import { NextResponse } from "next/server";
import { z } from "zod";

// Define completion schema
const CompletionSchema = z.object({
  id: z.string().optional(),
  taskId: z.string(),
  referrerId: z.string(),
  refereeId: z.string(),
  completionDate: z.date().optional(),
  status: z.enum(["pending", "verified", "rejected"]).default("pending"),
  verificationMethod: z.string().optional(),
  verificationData: z.any().optional(),
  rewardStatus: z.enum(["pending", "issued", "claimed"]).default("pending"),
  rewardDetails: z.any().optional(),
});

// Define reward schema
const RewardSchema = z.object({
  completionId: z.string(),
  type: z.enum(["discount", "payout"]),
  value: z.string(),
  code: z.string().optional(),
  expiryDate: z.date().optional(),
  status: z.enum(["pending", "issued", "claimed", "expired"]).default("pending"),
  payoutMethod: z.enum(["stripe", "paypal", "venmo"]).optional(),
  payoutDetails: z.any().optional(),
});

// Mock database
let completions: any[] = [
  {
    id: "completion-001",
    taskId: "task-001",
    referrerId: "user-001",
    refereeId: "referee-001",
    completionDate: new Date(),
    status: "verified",
    verificationMethod: "email",
    verificationData: { emailVerified: true },
    rewardStatus: "issued",
    rewardDetails: {
      type: "discount",
      value: "25%",
      code: "DISC25",
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    id: "completion-002",
    taskId: "task-002",
    referrerId: "user-002",
    refereeId: "referee-002",
    completionDate: new Date(),
    status: "pending",
    verificationMethod: "manual",
    rewardStatus: "pending",
  },
];

let rewards: any[] = [
  {
    completionId: "completion-001",
    type: "discount",
    value: "25%",
    code: "DISC25",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: "issued",
  },
];

// GET all completions or filter by taskId, referrerId, or refereeId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    const referrerId = searchParams.get("referrerId");
    const refereeId = searchParams.get("refereeId");
    
    let filteredCompletions = [...completions];
    
    if (taskId) {
      filteredCompletions = filteredCompletions.filter(completion => completion.taskId === taskId);
    }
    
    if (referrerId) {
      filteredCompletions = filteredCompletions.filter(completion => completion.referrerId === referrerId);
    }
    
    if (refereeId) {
      filteredCompletions = filteredCompletions.filter(completion => completion.refereeId === refereeId);
    }
    
    return NextResponse.json({ completions: filteredCompletions });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch completions", details: error.message },
      { status: 500 }
    );
  }
}

// POST a new completion
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate completion data
    const completionData = CompletionSchema.parse({
      ...body,
      id: `completion-${Date.now()}`,
      completionDate: body.completionDate || new Date(),
    });
    
    completions.push(completionData);
    
    return NextResponse.json({ completion: completionData }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create completion", details: error.message },
      { status: 500 }
    );
  }
}

// PUT to update a completion (verify or reject)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, verificationData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: "Completion ID is required" },
        { status: 400 }
      );
    }
    
    const completionIndex = completions.findIndex(completion => completion.id === id);
    
    if (completionIndex === -1) {
      return NextResponse.json(
        { error: "Completion not found" },
        { status: 404 }
      );
    }
    
    // Update completion
    completions[completionIndex] = {
      ...completions[completionIndex],
      status: status || completions[completionIndex].status,
      verificationData: verificationData || completions[completionIndex].verificationData,
    };
    
    // If status is verified, issue reward
    if (status === "verified" && completions[completionIndex].rewardStatus === "pending") {
      // Get task details to determine reward type and value
      // In a real app, this would fetch from the database
      const taskId = completions[completionIndex].taskId;
      const task = { rewardType: "discount", rewardValue: "25%" }; // Mock task data
      
      // Generate reward
      const rewardId = `reward-${Date.now()}`;
      const rewardCode = `CODE${Math.floor(Math.random() * 10000)}`;
      
      const reward = {
        completionId: id,
        type: task.rewardType,
        value: task.rewardValue,
        code: rewardCode,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "issued",
      };
      
      rewards.push(reward);
      
      // Update completion with reward details
      completions[completionIndex].rewardStatus = "issued";
      completions[completionIndex].rewardDetails = reward;
    }
    
    return NextResponse.json({ completion: completions[completionIndex] });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update completion", details: error.message },
      { status: 500 }
    );
  }
}

// POST to claim a reward
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { completionId, payoutMethod, payoutDetails } = body;
    
    if (!completionId) {
      return NextResponse.json(
        { error: "Completion ID is required" },
        { status: 400 }
      );
    }
    
    const completionIndex = completions.findIndex(completion => completion.id === completionId);
    
    if (completionIndex === -1) {
      return NextResponse.json(
        { error: "Completion not found" },
        { status: 404 }
      );
    }
    
    if (completions[completionIndex].rewardStatus !== "issued") {
      return NextResponse.json(
        { error: "Reward not issued or already claimed" },
        { status: 400 }
      );
    }
    
    // Update reward status
    const rewardIndex = rewards.findIndex(reward => reward.completionId === completionId);
    
    if (rewardIndex !== -1) {
      rewards[rewardIndex].status = "claimed";
      
      if (rewards[rewardIndex].type === "payout") {
        rewards[rewardIndex].payoutMethod = payoutMethod;
        rewards[rewardIndex].payoutDetails = payoutDetails;
      }
    }
    
    // Update completion
    completions[completionIndex].rewardStatus = "claimed";
    
    return NextResponse.json({ 
      success: true,
      reward: rewardIndex !== -1 ? rewards[rewardIndex] : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to claim reward", details: error.message },
      { status: 500 }
    );
  }
} 