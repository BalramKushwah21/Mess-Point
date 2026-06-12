# SaaS Conversion - Complete Implementation Checklist

## ✅ PHASE 1: Backend Infrastructure (COMPLETED)

### Database Schema
- [x] Created User model (registration, business info, status)
- [x] Created Plan model (Free, Basic, Pro, Enterprise tiers)
- [x] Created Subscription model (tracking user subscriptions)
- [x] Created Payment model (payment history)
- [x] Updated Mess model with userId for multi-tenancy
- [x] Created SQL migration file (`prisma/migrations/20260613_add_saas_tables.sql`)
- [x] Set up foreign keys and indexes
- [x] Designed data isolation strategy

### Authentication System
- [x] Created `auth-utils.js`
  - Password hashing with bcrypt
  - Phone/email validation
  - OTP generation
  - WhatsApp number normalization
- [x] Created `auth-actions.js` server actions
  - `registerUser()` - Create new account
  - `loginUser()` - Email/password login
  - `verifyOTPAndLogin()` - Phone OTP login
  - `getCurrentUser()` - Get logged-in user
  - `updateUserProfile()` - Edit profile
  - `changePassword()` - Secure password change
  - `logoutUser()` - Clear session

### Subscription Management
- [x] Created `subscription.js` utilities
  - `DEFAULT_PLANS` configuration
  - `initializeDefaultPlans()` - Seed plans
  - `getSubscriptionStatus()` - Get current subscription
  - `canCreateMess()` - Check mess creation limits
  - `canAddMember()` - Check member addition limits
  - `createTrialSubscription()` - 14-day trial setup
  - `createFreeSubscription()` - Free plan setup
- [x] Created `subscription-actions.js` server actions
  - `getSubscriptionInfo()` - Display plan details
  - `createMessWithSubscriptionCheck()` - Create mess with limits
  - `upgradePlan()` - Upgrade to higher tier
  - `downgradePlan()` - Downgrade to lower tier
  - `cancelSubscription()` - End subscription
  - `getPaymentHistory()` - View past payments

### Payment Processing
- [x] Created `razorpay.js` utilities
  - `initializeRazorpay()` - Setup Razorpay client
  - `createRazorpayOrder()` - Create payment orders
  - `verifyRazorpayPayment()` - Verify signatures
  - `verifyRazorpayWebhook()` - Webhook verification
  - Webhook handlers for all events:
    - `handleSubscriptionActivated()`
    - `handleSubscriptionCompleted()`
    - `handlePaymentCaptured()`
    - `handlePaymentFailed()`
    - And 6 more event handlers

### Configuration & Dependencies
- [x] Updated `package.json`
  - Added `bcrypt@^5.1.1` for password hashing
  - Added `razorpay@^2.9.2` for payments
- [x] Updated `.env.example` with all required keys
  - DATABASE_URL
  - RAZORPAY_KEY_ID
  - RAZORPAY_KEY_SECRET
  - RAZORPAY_WEBHOOK_SECRET
  - SMTP settings
  - JWT_SECRET
- [x] Created seed script `scripts/seed-plans.js`
  - Initializes 4 subscription plans
  - Idempotent (safe to run multiple times)
- [x] Created middleware `src/middleware.js`
  - Route protection
  - Auth redirect logic
  - Unauthenticated user handling

### Documentation
- [x] Created `SAAS_ARCHITECTURE.md`
  - System design overview
  - Database schema with relations
  - Authentication flow
  - Subscription plans
  - Multi-tenancy strategy
  - Security considerations
- [x] Created `IMPLEMENTATION_GUIDE.md`
  - Step-by-step setup instructions
  - Quick start guide
  - Database queries reference
  - Testing examples
  - Troubleshooting guide
- [x] Created `README_SAAS.md`
  - Product overview
  - Features list
  - Quick start
  - Architecture explanation
  - Pricing structure
  - Deployment guide
  - Roadmap

---

## ⏳ PHASE 2: Frontend Pages (NOT YET STARTED)

### Pages to Create

#### 1. Landing Page
- **Location**: `src/app/(landing)/page.js`
- **Features**:
  - Hero section with value proposition
  - Pricing comparison table
  - Feature highlights
  - FAQ section
  - CTA buttons (Sign up, Login)
  - Testimonials (optional)
  - Contact information

#### 2. Registration Page
- **Location**: `src/app/(auth)/register/page.js`
- **Form Fields**:
  - Email
  - Phone (10 digits)
  - First Name
  - Last Name
  - Business Name
  - Password (min 8 chars)
  - Confirm Password
  - Terms & Conditions checkbox
- **Actions**:
  - Call `registerUser()` from auth-actions.js
  - Show validation errors
  - Display success message
  - Redirect to dashboard

#### 3. Login Page
- **Location**: `src/app/(auth)/login/page.js`
- **Tabs**:
  - Email/Password login
  - Phone OTP login
- **Email/Password Tab**:
  - Email or Phone field
  - Password field
  - Remember me checkbox
  - Forgot password link
