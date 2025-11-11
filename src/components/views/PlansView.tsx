import { Plus, Target, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Exercise, TrainingPlan } from '../../types';

interface PlansViewProps {
  trainingPlans: TrainingPlan[];
  exercises: Exercise[];
  onCreateClassicPlan: () => void;
  onCreateEnhancedPlan: () => void;
  onNavigateToExercises: () => void;
  onSelectPlan: (plan: TrainingPlan) => void;
  onDeletePlan: (planId: string) => void;
}

export function PlansView({
  trainingPlans,
  exercises,
  onCreateClassicPlan,
  onCreateEnhancedPlan,
  onNavigateToExercises,
  onSelectPlan,
  onDeletePlan,
}: PlansViewProps) {
  if (exercises.length === 0) {
    return (
      <Card className="text-center py-12">
        <Target className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Create exercises first</h3>
        <p className="text-gray-600 mb-6">
          You need to have exercises before creating a training plan
        </p>
        <Button onClick={onNavigateToExercises}>Go to Exercises</Button>
      </Card>
    );
  }

  if (trainingPlans.length === 0) {
    return (
      <Card className="text-center py-12">
        <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No training plans yet</h3>
        <p className="text-gray-600 mb-6">Create your first training plan to get started</p>
        <Button onClick={onCreateEnhancedPlan}>Create Your First Plan</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Training Plans</h2>
        <div className="flex gap-3">
          <Button onClick={onCreateClassicPlan} variant="outline" leftIcon={<Plus size={20} />}>
            Classic Plan
          </Button>
          <Button onClick={onCreateEnhancedPlan} leftIcon={<Plus size={20} />}>
            Enhanced Plan
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {trainingPlans.map((plan) => (
          <Card key={plan.id} hover>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                {plan.description && <p className="text-gray-700 mb-3">{plan.description}</p>}
                {plan.exercises && (
                  <p className="text-sm text-gray-600 mb-3">
                    {plan.exercises.length} exercise{plan.exercises.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => onSelectPlan(plan)} className="flex-1">
                View Plan
              </Button>
              <Button onClick={() => onDeletePlan(plan.id)} variant="outline">
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
