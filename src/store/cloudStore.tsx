import { create } from 'zustand';

type PlanType = 'free' | 'pro' | 'enterprise';

interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
}

interface CloudState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useCloudStore = create<CloudState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

const plans = {
  free: { name: 'Gratuito', color: '#9e9e9e', limit: 3 },
  pro: { name: 'Pro', color: '#2196f3', limit: 50 },
  enterprise: { name: 'Enterprise', color: '#4caf50', limit: Infinity }
};

export function PlanBadge() {
  const { user } = useCloudStore();

  if (!user) return null;

  const planKey: PlanType = user.plan || 'free';
  const plan = plans[planKey];

  return (
    <div
      className="px-3 py-1 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: plan.color }}
    >
      {plan.name}
    </div>
  );
}
