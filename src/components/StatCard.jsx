import './StatCard.css';

export default function StatCard({ icon: Icon, label, value, suffix, tone = 'default' }) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__icon"><Icon /></div>
      <div>
        <p className="stat-card__value">{value}<span className="stat-card__suffix">{suffix}</span></p>
        <p className="stat-card__label">{label}</p>
      </div>
    </div>
  );
}
