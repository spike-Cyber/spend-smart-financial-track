import React from "react";
import { formatCurrency } from "./utils";
export function SavingsIllustration() {
  return (
    <svg viewBox="0 0 320 220" className="settings-illustration" aria-hidden="true">
      <defs>
        <linearGradient id="coinGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5d163" />
          <stop offset="100%" stopColor="#d69c1b" />
        </linearGradient>
        <linearGradient id="walletGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#56c292" />
          <stop offset="100%" stopColor="#123f52" />
        </linearGradient>
      </defs>
      <rect x="28" y="72" width="176" height="94" rx="24" fill="url(#walletGlow)" className="float-svg" />
      <rect x="150" y="94" width="106" height="62" rx="18" fill="rgba(255,255,255,0.18)" />
      <circle cx="221" cy="124" r="10" fill="#fff2" />
      <circle cx="242" cy="54" r="24" fill="url(#coinGlow)" className="coin-bounce coin-one" />
      <circle cx="278" cy="88" r="18" fill="url(#coinGlow)" className="coin-bounce coin-two" />
      <path d="M60 46 C96 20, 138 20, 176 44" fill="none" stroke="#56c292" strokeWidth="8" strokeLinecap="round" className="draw-line" />
      <path d="M164 38 L178 44 L168 58" fill="none" stroke="#56c292" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="draw-line" />
    </svg>
  );
}

export function SecurityIllustration() {
  return (
    <svg viewBox="0 0 320 220" className="settings-illustration" aria-hidden="true">
      <defs>
        <linearGradient id="shieldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7ac8df" />
          <stop offset="100%" stopColor="#2d8d67" />
        </linearGradient>
      </defs>
      <path d="M160 30 L236 60 V112 C236 154 208 184 160 198 C112 184 84 154 84 112 V60 Z" fill="url(#shieldGlow)" className="float-svg" />
      <rect x="133" y="96" width="54" height="42" rx="10" fill="rgba(255,255,255,0.18)" />
      <path d="M144 96 V84 C144 72 151 64 160 64 C169 64 176 72 176 84 V96" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" />
      <circle cx="160" cy="116" r="6" fill="white" />
      <path d="M48 168 H118" stroke="#56c292" strokeWidth="8" strokeLinecap="round" className="pulse-line" />
      <path d="M202 168 H272" stroke="#7ac8df" strokeWidth="8" strokeLinecap="round" className="pulse-line delay-line" />
    </svg>
  );
}

export function HeroOrbitIllustration() {
  return (
    <svg viewBox="0 0 320 180" className="page-illustration large-illustration" aria-hidden="true">
      <defs>
        <linearGradient id="orbitGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#56c292" />
          <stop offset="100%" stopColor="#7ac8df" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="92" rx="112" ry="38" fill="none" stroke="url(#orbitGlow)" strokeWidth="3" className="orbit-spin" />
      <ellipse cx="160" cy="92" rx="72" ry="22" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" />
      <circle cx="160" cy="92" r="34" fill="url(#orbitGlow)" className="float-svg" />
      <circle cx="266" cy="92" r="10" fill="#f5d163" className="coin-bounce" />
      <circle cx="112" cy="64" r="8" fill="#ff8b74" className="coin-bounce coin-two" />
    </svg>
  );
}

export function AuthIllustration({ mode }) {
  return mode === "signup" ? <SavingsIllustration /> : <SecurityIllustration />;
}

export function OverviewIllustration() {
  return (
    <svg viewBox="0 0 220 140" className="page-illustration compact-illustration" aria-hidden="true">
      <rect x="20" y="24" width="180" height="92" rx="22" fill="rgba(255,255,255,0.08)" />
      <path d="M42 88 L82 62 L116 74 L150 42 L178 56" fill="none" stroke="#56c292" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" className="draw-line" />
      <circle cx="178" cy="56" r="9" fill="#56c292" />
      <circle cx="82" cy="62" r="7" fill="#7ac8df" />
      <circle cx="150" cy="42" r="7" fill="#f5d163" />
    </svg>
  );
}

