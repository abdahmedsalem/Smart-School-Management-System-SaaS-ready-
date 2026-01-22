import { useState } from 'react'
import Sidebar from './components/Sidebar'
import { ToastProvider } from './components/Toast'
import Dashboard from './pages/Dashboard'
import StructureScolaire from './pages/StructureScolaire'
import GestionEleves from './pages/GestionEleves'
import GestionPersonnel from './pages/GestionPersonnel'
import GestionAcademique from './pages/GestionAcademique'
import EmploiDuTemps from './pages/EmploiDuTemps'
import GestionPresences from './pages/GestionPresences'
import GestionExamens from './pages/GestionExamens'
import GestionPaiements from './pages/GestionPaiements'
import DashboardFinance from './pages/DashboardFinance'
import GestionFrais from './pages/GestionFrais'
import GestionRecus from './pages/GestionRecus'
import RapportsFinanciers from './pages/RapportsFinanciers'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  const getPageTitle = () => {
    const titles = {
      'dashboard': 'Tableau de bord',
      'structure-scolaire': 'Structure scolaire',
      'eleves': 'Gestion des Élèves',
      'enseignants': 'Ressources Humaines',
      'administration-staff': 'Ressources Humaines',
      'academique': 'Gestion Académique',
      'matieres': 'Gestion Académique',
      'notes': 'Gestion Académique',
      'bulletins': 'Gestion Académique',
      'emploi-temps': 'Emploi du temps & Salles',
      'salles': 'Emploi du temps & Salles',
      'presences': 'Gestion des Présences',
      'examens': 'Examens & Évaluations',
      'dashboard-finance': 'Dashboard Financier',
      'paiements-eleve': 'Paiements',
      'gestion-frais': 'Gestion des Frais',
      'recus': 'Reçus',
      'rapports': 'Rapports Financiers',
    }
    return titles[activePage] || 'Tableau de bord'
  }

  const renderPage = () => {
    switch (activePage) {
      case 'structure-scolaire':
        return <StructureScolaire />
      case 'eleves':
        return <GestionEleves />
      // Module RH
      case 'enseignants':
        return <GestionPersonnel defaultTab="enseignants" />
      case 'administration-staff':
        return <GestionPersonnel defaultTab="administration" />
      // Module Académique
      case 'academique':
      case 'matieres':
        return <GestionAcademique defaultTab="matieres" />
      case 'notes':
        return <GestionAcademique defaultTab="notes" />
      case 'bulletins':
        return <GestionAcademique defaultTab="bulletins" />
      // Emploi du temps
      case 'emploi-temps':
        return <EmploiDuTemps defaultTab="emploi" />
      case 'salles':
        return <EmploiDuTemps defaultTab="salles" />
      // Présences
      case 'presences':
        return <GestionPresences />
      // Examens
      case 'examens':
        return <GestionExamens />
      // Finance
      case 'dashboard-finance':
        return <DashboardFinance />
      case 'paiements-eleve':
        return <GestionPaiements />
      case 'gestion-frais':
        return <GestionFrais />
      case 'recus':
        return <GestionRecus />
      case 'rapports':
        return <RapportsFinanciers />
      case 'dashboard':
        return <Dashboard />
      default:
        return <Dashboard />
    }
  }

  return (
    <ToastProvider>
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePage={activePage}
        onPageChange={(page) => {
          setActivePage(page)
          setSidebarOpen(false)
        }}
      />

      <div className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              <i className="bi bi-list"></i>
            </button>
            <h1 className="page-title-header">{getPageTitle()}</h1>
          </div>
          <div className="header-right">
            <button className="header-icon-btn">
              <i className="bi bi-search"></i>
            </button>
            <button className="header-icon-btn">
              <i className="bi bi-bell"></i>
              <span className="notification-dot"></span>
            </button>
            <div className="header-user">
              <div className="header-avatar">
                <i className="bi bi-person-fill"></i>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {renderPage()}
        </main>
      </div>

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          background: #f8f9fa;
        }

        .main-wrapper {
          flex: 1;
          margin-left: 280px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transition: margin-left 0.3s ease;
        }

        .top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .menu-toggle {
          display: none;
          background: transparent;
          border: none;
          font-size: 1.5rem;
          color: #374151;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
        }

        .menu-toggle:hover {
          background: #f3f4f6;
        }

        .page-title-header {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-icon-btn {
          position: relative;
          background: transparent;
          border: none;
          color: #6b7280;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 10px;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .header-icon-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
        }

        .header-user {
          margin-left: 8px;
        }

        .header-avatar {
          width: 40px;
          height: 40px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .header-avatar:hover {
          background: #d1d5db;
        }

        .main-content {
          flex: 1;
        }

        @media (max-width: 992px) {
          .main-wrapper {
            margin-left: 0;
          }

          .menu-toggle {
            display: block;
          }

          .page-title-header {
            font-size: 1.1rem;
          }
        }

        @media (max-width: 576px) {
          .top-header {
            padding: 12px 16px;
          }

          .page-title-header {
            display: none;
          }
        }

        .placeholder-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 80px);
          padding: 24px;
        }

        .placeholder-content {
          text-align: center;
          color: #6b7280;
        }

        .placeholder-icon {
          font-size: 4rem;
          color: #d1d5db;
          margin-bottom: 16px;
        }

        .placeholder-content h2 {
          font-size: 1.5rem;
          color: #374151;
          margin-bottom: 8px;
        }

        .placeholder-content p {
          font-size: 1rem;
          color: #9ca3af;
        }
      `}</style>
    </div>
    </ToastProvider>
  )
}

export default App
