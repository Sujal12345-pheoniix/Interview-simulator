# AI Interview Simulator

A production-ready, full-stack AI Interview Simulator built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **MongoDB**. This platform provides realistic behavioral, technical, and coding mock interviews with instant evaluation powered by OpenAI's GPT-4o. 

## Features
- **Dynamic Interviews**: Questions are generated on-the-fly based on role, experience level, and resume context.
- **Coding Arena**: Integrated Monaco Editor for real-world software engineering challenges.
- **Deep Analytics**: Track strengths, weaknesses, and performance trends over time with Recharts.
- **Premium UI**: Sleek, dark-mode-first interface using Shadcn UI and Framer Motion.

## Environment Variables
Create a `.env.local` file in the root directory:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# MongoDB Atlas
MONGODB_URI=mongodb+srv://...

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.

## Deployment
1. Set up a MongoDB cluster and get the connection string.
2. Configure Clerk for authentication and add the webhook URL (`https://your-domain.com/api/webhooks/clerk`) listening to `user.created`, `user.updated`, and `user.deleted` events.
3. Deploy to Vercel/Netlify with the required environment variables.
