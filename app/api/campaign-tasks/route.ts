import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Task, TaskStatus } from '@/types/api';
import { z } from 'zod';

interface TaskRequest {
  campaignId: string;
  title: string;
  description: string;
  points: number;
  type: string;
  requirements: string[];
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json<ErrorResponse>(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const tasks = await db.collection<Task>("tasks")
      .find({ campaignId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as TaskRequest;
    const { campaignId, title, description, points, type, requirements } = body;

    if (!campaignId || !title || !description) {
      return NextResponse.json<ErrorResponse>(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection<Task>("tasks").insertOne({
      campaignId,
      title,
      description,
      points,
      type,
      requirements,
      status: "active" as TaskStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const task = await db.collection<Task>("tasks").findOne({
      _id: result.insertedId,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error("Error creating task:", err);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { taskId, status } = body;

    if (!taskId || !status) {
      return NextResponse.json<ErrorResponse>(
        { error: "Task ID and status are required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection<Task>("tasks").updateOne(
      { _id: taskId },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json<ErrorResponse>(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const task = await db.collection<Task>("tasks").findOne({
      _id: taskId,
    });

    return NextResponse.json(task);
  } catch (err) {
    console.error("Error updating task:", err);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json<ErrorResponse>(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection<Task>("tasks").deleteOne({
      _id: taskId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json<ErrorResponse>(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting task:", err);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
} 