import { NextResponse } from "next/server";
import { z } from "zod";

// Define task schema
const TaskSchema = z.object({
  id: z.string().optional(),
  campaignId: z.string(),
  title: z.string(),
  description: z.string(),
  completionCriteria: z.string(),
  rewardType: z.enum(["discount", "payout"]),
  rewardValue: z.string(),
  status: z.enum(["active", "completed", "pending"]).default("active"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Define completion schema
const CompletionSchema = z.object({
  taskId: z.string(),
  referrerId: z.string(),
  refereeId: z.string(),
  completionDate: z.date().optional(),
  status: z.enum(["pending", "verified", "rejected"]).default("pending"),
  verificationMethod: z.string().optional(),
  verificationData: z.any().optional(),
});

// Mock database
let tasks: any[] = [
  {
    id: "task-001",
    campaignId: "campaign-001",
    title: "Sign up for a free trial",
    description: "Complete the sign-up process for a 14-day free trial of our premium service.",
    completionCriteria: "User must create an account and confirm email",
    rewardType: "discount",
    rewardValue: "25%",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "task-002",
    campaignId: "campaign-001",
    title: "Schedule a demo",
    description: "Book a 30-minute demo with our product specialist.",
    completionCriteria: "User must schedule and attend a demo session",
    rewardType: "payout",
    rewardValue: "$50",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

let completions: any[] = [];

// GET all tasks or filter by campaignId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    
    if (campaignId) {
      const filteredTasks = tasks.filter(task => task.campaignId === campaignId);
      return NextResponse.json({ tasks: filteredTasks });
    }
    
    return NextResponse.json({ tasks });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch tasks", details: error.message },
      { status: 500 }
    );
  }
}

// POST a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate task data
    const taskData = TaskSchema.parse({
      ...body,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    tasks.push(taskData);
    
    return NextResponse.json({ task: taskData }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create task", details: error.message },
      { status: 500 }
    );
  }
}

// PUT to update a task
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }
    
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }
    
    // Update task
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updateData,
      updatedAt: new Date(),
    };
    
    return NextResponse.json({ task: tasks[taskIndex] });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update task", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE a task
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }
    
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }
    
    // Remove task
    tasks = tasks.filter(task => task.id !== id);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete task", details: error.message },
      { status: 500 }
    );
  }
} 