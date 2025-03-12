import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/options"
import { connectToDatabase } from "@/lib/mongodb"
import Reward from "@/models/Reward"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is a customer
    if (session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Only customers can redeem rewards" },
        { status: 403 }
      )
    }

    // Get the reward ID from the URL params
    const rewardId = params.id
    if (!rewardId) {
      return NextResponse.json(
        { error: "Reward ID is required" },
        { status: 400 }
      )
    }

    // Connect to the database
    await connectToDatabase()

    // Find the reward
    const reward = await Reward.findById(rewardId)
    if (!reward) {
      return NextResponse.json(
        { error: "Reward not found" },
        { status: 404 }
      )
    }

    // Check if the reward belongs to the user
    if (reward.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You can only redeem your own rewards" },
        { status: 403 }
      )
    }

    // Check if the reward is available
    if (reward.status !== "available") {
      return NextResponse.json(
        { error: `Reward cannot be redeemed because it is ${reward.status}` },
        { status: 400 }
      )
    }

    // Update the reward status to redeemed
    reward.status = "redeemed"
    reward.dateRedeemed = new Date()
    await reward.save()

    return NextResponse.json({
      message: "Reward redeemed successfully",
      reward: {
        id: reward._id,
        status: reward.status,
        dateRedeemed: reward.dateRedeemed
      }
    })
  } catch (error) {
    console.error("Error redeeming reward:", error)
    return NextResponse.json(
      { error: "Failed to redeem reward" },
      { status: 500 }
    )
  }
} 