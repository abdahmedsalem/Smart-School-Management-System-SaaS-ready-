// Composant StatsGrid - Grille de statistiques
export default function StatsGrid({ stats }) {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card" style={{ borderLeftColor: stat.color || '#2D3E6f' }}>
          <div className="stat-icon" style={{ background: `${stat.color || '#2D3E6f'}15` }}>
            <i className={`bi ${stat.icon}`} style={{ color: stat.color || '#2D3E6f' }}></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        </div>
      ))}

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 10px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-left: 4px solid;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon i {
          font-size: 1.3rem;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  )
}
