// src/components/billing/UpgradeModal.tsx
import { useState } from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (plan: 'pro' | 'enterprise') => {
    setLoading(true);
    // Integrar com Stripe Checkout
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    });
    const { url } = await response.json();
    window.location.href = url;
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 32,
        maxWidth: 600,
        width: '90%'
      }}>
        <h2>Escolha seu plano</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
          <div style={{ padding: 24, border: '2px solid #e0e0e0', borderRadius: 8, textAlign: 'center' }}>
            <h3>Gratuito</h3>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>R$ 0</div>
            <ul style={{ textAlign: 'left', marginTop: 16 }}>
              <li>3 projetos</li>
              <li>Exportação básica</li>
              <li>Suporte comunidade</li>
            </ul>
            <button disabled style={{ width: '100%', marginTop: 16, padding: 12 }}>Atual</button>
          </div>

          <div style={{ padding: 24, border: '2px solid #2196f3', borderRadius: 8, textAlign: 'center' }}>
            <h3>Pro</h3>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>R$ 29<span style={{ fontSize: 16 }}>/mês</span></div>
            <ul style={{ textAlign: 'left', marginTop: 16 }}>
              <li>50 projetos</li>
              <li>Exportação PDF</li>
              <li>Render 3D HD</li>
              <li>Suporte email</li>
            </ul>
            <button 
              onClick={() => handleUpgrade('pro')}
              disabled={loading}
              style={{ width: '100%', marginTop: 16, padding: 12, background: '#2196f3', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              {loading ? 'Processando...' : 'Assinar Pro'}
            </button>
          </div>

          <div style={{ padding: 24, border: '2px solid #4caf50', borderRadius: 8, textAlign: 'center' }}>
            <h3>Enterprise</h3>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>R$ 99<span style={{ fontSize: 16 }}>/mês</span></div>
            <ul style={{ textAlign: 'left', marginTop: 16 }}>
              <li>Projetos ilimitados</li>
              <li>API access</li>
              <li>White label</li>
              <li>Suporte prioritário</li>
            </ul>
            <button 
              onClick={() => handleUpgrade('enterprise')}
              disabled={loading}
              style={{ width: '100%', marginTop: 16, padding: 12, background: '#4caf50', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              {loading ? 'Processando...' : 'Falar com vendas'}
            </button>
          </div>
        </div>

        <button onClick={onClose} style={{ marginTop: 24 }}>Fechar</button>
      </div>
    </div>
  );
}
