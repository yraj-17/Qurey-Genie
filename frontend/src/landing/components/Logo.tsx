import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 32, showText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <motion.div
        whileHover={{ rotate: -8, scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        className="relative"
      >
        <div
          className="absolute inset-0 rounded-full blur-md opacity-60"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }}
        />
        <img
          src={logo}
          alt="Query Genie"
          width={size}
          height={size}
          className="relative object-contain"
          style={{ width: size, height: size }}
        />
      </motion.div>
      {showText && (
        <span className="text-lg font-bold tracking-tight text-white">
          Query <span className="text-gradient-brand">Genie</span>
        </span>
      )}
    </div>
  );
}
