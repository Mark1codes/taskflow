# TaskFlow Notifications Roadmap

This document outlines the technical requirements and steps needed to make the Notification settings (Email, Push, Desktop) fully functional in the future.

## 1. Database Storage (Supabase)
Currently, the toggles in `settings.tsx` update a temporary React state. To persist these preferences:
- **Schema Update:** Add a JSONB column named `notifications` to the `profile` table (or individual boolean columns like `notify_email`, `notify_push`, `notify_desktop`).
- **Frontend Integration:** Update the `handleSave` function in `settings.tsx` to execute a Supabase `update` query on the `profile` table, saving the user's choices.
- **Initial Load:** Fetch these preferences when the user logs in and pass them to the `Settings` component to set the initial toggle states.

## 2. Email Notifications
To send automated emails (e.g., when a task is assigned, updated, or nearing its due date):
- **Email Service Provider:** Set up an account with a transactional email provider like [Resend](https://resend.com/), SendGrid, or AWS SES.
- **Backend API:** Create a Next.js API Route (e.g., `/api/notify`) that uses the provider's SDK to send emails.
- **Database Webhooks:** Configure Supabase Database Webhooks to trigger the `/api/notify` endpoint whenever a row in the `task` table is inserted or updated. The webhook payload will contain the task details, which the API route can use to construct and send the email.

## 3. Push and Desktop Notifications
To push notifications directly to a user's browser or device (even when they aren't actively using the app):
- **Notification Service:** The easiest and most reliable approach is to use a dedicated service like [OneSignal](https://onesignal.com/) or Firebase Cloud Messaging (FCM). 
- **Frontend Setup:** 
  - Install the provider's web SDK.
  - Add a Service Worker to your `public` directory to handle incoming push events in the background.
  - Prompt the user for notification permissions when they toggle "Push/Desktop notifications" on in the Settings page.
- **Backend Trigger:** Similar to Email, use Supabase Webhooks to hit a Next.js API route that calls the OneSignal/FCM API, which will then push the notification to the target user's device.

## Recommended Tech Stack for Implementation
- **Emails:** Resend + React Email (for building beautiful email templates).
- **Push:** OneSignal (offers a generous free tier and easy React integration).
- **Triggers:** Supabase Database Webhooks (simplifies event-driven logic without needing complex chron jobs).
