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

### MongoDB Setup

#### Option 1: Local MongoDB Installation

1. Download and install MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Follow the installation instructions for your operating system
3. Start the MongoDB service:
   ```bash
   mongod --dbpath /path/to/data/directory
   ```

#### Option 2: MongoDB Atlas (Cloud)

1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster
3. Set up database access (create a user with password)
4. Set up network access (allow access from your IP address)
5. Get your connection string and update the `.env.local` file:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
   ```

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

## AI Assistant

The dashboard includes an AI assistant powered by DeepSeek AI that can help users manage their referral program. The assistant can:

- Provide insights on campaigns
- Suggest follow-ups
- Answer questions about referrals
- Provide analytics information
- Suggest improvements to the referral program

### Configuration

To use the AI assistant, you need to set up a DeepSeek API key:

1. Sign up for a free account at [DeepSeek Platform](https://platform.deepseek.com/)
2. Generate an API key in your account settings
3. Add the API key to your `.env.local` file:

```
DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_API_URL=https://api.deepseek.com/v1
```

The AI assistant uses the `deepseek-chat` model, which is DeepSeek's standard chat model. This provides a good balance of performance and cost for a referral management assistant.

If the DeepSeek API is unavailable or there's an error, the assistant will fall back to a local implementation with predefined responses.

### Features

- **Real-time AI responses**: Get instant answers to your referral program questions
- **Fallback mechanism**: Continues to work even when the API is unavailable
- **Suggested prompts**: Helpful suggestions for new users
- **Context-aware**: The AI understands the context of your referral program

## Troubleshooting

### MongoDB Connection Issues

If you're having trouble connecting to MongoDB:

1. Make sure MongoDB is running
2. Check your connection string in `.env.local`
3. Ensure network access is properly configured
4. Check for any firewall issues

### Tailwind CSS Issues

If you're having issues with Tailwind CSS:

1. Make sure you have the correct versions of dependencies:
   ```bash
   npm install -D tailwindcss@3.3.0 postcss@8.4.24 autoprefixer@10.4.14
   ```

2. Ensure your configuration files are set up correctly:
   - `tailwind.config.js`
   - `postcss.config.js`
   - `app/globals.css`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
