import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { 
  MapPin, Shield, Clock, Users, Bell, ArrowRight, Zap, 
  Navigation, Radio, AlertTriangle, CheckCircle, Menu, X
} from 'lucide-react';
import './Landing.css';

// Counter Hook for Trust Section
const useCounter = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  
  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * (end - start) + start));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, start]);
  
  return count;
};

// Section Reveal Component
const FadeIn = ({ children, delay = 0, className = '' }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="landing-page">
      {/* NAVBAR */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          WheelBuddy
          <span className="nav-logo-dot"></span>
        </a>
        
        <div className="nav-links">
          <a href="#product" onClick={(e) => { e.preventDefault(); scrollTo('product'); }} className="nav-link">Product</a>
          <a href="#tracking" onClick={(e) => { e.preventDefault(); scrollTo('tracking'); }} className="nav-link">Tracking</a>
          <a href="#safety" onClick={(e) => { e.preventDefault(); scrollTo('safety'); }} className="nav-link">Safety</a>
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works'); }} className="nav-link">How it works</a>
        </div>
        
        <div className="nav-actions">
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>Login</button>
          <button className="btn btn-primary" onClick={() => navigate('/signup')}>Get Started</button>
        </div>

        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section">
        {/* Background School Bus & Children Scene */}
        <div className="hero-video-container">
          <img 
            src="/school_bus_hero.jpg" 
            alt="School Bus approaching bus stop with children waving" 
            className="hero-bg-video hero-bg-img"
          />
          <div className="hero-video-scrim"></div>
        </div>
        <div className="hero-grid-bg"></div>
        
        {/* Floating Cards (Top) */}
        <motion.div 
          className="glass-card badge-live"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="dot live"></div>
          <div>
            <span style={{ fontWeight: 700, marginRight: 6 }}>LIVE NETWORK</span>
            <span style={{ color: 'var(--text-secondary)' }}>24 buses active</span>
          </div>
        </motion.div>

        <motion.div 
          className="glass-card badge-safety"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <div className="dot safe"></div>
          <div>
            <span style={{ fontWeight: 700, marginRight: 6 }}>SAFETY STATUS</span>
            <span style={{ color: 'var(--text-secondary)' }}>All systems operational</span>
          </div>
        </motion.div>

        {/* Center Content */}
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="eyebrow">Smart School Transportation</span>
          </motion.div>
          
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Every journey.<br />Connected.
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Real-time school transportation built around safety, visibility and trust.
          </motion.p>
          
          <motion.div 
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button className="btn btn-primary btn-large" onClick={() => navigate('/signup')}>
              Explore Live Tracking <ArrowRight size={18} />
            </button>
            <button className="btn btn-ghost btn-large" onClick={() => scrollTo('how-it-works')}>
              See how it works
            </button>
          </motion.div>
        </div>

        {/* Floating Cards (Bottom) */}
        <div className="hero-bottom-cards">
          <motion.div 
            className="glass-card"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="dot live"></div>
            <span>BUS 24 — On Route</span>
          </motion.div>
          <motion.div 
            className="glass-card"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          >
            <Clock size={16} className="text-secondary" />
            <span>ETA — 08 min</span>
          </motion.div>
          <motion.div 
            className="glass-card"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          >
            <MapPin size={16} className="text-secondary" />
            <span>Next Stop — Krishna Nagar</span>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section id="product" className="section">
        <div className="section-header">
          <FadeIn>
            <span className="eyebrow">The Problem</span>
            <h2 className="section-title">School transportation shouldn't feel uncertain.</h2>
          </FadeIn>
        </div>
        
        <div className="problem-grid">
          <FadeIn delay={0.1}>
            <div className="problem-card">
              <div className="icon-wrapper"><MapPin size={24} /></div>
              <h3>Where is the bus?</h3>
              <p>Parents deserve real-time visibility into every journey. Stop relying on outdated schedules.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="problem-card">
              <div className="icon-wrapper"><Clock size={24} /></div>
              <h3>When will it arrive?</h3>
              <p>No more guessing. No more waiting outside in bad weather. Just accurate, live ETAs.</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="problem-card">
              <div className="icon-wrapper"><AlertTriangle size={24} /></div>
              <h3>What if something goes wrong?</h3>
              <p>When seconds matter, everyone needs to be connected. Instant alerts for any delay or issue.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* PRODUCT SECTION */}
      <section id="tracking" className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="section-header">
          <FadeIn>
            <span className="eyebrow">The Solution</span>
            <h2 className="section-title">One connected system.</h2>
            <p className="section-subtitle">Live location, without the guesswork. A unified dashboard for schools to monitor the entire fleet.</p>
          </FadeIn>
        </div>

        <FadeIn delay={0.2}>
          <div className="product-mockup-wrapper">
            <div className="mockup-sidebar">
              <div className="mockup-nav-item"></div>
              <div className="mockup-nav-item active"></div>
              <div className="mockup-nav-item"></div>
              <div className="mockup-nav-item"></div>
            </div>
            <div className="mockup-main">
              <div className="mockup-topbar">
                <div className="mockup-search"></div>
              </div>
              <div className="mockup-content">
                <div className="mockup-panel">
                  <div className="mockup-panel-header">
                    <span style={{ fontWeight: 600 }}>BUS 24</span>
                    <span style={{ color: 'var(--success)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div className="dot safe" style={{ width: 6, height: 6 }}></div> On Route
                    </span>
                  </div>
                  <div className="mockup-panel-row">
                    <span className="mockup-label">Driver</span>
                    <span className="mockup-value">Rajesh Kumar</span>
                  </div>
                  <div className="mockup-panel-row">
                    <span className="mockup-label">Speed</span>
                    <span className="mockup-value">32 km/h</span>
                  </div>
                  <div className="mockup-panel-row">
                    <span className="mockup-label">ETA</span>
                    <span className="mockup-value" style={{ color: 'var(--accent)' }}>08 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FEATURES SECTION */}
      <section className="section">
        <div className="features-grid">
          {[
            { icon: Navigation, title: 'Live Tracking', desc: 'Real-time GPS location for every bus in your fleet.' },
            { icon: Radio, title: 'Smart Routes', desc: 'Optimized routes with live traffic awareness.' },
            { icon: Shield, title: 'Safety First', desc: 'SOS alerts, breakdown detection, emergency protocols.' },
            { icon: Bell, title: 'Instant Alerts', desc: 'Push notifications for delays, arrivals, and emergencies.' },
            { icon: Users, title: 'Parent Portal', desc: 'Peace of mind for every parent, every journey.' },
            { icon: Zap, title: 'Fleet Analytics', desc: 'Data-driven insights for smarter operations.' },
          ].map((feature, idx) => (
            <FadeIn key={idx} delay={idx * 0.1}>
              <div className="feature-item">
                <feature.icon size={28} color="var(--accent)" />
                <h4>{feature.title}</h4>
                <p>{feature.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* PARENT SECTION */}
      <section id="safety" className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="parent-split">
          <div className="parent-text">
            <FadeIn>
              <span className="eyebrow">For Parents</span>
              <h2>Peace of mind,<br/>without the phone call.</h2>
              <p>Know when the bus is approaching. Know where it is. Know when the journey is complete. The WheelBuddy app keeps you informed every step of the way.</p>
              
              <div className="check-list">
                <div className="check-item"><CheckCircle size={20} className="check-icon" /> Real-time bus location</div>
                <div className="check-item"><CheckCircle size={20} className="check-icon" /> ETA notifications</div>
                <div className="check-item"><CheckCircle size={20} className="check-icon" /> Emergency alerts</div>
              </div>
            </FadeIn>
          </div>
          <div className="parent-visual">
            <FadeIn delay={0.2}>
              <div className="phone-mockup">
                <div className="phone-notch"></div>
                <div className="phone-content">
                  <div className="phone-card" style={{ textAlign: 'center' }}>
                    <div className="phone-title">Current Bus</div>
                    <div className="phone-value">BUS-24</div>
                  </div>
                  <div className="phone-card">
                    <div className="phone-title">Route</div>
                    <div className="phone-value" style={{ fontSize: '0.9rem' }}>Route A — GLA → Mathura</div>
                  </div>
                  <div className="phone-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="phone-title">ETA</div>
                      <div className="phone-value" style={{ color: 'var(--accent)' }}>8 mins</div>
                    </div>
                    <div>
                      <div className="phone-title">Driver</div>
                      <div className="phone-value" style={{ fontSize: '0.9rem' }}>Rajesh Kumar</div>
                    </div>
                  </div>
                  <button className="phone-btn">Track Bus</button>
                  <div className="phone-badge">
                    <Shield size={14} /> Journey monitored
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section">
        <div className="section-header">
          <FadeIn>
            <span className="eyebrow">How It Works</span>
            <h2 className="section-title">Get started in minutes.</h2>
          </FadeIn>
        </div>
        
        <FadeIn delay={0.2}>
          <div className="steps-container">
            <div className="steps-line"></div>
            <div className="step-card">
              <span className="step-number">01</span>
              <h4>Connect</h4>
              <p>Register your school and connect buses, drivers, and parents.</p>
            </div>
            <div className="step-card">
              <span className="step-number">02</span>
              <h4>Track</h4>
              <p>Monitor every bus in real-time with live GPS tracking.</p>
            </div>
            <div className="step-card">
              <span className="step-number">03</span>
              <h4>Communicate</h4>
              <p>Keep everyone informed with instant alerts and updates.</p>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* TRUST SECTION */}
      <section className="section trust-section">
        <FadeIn>
          <div className="stats-grid">
            <div>
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Students transported safely</div>
            </div>
            <div>
              <div className="stat-number">99.2%</div>
              <div className="stat-label">On-time arrival rate</div>
            </div>
            <div>
              <div className="stat-number">&lt; 30s</div>
              <div className="stat-label">Average alert response time</div>
            </div>
          </div>
          
          <div className="trust-statements">
            <span>Built for modern schools.</span>
            <span>Designed around safety.</span>
            <span>Real-time visibility.</span>
          </div>
        </FadeIn>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <FadeIn>
          <h2>Make every journey<br/>feel closer.</h2>
          <div className="cta-actions">
            <button className="btn btn-primary btn-large" onClick={() => navigate('/signup')}>Get Started</button>
            <button className="btn btn-ghost btn-large" onClick={() => scrollTo('product')}>Explore the platform</button>
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo">
              WheelBuddy <span className="nav-logo-dot"></span>
            </div>
            <p>Moving schools forward.</p>
          </div>
          <div className="footer-col">
            <h5>Product</h5>
            <ul>
              <li><a href="#">Live Tracking</a></li>
              <li><a href="#">Route Management</a></li>
              <li><a href="#">Fleet Analytics</a></li>
              <li><a href="#">Safety System</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Platform</h5>
            <ul>
              <li><a href="#">Parent Portal</a></li>
              <li><a href="#">Driver App</a></li>
              <li><a href="#">Admin Dashboard</a></li>
              <li><a href="#">API</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Press</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 WheelBuddy. All rights reserved.</div>
          <div className="social-links">
            <a href="#" className="social-link">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
