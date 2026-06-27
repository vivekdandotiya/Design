import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getScoreLabel } from '../lib/utils';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export default function ScoreGauge({
  score,
  size = 120,
  strokeWidth = 8,
  label,
  className = '',
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 80) return { stroke: '#10b981', text: 'text-emerald-500' };
    if (s >= 60) return { stroke: '#f59e0b', text: 'text-amber-500' };
    return { stroke: '#f43f5e', text: 'text-rose-500' };
  };

  const color = getColor(score);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-surface-200 dark:text-surface-700"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold font-display ${color.text}`}>
            {score}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium text-surface-600 dark:text-surface-400">
          {label}
        </span>
      )}
      <span className={`text-xs font-medium ${color.text}`}>
        {getScoreLabel(score)}
      </span>
    </div>
  );
}
