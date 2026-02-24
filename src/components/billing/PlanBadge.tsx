// src/components/billing/PlanBadge.tsx
import { useCloudStore } from '@/store/cloudStore';

const plans = {
  free: { name: 'Gratuito', color: '#9e9e9e', limit: 3 },
  pro: { name: 'Pro', color: '#2196f3', limit: 50 },
  enterprise: { name: 'Enterprise', color: '#4caf50', limit: Infinity }
};

export function PlanBadge() {
  const { user } = useCloudStore();
  if (!user) return null;

  const plan = plans[user.plan as keyof typeof plans] || plans.free;

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 700,
      zIndex: 1000,
      padding: '6px 12px',
      background: plan.color,
      color: 'white',
      borderRadius: 16,
      fontSize: 12,
      fontWeight: 'bold',
      textTransform: 'uppercase'
    }}>
      {plan.name}
    </div>
  );
}
