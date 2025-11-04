# Gym Tracker

A modern React application for tracking gym exercises and creating training plans.

## Features

- 📋 Exercise tracking with categories
- 📅 Monthly training plans
- 📊 Progress tracking
- 🔐 User authentication with Supabase
- 📱 Responsive design with Tailwind CSS
- 🎨 Modern UI components

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   ├── exercise/        # Exercise-related components
│   ├── training/        # Training plan components
│   └── layout/          # Layout components
├── config/              # Configuration files
│   ├── env.ts           # Environment configuration
│   └── constants.ts     # App constants
├── hooks/               # Custom React hooks
├── services/            # API services
│   ├── supabase.ts      # Supabase client and services
│   └── index.ts         # Service exports
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
│   ├── date.ts          # Date utilities
│   ├── helpers.ts       # General helpers
│   ├── validation.ts    # Form validation
│   └── index.ts         # Utility exports
└── lib/                 # Legacy library files
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd gym_tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
copy .env.example .env
```

Update the `.env` file with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# App Configuration
VITE_APP_NAME=Gym Tracker
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_MODE=true
```

### 4. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL migrations from `supabase/migrations/` in your Supabase SQL editor
3. Get your project URL and anon key from the Supabase dashboard
4. Update your `.env` file with these credentials

### 5. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `VITE_APP_NAME` | Application name | No |
| `VITE_APP_VERSION` | Application version | No |
| `VITE_DEV_MODE` | Development mode flag | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details