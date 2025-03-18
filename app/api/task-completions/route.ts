import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TaskCompletion } from "@/types/api";
import { z } from "zod";

interface CompletionRequest {
  taskId: string;
  userId: string;
  proof: string;
  status: "pending" | "approved" | "rejected";
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

interface ClaimRewardRequest {
  completionId: string;
  payoutMethod?: string;
  payoutDetails?: Record<string, unknown>;
}

// Define completion schema
const CompletionSchema = z.object({
  id: z.string().optional(),
  taskId: z.string(),
  referrerId: z.string(),
  refereeId: z.string(),
  completionDate: z.date().optional(),
  status: z.enum(["pending", "verified", "rejected"]).default("pending"),
  verificationMethod: z.string().optional(),
  verificationData: z.record(z.unknown()).optional(),
  rewardStatus: z.enum(["pending", "issued", "claimed"]).default("pending"),
  rewardDetails: z.record(z.unknown()).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const taskId = searchParams.get("taskId");

    if (!userId && !taskId) {
      return NextResponse.json<ErrorResponse>(
        { error: "Either userId or taskId is required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const query = userId ? { userId } : { taskId };
    const completions = await db.collection<TaskCompletion>("completions")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(completions);
  } catch (err) {
    console.error("Error fetching completions:", err);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to fetch completions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as CompletionRequest;

    if (!body.taskId || !body.userId || !body.proof) {
      return NextResponse.json<ErrorResponse>(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection<TaskCompletion>("completions").insertOne({
      ...body,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const completion = await db.collection<TaskCompletion>("completions").findOne({
      _id: result.insertedId,
    });

    return NextResponse.json(completion, { status: 201 });
  } catch (err) {
    console.error("Error creating completion:", err);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to create completion" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as { completionId: string; status: string } | ClaimRewardRequest;
    const { completionId } = body;

    if (!completionId) {
      return NextResponse.json<ErrorResponse>(
        { error: "Completion ID is required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    
    // Handle status update
    if ('status' in body) {
      const result = await db.collection<TaskCompletion>("completions").updateOne(
        { _id: completionId },
        {
          $set: {
            status: body.status,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json<ErrorResponse>(
          { error: "Completion not found" },
          { status: 404 }
        );
      }

      const completion = await db.collection<TaskCompletion>("completions").findOne({
        _id: completionId,
      });

      return NextResponse.json(completion);
    }
    
    // Handle reward claim
    const completion = await db.collection<TaskCompletion>("completions").findOne({
      _id: completionId,
    });

    if (!completion) {
      return NextResponse.json<ErrorResponse>(
        { error: "Completion not found" },
        { status: 404 }
      );
    }

    if (completion.rewardStatus !== "issued") {
      return NextResponse.json<ErrorResponse>(
        { error: "Reward not issued or already claimed" },
        { status: 400 }
      );
    }

    const result = await db.collection<TaskCompletion>("completions").updateOne(
      { _id: completionId },
      {
        $set: {
          rewardStatus: "claimed",
          payoutMethod: body.payoutMethod,
          payoutDetails: body.payoutDetails,
          updatedAt: new Date(),
        },
      }
    );

    const updatedCompletion = await db.collection<TaskCompletion>("completions").findOne({
      _id: completionId,
    });

    return NextResponse.json({
      success: true,
      completion: updatedCompletion,
    });
  } catch (err) {
    console.error("Error updating completion:", err);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to update completion", details: err instanceof Error ? err.message : undefined },
      { status: 500 }
    );
  }
}