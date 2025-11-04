import { Dumbbell, LogOut } from 'lucide-react';
import { Button } from '../ui';

interface HeaderProps {
  userEmail?: string;
  onSignOut: () => void;
}

export function Header({ userEmail, onSignOut }: HeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Dumbbell className="text-primary-600" size={40} />
        <h1 className="text-4xl font-bold text-gray-900">Gym Tracker</h1>
      </div>
      <p className="text-gray-600 text-lg">Track your exercises and follow your training plans</p>
      
      {userEmail && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="text-sm text-gray-600">Welcome, {userEmail}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onSignOut}
            leftIcon={<LogOut size={16} />}
          >
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );
}