import { useState } from 'react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <i className="bi bi-mortarboard-fill"></i>
            <span>EduGestion</span>
          </div>

          <div className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
            <a href="#" className="navbar-link active">
              <i className="bi bi-people"></i>
              <span>Élèves</span>
            </a>
            <a href="#" className="navbar-link">
              <i className="bi bi-building"></i>
              <span>Établissements</span>
            </a>
            <a href="#" className="navbar-link">
              <i className="bi bi-journal-text"></i>
              <span>Classes</span>
            </a>
            <a href="#" className="navbar-link">
              <i className="bi bi-bar-chart"></i>
              <span>Statistiques</span>
            </a>
          </div>

          <div className="navbar-actions">
            <button className="navbar-icon-btn">
              <i className="bi bi-bell"></i>
              <span className="notification-badge">3</span>
            </button>
            <div className="navbar-user">
              <div className="user-avatar">
                <i className="bi bi-person-fill"></i>
              </div>
              <span className="user-name">Admin</span>
            </div>
          </div>

          <button
            className="navbar-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
          </button>
        </div>
      </nav>

      <style>{`
        .navbar {
          background: #2D3E6f;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(45, 62, 111, 0.2);
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-size: 1.25rem;
          font-weight: 700;
          text-decoration: none;
        }

        .navbar-brand i {
          font-size: 1.5rem;
        }

        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .navbar-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .navbar-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .navbar-link.active {
          color: white;
          background: rgba(255, 255, 255, 0.15);
        }

        .navbar-link i {
          font-size: 1.1rem;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .navbar-icon-btn {
          position: relative;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.25rem;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .navbar-icon-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .notification-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background: #dc3545;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px 6px 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .navbar-user:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .user-name {
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .navbar-toggle {
          display: none;
          background: transparent;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 8px;
        }

        @media (max-width: 992px) {
          .navbar-menu {
            position: absolute;
            top: 64px;
            left: 0;
            right: 0;
            background: #2D3E6f;
            flex-direction: column;
            padding: 16px;
            gap: 4px;
            display: none;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          }

          .navbar-menu.open {
            display: flex;
          }

          .navbar-link {
            width: 100%;
            padding: 12px 16px;
          }

          .navbar-toggle {
            display: block;
          }

          .user-name {
            display: none;
          }
        }

        @media (max-width: 576px) {
          .navbar {
            padding: 0 16px;
          }

          .navbar-brand span {
            display: none;
          }
        }
      `}</style>
    </>
  )
}
