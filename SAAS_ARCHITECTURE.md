# Mess Manager SaaS Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────┐
│                  Mess Manager SaaS Platform              │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Landing    │  │ Registration │  │    Login     │  │
│  │    Page      │  │     Page     │  │     Page     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                              │
│  ┌───────────────────────────────────────────┐           │
│  │        Razorpay Payment Gateway           │           │
│  │   (Subscription Processing & Billing)    │           │
│  └───────────────────────────────────────────┘           │
│                            │                              │
│  ┌───────────────────────────────────────────┐           │
│  │   Dashboard (Tenant-Specific)             │           │
│  │   - Member Management                     │           │
│  │   - Subscription Info                     │           │
│  │   - Payment History                       │           │
│  │   - Usage Analytics                       │           │
│  └───────────────────────────────────────────┘           │
│                            │                              │
│  ┌───────────────────────────────────────────┐           │
│  │    Admin Dashboard (Super Admin)          │           │
│  │    - All Subscriptions                    │           │
│  │    - Payment Monitoring                   │           │
│  │    - Plan Management                      │           │
│  │    - User Analytics                       │           │
│  └───────────────────────────────────────────┘           │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## 📊 Database Schema (New Tables)

```sql
-- User Account
User {
  id          String    @id @default(cuid())
  email       String    @unique
  phone       String    @unique
  passwordHash String?
  firstName   String
  lastName    String
  businessName String
  verified    Boolean   @default(false)
  status      String    @default("active") -- active, suspended, deleted
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  subscriptions Subscription[]
  messes      Mess[]
}

-- Subscription Plans
Plan {
  id          String    @id @default(cuid())
  name        String    -- "Free", "Basic", "Pro", "Enterprise"
  price       Int       -- in paise (0 for free)
  currency    String    @default("INR")
  billingCycle String   -- "monthly", "yearly"
  
  -- Feature Limits
  maxMesses   Int       -- 1 for free, 3 for basic, unlimited for pro
  maxMembers  Int       -- 50 for free, 500 for basic, unlimited for pro
  whatsappAlerts Boolean
  customBranding Boolean
  advancedReporting Boolean
  
  description String?
  createdAt   DateTime  @default(now())
  subscriptions Subscription[]
}

-- User Subscriptions
Subscription {
  id          String    @id @default(cuid())
  userId      String
  planId      String
  status      String    -- "active", "trial", "expired", "cancelled", "suspended"
  
  -- Dates
  startDate   DateTime
  endDate     DateTime?
  trialEndDate DateTime?
  renewalDate DateTime?
  
  -- Payment Info
  razorpaySubscriptionId String?
  razorpayCustomerId String?
  nextBillingDate DateTime?
  
  -- Usage
  messesUsed  Int       @default(0)
  membersUsed Int       @default(0)
  
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan        Plan      @relation(fields: [planId], references: [id])
  payments    Payment[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([userId])
  @@index([planId])
}

-- Payment History
Payment {
  id          String    @id @default(cuid())
  subscriptionId String
  razorpayPaymentId String @unique
  razorpayOrderId String
  
  amount      Int       -- in paise
  currency    String    @default("INR")
  status      String    -- "pending", "captured", "failed", "refunded"
  
  subscription Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([subscriptionId])
}

-- Update Existing Tables
Mess {
  id        String    @id @default(cuid())
  userId    String    -- NEW: Link to owner
  name      String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  members   Member[]
  settings  Setting[]
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

Member {
  -- (unchanged) but now scoped by user's subscription
  -- ... existing fields ...
}

Setting {
  -- (unchanged)
  -- ... existing fields ...
}
```

## 🔐 Authentication Flow

1. **Registration**
   - Email/Phone input
   - OTP verification (for phone)
   - Business name, password
   - Create User account

2. **Free Trial**
   - Auto-enroll in "Trial Plan" for 14 days
   - Full "Pro" features during trial
   - Credit card required (for payment intent verification)

3. **Login**
   - Email + Password OR Phone + OTP
   - Session/JWT token
   - Redirect to dashboard

## 💳 Subscription Plans

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│    FREE      │    BASIC     │     PRO      │  ENTERPRISE  │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ $0/month     │ ₹299/month   │ ₹999/month   │ Custom       │
│ 14-day trial │ No trial     │ 7-day trial  │              │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ 1 Mess       │ 3 Messes     │ Unlimited    │ Unlimited    │
│ 50 Members   │ 500 Members  │ Unlimited    │ Unlimited    │
│ Basic Alert  │ WhatsApp ✓   │ WhatsApp ✓   │ All + API    │
│ No Branding  │ No Branding  │ Custom Logo  │ Custom       │
│              │              │ Analytics    │ Support      │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

## 🔄 Key Features

### Multi-Tenancy
- Middleware to extract user from session
- Query filters: `where: { mess: { userId: currentUser.id } }`
- Prevent cross-user data access

### Subscription Checks
- Middleware to verify active subscription
- Display upgrade prompts when limits reached
- Disable features for inactive subscriptions

### Razorpay Integration
- Subscription creation on Razorpay
- Webhook handling for payment updates
- Automatic renewal management

### Dashboard
- Subscription status & renewal date
- Usage analytics (messes, members)
- Payment history
- Upgrade/downgrade options

## 📁 File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── register/page.js
│   │   ├── login/page.js
│   │   ├── verify-otp/page.js
│   │   └── reset-password/page.js
│   ├── (dashboard)/
│   │   ├── dashboard/page.js (updated)
│   │   ├── subscription/page.js (NEW)
│   │   ├── billing/page.js (NEW)
│   │   └── settings/page.js (NEW)
│   ├── landing/ (NEW)
│   │   └── page.js
│   ├── middleware.js (NEW)
│   └── layout.js (updated)
├── lib/
│   ├── auth.js (NEW)
│   ├── razorpay.js (NEW)
│   ├── subscription.js (NEW)
│   └── ... existing ...
├── components/
│   ├── auth/ (NEW)
│   ├── subscription/ (NEW)
│   └── ... existing ...
└── generated/prisma/
```

## 🚀 Implementation Steps

1. **Database Setup** ← We're here
   - Update Prisma schema
   - Create migrations

2. **Authentication**
   - Email/Password auth
   - Phone OTP verification
   - Session management

3. **Subscription System**
   - Plan management
   - Trial period
   - Subscription status tracking

4. **Razorpay Integration**
   - Create subscription on Razorpay
   - Handle webhooks
   - Manage renewals

5. **UI Updates**
   - Landing page
   - Registration flow
   - Subscription dashboard
   - Feature-gating

6. **Middleware & Security**
   - User context extraction
   - Data isolation
   - Access control

## 🛡️ Security Considerations

- ✅ Password hashing (bcrypt)
- ✅ OTP verification
- ✅ CSRF protection
- ✅ API rate limiting
- ✅ Webhook signature verification
- ✅ Multi-tenant data isolation
- ✅ PCI compliance (Razorpay handles)

## 📈 Future Enhancements

- Analytics dashboard
- Team management (sub-users)
- API access for premium tiers
- Mobile app
- Invoice generation
- Accounting software integration
