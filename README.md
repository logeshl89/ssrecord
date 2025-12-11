# SS Engineering Business Dashboard

A comprehensive full-stack business management dashboard built with Next.js 16, TypeScript, and PostgreSQL. This application helps businesses manage their sales, purchases, and financial records with automated billing and reporting features.

## Features

- **User Authentication**: Secure login system with password management
- **Transaction Management**: Record and manage sales and purchase transactions
- **Automated Billing**: Auto-generated bill numbers in format P/S + YEAR + sequence
- **Financial Dashboard**: Real-time financial insights with charts and metrics
- **Reporting**: Export transaction data to PDF reports
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI, Radix UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Node.js pg client
- **Authentication**: Custom JWT-based authentication
- **Charts**: Recharts for data visualization
- **PDF Generation**: jsPDF with AutoTable
- **Deployment**: Netlify with optimized configuration

## Prerequisites

- Node.js 18+ or 20+
- PostgreSQL database
- npm or yarn package manager

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ssrecord
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with your database credentials:

```env
POSTGRES_URL=your_postgresql_connection_string
NILEDB_API_URL=your_niledb_api_url
NILEDB_PASSWORD=your_niledb_password
NILEDB_POSTGRES_URL=your_niledb_postgres_url
NILEDB_URL=your_niledb_url
NILEDB_USER=your_niledb_user
```

### 4. Database Setup

Run the database initialization script to create tables and seed initial data:

```bash
npm run db:init
```

### 5. Development Server

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:9002` to access the application.

## Production Deployment

### Netlify Deployment

The project is configured for easy deployment to Netlify:

1. Connect your GitHub repository to Netlify
2. Set the build command to: `npm run build`
3. Set the publish directory to: `.next`
4. Add environment variables in Netlify dashboard

### Manual Production Build

```bash
npm run build:prod
npm run start:prod
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard page
│   ├── entries/        # Transaction entries page
│   ├── login/          # Login page
│   └── profile/        # User profile page
├── components/         # Reusable UI components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Business logic and utilities
│   ├── migrations/     # Database migration scripts
│   ├── services/       # Service layer for business logic
│   └── types/          # TypeScript type definitions
└── public/             # Static assets
```

## Key Features Explained

### Automated Bill Numbers
- Sales bills are prefixed with 'S' + current year + sequence number (e.g., S2025001)
- Purchase bills are prefixed with 'P' + current year + sequence number (e.g., P2025001)

### Financial Dashboard
- Real-time calculation of total revenue and purchases
- Profit calculation based on base amounts (excluding GST)
- Monthly overview charts for sales and purchases
- GST payable calculations

### Data Management
- Centralized data context for efficient data sharing
- Client-side calculations for better performance
- Real-time data updates after CRUD operations

### Security
- Password hashing with bcrypt
- Protected routes with authentication middleware
- Secure database connections with SSL

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run db:init` - Initialize database with migrations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is proprietary software for SS Engineering. All rights reserved.

## Support

For support, contact the development team or create an issue in the repository.