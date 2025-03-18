import mongoose, { Schema, Document } from "mongoose"

export interface IReward extends Document {
  userId: mongoose.Types.ObjectId
  campaignId: mongoose.Types.ObjectId
  businessId: mongoose.Types.ObjectId
  type: string
  amount: number
  status: "pending" | "available" | "redeemed" | "expired"
  shareMethod: string
  dateEarned: Date
  dateRedeemed: Date | null
  description: string
  code: string
}

// Helper function to generate a reward code
function generateRewardCode(): string {
  const prefix = "RW"
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${randomPart}`
}

const RewardSchema = new Schema<IReward>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["discount", "cashback", "points", "gift"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "available", "redeemed", "expired"],
      default: "pending",
    },
    shareMethod: {
      type: String,
      required: true,
    },
    dateEarned: {
      type: Date,
      default: Date.now,
    },
    dateRedeemed: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      default: generateRewardCode
    }
  },
  { timestamps: true }
)

// Create indexes for faster queries
RewardSchema.index({ userId: 1 })
RewardSchema.index({ campaignId: 1 })
RewardSchema.index({ businessId: 1 })
RewardSchema.index({ status: 1 })

export default mongoose.models.Reward || mongoose.model<IReward>("Reward", RewardSchema) 