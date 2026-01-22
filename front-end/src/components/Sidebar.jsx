import { useState } from 'react'

export default function Sidebar({ isOpen, onClose, activePage, onPageChange }) {
  const [expandedMenus, setExpandedMenus] = useState(['gestion-ecole'])

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: 'bi-grid-1x2-fill',
    },
    {
      id: 'structure-scolaire',
      label: 'Structure scolaire',
      icon: 'bi-building',
    },
    {
      id: 'eleves',
      label: 'Élèves',
      icon: 'bi-people-fill',
    },
    {
      id: 'personnel',
      label: 'Ressources Humaines',
      icon: 'bi-person-badge-fill',
      children: [
        { id: 'enseignants', label: 'Enseignants' },
        { id: 'administration-staff', label: 'Administration' },
      ]
    },
    {
      id: 'academique',
      label: 'Académique',
      icon: 'bi-book-fill',
      children: [
        { id: 'matieres', label: 'Matières' },
        { id: 'notes', label: 'Notes' },
        { id: 'bulletins', label: 'Bulletins' },
      ]
    },
    {
      id: 'organisation',
      label: 'Organisation',
      icon: 'bi-calendar3',
      children: [
        { id: 'emploi-temps', label: 'Emploi du temps' },
        { id: 'salles', label: 'Salles' },
      ]
    },
    {
      id: 'presences',
      label: 'Présences',
      icon: 'bi-calendar-check-fill',
    },
    {
      id: 'examens',
      label: 'Examens',
      icon: 'bi-journal-text',
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: 'bi-currency-dollar',
      children: [
        { id: 'dashboard-finance', label: 'Dashboard' },
        { id: 'paiements-eleve', label: 'Paiements' },
        { id: 'gestion-frais', label: 'Gestion des frais' },
        { id: 'recus', label: 'Reçus' },
        { id: 'rapports', label: 'Rapports' },
      ]
    },
  ]

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <i className="bi bi-mortarboard-fill"></i>
            </div>
            <span className="logo-text">EduGestion</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div key={item.id} className="nav-item-wrapper">
              {/* Parent Item */}
              <button
                className={`nav-item ${!item.children && activePage === item.id ? 'active' : ''}`}
                onClick={() => {
                  if (item.children) {
                    toggleMenu(item.id)
                  } else {
                    onPageChange(item.id)
                  }
                }}
              >
                <div className="nav-item-left">
                  <i className={`bi ${item.icon} nav-icon`}></i>
                  <span className="nav-label">{item.label}</span>
                </div>
                {item.children && (
                  <i className={`bi bi-chevron-down nav-arrow ${expandedMenus.includes(item.id) ? 'open' : ''}`}></i>
                )}
              </button>

              {/* Children */}
              {item.children && (
                <div className={`nav-children ${expandedMenus.includes(item.id) ? 'open' : ''}`}>
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      className={`nav-child-item ${activePage === child.id ? 'active' : ''}`}
                      onClick={() => onPageChange(child.id)}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <i className="bi bi-person-fill"></i>
            </div>
            <div className="user-details">
              <span className="user-name">Admin</span>
              <span className="user-role">Administrateur</span>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar-backdrop {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 998;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s, visibility 0.3s;
        }

        .sidebar-backdrop.open {
          opacity: 1;
          visibility: visible;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 280px;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          z-index: 999;
          transition: transform 0.3s ease;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #f3f4f6;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #2D3E6f 0%, #4f5d8a 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }

        .sidebar-close {
          display: none;
          background: transparent;
          border: none;
          color: #6b7280;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
        }

        .sidebar-close:hover {
          background: #f3f4f6;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 16px 12px;
        }

        .nav-item-wrapper {
          margin-bottom: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background: #f9fafb;
        }

        .nav-item.active {
          background: #eff6ff;
        }

        .nav-item-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-icon {
          font-size: 1.1rem;
          color: #4b5563;
        }

        .nav-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #4b5563;
        }

        .nav-item:hover .nav-icon,
        .nav-item:hover .nav-label {
          color: #1f2937;
        }

        .nav-arrow {
          color: #9ca3af;
          font-size: 0.75rem;
          transition: transform 0.2s;
        }

        .nav-arrow.open {
          transform: rotate(180deg);
        }

        .nav-children {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
          padding-left: 60px;
        }

        .nav-children.open {
          max-height: 500px;
        }

        .nav-child-item {
          display: block;
          width: 100%;
          padding: 10px 16px;
          background: transparent;
          border: none;
          border-radius: 20px;
          text-align: left;
          font-size: 0.875rem;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
          margin: 4px 0;
        }

        .nav-child-item:hover {
          color: #374151;
          background: #f9fafb;
        }

        .nav-child-item.active {
          background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
          color: #db2777;
          font-weight: 500;
          border: 1px solid #f9a8d4;
        }

        .sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid #f3f4f6;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-size: 1.1rem;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
        }

        .user-role {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        @media (max-width: 992px) {
          .sidebar-backdrop {
            display: block;
          }

          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .sidebar-close {
            display: block;
          }
        }
      `}</style>
    </>
  )
}
