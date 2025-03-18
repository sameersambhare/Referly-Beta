// Export all models from a single file for easier imports
import User, { IUser } from './User';
import Business, { IBusiness } from './Business';
import Referrer, { IReferrer } from './Referrer';
import Customer, { ICustomer } from './Customer';
import Admin, { IAdmin } from './Admin';
import Campaign, { ICampaign } from './Campaign';
import Referral, { IReferral } from './Referral';
import Analytics, { IAnalytics } from './Analytics';
import Reward, { IReward } from './Reward';
import FollowUp, { IFollowUp } from './FollowUp';

// Export models
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

// Export interfaces
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

// Default export for convenience
export default {
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