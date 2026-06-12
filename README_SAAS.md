# Mess Manager SaaS Platform

A complete multi-tenant Software-as-a-Service (SaaS) platform for managing mess (hostel) memberships, payments, and customer communications at scale.

## 🎯 Key Features

### Multi-Tenancy
- ✅ Each mess business gets its own isolated workspace
- ✅ Multiple messes per subscription
- ✅ Secure data isolation with userId checks

### Authentication
- ✅ Email/Password registration and login
- ✅ Phone OTP login (ready for SMS integration)
- ✅ Secure password hashing with bcrypt
- ✅ Session-based authentication with HTTP-only cookies

### Subscription Management
- ✅ **Free Plan**: 1 mess, 50 members (14-day trial)
- ✅ **Basic Plan**: 3 messes, 500 members (₹299/month)
- ✅ **Pro Plan**: Unlimited messes, unlimited members (₹999/month)
- ✅ **Enterprise Plan**: Custom features and support (₹2,999/month)

### Feature-Based Limits
- WhatsApp alerts (all plans)
- Custom branding (Pro+ only)
- Advanced reporting (Pro+ only)
- API access (Enterprise only)

### Payment Processing
- ✅ **Razorpay Integration**: Accept subscriptions and one-time payments
- ✅ **Webhook Handling**: Real-time payment status updates
- ✅ **Payment History**: Track all transactions
- ✅ **Automatic Renewals**: Recurring billing management

### Member Management
- ✅ Add/edit/delete members
- ✅ Payment and expiry tracking
- ✅ WhatsApp reminders
- ✅ Bulk operations

### Dashboard
- ✅ Real-time analytics
- ✅ Subscription status
- ✅ Usage metrics
- ✅ Payment history

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Razorpay account (free)
- Git

### Installation

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database and Razorpay keys
   ```

3. **Setup database**
   ```bash
   # If using Neon DB or remote PostgreSQL
   npx prisma migrate deploy
   
   # Or if you need to apply migrations
   npx prisma migrate dev --name init
   ```

4. **Seed default plans**
   ```bash
   node scripts/seed-plans.js
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the app**
   - Open http://localhost:3000
   - Register a new account
   - Start your 14-day free trial!

## 📚 Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **Backend**: Next.js API routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Session + HTTP-only cookies
- **Payments**: Razorpay (India-based)
- **Security**: bcrypt, CSRF protection, SQL injection prevention

### Database Schema

```
User
├── Subscription (many)
│   ├── Plan
│   └── Payment (many)
└── Mess (many)
    ├── Member
    └── Setting
```

### File Structure
```
src/
├── app/
│   ├── auth-actions.js              # Authentication
│   ├── subscription-actions.js      # Subscription logic
│   ├── actions.js                   # Existing mess operations (updated)
│   ├── dashboard.js                 # Main dashboard
│   ├── layout.js
│   └── middleware.js                # Auth middleware
├── lib/
│   ├── auth-utils.js                # Auth utilities
│   ├── subscription.js              # Plan management
│   ├── razorpay.js                  # Payment processing
│   ├── members.js
│   ├── prisma.js
│   └── ...
└── generated/prisma/                # Generated types

prisma/
├── schema.prisma                    # Database schema
└── migrations/                      # Migration history

scripts/
└── seed-plans.js                    # Initialize subscription plans

docs/
├── SAAS_ARCHITECTURE.md
├── IMPLEMENTATION_GUIDE.md
└── ...
```

## 🔐 Authentication Flow

### Registration
```
1. User enters email, phone, name, business name, password
2. Validation checks (format, uniqueness, strength)
3. Password hashing with bcrypt
4. User record created
5. Free trial subscription auto-created (14 days Pro plan)
6. Session cookie set
7. Redirect to dashboard
```

### Login
```
1. User enters email/phone + password
2. User lookup
3. Password verification
4. Session cookie set
5. Redirect to dashboard (or requested page)
```

## 💳 Subscription Flow

### Trial Period
```
Registration
    ↓
Auto-create Trial Subscription
    ↓
14 days of Pro features
    ↓
Reminder email at day 12
    ↓
Upgrade or downgrade at day 14
```

### Upgrade Flow
```
1. User selects new plan
2. Create Razorpay order
3. Display payment form
4. User completes payment
5. Razorpay webhook confirms
6. Update subscription status
7. Show success message
```

