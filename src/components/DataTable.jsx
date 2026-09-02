import { useMemo, useState } from 'react';
import StatusBadge from './StatusBadge';
import { useLanguage } from '../i18n/LanguageContext';
import './DataTable.css';

const columns = [
  { key: 'number', labelKey: 'tableBusNo' },
  { key: 'driver', labelKey: 'tableDriver' },
  { key: 'route', labelKey: 'tableRoute' },
  { key: 'avgSpeed', labelKey: 'tableAvgSpeed', numeric: true },
  { key: 'delays', labelKey: 'tableDelays', numeric: true },
  { key: 'harshBraking', labelKey: 'tableHarshBraking', numeric: true },
  { key: 'status', labelKey: 'tableStatus' },
];

export default function DataTable({ rows }) {
  const { t } = useLanguage();
  const [sortKey, setSortKey] = useState('number');
  const [sortDir, setSortDir] = useState('asc');

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} onClick={() => toggleSort(col.key)} className={col.numeric ? 'is-numeric' : ''}>
                <span>
                  {t(col.labelKey)}
                  <i className={`data-table__sort-icon ${sortKey === col.key ? `is-${sortDir}` : ''}`} aria-hidden="true">▲</i>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id}>
              <td className="data-table__mono">{row.number}</td>
              <td>{row.driver}</td>
              <td>{row.route}</td>
              <td className="is-numeric data-table__mono">{row.avgSpeed} km/h</td>
              <td className="is-numeric">{row.delays}</td>
              <td className="is-numeric">{row.harshBraking}</td>
              <td><StatusBadge status={row.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
