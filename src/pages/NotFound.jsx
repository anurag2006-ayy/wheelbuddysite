import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft } from 'lucide-react';
import './Landing.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 'var(--space-6)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', maxWidth: 480 }}
      >
        {/* Animated route ending */}
        <div style={{
          width: 120,
          height: 120,
          margin: '0 auto var(--space-8)',
          position: 'relative',
        }}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            {/* Road */}
            <motion.path
              d="M 20 100 Q 40 60 60 50 Q 80 40 100 20"
              stroke="var(--border-strong)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="8 6"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
            {/* Dead end marker */}
            <motion.circle
              cx="100"
              cy="20"
              r="8"
              fill="var(--danger-muted)"
              stroke="var(--danger)"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, duration: 0.3, type: 'spring' }}
            />
            {/* Bus on route */}
            <motion.g
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: '70%' }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            >
              <circle cx="40" cy="80" r="6" fill="var(--accent)" />
            </motion.g>
          </svg>
        </div>

        <div style={{
          fontSize: 'var(--text-display-l)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: 'var(--tracking-tight)',
          marginBottom: 'var(--space-4)',
        }}>
          404
        </div>

        <h1 style={{
          fontSize: 'var(--text-heading-l)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-3)',
        }}>
          Looks like this route doesn't exist.
        </h1>

        <p style={{
          fontSize: 'var(--text-body-m)',
          color: 'var(--text-secondary)',
          lineHeight: 'var(--lh-body)',
          marginBottom: 'var(--space-8)',
        }}>
          The page you're looking for may have been moved or no longer exists.
        </p>

        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/')}
          style={{ gap: 8 }}
        >
          <ArrowLeft size={18} />
          Back to WheelBuddy
        </button>
      </motion.div>
    </div>
  );
}
