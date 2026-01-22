// Composant Card réutilisable
export default function Card({ children, title, icon, actions, className = '' }) {
  return (
    <div className={`card-component ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          <div className="card-title">
            {icon && <i className={`bi ${icon}`}></i>}
            {title && <h3>{title}</h3>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>

      <style>{`
        .card-component {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(45, 62, 111, 0.08);
          overflow: hidden;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-title i {
          font-size: 1.1rem;
          color: #2D3E6f;
        }

        .card-title h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .card-body {
          padding: 20px;
        }
      `}</style>
    </div>
  )
}
