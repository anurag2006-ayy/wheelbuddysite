import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Bus, Shield, MapPin, LogIn } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [role, setRole] = useState('parent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    try {
      login(role, email || `${role}@wheelbuddy.app`);
      const routes = { parent: '/parent', driver: '/driver', admin: '/admin' };
      navigate(routes[role]);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const placeholders = {
    parent: 'parent@school.edu',
    driver: 'driver@school.edu',
    admin: 'admin@school.edu'
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          WheelBuddy<span className="login-brand-dot"></span>
        </div>
        
        <motion.div 
          className="login-left-content"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { 
              opacity: 1, 
              x: 0,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          <div className="login-features">
            <motion.div className="login-feature" variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
              <div className="login-feature-icon">
                <MapPin size={24} />
              </div>
              <div className="login-feature-text">
                <h3>Real-time tracking for every bus</h3>
              </div>
            </motion.div>
            
            <motion.div className="login-feature" variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
              <div className="login-feature-icon">
                <Shield size={24} />
              </div>
              <div className="login-feature-text">
                <h3>Safety alerts and SOS system</h3>
              </div>
            </motion.div>
            
            <motion.div className="login-feature" variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
              <div className="login-feature-icon">
                <Bus size={24} />
              </div>
              <div className="login-feature-text">
                <h3>Complete fleet management</h3>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        <div className="login-tagline">
          Moving schools forward.
        </div>
      </div>

      <div className="login-right">
        <div className="login-lang-wrapper">
          <LanguageSwitcher />
        </div>
        
        <motion.div 
          className="login-form-container"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="login-form-header">
            <h1>Welcome back</h1>
            <p>Sign in to your account</p>
          </div>

          <div className="login-roles">
            {['parent', 'driver', 'admin'].map(r => (
              <button
                key={r}
                className={`login-role-btn ${role === r ? 'active' : ''}`}
                onClick={() => setRole(r)}
                type="button"
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label className="input-label">Email address</label>
              <input 
                type="email" 
                className={`input ${error ? 'input-error' : ''}`}
                placeholder={placeholders[role]}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="login-field">
              <label className="input-label">Password</label>
              <div className="input-password-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className={`input ${error ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary btn-lg login-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            Don't have an account? <a href="#">Get Started</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