- **Phone OTP Tab**:
  - Phone field
  - "Send OTP" button
  - OTP input field
  - "Verify & Login" button
- **Actions**:
  - Call `loginUser()` for password
  - Call `verifyOTPAndLogin()` for OTP

#### 4. Subscription Dashboard Page
- **Location**: `src/app/(dashboard)/subscription/page.js`
- **Displays**:
  - Current plan name & price
  - Subscription status (Active, Trial, Expired)
  - Days remaining / renewal date
  - Features included
  - Usage metrics (messes/members used)
  - Upgrade/Downgrade buttons
  - Cancel subscription button
- **Actions**:
  - Call `getSubscriptionInfo()`
  - Call `upgradePlan()`
  - Call `downgradePlan()`
  - Call `cancelSubscription()`

#### 5. Billing & Payments Page
- **Location**: `src/app/(dashboard)/billing/page.js`
- **Displays**:
  - Payment method on file
  - Billing address
  - Upcoming payment date
  - Payment history table with:
    - Date
    - Plan name
    - Amount
    - Status (Paid, Failed, Pending)
    - Invoice (download link)
  - Update payment method button
- **Actions**:
  - Call `getPaymentHistory()`
  - Redirect to Razorpay for payment update

#### 6. Plans & Pricing Page
- **Location**: `src/app/(dashboard)/plans/page.js`
- **Displays**:
  - Current plan highlighted
  - All available plans in comparison view
  - Plan details (messes, members, features)
  - Upgrade path recommendations
  - Annual vs Monthly toggle
- **Actions**:
  - Call `upgradePlan()` with selected plan
  - Call `downgradePlan()` with selected plan
  - Show immediate effect of plan change

#### 7. Settings Page
- **Location**: `src/app/(dashboard)/settings/page.js`
- **Tabs**:
  - **Profile Tab**:
    - First Name, Last Name, Business Name
    - Email (view only)
    - Phone (view only)
    - Update button
  - **Security Tab**:
    - Current password
    - New password
    - Confirm new password
    - Change password button
  - **Preferences Tab**:
    - Email notifications toggle
    - SMS notifications toggle
    - Payment reminders toggle
    - Newsletter toggle
- **Actions**:
  - Call `updateUserProfile()`
  - Call `changePassword()`

---

## ⏳ PHASE 3: API Routes (NOT YET STARTED)

### Authentication Routes

#### 1. POST `/api/auth/register`
**Handler**: `src/app/api/auth/register/route.js`
```javascript
// Request body:
{
  email: "user@example.com",
  phone: "9876543210",
  firstName: "John",
  lastName: "Doe",
  businessName: "My Mess",
  password: "SecurePass123!"
}

// Response:
{
  ok: true,
  message: "Account created",
  userId: "cuid..."
}
```

#### 2. POST `/api/auth/login`
**Handler**: `src/app/api/auth/login/route.js`
```javascript
// Request body:
{
  emailOrPhone: "user@example.com",
  password: "SecurePass123!"
}

// Response:
{
  ok: true,
  message: "Logged in successfully",
  userId: "cuid..."
}
```

#### 3. POST `/api/auth/logout`
**Handler**: `src/app/api/auth/logout/route.js`
- Clear session cookie
- Return success

#### 4. GET `/api/auth/me`
**Handler**: `src/app/api/auth/me/route.js`
- Return current user info (from cookie)
- Requires authentication

#### 5. POST `/api/auth/send-otp`
**Handler**: `src/app/api/auth/send-otp/route.js`
```javascript
// Request body:
{ phone: "9876543210" }

// Response:
{ ok: true, message: "OTP sent" }
```

#### 6. POST `/api/auth/verify-otp`
**Handler**: `src/app/api/auth/verify-otp/route.js`
```javascript
// Request body:
{ phone: "9876543210", otp: "123456" }

// Response:
{ ok: true, message: "Verified", userId: "cuid..." }
```

### Subscription Routes

#### 7. GET `/api/subscriptions/current`
**Handler**: `src/app/api/subscriptions/current/route.js`
- Get user's active subscription
- Requires authentication

#### 8. POST `/api/subscriptions/upgrade`
**Handler**: `src/app/api/subscriptions/upgrade/route.js`
```javascript
// Request body:
{ planName: "Pro" }

// Response:
{ ok: true, subscription: {...} }
```

#### 9. POST `/api/subscriptions/downgrade`
**Handler**: `src/app/api/subscriptions/downgrade/route.js`
```javascript
// Request body:
{ planName: "Basic" }

// Response:
{ ok: true, subscription: {...} }
```

#### 10. POST `/api/subscriptions/cancel`
**Handler**: `src/app/api/subscriptions/cancel/route.js`
- Cancel user subscription
- Requires authentication

### Payment Routes

#### 11. POST `/api/razorpay/checkout`
**Handler**: `src/app/api/razorpay/checkout/route.js`
```javascript
// Request body:
{ planId: "cuid...", amount: 99900 }

// Creates Razorpay order
// Response:
{ orderId: "order_...", key: "rzp_live_..." }
```

