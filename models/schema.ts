// This file now imports and re-exports all models from individual files
// It's kept for backward compatibility with existing code

import {
  User,
  Business,
  Referrer,
  Customer,
  Admin,
  Campaign,
  Referral,
  Analytics,
  Reward,
  FollowUp,
  IUser,
  IBusiness,
  IReferrer,
  ICustomer,
  IAdmin,
  ICampaign,
  IReferral,
  IAnalytics,
  IReward,
  IFollowUp
} from './index';

// Re-export all models and interfaces
export {
  User,
  Business,
  Referrer,
  Customer,
  Admin,
  Campaign,
  Referral,
  Analytics,
  Reward,
  FollowUp
};

export type {
  IUser,
  IBusiness,
  IReferrer,
  ICustomer,
  IAdmin,
  ICampaign,
  IReferral,
  IAnalytics,
  IReward,
  IFollowUp
}; 