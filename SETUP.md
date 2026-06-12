# Mess Manager - Setup Guide

## Project Overview
Mess Manager is a full-stack web application for managing mess (hostel) memberships, payments, and customer communications. Built with Next.js 16, React 19, Tailwind CSS v4, and Prisma ORM.

## Features
- 🏢 **Multi-Mess Support**: Manage multiple messes from a single dashboard
- 👥 **Member Management**: Add, update, delete, and track member information
- 💰 **Payment Tracking**: Monitor payment dates, amounts, and membership plans
- ⏰ **Expiry Alerts**: Automatic alerts for expired and expiring memberships
- 💬 **WhatsApp Integration**: Send ready-made WhatsApp messages to members
- 📊 **Dashboard Analytics**: View key metrics and member statistics

## Tech Stack
- **Frontend**: Next.js 16.2.9, React 19.2.4
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Prisma ORM
- **Runtime**: Node.js
- **Build Tool**: Turbopack

## Installation

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or remote)
- npm or yarn package manager

### Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file in the project root:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mess_management"
   ```

3. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

4. **Generate Prisma Client**
   ```bash
   npm run build
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio to manage database

## Database Schema

### Mess
- `id`: Unique identifier (CUID)
- `name`: Mess name
- `members`: Relation to Member model
- `settings`: Relation to Setting model

### Member
- `id`: Unique identifier (CUID)
- `messId`: Foreign key to Mess
- `name`: Member name
- `mobile`: WhatsApp phone number
- `registrationDate`: Date member joined
- `paymentDate`: Latest payment date
- `durationDays`: Membership duration (days)
- `amount`: Monthly amount in Rs.
- `plan`: Membership plan name

### Setting
- `messId`: Foreign key to Mess (composite key)
- `key`: Setting key (composite key)
- `value`: Setting value
- `updatedAt`: Last update timestamp

## Project Structure

```
src/
├── app/
│   ├── actions.js          - Server actions (CRUD operations)
│   ├── dashboard.js        - Main dashboard component
│   ├── page.js             - Home page
│   ├── layout.js           - Root layout
│   └── globals.css         - Global styles
├── lib/
│   ├── members.js          - Member-related utilities
│   └── prisma.js           - Prisma client configuration
└── generated/
    └── prisma/             - Generated Prisma types

prisma/
├── schema.prisma           - Database schema
└── migrations/             - Database migration history

public/
└── mess-hero.png          - Hero image
```

## API Actions

All operations are server-side actions defined in `src/app/actions.js`:

- `createMess(input)` - Create a new mess
- `loadMess(messId)` - Switch to a mess
- `createMember(messId, input)` - Add a new member
- `renewMember(messId, memberId)` - Renew membership payment
- `deleteMember(messId, memberId)` - Remove a member
- `saveOwnerNumber(messId, value)` - Save owner's WhatsApp number

## Features in Detail

### Member Lifecycle
1. **Add Member**: Enter name, mobile, registration date, payment date, days, amount, and plan
2. **Track Status**: Status is automatically calculated:
   - **Active**: Payment not expired, 3+ days remaining
   - **Expiring**: Payment expiring in 1-3 days
   - **Expired**: Payment expired
3. **Renew**: Update payment date to today
4. **Contact**: Send WhatsApp messages with pre-filled templates
5. **Delete**: Remove member from database

### WhatsApp Alerts
- Send individual renewal reminders to members
- Send batch alerts to owner for all expired memberships
- Phone number normalization (10-digit → 91XXXXXXXXXX)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## Troubleshooting

### Port 3000 already in use
Kill the existing process:
```bash
taskkill /PID 22688 /F  # Windows
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9  # Mac/Linux
```

### Database connection errors
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database credentials

### Prisma generation errors
```bash
rm -rf src/generated/prisma
npm run build
```

## Production Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

3. Environment setup:
   - Set `NODE_ENV=production`
   - Configure `DATABASE_URL` for production database
   - Use strong password for database

## License
MIT

## Support
For issues or feature requests, please check the project README or create an issue.