#### 12. POST `/api/webhooks/razorpay`
**Handler**: `src/app/api/webhooks/razorpay/route.js`
- Receives Razorpay webhook events
- Verifies signature
- Updates subscription & payment records
- Sends confirmation emails
- No authentication (Razorpay calls this)

### Payment History Routes

#### 13. GET `/api/payments/history`
**Handler**: `src/app/api/payments/history/route.js`
- Get user's payment history
- Pagination support
- Requires authentication

---

## ⏳ PHASE 4: Components (NOT YET STARTED)

### Reusable Components

#### Authentication Components
- `components/auth/RegisterForm.js`
- `components/auth/LoginForm.js`
- `components/auth/OTPInput.js`
- `components/auth/PasswordInput.js`

#### Subscription Components
- `components/subscription/PricingTable.js`
- `components/subscription/PlanCard.js`
- `components/subscription/UpgradePrompt.js`
- `components/subscription/FeatureBadge.js`

#### Payment Components
- `components/payment/RazorpayForm.js`
- `components/payment/PaymentHistory.js`
- `components/payment/InvoiceList.js`

#### Shared Components
- `components/Navbar.js` (with user menu)
- `components/Sidebar.js` (dashboard navigation)
- `components/Layout.js` (dashboard layout)
- `components/Alert.js` (notifications)

---

## ⏳ PHASE 5: Integration & Testing (NOT YET STARTED)

### Database Connectivity
- [ ] Apply SQL migration once DB is accessible
- [ ] Verify all tables created
- [ ] Verify indexes created
- [ ] Run seed-plans.js script
- [ ] Test database connections

### Integration Testing
- [ ] Test user registration flow
- [ ] Test login with email/password
- [ ] Test OTP login
- [ ] Test subscription creation
- [ ] Test plan upgrade
- [ ] Test Razorpay payment
- [ ] Test webhook handling
- [ ] Test multi-tenant data isolation
- [ ] Test subscription limits

### Security Testing
- [ ] Test password hashing
- [ ] Test session expiration
- [ ] Test CSRF protection
- [ ] Test unauthorized access
- [ ] Test SQL injection protection
- [ ] Test XSS prevention
- [ ] Test data isolation

### Load Testing
- [ ] Test with concurrent users
- [ ] Test payment processing under load
- [ ] Monitor database performance
- [ ] Check memory usage

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] Error logging setup

### Infrastructure
- [ ] Select hosting (Vercel recommended)
- [ ] Configure domain
- [ ] Set up SSL/HTTPS
- [ ] Configure DNS
- [ ] Setup CDN (optional)

### Razorpay Setup
- [ ] Get live API keys
- [ ] Update .env.production
- [ ] Register webhook URL
- [ ] Test webhook delivery
- [ ] Get merchant account approved

### Monitoring & Alerts
- [ ] Setup error tracking (Sentry)
- [ ] Setup monitoring (DataDog, New Relic)
- [ ] Setup alerts for critical issues
- [ ] Setup backup monitoring
- [ ] Configure uptime monitoring

### Post-Deployment
- [ ] Verify all features working
- [ ] Test payment flow end-to-end
- [ ] Monitor server logs
- [ ] Check database performance
- [ ] Verify email delivery
- [ ] Test user registration

---

## 📈 Success Metrics

- [ ] Users can register (conversion rate: 80%+)
- [ ] Users can complete payment (checkout success: 95%+)
- [ ] Subscription renewals (auto-renewal rate: 90%+)
- [ ] Page load time < 2 seconds
- [ ] Zero data isolation breaches
- [ ] 99.9% uptime

---

## 📝 Notes

1. **Database Migration**: The SQL migration file is ready at `prisma/migrations/20260613_add_saas_tables.sql`. Once the DB connection is stable, run:
   ```bash
   npx prisma migrate deploy
   ```

2. **Seed Script**: Initialize default plans with:
   ```bash
   node scripts/seed-plans.js
   ```

3. **Dependencies**: Install new packages:
   ```bash
   npm install
   ```

4. **Testing**: Use Razorpay test credentials during development

5. **Production**: Switch to live keys before going live

---

## 🎯 Estimated Timeline

- **Phase 2 (Frontend)**: 2-3 days
- **Phase 3 (API Routes)**: 1-2 days
- **Phase 4 (Components)**: 1-2 days
- **Phase 5 (Testing & Deployment)**: 1-2 days

**Total: 5-9 days to production-ready**

---

## 🆘 Support

For issues or questions:
1. Check IMPLEMENTATION_GUIDE.md
2. Check SAAS_ARCHITECTURE.md
3. Review code comments
4. Check error logs
5. Contact support

---

**Status**: 50% Complete (Backend Done, Frontend Pending)
**Last Updated**: June 13, 2026
**Version**: 2.0.0 (SaaS Edition)
