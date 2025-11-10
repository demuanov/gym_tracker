# 🏋️‍♂️ Gym Tracker

A comprehensive, modern React application for tracking gym workouts, managing training plans, and monitoring fitness progress. Built with a calendar-centric approach to workout scheduling and detailed exercise tracking.

## ✨ Key Features

### 📅 **Calendar-Based Workout Management**
- Interactive calendar interface for scheduling and tracking workouts
- Visual indicators for scheduled vs completed training sessions
- Easy workout assignment to specific dates
- Monthly and weekly workout planning

### 🏋️‍♂️ **Advanced Exercise Tracking**
- Comprehensive exercise library with categories (Chest, Back, Shoulders, Arms, Legs, Core, Cardio, Full Body)
- Detailed exercise management with sets, reps, and weight tracking
- Real-time exercise completion status
- Progressive overload monitoring

### 📋 **Enhanced Training Plans**
- Create multi-day workout plans with detailed scheduling
- Enhanced training plan form with exercise selection and workout configuration
- Plan assignment to calendar dates
- Training plan templates and customization

### ⏱️ **Integrated Workout Timer**
- Built-in timer for workout sessions and rest periods
- Start, pause, and reset functionality
- Timer integration within exercise detail view
- Rest period management between sets

### 📊 **Progress Analytics**
- Comprehensive workout statistics and progress tracking
- Total workouts completed and weekly goals
- Weight progression and personal records
- Workout streak tracking and motivation metrics

### 🎛️ **Responsive Navigation**
- Mobile-first responsive design with navigation drawer
- Desktop navigation tabs for larger screens
- Quick access to all app sections (Calendar, Exercises, Plans, Statistics, Profile)
- User account management and authentication

### 🔐 **Secure User Management**
- Supabase authentication with email/password
- Secure user data storage and privacy
- Multi-user support with isolated data

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Full type safety and enhanced developer experience
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development

### **Backend & Database**
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - Secure user authentication and authorization
- **Real-time Subscriptions** - Live data updates across clients

### **UI & UX**
- **Lucide React** - Beautiful, customizable SVG icon library
- **date-fns** - Modern JavaScript date utility library
- **Responsive Design** - Mobile-first approach with desktop optimization
- **Custom Hooks** - Reusable logic for timers, authentication, and data fetching

### **Development Tools**
- **ESLint** - Code linting and quality enforcement
- **TypeScript ESLint** - TypeScript-specific linting rules
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - Automatic vendor prefix handling

## 📁 Project Structure

