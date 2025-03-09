# Referly - Referral Management Platform

Referly is a comprehensive referral management platform designed to help businesses manage and track referrals, run campaigns, and leverage AI to optimize their referral programs.

## Features

### Business Side Features
- Registration/Login
- AI Agent: Assistant for actions/tasks/follow-ups
- Analytics/Data: View relevant data/analytics
- Mini CRM: Manage customers and their details
- Send Links: Generate referral links
- Text/Email Customer communication
- Bulk Import Customers
- Referral Tracking/Analytics
- Campaign Set Up/Management
- Follow Up Set Up/Management
- Automated Reward Verification

### Referrer Side Features
- No Account Required
- Personalized Referral Link
- AI Chat interface
- AI-Powered Sharing Suggestions
- One-Click Sharing: SMS, Email, and Facebook Post
- Basic Referral Tracking
- Instant Reward Notifications
- Claimable Discount Codes & Rewards

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Form Validation**: Zod, React Hook Form

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/referly.git
   cd referly
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Update the variables with your own values

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app directory
  - `/api` - API routes
  - `/components` - React components
  - `/lib` - Utility functions
  - `/models` - MongoDB models
  - `/pages` - Page components

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Referrals
- `POST /api/referrals/generate-link` - Generate a referral link
- `POST /api/referrals/track-click` - Track referral link clicks
- `POST /api/referrals/submit` - Submit a referral

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create a new campaign
- `GET /api/campaigns/[id]` - Get a specific campaign
- `PATCH /api/campaigns/[id]` - Update a campaign
- `DELETE /api/campaigns/[id]` - Delete a campaign

### Customers (Mini CRM)
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create a new customer or bulk import
- `GET /api/customers/[id]` - Get a specific customer
- `PATCH /api/customers/[id]` - Update a customer
- `DELETE /api/customers/[id]` - Delete a customer

### Follow-ups
- `GET /api/follow-ups` - Get all follow-ups
- `POST /api/follow-ups` - Create a new follow-up
- `GET /api/follow-ups/[id]` - Get a specific follow-up
- `PATCH /api/follow-ups/[id]` - Update a follow-up
- `DELETE /api/follow-ups/[id]` - Delete a follow-up

### Analytics
- `GET /api/analytics` - Get business analytics

## License

This project is licensed under the MIT License - see the LICENSE file for details.
