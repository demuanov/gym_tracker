import React, { useState } from 'react';
import {
  Calendar,
  BarChart3,
  User,
  Settings,
  Dumbbell,
  TrendingUp,
  Trophy,
  Target,
  Clock,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Button, Card } from '../ui';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // User from Supabase
  onNavigate: (view: 'calendar' | 'statistics' | 'profile') => void;
  onSignOut: () => void;
  currentView: string;
  stats?: {
    totalWorkouts: number;
    totalExercises: number;
    weeklyGoal: number;
    currentStreak: number;
    totalWeight: number;
    averageWorkoutTime: number;
  };
}

export default function NavigationDrawer({
  isOpen,
  onClose,
  user,
  onNavigate,
  onSignOut,
  currentView,
  stats = {
    totalWorkouts: 0,
    totalExercises: 0,
    weeklyGoal: 3,
    currentStreak: 0,
    totalWeight: 0,
    averageWorkoutTime: 45
  }
}: NavigationDrawerProps) {
  const navigationItems = [
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      description: 'View and schedule workouts'
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: BarChart3,
      description: 'Track your progress'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Account settings'
    }
  ];

  const handleNavigate = (view: 'calendar' | 'statistics' | 'profile') => {
    onNavigate(view);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Dumbbell className="text-primary-600" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Gym Tracker</h1>
                <p className="text-sm text-gray-600">Workout Planner</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="lg:hidden p-2"
            >
              <X size={16} />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="text-primary-600" size={20} />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-sm text-gray-600">{user?.email}</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{stats.currentStreak}</div>
                <div className="text-xs text-green-700">Day Streak</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{stats.totalWorkouts}</div>
                <div className="text-xs text-blue-700">Workouts</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-6 space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id as 'calendar' | 'statistics' | 'profile')}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left
                  ${currentView === item.id
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon size={20} />
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm opacity-75">{item.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Statistics Preview */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              This Week
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-blue-600" />
                  <span className="text-sm text-gray-700">Weekly Goal</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {Math.min(stats.totalWorkouts, stats.weeklyGoal)}/{stats.weeklyGoal}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-green-600" />
                  <span className="text-sm text-gray-700">Avg. Time</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.averageWorkoutTime}min
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-600" />
                  <span className="text-sm text-gray-700">Total Weight</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {(stats.totalWeight / 1000).toFixed(1)}k kg
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Weekly Progress</span>
                  <span>{Math.round((stats.totalWorkouts / stats.weeklyGoal) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((stats.totalWorkouts / stats.weeklyGoal) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onSignOut}
              className="w-full"
              leftIcon={<LogOut size={16} />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Toggle Button Component
interface DrawerToggleProps {
  onClick: () => void;
  className?: string;
}

export function DrawerToggle({ onClick, className = '' }: DrawerToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`lg:hidden ${className}`}
      leftIcon={<Menu size={16} />}
    >
      Menu
    </Button>
  );
}