```
gym_tracker/
├── 📁 src/
│   ├── 📁 components/           # React components
│   │   ├── 📁 ui/              # Reusable UI components (Button, Card, Modal, etc.)
│   │   ├── 📁 forms/           # Form components (ExerciseForm, TrainingPlanForm)
│   │   ├── 📁 exercise/        # Exercise components (ExerciseCard, ExerciseDetailView)
│   │   ├── 📁 training/        # Training plan components (TrainingPlanView, etc.)
│   │   ├── 📁 calendar/        # Calendar components (CalendarView, DatePicker)
│   │   └── 📁 layout/          # Layout components (NavigationDrawer, Header)
│   ├── 📁 config/              # Configuration files
│   │   ├── env.ts              # Environment configuration
│   │   └── constants.ts        # App constants and exercise categories
│   ├── 📁 hooks/               # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hook
│   │   ├── useExercises.ts     # Exercise management hook
│   │   └── useWorkoutTimer.ts  # Workout timer hook
│   ├── 📁 lib/                 # Core services
│   │   └── supabase.ts         # Supabase client configuration
│   ├── 📁 types/               # TypeScript type definitions
│   │   ├── index.ts            # Main type definitions
│   │   └── database.ts         # Supabase generated types
│   ├── 📁 utils/               # Utility functions
│   │   ├── date.ts             # Date formatting and manipulation
│   │   ├── helpers.ts          # General helper functions
│   │   └── index.ts            # Utility exports
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
├── 📁 supabase/
│   └── 📁 migrations/          # Database migration files
│       └── 20250630183241_broken_stream.sql
├── 📁 scripts/                 # Build and utility scripts
├── 📄 .env                     # Environment variables
├── 📄 .env.example            # Environment template
├── 📄 package.json            # Project dependencies and scripts
├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 tailwind.config.js      # Tailwind CSS configuration
├── 📄 vite.config.ts          # Vite build configuration
└── 📄 README.md               # Project documentation
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
2. Run the SQL migrations from `supabase/migrations/` in your Supabase SQL editor:
   ```sql
   -- Run the migration file to create all necessary tables
   -- This includes: exercises, training_plans, calendar_workouts, exercise_sets, workout_timers
   ```
3. Get your project URL and anon key from the Supabase dashboard
4. Update your `.env` file with these credentials

### 5. Database Migration

Run the database migration to set up all required tables:

```bash
npm run db:migrate
```

This will create the following tables:
- `exercises` - Exercise definitions and metadata
- `training_plans` - Training plan templates
- `calendar_workouts` - Scheduled workouts on calendar
- `exercise_sets` - Individual sets with reps and weight
- `workout_timers` - Timer sessions for workouts

### 6. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🚀 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reloading |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code quality checks |
| `npm run lint:fix` | Automatically fix ESLint errors |
| `npm run db:migrate` | Run database migrations |
| `npm run db:check` | Check database connection and status |
| `npm run db:types` | Generate TypeScript types from Supabase schema |

## 🎯 Usage Guide

### **Getting Started**
1. **Sign Up/Login** - Create an account or sign in with your credentials
2. **Add Exercises** - Start by adding your favorite exercises with categories
3. **Create Training Plans** - Design comprehensive workout plans with multiple days
4. **Schedule Workouts** - Use the calendar to assign plans to specific dates
5. **Track Progress** - Log your sets, reps, and weights during workouts

### **Workflow Example**
```
1. Create exercises (Bench Press, Squats, etc.)
   ↓
2. Build a training plan (Push/Pull/Legs split)
   ↓
3. Schedule plan on calendar dates
   ↓
4. On workout day, open exercise detail view
   ↓
5. Add sets with reps and weight, use timer
   ↓
6. Track progress and view statistics
```

### **Key Navigation**
- **📅 Calendar**: Main view for scheduling and accessing workouts
- **🏋️‍♂️ Exercises**: Manage your exercise library
- **📋 Plans**: Create and edit training plans
- **📊 Statistics**: View progress and analytics
- **👤 Profile**: Account settings and preferences

## ⚙️ Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ Yes | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ Yes | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_APP_NAME` | Application name | ❌ No | `Gym Tracker` |
| `VITE_APP_VERSION` | Application version | ❌ No | `1.0.0` |
| `VITE_DEV_MODE` | Development mode flag | ❌ No | `true` |

## 🏗️ Architecture & Design Patterns

### **Component Architecture**
- **Atomic Design**: UI components built with reusable atoms and molecules
- **Container/Presentational**: Clear separation of data logic and presentation
- **Custom Hooks**: Encapsulated business logic in reusable hooks

### **State Management**
- **React Hooks**: useState and useEffect for local component state
- **Custom Hooks**: Centralized state management for auth, exercises, and timers
- **Supabase Real-time**: Automatic data synchronization across clients

### **Data Flow**
```
Supabase (Database) ↔ Custom Hooks ↔ React Components ↔ User Interface
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository** to your GitHub account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/gym-tracker.git
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes** and commit them:
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Run quality checks**:
   ```bash
   npm run lint
   npm run build
   ```
6. **Push to your branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Submit a pull request** with a clear description of your changes

### **Development Guidelines**
- Follow TypeScript best practices
- Maintain consistent code formatting with ESLint
- Write descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed

## 🐛 Troubleshooting

### **Common Issues**

**Build Errors:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Supabase Connection Issues:**
- Verify your `.env` file has correct Supabase credentials
- Check if your Supabase project is active
- Run `npm run db:check` to test database connection

**TypeScript Errors:**
```bash
# Regenerate Supabase types
npm run db:types
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Supabase** - For the excellent backend-as-a-service platform
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icon library
- **Vite** - For the lightning-fast build tool

---

**Built with ❤️ for fitness enthusiasts and developers who love clean, modern web applications.**