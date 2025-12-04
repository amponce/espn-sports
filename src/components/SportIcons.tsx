import {
  Dribbble,
  Trophy,
  Circle,
  Disc,
  Target,
  Flag,
  Car,
  Swords,
  Volleyball,
  type LucideIcon,
} from 'lucide-react';

// Sport icon mapping
export const sportIcons: Record<string, LucideIcon> = {
  football: Trophy,        // Football/NFL
  basketball: Dribbble,    // Basketball
  baseball: Circle,        // Baseball
  hockey: Disc,           // Hockey
  soccer: Circle,          // Soccer
  mma: Swords,            // MMA/Fighting
  golf: Flag,             // Golf
  racing: Car,            // Racing
  tennis: Target,         // Tennis
};

interface SportIconProps {
  sport: string;
  className?: string;
  size?: number;
}

export function SportIcon({ sport, className = '', size = 24 }: SportIconProps) {
  const Icon = sportIcons[sport] || Trophy;
  return <Icon className={className} size={size} />;
}

// Sport colors for styling
export const sportColors: Record<string, string> = {
  football: '#013369',    // NFL blue
  basketball: '#C9082A',  // NBA red
  baseball: '#002D72',    // MLB blue
  hockey: '#000000',      // NHL black
  soccer: '#38003c',      // Premier League purple
  mma: '#d20a0a',         // UFC red
  golf: '#006747',        // Masters green
  racing: '#e10600',      // F1 red
  tennis: '#4e9e3c',      // Wimbledon green
};
