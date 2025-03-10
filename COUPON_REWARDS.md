# Coupon Rewards Integration

This document outlines the integration of the 27coupons API for providing coupon rewards to referrers in the Referly platform.

## Overview

The Coupon Rewards feature allows businesses to reward their referrers with coupons and discount codes from various retailers. This integration uses the 27coupons API to fetch the latest coupons and display them in the Referly platform.

## API Integration

The integration uses the 27coupons API via RapidAPI. The API endpoint is:

```
https://27coupons.p.rapidapi.com/coupons/latest/
```

API credentials are stored in the `.env.local` file as `RAPID_API_KEY`.

### Mock Data

The integration includes mock coupon data for testing purposes or when the API is unavailable. This ensures that the UI can still be tested and demonstrated even without a valid API key or when the API is down.

## Components

### API Route

- `app/api/coupons/route.ts`: Handles fetching coupons from the 27coupons API and implements caching to reduce API calls. Falls back to mock data if the API request fails.

### UI Components

- `app/components/dashboard/CouponRewards.tsx`: Displays available coupons for selection.
- `app/rewards/page.tsx`: Main rewards management page with tabs for available rewards, eligible referrers, and reward history.
- `app/rewards/history/page.tsx`: Displays the history of rewards issued to referrers.
- `app/rewards/settings/page.tsx`: Allows configuration of reward settings, including automation and notifications.
- `app/rewards/custom/page.tsx`: Enables creation of custom rewards.

### Supporting Components

- `app/components/ui/date-picker.tsx`: Date picker component for selecting expiry dates.
- `app/components/ui/calendar.tsx`: Calendar component used by the date picker.
- `app/components/ui/popover.tsx`: Popover component used by the date picker.
- `app/components/ui/badge.tsx`: Badge component for displaying categories.
- `app/components/ui/switch.tsx`: Switch component for toggle switches in settings.
- `app/components/ui/textarea.tsx`: Textarea component for input fields.

## Features

1. **Coupon Display**: View and select from a list of available coupons.
2. **Reward Management**: Track and manage rewards issued to referrers.
3. **Reward History**: View a history of all rewards issued.
4. **Reward Settings**: Configure automation and notification settings for rewards.
5. **Custom Rewards**: Create custom rewards with specific details and expiry dates.

## Usage

1. Navigate to the dashboard to see available coupons.
2. Select a coupon to reward a referrer.
3. View and manage rewards in the rewards section.
4. Configure reward settings to automate the reward process.

## Dependencies

- `date-fns`: For date formatting and manipulation.
- `react-day-picker`: For the calendar and date picker components.
- `@radix-ui/react-popover`: For the popover component.
- `@radix-ui/react-switch`: For the switch component.
- `class-variance-authority`: For the badge component.

## CSS Configuration

The integration requires the following CSS configuration:

1. Import the react-day-picker styles at the beginning of the `app/globals.css` file:
   ```css
   @import "react-day-picker/dist/style.css";
   
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

## Future Enhancements

1. **Category Filtering**: Add ability to filter coupons by category.
2. **Reward Automation**: Implement automatic reward distribution based on referral conversions.
3. **Email Notifications**: Send email notifications to referrers when rewards are issued.
4. **Analytics**: Track reward usage and effectiveness.
5. **Custom Reward Templates**: Create and save custom reward templates for reuse.

## Troubleshooting

### API Issues
If the 27coupons API is unavailable or returns an error, the system will automatically fall back to using mock data. This ensures that the UI remains functional for testing and demonstration purposes.

### CSS Import Issues
Ensure that the `@import` statement for react-day-picker styles is placed at the beginning of the `app/globals.css` file, before any other CSS rules. This is required by CSS import rules. 