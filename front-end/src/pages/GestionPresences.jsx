import { useState, useMemo, useEffect } from 'react'
import { presenceService, classeService, eleveService } from '../services'

export default function GestionPresences() {
  const [activeTab, setActiveTab] = useState('saisie')
  const [selectedClasse, setSelectedClasse] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [presences, setPresences] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')

  // State pour les données de l'API
  const [eleves, setEleves] = useState([])
  const [classes, setClasses] = useState([])
  const [historique, setHistorique] = useState([])
  const [alertes, setAlertes] = useState([])
  const [loading, setLoading] = useState(true)

  // Charger les classes au démarrage
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const classesData = await classeService.getAllClasses()
        const classeNames = classesData.map(c => c.nom)
        setClasses(classeNames)
        if (classeNames.length > 0 && !selectedClasse) {
          setSelectedClasse(classeNames[0])
        }
      } catch (error) {
        console.error('Erreur lors du chargement des classes:', error)
      }
    }
    loadClasses()
  }, [])

  // Charger les élèves et présences quand la classe change
  useEffect(() => {
    const loadElevesAndPresences = async () => {
      if (!selectedClasse) return
      try {
        setLoading(true)
        // Charger les élèves de la classe
        const elevesData = await eleveService.getAll({ classe: selectedClasse })
        const mappedEleves = elevesData.map(e => ({
          id: e.id,
          nom: e.nom,
          prenom: e.prenom,
          classe: e.classe?.nom || selectedClasse
        }))
        setEleves(mappedEleves)

        // Charger les présences pour cette classe et date
        try {
          const presencesData = await presenceService.getPresences({
            classeId: selectedClasse,
            date: selectedDate
          })
          const presencesMap = {}
          presencesData.forEach(p => {
            presencesMap[p.eleveId || p.eleve?.id] = p.statut || 'present'
          })
          setPresences(presencesMap)
        } catch {
          setPresences({})
        }

        // Charger les alertes
        try {
          const alertesData = await presenceService.getAlertes()
          setAlertes(alertesData.map(a => ({
            eleve: a.eleve ? `${a.eleve.prenom} ${a.eleve.nom}` : a.eleveNom || '',
            absences: a.totalAbsences || 0,
            nonJustifiees: a.absencesNonJustifiees || 0
          })))
        } catch {
          setAlertes([])
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
      } finally {
        setLoading(false)
      }
    }
    loadElevesAndPresences()
  }, [selectedClasse, selectedDate])

  // Stats
  const stats = useMemo(() => {
    const values = Object.values(presences)
    return {
      total: eleves.length,
      presents: values.filter(v => v === 'present').length,
      absents: values.filter(v => v === 'absent').length,
      retards: values.filter(v => v === 'retard').length,
      tauxPresence: values.length > 0 ? Math.round((values.filter(v => v === 'present').length / values.length) * 100) : 0
    }
  }, [presences, eleves])

  const handlePresenceChange = (eleveId, status) => {
    setPresences(prev => ({ ...prev, [eleveId]: status }))
  }

  const handleSaveAll = async () => {
    try {
      const presencesArray = eleves.map(e => ({
        eleveId: e.id,
        statut: presences[e.id] || 'present'
      }))
      await presenceService.savePresencesBulk(selectedClasse, selectedDate, null, presencesArray)
      alert('Présences enregistrées avec succès!')
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error)
      alert('Erreur lors de l\'enregistrement des présences')
    }
  }

  const handleMarkAllPresent = () => {
    const newPresences = {}
    eleves.forEach(e => newPresences[e.id] = 'present')
    setPresences(newPresences)
  }

  const filteredHistorique = useMemo(() => {
    return historique.filter(h => {
      const matchSearch = (h.eleve || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchType = !filterType || h.type === filterType
      return matchSearch && matchType
    })
  }, [searchTerm, filterType, historique])

  return (
    <div className="gestion-presences">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">
              <i className="bi bi-calendar-check me-2"></i>
              Gestion des Présences
            </h1>
            <p className="text-muted">Suivi quotidien des présences et absences</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><i className="bi bi-people"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Élèves</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon present"><i className="bi bi-check-circle"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.presents}</span>
            <span className="stat-label">Présents</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon absent"><i className="bi bi-x-circle"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.absents}</span>
            <span className="stat-label">Absents</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon retard"><i className="bi bi-clock"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.retards}</span>
            <span className="stat-label">Retards</span>
          </div>
        </div>
        <div className="stat-card large">
          <div className="stat-icon taux"><i className="bi bi-graph-up"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.tauxPresence}%</span>
            <span className="stat-label">Taux de présence</span>
          </div>
          <div className="progress-ring">
            <svg viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                strokeDasharray={`${stats.tauxPresence}, 100`}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'saisie' ? 'active' : ''}`} onClick={() => setActiveTab('saisie')}>
            <i className="bi bi-pencil-square"></i> Saisie quotidienne
          </button>
          <button className={`tab ${activeTab === 'historique' ? 'active' : ''}`} onClick={() => setActiveTab('historique')}>
            <i className="bi bi-clock-history"></i> Historique
          </button>
          <button className={`tab ${activeTab === 'alertes' ? 'active' : ''}`} onClick={() => setActiveTab('alertes')}>
            <i className="bi bi-exclamation-triangle"></i> Alertes
            {alertes.length > 0 && <span className="alert-badge">{alertes.length}</span>}
          </button>
          <button className={`tab ${activeTab === 'statistiques' ? 'active' : ''}`} onClick={() => setActiveTab('statistiques')}>
            <i className="bi bi-bar-chart"></i> Statistiques
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content-card">
        {/* Tab Saisie */}
        {activeTab === 'saisie' && (
          <div className="tab-content">
            <div className="toolbar">
              <div className="toolbar-left">
                <select className="filter-select" value={selectedClasse} onChange={e => setSelectedClasse(e.target.value)}>
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="date"
                  className="date-input"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="toolbar-right">
                <button className="btn-mark-all" onClick={handleMarkAllPresent}>
                  <i className="bi bi-check-all"></i> Tous présents
                </button>
                <button className="btn-save" onClick={handleSaveAll}>
                  <i className="bi bi-save"></i> Enregistrer
                </button>
              </div>
            </div>

            {/* Liste des élèves */}
            <div className="presence-list">
              {eleves.map((eleve, index) => (
                <div key={eleve.id} className="presence-row">
                  <div className="eleve-info">
                    <span className="eleve-numero">{index + 1}</span>
                    <div className="eleve-avatar">
                      <i className="bi bi-person"></i>
                    </div>
                    <div className="eleve-details">
                      <span className="eleve-nom">{eleve.prenom} {eleve.nom}</span>
                      <span className="eleve-classe">{eleve.classe}</span>
                    </div>
                  </div>
                  <div className="presence-buttons">
                    <button
                      className={`presence-btn present ${presences[eleve.id] === 'present' ? 'active' : ''}`}
                      onClick={() => handlePresenceChange(eleve.id, 'present')}
                    >
                      <i className="bi bi-check-lg"></i>
                      <span>Présent</span>
                    </button>
                    <button
                      className={`presence-btn absent ${presences[eleve.id] === 'absent' ? 'active' : ''}`}
                      onClick={() => handlePresenceChange(eleve.id, 'absent')}
                    >
                      <i className="bi bi-x-lg"></i>
                      <span>Absent</span>
                    </button>
                    <button
                      className={`presence-btn retard ${presences[eleve.id] === 'retard' ? 'active' : ''}`}
                      onClick={() => handlePresenceChange(eleve.id, 'retard')}
                    >
                      <i className="bi bi-clock"></i>
                      <span>Retard</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Historique */}
        {activeTab === 'historique' && (
          <div className="tab-content">
            <div className="toolbar">
              <div className="toolbar-left">
                <div className="search-box">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    placeholder="Rechercher un élève..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option value="">Tous les types</option>
                  <option value="absent">Absences</option>
                  <option value="retard">Retards</option>
                </select>
              </div>
              <div className="toolbar-right">
                <button className="btn-export">
                  <i className="bi bi-file-excel"></i> Export Excel
                </button>
              </div>
            </div>

            <table className="historique-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Élève</th>
                  <th>Classe</th>
                  <th>Type</th>
                  <th>Motif</th>
                  <th>Justifié</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistorique.map(item => (
                  <tr key={item.id}>
                    <td>{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                    <td className="eleve-cell">{item.eleve}</td>
                    <td>{item.classe}</td>
                    <td>
                      <span className={`type-badge ${item.type}`}>
                        {item.type === 'absent' ? 'Absence' : 'Retard'}
                      </span>
                    </td>
                    <td>{item.motif || <span className="no-motif">Non renseigné</span>}</td>
                    <td>
                      <span className={`justifie-badge ${item.justifie ? 'oui' : 'non'}`}>
                        {item.justifie ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button title="Justifier"><i className="bi bi-check-lg"></i></button>
                        <button title="Modifier"><i className="bi bi-pencil"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Alertes */}
        {activeTab === 'alertes' && (
          <div className="tab-content">
            <div className="alertes-header">
              <h3><i className="bi bi-exclamation-triangle me-2"></i>Élèves avec absences répétées</h3>
              <p>Ces élèves ont accumulé plusieurs absences non justifiées</p>
            </div>

            <div className="alertes-list">
              {alertes.map((alerte, index) => (
                <div key={index} className="alerte-card">
                  <div className="alerte-icon">
                    <i className="bi bi-person-exclamation"></i>
                  </div>
                  <div className="alerte-details">
                    <h4>{alerte.eleve}</h4>
                    <div className="alerte-stats">
                      <span className="stat">
                        <i className="bi bi-calendar-x"></i>
                        {alerte.absences} absences totales
                      </span>
                      <span className="stat warning">
                        <i className="bi bi-exclamation-circle"></i>
                        {alerte.nonJustifiees} non justifiées
                      </span>
                    </div>
                  </div>
                  <div className="alerte-actions">
                    <button className="btn-contact">
                      <i className="bi bi-telephone"></i> Contacter parent
                    </button>
                    <button className="btn-view">
                      <i className="bi bi-eye"></i> Voir détails
                    </button>
                  </div>
                </div>
              ))}

              {alertes.length === 0 && (
                <div className="no-alertes">
                  <i className="bi bi-check-circle"></i>
                  <h4>Aucune alerte</h4>
                  <p>Tous les élèves ont un taux de présence satisfaisant</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Statistiques */}
        {activeTab === 'statistiques' && (
          <div className="tab-content">
            <div className="stats-filters">
              <select className="filter-select">
                <option>Cette semaine</option>
                <option>Ce mois</option>
                <option>Ce trimestre</option>
                <option>Cette année</option>
              </select>
              <select className="filter-select" value={selectedClasse} onChange={e => setSelectedClasse(e.target.value)}>
                <option value="">Toutes les classes</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="stats-overview">
              <div className="overview-card">
                <h4>Taux de présence global</h4>
                <div className="big-stat">
                  <span className="value">87%</span>
                  <span className="trend positive"><i className="bi bi-arrow-up"></i> +2%</span>
                </div>
                <p>par rapport à la semaine dernière</p>
              </div>

              <div className="overview-card">
                <h4>Total absences</h4>
                <div className="big-stat">
                  <span className="value">45</span>
                  <span className="trend negative"><i className="bi bi-arrow-down"></i> -5</span>
                </div>
                <p>absences cette semaine</p>
              </div>

              <div className="overview-card">
                <h4>Retards</h4>
                <div className="big-stat">
                  <span className="value">23</span>
                  <span className="trend neutral"><i className="bi bi-dash"></i> 0</span>
                </div>
                <p>retards cette semaine</p>
              </div>
            </div>

            <div className="stats-details">
              <div className="chart-card">
                <h4>Présences par jour</h4>
                <div className="bar-chart">
                  {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu'].map((jour, i) => (
                    <div key={jour} className="bar-item">
                      <div className="bar-container">
                        <div className="bar present" style={{ height: `${[85, 92, 88, 78, 90][i]}%` }}></div>
                      </div>
                      <span className="bar-label">{jour}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <h4>Par classe</h4>
                <div className="class-stats">
                  {classes.slice(0, 4).map((classe, i) => (
                    <div key={classe} className="class-row">
                      <span className="class-name">{classe}</span>
                      <div className="progress-bar">
                        <div className="progress" style={{ width: `${[92, 85, 88, 79][i]}%` }}></div>
                      </div>
                      <span className="class-value">{[92, 85, 88, 79][i]}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .gestion-presences {
          padding: 24px;
          background: #f8f9fa;
          min-height: calc(100vh - 64px);
        }

        .page-header { margin-bottom: 24px; }
        .header-content { display: flex; justify-content: space-between; align-items: center; }
        .page-title { font-size: 1.75rem; font-weight: 700; color: #2D3E6f; margin: 0; }
        .text-muted { color: #6b7280; margin: 0; }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .stat-card.large {
          grid-column: span 2;
          position: relative;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-icon.total { background: #dbeafe; color: #2563eb; }
        .stat-icon.present { background: #d1fae5; color: #059669; }
        .stat-icon.absent { background: #fee2e2; color: #dc2626; }
        .stat-icon.retard { background: #fef3c7; color: #d97706; }
        .stat-icon.taux { background: #ede9fe; color: #7c3aed; }

        .stat-info { display: flex; flex-direction: column; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: #1f2937; }
        .stat-label { font-size: 0.85rem; color: #6b7280; }

        .progress-ring {
          position: absolute;
          right: 20px;
          width: 60px;
          height: 60px;
        }

        .progress-ring svg { transform: rotate(-90deg); }

        /* Tabs */
        .tabs-container {
          background: white;
          border-radius: 12px 12px 0 0;
          padding: 0 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .tabs { display: flex; gap: 8px; overflow-x: auto; }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          background: transparent;
          border: none;
          color: #6b7280;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
          position: relative;
        }

        .tab:hover { color: #2D3E6f; }
        .tab.active { color: #2D3E6f; border-bottom-color: #2D3E6f; }

        .alert-badge {
          position: absolute;
          top: 10px;
          right: 5px;
          background: #dc2626;
          color: white;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 10px;
        }

        .content-card {
          background: white;
          border-radius: 0 0 12px 12px;
          padding: 20px;
          min-height: 500px;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }

        .toolbar-left, .toolbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .filter-select, .date-input {
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
        }

        .btn-mark-all {
          padding: 10px 16px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-save {
          padding: 10px 20px;
          background: #2D3E6f;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-export {
          padding: 10px 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Presence List */
        .presence-list { display: flex; flex-direction: column; gap: 12px; }

        .presence-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .presence-row:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

        .eleve-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .eleve-numero {
          width: 30px;
          height: 30px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 600;
          color: #6b7280;
        }

        .eleve-avatar {
          width: 40px;
          height: 40px;
          background: #2D3E6f;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .eleve-details { display: flex; flex-direction: column; }
        .eleve-nom { font-weight: 600; color: #1f2937; }
        .eleve-classe { font-size: 0.85rem; color: #6b7280; }

        .presence-buttons { display: flex; gap: 8px; }

        .presence-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .presence-btn:hover { border-color: #d1d5db; }

        .presence-btn.present.active {
          background: #d1fae5;
          border-color: #059669;
          color: #059669;
        }

        .presence-btn.absent.active {
          background: #fee2e2;
          border-color: #dc2626;
          color: #dc2626;
        }

        .presence-btn.retard.active {
          background: #fef3c7;
          border-color: #d97706;
          color: #d97706;
        }

        /* Historique Table */
        .historique-table {
          width: 100%;
          border-collapse: collapse;
        }

        .historique-table th {
          text-align: left;
          padding: 12px;
          background: #f9fafb;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.85rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .historique-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .historique-table tr:hover { background: #f9fafb; }

        .eleve-cell { font-weight: 500; }

        .type-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .type-badge.absent { background: #fee2e2; color: #dc2626; }
        .type-badge.retard { background: #fef3c7; color: #d97706; }

        .justifie-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .justifie-badge.oui { background: #d1fae5; color: #059669; }
        .justifie-badge.non { background: #fee2e2; color: #dc2626; }

        .no-motif { color: #9ca3af; font-style: italic; }

        .table-actions { display: flex; gap: 6px; }

        .table-actions button {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: #f3f4f6;
          border: none;
          color: #6b7280;
          cursor: pointer;
        }

        .table-actions button:hover { background: #2D3E6f; color: white; }

        .search-box {
          position: relative;
        }

        .search-box i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-box input {
          padding: 10px 12px 10px 36px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          width: 250px;
        }

        /* Alertes */
        .alertes-header {
          margin-bottom: 20px;
        }

        .alertes-header h3 { margin: 0 0 4px; color: #1f2937; }
        .alertes-header p { margin: 0; color: #6b7280; }

        .alertes-list { display: flex; flex-direction: column; gap: 16px; }

        .alerte-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
        }

        .alerte-icon {
          width: 60px;
          height: 60px;
          background: #dc2626;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.75rem;
        }

        .alerte-details { flex: 1; }
        .alerte-details h4 { margin: 0 0 8px; color: #1f2937; }

        .alerte-stats { display: flex; gap: 16px; }

        .alerte-stats .stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .alerte-stats .stat.warning { color: #dc2626; font-weight: 600; }

        .alerte-actions { display: flex; gap: 8px; }

        .btn-contact {
          padding: 10px 16px;
          background: #2D3E6f;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-view {
          padding: 10px 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .no-alertes {
          text-align: center;
          padding: 60px;
          color: #059669;
        }

        .no-alertes i { font-size: 4rem; margin-bottom: 16px; }
        .no-alertes h4 { margin: 0 0 8px; }
        .no-alertes p { margin: 0; color: #6b7280; }

        /* Statistics */
        .stats-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .overview-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
        }

        .overview-card h4 { margin: 0 0 12px; color: #6b7280; font-size: 0.9rem; }
        .overview-card p { margin: 8px 0 0; font-size: 0.85rem; color: #9ca3af; }

        .big-stat {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }

        .big-stat .value { font-size: 2.5rem; font-weight: 700; color: #1f2937; }

        .trend {
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .trend.positive { color: #059669; }
        .trend.negative { color: #dc2626; }
        .trend.neutral { color: #6b7280; }

        .stats-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .chart-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
        }

        .chart-card h4 { margin: 0 0 16px; color: #374151; }

        .bar-chart {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          height: 150px;
        }

        .bar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .bar-container {
          width: 40px;
          height: 120px;
          background: #e5e7eb;
          border-radius: 4px;
          display: flex;
          align-items: flex-end;
        }

        .bar-container .bar {
          width: 100%;
          background: linear-gradient(180deg, #2D3E6f, #4f5d8a);
          border-radius: 4px;
        }

        .bar-label { font-size: 0.85rem; color: #6b7280; }

        .class-stats { display: flex; flex-direction: column; gap: 12px; }

        .class-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .class-name { width: 120px; font-size: 0.9rem; color: #374151; }

        .progress-bar {
          flex: 1;
          height: 10px;
          background: #e5e7eb;
          border-radius: 5px;
          overflow: hidden;
        }

        .progress-bar .progress {
          height: 100%;
          background: linear-gradient(90deg, #2D3E6f, #4f5d8a);
          border-radius: 5px;
        }

        .class-value { width: 40px; font-weight: 600; color: #1f2937; }

        @media (max-width: 768px) {
          .gestion-presences { padding: 16px; }
          .presence-row { flex-direction: column; gap: 12px; }
          .presence-buttons { width: 100%; }
          .presence-btn { flex: 1; justify-content: center; }
          .stats-overview { grid-template-columns: 1fr; }
          .stats-details { grid-template-columns: 1fr; }
          .alerte-card { flex-direction: column; text-align: center; }
          .alerte-actions { flex-direction: column; width: 100%; }
        }
      `}</style>
    </div>
  )
}