### Webhook Processing
```
Payment completed
    ↓
Razorpay sends webhook
    ↓
Verify signature
    ↓
Update Payment record
    ↓
Update Subscription status
    ↓
Send confirmation email
```

## 🛡️ Security Features

- ✅ **Passwords**: Bcrypt hashing with salt rounds
- ✅ **Sessions**: HTTP-only, secure cookies
- ✅ **API Routes**: Server-side validation
- ✅ **Database**: Parameterized queries via Prisma
- ✅ **CSRF**: Next.js built-in protection
- ✅ **XSS**: React auto-escaping
- ✅ **Payment**: Razorpay webhook signature verification
- ✅ **Data Isolation**: userId checks on all queries
- ✅ **Rate Limiting**: Ready for implementation
- ✅ **HTTPS**: Enforced in production

## 📖 Implementation Guides

- [SaaS Architecture](./SAAS_ARCHITECTURE.md) - System design and database schema
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Step-by-step implementation
- [Setup Guide](./SETUP.md) - Installation and configuration
- [API Documentation](./API_DOCS.md) - Coming soon

## 🧪 Testing

### Test Credentials
- **Razorpay Test Cards**: See https://razorpay.com/docs/api/webhooks/
- **Test Email**: Use any email ending with `.test`
- **Test Phone**: Any 10-digit number

### API Endpoints (Ready for implementation)

```
# Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/send-otp
POST   /api/auth/verify-otp

# Subscriptions
GET    /api/subscriptions/current
POST   /api/subscriptions/upgrade
POST   /api/subscriptions/downgrade
POST   /api/subscriptions/cancel
GET    /api/payments/history

# Messes & Members
GET    /api/messes
POST   /api/messes
GET    /api/messes/:messId/members
POST   /api/messes/:messId/members

# Webhooks
POST   /api/webhooks/razorpay
```

## 📊 Pricing Structure

| Feature | Free | Basic | Pro | Enterprise |
|---------|------|-------|-----|------------|
| Price | Free | ₹299 | ₹999 | Custom |
| Messes | 1 | 3 | ∞ | ∞ |
| Members | 50 | 500 | ∞ | ∞ |
| WhatsApp Alerts | ✓ | ✓ | ✓ | ✓ |
| Custom Branding | ✗ | ✗ | ✓ | ✓ |
| Analytics | ✗ | ✗ | ✓ | ✓ |
| API Access | ✗ | ✗ | ✗ | ✓ |
| Priority Support | ✗ | ✗ | ✗ | ✓ |

## 🔄 Deployment

### Environment Variables Required
```env
# Database
DATABASE_URL=postgresql://...

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=secret
RAZORPAY_WEBHOOK_SECRET=webhook_secret

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
JWT_SECRET=your-secret-key
```

### Deployment Platforms
- **Vercel** (Recommended for Next.js)
- **Railway**
- **Render**
- **AWS**
- **DigitalOcean**

### Production Checklist
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] SSL/HTTPS enabled
- [ ] Razorpay live keys set
- [ ] Email service configured
- [ ] Monitoring/logging setup
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Security headers set
- [ ] Database indexes created

## 🚦 Roadmap

### Phase 1 (Current)
- ✅ Multi-tenant architecture
- ✅ Authentication system
- ✅ Subscription management
- ✅ Razorpay integration
- ✅ Basic dashboard

### Phase 2
- [ ] Email verification
- [ ] SMS OTP with Twilio
- [ ] Advanced analytics
- [ ] Bulk operations
- [ ] CSV import/export

### Phase 3
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations
- [ ] White-label solution
- [ ] Team management
- [ ] Advanced reporting

### Phase 4
- [ ] AI-powered insights
- [ ] Predictive analytics
- [ ] Automated invoicing
- [ ] Accounting software integration
- [ ] Multi-language support

## 📞 Support & Resources

- **Prisma**: https://www.prisma.io/docs/
- **Razorpay**: https://razorpay.com/docs/
- **Next.js**: https://nextjs.org/docs/
- **React**: https://react.dev/

## 🤝 Contributing

This is a commercial product. For issues or feature requests:
1. Check existing issues
2. Create detailed bug report
3. Suggest features with use cases

## 📄 License

This project is proprietary. All rights reserved.

## 💬 Questions?

- Email: support@messmanger.com
- Chat: https://messmanger.com/chat
- Docs: https://docs.messmanger.com

---

**Built with ❤️ for mess businesses everywhere**

Last updated: June 2026
Version: 2.0.0 (SaaS Edition)
