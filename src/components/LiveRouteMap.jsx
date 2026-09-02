import { useEffect, useRef, useState } from 'react';
import { routePath } from '../data/mockData';
import './LiveRouteMap.css';

// Builds a smooth SVG path string through the mock GPS points.
function toSmoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    d += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
  }
  d += ` T ${points[points.length - 1].x} ${points[points.length - 1].y}`;
  return d;
}

// Interpolates a position along the polyline for a progress value 0..1
function pointAt(points, progress) {
  const segCount = points.length - 1;
  const scaled = progress * segCount;
  const idx = Math.min(Math.floor(scaled), segCount - 1);
  const t = scaled - idx;
  const a = points[idx];
  const b = points[idx + 1];
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

export default function LiveRouteMap({ variant = 'card', speed = 38, label }) {
  const [progress, setProgress] = useState(0.32);
  const dir = useRef(1);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        let next = p + dir.current * 0.006;
        if (next >= 1) { next = 1; dir.current = -1; }
        if (next <= 0) { next = 0; dir.current = 1; }
        return next;
      });
    }, 90);
    return () => clearInterval(id);
  }, []);

  const pos = pointAt(routePath, progress);
  const dPath = toSmoothPath(routePath);
  const traveledCount = Math.max(1, Math.round(progress * (routePath.length - 1)) + 1);
  const traveled = routePath.slice(0, traveledCount);

  return (
    <div className={`live-map live-map--${variant}`}>
      <svg viewBox="0 0 470 240" className="live-map__svg" role="img" aria-label={label || 'Live bus location'}>
        <defs>
          <linearGradient id="routeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#93A5EF" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
        </defs>

        {/* full route, faint */}
        <path d={dPath} className="live-map__route-ghost" />
        {/* traveled portion, solid */}
        <path d={toSmoothPath(traveled)} className="live-map__route-done" />

        {routePath.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === 0 || i === routePath.length - 1 ? 5 : 3} className="live-map__stop" />
        ))}

        {/* pulse under the marker */}
        <circle cx={pos.x} cy={pos.y} r="14" className="live-map__pulse" />
        <g transform={`translate(${pos.x}, ${pos.y})`} className="live-map__marker">
          <circle r="11" className="live-map__marker-bg" />
          <path d="M-5,-3.5 h10 a1.4,1.4 0 0 1 1.4,1.4 v3.4 a1,1 0 0 1 -1,1 h-0.6 a1.6,1.6 0 0 1 -3.2,0 h-2.4 a1.6,1.6 0 0 1 -3.2,0 h-0.6 a1,1 0 0 1 -1,-1 v-3.4 a1.4,1.4 0 0 1 1.4,-1.4 z" className="live-map__bus-icon" />
        </g>
      </svg>

      {variant === 'card' && (
        <div className="live-map__readout">
          <span className="live-map__readout-dot" />
          {speed} km/h
        </div>
      )}
    </div>
  );
}
