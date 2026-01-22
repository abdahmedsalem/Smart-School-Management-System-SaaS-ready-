// Dashboard Global - School Management System
// Toutes les données sont dynamiques et calculées à partir de la base de données
import { useState, useEffect, useCallback, useMemo } from 'react'
import { eleveService, enseignantService, classeService } from '../services'

export default function Dashboard() {
  // États pour les données brutes
  const [eleves, setEleves] = useState([])
  const [enseignants, setEnseignants] = useState([])
  const [administratifs, setAdministratifs] = useState([])
  const [classes, setClasses] = useState([])
  const [salles, setSalles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState('2024-2025')

  // Années scolaires disponibles
  const schoolYears = ['2022-2023', '2023-2024', '2024-2025', '2025-2026']

  // Charger toutes les données
  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [elevesData, enseignantsData, adminsData, classesData, sallesData] = await Promise.all([
        eleveService.getAll().catch(() => []),
        enseignantService.getAllEnseignants().catch(() => []),
        enseignantService.getAllPersonnelAdmin().catch(() => []),
        classeService.getAllClasses().catch(() => []),
        classeService.getAllSalles().catch(() => [])
      ])

      setEleves(elevesData || [])
      setEnseignants(enseignantsData || [])
      setAdministratifs(adminsData || [])
      setClasses(classesData || [])
      setSalles(sallesData || [])

    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // ============ CALCULS DYNAMIQUES ============

  // Statistiques principales
  const stats = useMemo(() => ({
    totalEleves: eleves.length,
    totalEnseignants: enseignants.length,
    totalAdministratifs: administratifs.length,
    totalClasses: classes.length,
    totalSalles: salles.length,
    totalPersonnel: enseignants.length + administratifs.length
  }), [eleves, enseignants, administratifs, classes, salles])

  // Statistiques élèves par genre
  const elevesParGenre = useMemo(() => {
    const garcons = eleves.filter(e =>
      e.sexe?.toLowerCase() === 'masculin' ||
      e.sexe?.toLowerCase() === 'm' ||
      e.genre?.toLowerCase() === 'masculin' ||
      e.genre?.toLowerCase() === 'm'
    ).length
    const filles = eleves.length - garcons
    const total = eleves.length || 1 // Éviter division par 0

    return {
      garcons,
      filles,
      pctGarcons: Math.round((garcons / total) * 100),
      pctFilles: Math.round((filles / total) * 100)
    }
  }, [eleves])

  // Statistiques élèves par classe/niveau
  const elevesParClasse = useMemo(() => {
    const parClasse = {}

    // Compter les élèves par classe
    eleves.forEach(eleve => {
      const classeId = eleve.classeId || eleve.classe?.id
      if (classeId) {
        if (!parClasse[classeId]) {
          parClasse[classeId] = { count: 0, nom: '' }
        }
        parClasse[classeId].count++
      }
    })

    // Associer les noms des classes
    classes.forEach(classe => {
      if (parClasse[classe.id]) {
        parClasse[classe.id].nom = classe.nom || classe.name || `Classe ${classe.id}`
      }
    })

    // Convertir en tableau et trier par effectif
    const result = Object.entries(parClasse)
      .map(([id, data]) => ({
        id,
        nom: data.nom || `Classe ${id}`,
        count: data.count,
        percent: Math.round((data.count / (eleves.length || 1)) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7) // Top 7 classes

    return result
  }, [eleves, classes])

  // Statistiques classes par cycle
  const classesParCycle = useMemo(() => {
    const cycles = {}

    classes.forEach(classe => {
      const cycle = classe.cycle || classe.niveau?.cycle || 'Autre'
      if (!cycles[cycle]) {
        cycles[cycle] = { count: 0, eleves: 0 }
      }
      cycles[cycle].count++
      cycles[cycle].eleves += classe.effectif || classe.nbEleves || 0
    })

    // Si pas d'effectif dans les classes, calculer depuis les élèves
    if (Object.values(cycles).every(c => c.eleves === 0)) {
      classes.forEach(classe => {
        const cycle = classe.cycle || classe.niveau?.cycle || 'Autre'
        const elevesClasse = eleves.filter(e =>
          e.classeId === classe.id || e.classe?.id === classe.id
        ).length
        cycles[cycle].eleves += elevesClasse
      })
    }

    return cycles
  }, [classes, eleves])

  // Statistiques personnel par type
  const personnelParType = useMemo(() => {
    const totalPersonnel = enseignants.length + administratifs.length || 1

    return {
      enseignants: {
        count: enseignants.length,
        percent: Math.round((enseignants.length / totalPersonnel) * 100)
      },
      administratifs: {
        count: administratifs.length,
        percent: Math.round((administratifs.length / totalPersonnel) * 100)
      }
    }
  }, [enseignants, administratifs])

  // Statistiques salles par type
  const sallesParType = useMemo(() => {
    const types = {}
    salles.forEach(salle => {
      const type = salle.type || 'Standard'
      if (!types[type]) types[type] = 0
      types[type]++
    })
    return types
  }, [salles])

  // Salles disponibles
  const sallesDisponibles = useMemo(() => {
    return salles.filter(s => s.disponible !== false).length
  }, [salles])

  // Actions rapides
  const quickActions = [
    { id: 'new-student', label: 'Nouvel élève', icon: 'bi-person-plus-fill', color: '#3b82f6', page: 'eleves' },
    { id: 'mark-presence', label: 'Saisir présences', icon: 'bi-calendar-check', color: '#10b981', page: 'presences' },
    { id: 'add-payment', label: 'Nouveau paiement', icon: 'bi-cash-coin', color: '#f59e0b', page: 'paiements-eleve' },
    { id: 'view-schedule', label: 'Emploi du temps', icon: 'bi-calendar3', color: '#8b5cf6', page: 'emploi-temps' },
  ]

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Header avec sélecteur d'année */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble de l'établissement</p>
        </div>
        <div className="year-selector">
          <span className="year-label">Année scolaire:</span>
          <div className="year-buttons">
            {schoolYears.map(year => (
              <button
                key={year}
                className={`btn-year ${selectedYear === year ? 'active' : ''}`}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cartes statistiques principales - DYNAMIQUES */}
      <div className="stats-grid">
        <div className="stat-card stat-eleves">
          <div className="stat-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.totalEleves}</span>
            <span className="stat-label">Élèves inscrits</span>
          </div>
          <div className={`stat-badge ${stats.totalEleves > 0 ? 'positive' : 'neutral'}`}>
            <i className={`bi ${stats.totalEleves > 0 ? 'bi-check-circle' : 'bi-dash'}`}></i>
            {stats.totalEleves > 0 ? 'Actif' : '-'}
          </div>
        </div>

        <div className="stat-card stat-enseignants">
          <div className="stat-icon">
            <i className="bi bi-person-workspace"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.totalEnseignants}</span>
            <span className="stat-label">Enseignants</span>
          </div>
          <div className={`stat-badge ${stats.totalEnseignants > 0 ? 'positive' : 'neutral'}`}>
            <i className={`bi ${stats.totalEnseignants > 0 ? 'bi-check-circle' : 'bi-dash'}`}></i>
            {stats.totalEnseignants > 0 ? 'Actif' : '-'}
          </div>
        </div>

        <div className="stat-card stat-classes">
          <div className="stat-icon">
            <i className="bi bi-door-open"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.totalClasses}</span>
            <span className="stat-label">Classes</span>
          </div>
          <div className={`stat-badge ${stats.totalClasses > 0 ? 'positive' : 'neutral'}`}>
            <i className={`bi ${stats.totalClasses > 0 ? 'bi-check-circle' : 'bi-dash'}`}></i>
            {stats.totalClasses > 0 ? 'Actif' : '-'}
          </div>
        </div>

        <div className="stat-card stat-salles">
          <div className="stat-icon">
            <i className="bi bi-building"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.totalSalles}</span>
            <span className="stat-label">Salles</span>
          </div>
          <div className="stat-badge neutral">
            <i className="bi bi-door-open"></i>
            {sallesDisponibles} dispo
          </div>
        </div>
      </div>

      {/* Section principale */}
      <div className="dashboard-main">
        {/* Colonne gauche */}
        <div className="dashboard-left">
          {/* Carte Élèves détaillée - DYNAMIQUE */}
          <div className="detail-card eleves-card">
            <div className="card-header">
              <div className="card-title-section">
                <div className="card-icon eleves">
                  <i className="bi bi-people-fill"></i>
                </div>
                <div>
                  <h3>Élèves</h3>
                  <span className="card-subtitle">Répartition par classe</span>
                </div>
              </div>
              <span className="total-badge">{stats.totalEleves} total</span>
            </div>

            {/* Genre - DYNAMIQUE */}
            <div className="gender-stats">
              <div className="gender-item male">
                <i className="bi bi-gender-male"></i>
                <div className="gender-info">
                  <span className="gender-count">{elevesParGenre.garcons}</span>
                  <span className="gender-label">Garçons</span>
                </div>
                <span className="gender-percent">{elevesParGenre.pctGarcons}%</span>
              </div>
              <div className="gender-item female">
                <i className="bi bi-gender-female"></i>
                <div className="gender-info">
                  <span className="gender-count">{elevesParGenre.filles}</span>
                  <span className="gender-label">Filles</span>
                </div>
                <span className="gender-percent">{elevesParGenre.pctFilles}%</span>
              </div>
            </div>

            {/* Répartition par classe - DYNAMIQUE */}
            <div className="niveau-progress">
              {elevesParClasse.length > 0 ? (
                elevesParClasse.map((classe, idx) => (
                  <div key={classe.id || idx} className="progress-row">
                    <span className="progress-label" title={classe.nom}>
                      {classe.nom.length > 8 ? classe.nom.substring(0, 8) + '...' : classe.nom}
                    </span>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${Math.max(classe.percent, 5)}%` }}
                      ></div>
                    </div>
                    <span className="progress-value">{classe.count}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="bi bi-inbox"></i>
                  <p>Aucun élève inscrit</p>
                </div>
              )}
            </div>
          </div>

          {/* Carte Personnel - DYNAMIQUE */}
          <div className="detail-card personnel-card">
            <div className="card-header">
              <div className="card-title-section">
                <div className="card-icon personnel">
                  <i className="bi bi-person-badge-fill"></i>
                </div>
                <div>
                  <h3>Personnel</h3>
                  <span className="card-subtitle">Ressources humaines</span>
                </div>
              </div>
              <span className="total-badge">{stats.totalPersonnel} total</span>
            </div>

            <div className="personnel-types">
              <div className="personnel-type-item">
                <div className="type-icon enseignant">
                  <i className="bi bi-mortarboard"></i>
                </div>
                <div className="type-info">
                  <span className="type-count">{personnelParType.enseignants.count}</span>
                  <span className="type-label">Enseignants</span>
                </div>
                <div className="type-bar">
                  <div
                    className="type-bar-fill enseignant"
                    style={{ width: `${personnelParType.enseignants.percent}%` }}
                  ></div>
                </div>
              </div>
              <div className="personnel-type-item">
                <div className="type-icon admin">
                  <i className="bi bi-clipboard-data"></i>
                </div>
                <div className="type-info">
                  <span className="type-count">{personnelParType.administratifs.count}</span>
                  <span className="type-label">Administratifs</span>
                </div>
                <div className="type-bar">
                  <div
                    className="type-bar-fill admin"
                    style={{ width: `${personnelParType.administratifs.percent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Liste des salles par type */}
            {Object.keys(sallesParType).length > 0 && (
              <div className="salles-section">
                <h4>Salles par type</h4>
                <div className="salles-types">
                  {Object.entries(sallesParType).map(([type, count]) => (
                    <div key={type} className="salle-type-badge">
                      <span className="salle-type-name">{type}</span>
                      <span className="salle-type-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite */}
        <div className="dashboard-right">
          {/* Actions rapides */}
          <div className="quick-actions-card">
            <h3>Actions rapides</h3>
            <div className="quick-actions-grid">
              {quickActions.map(action => (
                <button key={action.id} className="quick-action-btn">
                  <div className="action-icon" style={{ background: action.color }}>
                    <i className={`bi ${action.icon}`}></i>
                  </div>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Classes par cycle - DYNAMIQUE */}
          <div className="cycles-card">
            <div className="card-header">
              <h3>Classes par cycle</h3>
              <span className="total-badge">{stats.totalClasses} classes</span>
            </div>
            <div className="cycles-list">
              {Object.entries(classesParCycle).length > 0 ? (
                Object.entries(classesParCycle).map(([cycle, data]) => (
                  <div key={cycle} className="cycle-item">
                    <div className="cycle-header">
                      <span className="cycle-name">{cycle}</span>
                      <span className="cycle-count">{data.count} classe{data.count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="cycle-details">
                      <span className="cycle-eleves">
                        <i className="bi bi-people"></i> {data.eleves} élève{data.eleves > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state small">
                  <i className="bi bi-inbox"></i>
                  <p>Aucune classe</p>
                </div>
              )}
            </div>
          </div>

          {/* Résumé rapide */}
          <div className="summary-card">
            <h3>Résumé</h3>
            <div className="summary-items">
              <div className="summary-item">
                <span className="summary-label">Ratio élèves/classe</span>
                <span className="summary-value">
                  {stats.totalClasses > 0
                    ? Math.round(stats.totalEleves / stats.totalClasses)
                    : 0}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Ratio élèves/enseignant</span>
                <span className="summary-value">
                  {stats.totalEnseignants > 0
                    ? Math.round(stats.totalEleves / stats.totalEnseignants)
                    : 0}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Capacité salles</span>
                <span className="summary-value">
                  {salles.reduce((acc, s) => acc + (s.capacite || 0), 0)} places
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .dashboard {
          padding: 28px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
          min-height: calc(100vh - 80px);
        }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #6b7280;
          gap: 16px;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
          border-top-color: #2D3E6f;
          border-radius: 50%;
          animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes countUp {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Header */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 20px;
          animation: fadeInUp 0.5s ease-out;
        }

        .header-title h1 {
          font-size: 1.85rem;
          font-weight: 800;
          background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }

        .header-title p {
          color: #6b7280;
          margin: 0;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .year-selector {
          display: flex;
          align-items: center;
          gap: 14px;
          background: white;
          padding: 8px 12px 8px 18px;
          border-radius: 50px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .year-label {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .year-buttons {
          display: flex;
          gap: 6px;
        }

        .btn-year {
          padding: 8px 18px;
          border: none;
          background: transparent;
          border-radius: 25px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-year:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-year.active {
          background: linear-gradient(135deg, #2D3E6f 0%, #4a5a8a 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(45, 62, 111, 0.3);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 22px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 18px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          border: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 0.5s ease-out backwards;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.1);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          transform: translate(30%, -30%);
          opacity: 0.08;
        }

        .stat-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          border-radius: 0 0 20px 20px;
        }

        .stat-eleves::before { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
        .stat-eleves::after { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
        .stat-enseignants::before { background: linear-gradient(135deg, #10b981, #34d399); }
        .stat-enseignants::after { background: linear-gradient(90deg, #10b981, #34d399); }
        .stat-classes::before { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
        .stat-classes::after { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
        .stat-salles::before { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
        .stat-salles::after { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        .stat-eleves .stat-icon {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #3b82f6;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
        }
        .stat-enseignants .stat-icon {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          color: #10b981;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
        }
        .stat-classes .stat-icon {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          color: #f59e0b;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);
        }
        .stat-salles .stat-icon {
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
          color: #8b5cf6;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }

        .stat-number {
          font-size: 2.25rem;
          font-weight: 800;
          color: #1f2937;
          line-height: 1;
          letter-spacing: -1px;
          animation: countUp 0.6s ease-out;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #6b7280;
          margin-top: 6px;
          font-weight: 500;
        }

        .stat-badge {
          position: absolute;
          top: 18px;
          right: 18px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 1;
        }

        .stat-badge.positive {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #15803d;
        }

        .stat-badge.negative {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #dc2626;
        }

        .stat-badge.neutral {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          color: #6b7280;
        }

        /* Main Layout */
        .dashboard-main {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 26px;
        }

        .dashboard-left {
          display: flex;
          flex-direction: column;
          gap: 26px;
        }

        .dashboard-right {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        /* Detail Cards */
        .detail-card {
          background: white;
          border-radius: 20px;
          padding: 26px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          border: none;
          animation: fadeInUp 0.5s ease-out backwards;
          animation-delay: 0.3s;
          transition: all 0.3s ease;
        }

        .detail-card:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
        }

        .detail-card .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .card-title-section {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .card-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.35rem;
        }

        .card-icon.eleves {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }
        .card-icon.personnel {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          color: #10b981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
        }

        .card-title-section h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #1f2937;
        }

        .card-subtitle {
          font-size: 0.8rem;
          color: #9ca3af;
          font-weight: 500;
        }

        .total-badge {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          padding: 8px 16px;
          border-radius: 25px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #4b5563;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 40px;
          color: #9ca3af;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 16px;
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 12px;
          display: block;
          opacity: 0.6;
        }

        .empty-state p {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .empty-state.small {
          padding: 20px;
        }

        .empty-state.small i {
          font-size: 1.75rem;
        }

        /* Gender Stats */
        .gender-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 26px;
        }

        .gender-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          border-radius: 16px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          transition: all 0.3s ease;
          border-left: 4px solid;
        }

        .gender-item:hover {
          transform: translateX(5px);
        }

        .gender-item.male {
          border-left-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }
        .gender-item.female {
          border-left-color: #ec4899;
          background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
        }

        .gender-item i {
          font-size: 1.75rem;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }

        .gender-item.male i {
          color: #3b82f6;
          background: white;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
        }
        .gender-item.female i {
          color: #ec4899;
          background: white;
          box-shadow: 0 2px 8px rgba(236, 72, 153, 0.15);
        }

        .gender-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .gender-count {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1f2937;
        }

        .gender-label {
          font-size: 0.85rem;
          color: #6b7280;
          font-weight: 500;
        }

        .gender-percent {
          font-size: 1rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          background: white;
        }

        .gender-item.male .gender-percent { color: #3b82f6; }
        .gender-item.female .gender-percent { color: #ec4899; }

        /* Progress Rows */
        .niveau-progress {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .progress-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 8px 12px;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .progress-row:hover {
          background: #f9fafb;
        }

        .progress-label {
          width: 80px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .progress-bar-container {
          flex: 1;
          height: 10px;
          background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
          border-radius: 6px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%);
          border-radius: 6px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
        }

        .progress-value {
          width: 45px;
          text-align: right;
          font-size: 0.9rem;
          font-weight: 700;
          color: #1f2937;
          background: #f3f4f6;
          padding: 4px 10px;
          border-radius: 8px;
        }

        /* Personnel Types */
        .personnel-types {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .personnel-type-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          border-radius: 14px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          transition: all 0.3s ease;
        }

        .personnel-type-item:hover {
          transform: translateX(5px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .type-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .type-icon.enseignant {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #2563eb;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .type-icon.admin {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #d97706;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.2);
        }

        .type-info {
          flex: 1;
        }

        .type-count {
          display: block;
          font-size: 1.3rem;
          font-weight: 800;
          color: #1f2937;
        }

        .type-label {
          font-size: 0.85rem;
          color: #6b7280;
          font-weight: 500;
        }

        .type-bar {
          width: 110px;
          height: 8px;
          background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
          border-radius: 4px;
          overflow: hidden;
        }

        .type-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .type-bar-fill.enseignant {
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
        }
        .type-bar-fill.admin {
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
          box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
        }

        /* Salles Section */
        .salles-section {
          margin-top: 26px;
          padding-top: 22px;
          border-top: 2px dashed #e5e7eb;
        }

        .salles-section h4 {
          margin: 0 0 14px 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .salles-section h4::before {
          content: '';
          width: 4px;
          height: 16px;
          background: linear-gradient(180deg, #8b5cf6, #a78bfa);
          border-radius: 2px;
        }

        .salles-types {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .salle-type-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .salle-type-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .salle-type-name {
          font-size: 0.85rem;
          color: #374151;
          font-weight: 600;
        }

        .salle-type-count {
          font-size: 0.8rem;
          font-weight: 800;
          color: #1f2937;
          background: white;
          padding: 4px 10px;
          border-radius: 15px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        /* Quick Actions */
        .quick-actions-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          animation: fadeInUp 0.5s ease-out backwards;
          animation-delay: 0.4s;
        }

        .quick-actions-card h3 {
          margin: 0 0 18px 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .quick-actions-card h3::before {
          content: '';
          width: 4px;
          height: 18px;
          background: linear-gradient(180deg, #3b82f6, #60a5fa);
          border-radius: 2px;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px 14px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border: 2px solid transparent;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .quick-action-btn:hover {
          background: white;
          border-color: #e5e7eb;
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .action-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: transform 0.3s ease;
        }

        .quick-action-btn:hover .action-icon {
          transform: scale(1.1);
        }

        .quick-action-btn span {
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
          text-align: center;
        }

        /* Cycles Card */
        .cycles-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          animation: fadeInUp 0.5s ease-out backwards;
          animation-delay: 0.5s;
        }

        .cycles-card .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .cycles-card h3 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cycles-card h3::before {
          content: '';
          width: 4px;
          height: 18px;
          background: linear-gradient(180deg, #f59e0b, #fbbf24);
          border-radius: 2px;
        }

        .cycles-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .cycle-item {
          padding: 16px 18px;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 14px;
          border-left: 4px solid;
          transition: all 0.3s ease;
        }

        .cycle-item:nth-child(1) { border-left-color: #3b82f6; }
        .cycle-item:nth-child(2) { border-left-color: #10b981; }
        .cycle-item:nth-child(3) { border-left-color: #f59e0b; }
        .cycle-item:nth-child(4) { border-left-color: #8b5cf6; }

        .cycle-item:hover {
          transform: translateX(5px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .cycle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .cycle-name {
          font-weight: 700;
          color: #1f2937;
          font-size: 0.95rem;
        }

        .cycle-count {
          font-size: 0.8rem;
          font-weight: 700;
          color: #4b5563;
          background: white;
          padding: 5px 12px;
          border-radius: 15px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .cycle-details {
          display: flex;
          gap: 16px;
        }

        .cycle-eleves {
          font-size: 0.875rem;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .cycle-eleves i {
          color: #9ca3af;
        }

        /* Summary Card */
        .summary-card {
          background: linear-gradient(135deg, #2D3E6f 0%, #4a5a8a 100%);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 8px 30px rgba(45, 62, 111, 0.3);
          animation: fadeInUp 0.5s ease-out backwards;
          animation-delay: 0.6s;
        }

        .summary-card h3 {
          margin: 0 0 18px 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: white;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .summary-card h3::before {
          content: '';
          width: 4px;
          height: 18px;
          background: linear-gradient(180deg, #fbbf24, #f59e0b);
          border-radius: 2px;
        }

        .summary-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .summary-item:hover {
          background: rgba(255,255,255,0.15);
          transform: translateX(5px);
        }

        .summary-label {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.8);
          font-weight: 500;
        }

        .summary-value {
          font-size: 1.15rem;
          font-weight: 800;
          color: white;
          background: rgba(255,255,255,0.2);
          padding: 4px 14px;
          border-radius: 20px;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .dashboard-main {
            grid-template-columns: 1fr;
          }

          .dashboard-right {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
          }

          .summary-card {
            grid-column: span 2;
          }
        }

        @media (max-width: 992px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-right {
            grid-template-columns: 1fr;
          }

          .summary-card {
            grid-column: span 1;
          }
        }

        @media (max-width: 768px) {
          .dashboard {
            padding: 18px;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .year-selector {
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
            padding: 14px;
            border-radius: 16px;
          }

          .year-buttons {
            flex-wrap: wrap;
            width: 100%;
          }

          .btn-year {
            padding: 8px 14px;
            font-size: 0.8rem;
            flex: 1;
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .gender-stats {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 20px;
          }

          .stat-number {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  )
}
