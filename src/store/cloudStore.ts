import { useCloudStore } from '@/store/cloudStore';

const plans = {
  free: { name: 'Gratuito', color: '#9e9e9e', limit: 3 },
  pro: { name: 'Pro', color: '#2196f3', limit: 50 },
  enterprise: { name: 'Enterprise', color: '#4caf50', limit: Infinity }
};

export function PlanBadge() {
  const { user } = useCloudStore();
  if (!user) return null;

  // @ts-ignore - plan pode não existir no tipo ainda
  const planKey = (user.plan as keyof typeof plans) || 'free';
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
