import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { maosCampaigns } from '@/data/maosCampanhas';

const FIRST_NAMES = [
  'Ana', 'Lucas', 'Juliana', 'Rafael', 'Fernanda', 'Carlos', 'Mariana',
  'Pedro', 'Camila', 'Bruno', 'Beatriz', 'Thiago', 'Larissa', 'Gabriel',
  'Isabela', 'Diego', 'Letícia', 'Matheus', 'Amanda', 'Gustavo',
  'Patrícia', 'Rodrigo', 'Natália', 'Felipe', 'Raquel', 'Vinícius',
  'Daniela', 'André', 'Carla', 'Leonardo',
];

const VALUES = [10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200];

const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomMinutes = () => Math.floor(Math.random() * 28) + 2; // 2–30 min

type Notification = {
  id: number;
  name: string;
  value: number;
  campaign: string;
  minutesAgo: number;
};

const generateNotification = (id: number): Notification => {
  const isAnonymous = Math.random() < 0.35;
  const campaign = randomItem(maosCampaigns);

  return {
    id,
    name: isAnonymous ? 'Doador anônimo' : randomItem(FIRST_NAMES),
    value: randomItem(VALUES),
    campaign: campaign.title.length > 40 ? campaign.title.slice(0, 37) + '...' : campaign.title,
    minutesAgo: randomMinutes(),
  };
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const DonationNotifications = () => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [visible, setVisible] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    // First notification after 8–15s
    const initialDelay = 8000 + Math.random() * 7000;

    const scheduleNext = () => {
      // Interval between notifications: 25–55s (moderate)
      const interval = 25000 + Math.random() * 30000;
      return setTimeout(() => {
        setCounter((c) => c + 1);
      }, interval);
    };

    const initialTimer = setTimeout(() => {
      setCounter(1);
    }, initialDelay);

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (counter === 0) return;

    const n = generateNotification(counter);
    setNotification(n);
    setVisible(true);

    // Hide after 5s
    const hideTimer = setTimeout(() => setVisible(false), 5000);

    // Schedule next after hide + pause
    const nextTimer = setTimeout(() => {
      setCounter((c) => c + 1);
    }, 5000 + 25000 + Math.random() * 30000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [counter]);

  if (!notification) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-[60] transition-all duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        className="flex max-w-sm items-start gap-3 rounded-2xl border px-5 py-4 shadow-lg"
        style={{
          backgroundColor: 'hsl(var(--maos-surface))',
          borderColor: 'hsl(var(--maos-border))',
          color: 'hsl(var(--maos-text))',
        }}
      >
        <span
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: 'hsl(var(--maos-brand) / 0.15)' }}
        >
          <Heart className="size-5" style={{ color: 'hsl(var(--maos-brand))' }} />
        </span>

        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold leading-snug">
            <span className="font-bold">{notification.name}</span>{' '}
            doou{' '}
            <span className="font-bold" style={{ color: 'hsl(var(--maos-brand))' }}>
              {formatCurrency(notification.value)}
            </span>
          </p>
          <p className="truncate text-xs" style={{ color: 'hsl(var(--maos-muted))' }}>
            {notification.campaign}
          </p>
          <p className="text-xs" style={{ color: 'hsl(var(--maos-muted))' }}>
            {notification.minutesAgo} min atrás
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonationNotifications;