export function SectionIllustration({ title }) {
  if (title === "Expenses") {
    return (
      <svg viewBox="0 0 320 150" className="page-illustration" aria-hidden="true">
        <rect x="40" y="32" width="112" height="84" rx="18" fill="rgba(255,255,255,0.08)" />
        <path d="M74 56 H120" stroke="#ff8b74" strokeWidth="8" strokeLinecap="round" />
        <path d="M74 78 H136" stroke="#ff8b74" strokeWidth="8" strokeLinecap="round" />
        <circle cx="224" cy="72" r="34" fill="#d96149" className="float-svg" />
        <path d="M208 72 H240" stroke="white" strokeWidth="8" strokeLinecap="round" />
      </svg>
    );
  }

  if (title === "Income") {
    return (
      <svg viewBox="0 0 320 150" className="page-illustration" aria-hidden="true">
        <path d="M54 110 L110 76 L150 88 L206 42 L260 54" fill="none" stroke="#56c292" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" className="draw-line" />
        <path d="M244 42 H268 V66" fill="none" stroke="#56c292" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="206" cy="42" r="9" fill="#f5d163" className="coin-bounce" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 320 150" className="page-illustration" aria-hidden="true">
      <rect x="76" y="42" width="168" height="76" rx="22" fill="url(#walletGlow)" className="float-svg" />
      <circle cx="116" cy="56" r="18" fill="url(#coinGlow)" className="coin-bounce" />
      <circle cx="150" cy="34" r="14" fill="url(#coinGlow)" className="coin-bounce coin-two" />
      <path d="M120 82 H210" stroke="rgba(255,255,255,0.38)" strokeWidth="10" strokeLinecap="round" />
      <path d="M120 102 H188" stroke="rgba(255,255,255,0.28)" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}

export function MonthlyWaveIllustration() {
  return (
    <svg viewBox="0 0 320 120" className="page-illustration compact-illustration" aria-hidden="true">
      <path d="M18 84 C54 30, 86 30, 118 72 S182 112, 214 58 S278 24, 302 48" fill="none" stroke="#56c292" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="draw-line" />
      <path d="M18 96 C58 72, 92 64, 124 88 S188 114, 226 82 S276 56, 302 70" fill="none" stroke="#7ac8df" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ReceiptIllustration() {
  return (
    <svg viewBox="0 0 220 120" className="page-illustration compact-illustration" aria-hidden="true">
      <path d="M40 18 H168 V102 L152 92 L136 102 L120 92 L104 102 L88 92 L72 102 L56 92 L40 102 Z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
      <path d="M64 44 H144" stroke="#7ac8df" strokeWidth="8" strokeLinecap="round" />
      <path d="M64 64 H132" stroke="#56c292" strokeWidth="8" strokeLinecap="round" />
      <path d="M64 84 H118" stroke="#ff8b74" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

export function PieChartIllustration() {
  return (
    <svg viewBox="0 0 150 120" className="page-illustration compact-illustration" aria-hidden="true">
      <circle cx="62" cy="60" r="34" fill="#123f52" />
      <path d="M62 60 L62 26 A34 34 0 0 1 93 78 Z" fill="#56c292" />
      <path d="M62 60 L93 78 A34 34 0 0 1 40 90 Z" fill="#f5d163" />
      <circle cx="62" cy="60" r="16" fill="var(--panel)" />
      <circle cx="118" cy="36" r="8" fill="#ff8b74" className="coin-bounce" />
    </svg>
  );
}

export function BarGrowthIllustration() {
  return (
    <svg viewBox="0 0 180 120" className="page-illustration compact-illustration" aria-hidden="true">
      <rect x="30" y="72" width="20" height="28" rx="8" fill="#7ac8df" />
      <rect x="64" y="56" width="20" height="44" rx="8" fill="#56c292" />
      <rect x="98" y="36" width="20" height="64" rx="8" fill="#f5d163" />
      <rect x="132" y="18" width="20" height="82" rx="8" fill="#56c292" className="float-svg" />
      <path d="M28 28 L64 18 L102 32 L146 10" fill="none" stroke="#56c292" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="draw-line" />
    </svg>
  );
}

export function TrendSparkIllustration() {
  return (
    <svg viewBox="0 0 220 120" className="page-illustration compact-illustration" aria-hidden="true">
      <path d="M18 82 L58 52 L88 62 L126 30 L164 40 L202 18" fill="none" stroke="#56c292" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" className="draw-line" />
      <path d="M18 96 L58 86 L88 92 L126 72 L164 78 L202 62" fill="none" stroke="#d96149" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="202" cy="18" r="7" fill="#56c292" />
      <circle cx="202" cy="62" r="6" fill="#d96149" />
    </svg>
  );
}


export function Modal({ children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="row-end" style={{ marginBottom: 16 }}>
          <div />
          <button className="icon-button" onClick={onClose}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}


export function PieChartCard({ data }) {
  if (!data.length) {
    return <div className="empty-state">Add expense data to generate the pie chart.</div>;
  }

  const colors = ["#1f8f63", "#123f52", "#ce9f29", "#d96149", "#7b8cff", "#5bbdd3"];
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  const segments = data.slice(0, 5).map((item, index) => {
    const angle = (item.value / total) * Math.PI * 2;
    const start = polarToCartesian(60, 60, 46, currentAngle);
    const end = polarToCartesian(60, 60, 46, currentAngle + angle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M 60 60 L ${start.x} ${start.y} A 46 46 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
    currentAngle += angle;
    return { ...item, d, color: colors[index % colors.length] };
  });

  return (
    <div className="chart-layout">
      <svg viewBox="0 0 120 120" className="pie-chart">
        {segments.map((segment) => (
          <path key={segment.label} d={segment.d} fill={segment.color} className="chart-animate" />
        ))}
        <circle cx="60" cy="60" r="22" fill="var(--panel)" />
      </svg>
      <div className="chart-legend">
        {segments.map((item) => (
          <div className="legend-row" key={item.label}>
            <span className="legend-dot" style={{ background: item.color }} />
            <span>{item.label}</span>
            <strong>{Math.round((item.value / total) * 100)}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarChartCard({ data, tone }) {
  if (!data.length) {
    return <div className="empty-state">Add income data to generate the bar graph.</div>;
  }

  const items = data.slice(0, 6);
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="bar-chart">
      {items.map((item, index) => (
        <div className="bar-item" key={item.label}>
          <div
            className={`bar-fill ${tone}`}
            style={{ height: `${Math.max((item.value / max) * 180, 18)}px`, animationDelay: `${index * 0.08}s` }}
          />
          <span className="helper small-center">{item.label}</span>
          <strong className="small-center">{formatCurrency(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

export function TrendChartCard({ data }) {
  if (!data.length) {
    return <div className="empty-state">Add transactions to generate the trend graph.</div>;
  }

  const max = Math.max(...data.flatMap((item) => [item.income, item.expense]), 1);
  const incomePoints = data.map((item, index) => `${20 + index * 90},${220 - (item.income / max) * 180}`).join(" ");
  const expensePoints = data.map((item, index) => `${20 + index * 90},${220 - (item.expense / max) * 180}`).join(" ");

  return (
    <div className="trend-chart-wrap">
      <svg viewBox="0 0 500 240" className="trend-chart">
        <line x1="20" y1="220" x2="480" y2="220" className="axis-line" />
        <line x1="20" y1="20" x2="20" y2="220" className="axis-line" />
        <polyline points={incomePoints} className="trend-line income-line" />
        <polyline points={expensePoints} className="trend-line expense-line" />
        {data.map((item, index) => (
          <g key={item.month}>
            <circle cx={20 + index * 90} cy={220 - (item.income / max) * 180} r="4" className="income-point" />
            <circle cx={20 + index * 90} cy={220 - (item.expense / max) * 180} r="4" className="expense-point" />
            <text x={20 + index * 90} y="236" textAnchor="middle" className="axis-label">
              {item.month.slice(5).replace("-", "/")}
            </text>
          </g>
        ))}
      </svg>
      <div className="trend-legend">
        <span><i className="legend-dot income-bg" /> Income</span>
        <span><i className="legend-dot expense-bg" /> Expense</span>
      </div>
    </div>
  );
}

export function polarToCartesian(centerX, centerY, radius, angleInRadians) {
  return {
    x: centerX + radius * Math.cos(angleInRadians - Math.PI / 2),
    y: centerY + radius * Math.sin(angleInRadians - Math.PI / 2)
  };
}



