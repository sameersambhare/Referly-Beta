// Generic API error type
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Query types
export interface BaseQuery {
  businessId: string;
}

export interface DateRangeQuery extends BaseQuery {
  startDate?: Date;
  endDate?: Date;
}

// Analytics types
export interface AnalyticsQuery extends DateRangeQuery {
  campaignId?: string;
}

export interface AnalyticsData {
  referralCount: number;
  clickCount: number;
  conversionCount: number;
  rewardsPaid: number;
  date: Date;
  campaignId?: string;
}

// Dashboard types
export interface DashboardSummary {
  totalReferrals: number;
  totalClicks: number;
  totalConversions: number;
  overallConversionRate: number;
  activeReferralsCount: number;
  activeCampaignsCount: number;
  customersCount: number;
}

export interface RecentActivity {
  type: string;
  date: string;
  description: string;
}

export interface DashboardCampaign {
  id: string;
  title: string;
  status: "active" | "completed" | "upcoming";
  startDate: string;
  endDate: string;
  completedTasks: number;
  totalTasks: number;
  referrals: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentActivity: RecentActivity[];
  campaigns: DashboardCampaign[];
}

// Campaign types
export interface CampaignQuery extends BaseQuery {
  isActive?: boolean;
}

// Customer types
export interface CustomerQuery extends BaseQuery {
  status?: 'active' | 'inactive' | 'lead';
  tag?: string;
  search?: string;
}

// Follow-up types
export interface FollowUpQuery extends BaseQuery {
  status?: 'scheduled' | 'completed' | 'cancelled';
  type?: 'email' | 'sms' | 'call' | 'meeting';
  referralId?: string;
  customerId?: string;
  isAutomated?: boolean;
}

// Task types
export interface TaskData {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Completion types
export interface CompletionData {
  id: string;
  taskId: string;
  userId: string;
  completionDate: Date;
  proof?: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Reward types
export interface RewardData {
  id: string;
  userId: string;
  amount: number;
  type: 'cash' | 'points' | 'gift';
  status: 'pending' | 'paid';
  createdAt: Date;
}

// Coupon types
export interface CouponData {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  category?: string;
  validUntil?: Date;
  description?: string;
}

export interface Campaign {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  rewardType: string;
  rewardAmount: number;
  referralCount: number;
  conversionCount: number;
}

export interface Task {
  _id: string;
  campaignId: string;
  title: string;
  description: string;
  points: number;
  isActive: boolean;
  order: number;
  type: 'social' | 'content' | 'referral' | 'other';
  requirements: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCompletion {
  _id: string;
  taskId: string;
  userId: string;
  status: 'pending' | 'completed' | 'rejected';
  submissionData: Record<string, unknown>;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
} 