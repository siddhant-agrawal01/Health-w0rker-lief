
## Important Testing Note

**Note:** If you test the Vercel deployed app, you will not be able to clock in because the hospital details are configured according to my local area. To see the application working properly, check the video demonstration below or set up the application locally with your own area's hospital details.

[Video Demonstration Link]

[Screencast from 2025-03-14 20-25-42.webm](https://github.com/user-attachments/assets/63f0f918-575f-483c-926a-c201374c5d1f)


# Health Worker Application

A comprehensive web application for healthcare workers to clock in and out of their shifts efficiently. This platform is accessible via both web and mobile, allowing hospitals and other healthcare organizations to track and manage shift timings accurately.

## Project Overview

This application is built with Next.js, leveraging modern web technologies to provide:

- Location-based clock-in/out system for healthcare workers
- Role-based access control for managers and care workers
- Real-time monitoring of staff attendance
- Analytics dashboard for tracking work hours and patterns

## Core Features

### Role-Based Access

#### Manager Features:

- **Location-Based Clock-In Control**
  - Set geographic perimeters (within 5 km of a hospital)
  - Restrict clock-in to authorized locations
- **Shift Monitoring Dashboard**
  - Real-time table of all staff currently clocked in
  - Clock-in/out timestamps and locations
- **Analytics Dashboard**
  - Daily statistics (average hours, staff count)
  - Weekly reports on hours worked per staff

#### Care Worker Features:

- **Clock-In System**
  - Location-verified clock-in
  - Note addition option
  - Error messaging for out-of-bounds attempts
- **Clock-Out System**
  - Status-aware interface
  - Optional notes at clock-out

### User Authentication

- Username & Password authentication
- Google Authentication (OAuth via Auth0)
- Secure session management
- User history dashboard

## Tech Stack

- **Frontend:** Next.js with Tailwind CSS and ShadCN UI
- **Backend:** GraphQL API
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Auth0 with multiple sign-in methods

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/Health-w0rker-lief.git
   cd Health-w0rker-lief
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables by creating a `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/health_worker_db?schema=public"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generated-secret-key"
   ```

### Database Setup

1. Make sure PostgreSQL is installed and running on your system
2. Create a new database:
   ```sql
   CREATE DATABASE health_worker_db;
   ```
3. Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

### Seeding Hospital Data

To use the application properly, you need to seed the database with hospital data:

1. Locate the `seed.js` file in the `prisma` directory
2. Edit the file to add hospitals in your area:

   ```javascript
   // Example format for adding a hospital
   {
     name: "General Hospital",
     latitude: 40.7128, // Use your area's coordinates
     longitude: -74.0060, // Use your area's coordinates
     address: "123 Hospital Street, City, State, ZIP"
   }
   ```

   > **Important**: Add hospitals within a 5km radius of your current location to enable successful clock-in

3. Run the seed script:
   ```bash
   npx prisma db seed
   ```

### Running the Application

1. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## Development Notes

- You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.
- This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a custom font family.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

