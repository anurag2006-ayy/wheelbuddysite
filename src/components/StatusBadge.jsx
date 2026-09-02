import { useLanguage } from '../i18n/LanguageContext';

const MAP = {
  'on-time': { cls: 'badge-success', key: 'statusOnTime' },
  'delayed': { cls: 'badge-warning', key: 'statusDelayed' },
  'stopped': { cls: 'badge-neutral', key: 'statusStopped' },
  'Active': { cls: 'badge-success', key: 'Active' },
  'Inactive': { cls: 'badge-warning', key: 'Inactive' },
  'Unassigned': { cls: 'badge-neutral', key: 'Unassigned' },
};

export default function StatusBadge({ status, label }) {
  const { t } = useLanguage();
  const conf = MAP[status] || MAP['stopped'];
  return (
    <span className={`badge ${conf.cls}`}>
      <span className="badge-dot" />
      {label || t(conf.key)}
    </span>
  );
}
