# Product Requirements Document (PRD) — QuickDine AI

## 1. Problem Statement
In urban Pakistan (specifically cities like Islamabad, Lahore, and Karachi), dining out is a central social activity, yet it is plagued by severe inefficiencies:
- **Long Restaurant Wait Times**: Popular dine-in spots regularly have wait times ranging from 30 to 60+ minutes on weekends (e.g., Margalla Hills, Blue Area, F-7/F-6 sectors).
- **Decision Fatigue**: Existing applications (like Foodpanda) focus heavily on delivery and offer overwhelming, non-personalized list options, leading to endless scrolling and decision paralysis.
- **Disconnected Dine-In**: Customers order manually after arriving at the table, delaying their meals by another 20–30 minutes while the kitchen prepares the food.
- **Inefficient Restaurant Operations**: Restaurant staff struggle to balance incoming phone reservations, walk-in traffic, and kitchen workflow, causing order errors and slow table turnover.

**QuickDine AI** bridges this gap by offering a streamlined pre-ordering and table-booking app combined with AI-driven, context-aware meal recommendations.

---

## 2. Target Users & Personas

### Persona A: The Busy Professional (Customer)
- **Name**: Zainab, 28, Software Engineer in Islamabad (lives near F-11).
- **Behavior**: Frequently dines out with colleagues or friends. Values her time highly.
- **Pain Point**: Hates wasting 45 minutes waiting for a table at Monal or Savour Foods on weekend evenings, and often struggles to decide what to eat.
- **Goal**: Wants to choose a place, pre-order her food, book a table, and have her hot meal served shortly after she arrives.

### Persona B: The Family Planner (Customer)
- **Name**: Tariq, 42, Bank Manager in Karachi.
- **Behavior**: Dines out weekly with his wife and three children.
- **Pain Point**: Managing hungry kids in a crowded waiting lobby. Hard to find dishes that fit everyone's spice preferences and dietary constraints.
- **Goal**: Wants a personalized recommendation that satisfies the kids' mild preferences and his wife's spice preference, with a pre-booked family table.

### Persona C: The Restaurant Manager (Business Owner)
- **Name**: Asif, 35, Restaurant Manager at Bundu Khan (Islamabad).
- **Behavior**: Manages the front-of-house and kitchen routing.
- **Pain Point**: Chaotic order queues, double-booked tables, and angry customers waiting for food during rush hours.
- **Goal**: Wants a clear dashboard showing incoming bookings, accepted orders, ready-to-serve status, and table requirements in real-time.

---

## 3. Core User Journeys

### Journey 1: Customer Taste-Matched Pre-Order
1. Zainab opens QuickDine and logs in via Google.
2. If it's her first time, she completes a quick 5-step Taste Quiz defining her preference (Pakistani/Continental, Medium Spice, PKR 1500–3000 budget, dining with friends, halal only).
3. On the Home screen, the **AI Picks** (powered by Gemini) displays 3 curated restaurant recommendations matching her exact profile with specific dish suggestions (e.g., "Monal's Grilled Chicken Platter because you prefer continental and are dining with friends").
4. She taps a restaurant, browse its structured menu, adds items to her cart, chooses a table preference (Window), and selects an arrival time slot (e.g., 30 minutes from now).
5. She places the pre-order, sees a checkout success screen with a Google Maps link to the location, and tracks the live status of the order.

### Journey 2: Restaurant Dashboard Fulfilment
1. Manager Asif logs in to the Restaurant Dashboard using credentials (`restaurant@quickdine.demo`).
2. An alert pops up as Zainab's new pre-order arrives in the **New Orders** column.
3. Asif reviews the details (items, table preference: Window, arrival: 30 minutes) and clicks **Accept**. The order moves to the **Accepted** column.
4. As the kitchen completes the meal, Asif clicks **Mark Ready**. The order moves to the **Ready** column.
5. When Zainab arrives and is served, Asif clicks **Complete**. Zainab is prompted to review her experience, and the order moves to **Completed**.

---

## 4. Success Metrics & KPIs
To measure the effectiveness of the QuickDine AI platform:
- **Dine-in Wait Time Reduction**: Average time elapsed between customer arrival and food serving (Target: Under 10 minutes).
- **AI Recommendation Click-Through**: Percentage of customers ordering from one of the three "AI Picks" (Target: >35%).
- **Dashboard Efficiency**: Average time taken by restaurants to accept an order (Target: Under 2 minutes).
- **Customer Satisfaction**: Average ratings for restaurants and overall platform (Target: >4.3/5).
- **Table Turnover**: Increase in tables served per night for partner restaurants (Target: +20%).

---

## 5. Feature Prioritization Rationale

### P1: Core Dine-In Engine
Without basic authentication, menu browsing, ordering, and a restaurant dashboard, the app cannot function. These form the base MVP.

### P2: Gemini AI Features
Gemini 2.5 Flash powers the personalization element (Taste Quiz onboarding, AI Picks recommendation, and the floating Chat Assistant). This is our key differentiator and submission core.

### P3: Polish & History
Includes order history for quick repeat orders and a post-meal Review & Rating component to ensure a complete loop for feedback data.

### P4: Demo & Tests
Vitest unit, component, and integration tests to guarantee code quality and stability. Mock data seeding to populate the 6 Pakistan-focused restaurants and menus for demo purposes.

---

## 6. Known Limitations & Out of Scope
- **Online Payments**: For this prototype, payment is handled cash-on-delivery/dine-in card at the venue. Online gateway integration (Easypaisa/JazzCash/Stripe) is out of scope.
- **Live GPS Tracking**: Tracking uses step-by-step status transitions (New → Accepted → Ready → Completed) rather than real-time GPS coordinates.
- **Multi-Branch Management**: Restaurants are assumed to have a single physical location for this iteration.
- **Dynamic Table Allocation**: The table selection is a user preference (e.g. Window, Outdoor) rather than a rigid table map linked to restaurant layout APIs.
