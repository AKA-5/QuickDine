# QuickDine AI - Pre-order & Dine-in Recommendations

Built for the Google Gen AI Academy APAC "Meet the Builders" campaign.

## Problem Statement
In urban Pakistan, dine-in visits to popular restaurants in cities like Islamabad, Lahore, and Karachi are plagued by waiting times exceeding 30–60 minutes. Diners experience choice overload on conventional apps like Foodpanda (which focus on delivery rather than dine-in) and wait in long lines for table seating and food preparation. QuickDine AI solves this by combining pre-ordering and seat reservations with a custom taste-matching recommendation engine.

## Features
- **Landing Page**: Visually professional hero sections with custom local restaurant stats.
- **Google & Email Authentication**: Secure logins for customers (Google) and restaurant staff (email/password).
- **Taste Onboarding Quiz**: 5-question multi-step onboarding profiling favorite cuisines, spice tolerances, budgets, companions, and diets.
- **AI Picks recommendations**: Personalized 3-restaurant recommendations powered by **Gemini 2.5 Flash** with custom reasoning and recommended dishes.
- **Localized Ambiance Filters**: Instant category filters including Scenic (for Margalla Hills spots like Monal), Family-Friendly, and BBQ.
- **Dine-in Cart & Checkout**: Choose arrival time slots (ASAP, 30 min, 1 hour, or custom), select seating preferences (Window, Outdoor, Center), and leave special instructions.
- **Live Status Tracker**: Subscribes to live Firestore updates (New → Accepted → Preparing → Ready → Completed) with Google Maps routing.
- **Restaurant Operations Board**: Real-time Kanban board for kitchen managers to view and route incoming orders.
- **AI Chat Assistant**: Contextual floating slide-up chat guide answering questions based on user tastes and menus.
- **Review & Rating**: Submit overall, ambiance, and dish feedback upon order completion, updating average ratings via Firestore transactions.
- **Order History**: Check past dine-in logs with one-click repeat ordering.

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 (utility-first, theme configuration) |
| Icons | Google Material Symbols |
| Fonts | DM Serif Display (headings), DM Sans (body) |
| Database & Auth | Firebase v10 modular SDK (Firestore, Auth) |
| AI Model | Gemini 2.5 Flash via `@google/generative-ai` |
| Verification | Vitest + React Testing Library |

## How to Run Locally
1. Clone this repository and open the directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase credentials and Gemini API key inside `.env`.
4. Start the local server:
   ```bash
   npm run dev
   ```
5. Run the test suite:
   ```bash
   npm run test
   ```

## How Gemini is Used
QuickDine AI integrates **Gemini 2.5 Flash** via Google's Generative AI SDK inside [src/services/gemini.js](file:///d:/CodeProjects/Visual%20Project/QuickDine/src/services/gemini.js):
- **Restaurant Recommendations**: Matches the diner's budget in PKR, spice level, and cuisines to available restaurant options, outputting JSON recommendations with detailed logic and dish recommendations.
- **Chat Assistant**: Connects diner conversations to Gemini's chat mode, contextualizing responses with the user's taste quiz and available restaurant properties.

## Live Demo
- **Vercel Deploy**: *[Provide public URL here during Vercel deployment]*

## Author
- **Muhammad Kaleem Akhtar**
- **GitHub**: [github.com/kaleem-akhtar](https://github.com/kaleem-akhtar)
- **LinkedIn**: [linkedin.com/in/kaleem-akhtar](https://linkedin.com/in/kaleem-akhtar)
