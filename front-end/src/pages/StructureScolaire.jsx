import { useState, useMemo, useEffect } from "react"
import { classeService } from "../services/classeService"

// Composant Modal Classe
function ClasseModal({ classe, cycles, niveaux, specialites, professeurs, onClose, onSave, onLoadMatieres }) {
  const isEdit = !!classe
  const [formData, setFormData] = useState({
    nom: classe?.nom || '',
    cycleId: classe?.cycleId || '',
    niveauId: classe?.niveauId || '',
    specialiteId: classe?.specialiteId || '',
    capacite: classe?.capacite || 35,
    salle: classe?.salle || '',
    statut: classe?.statut || 'Active',
    matiereIds: classe?.matieres?.map(m => m.id) || [],
  })
  const [matieres, setMatieres] = useState([])
  const [allMatieres, setAllMatieres] = useState([])
  const [loading, setLoading] = useState(false)

  const selectedCycle = cycles.find(c => c.id === formData.cycleId)
  const filteredNiveaux = niveaux.filter(n => n.cycleId === formData.cycleId)
  const filteredSpecialites = specialites.filter(s => s.cycleId === formData.cycleId)
  const hasSpecialites = filteredSpecialites.length > 0

  // Charger les matières filtrées selon le cycle et niveau sélectionnés
  useEffect(() => {
    const loadFilteredMatieres = async () => {
      try {
        if (formData.cycleId || formData.niveauId) {
          const result = await classeService.getFilteredMatieres(formData.cycleId, formData.niveauId)
          setAllMatieres(result)
        } else {
          setAllMatieres([])
        }
      } catch (error) {
        console.error('Erreur lors du chargement des matières:', error)
      }
    }
    loadFilteredMatieres()
  }, [formData.cycleId, formData.niveauId])

  useEffect(() => {
    const loadMatieres = async () => {
      if (selectedCycle) {
        const specialite = formData.specialiteId
          ? specialites.find(s => s.id === formData.specialiteId)?.nom
          : null
        const result = await onLoadMatieres(selectedCycle.nom, specialite)
        setMatieres(result)
      } else {
        setMatieres([])
      }
    }
    loadMatieres()
  }, [formData.cycleId, formData.specialiteId, selectedCycle, specialites, onLoadMatieres])

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      if (field === 'cycleId') {
        newData.niveauId = ''
        newData.specialiteId = ''
        newData.matiereIds = [] // Réinitialiser les matières sélectionnées
      }
      if (field === 'niveauId') {
        newData.matiereIds = [] // Réinitialiser les matières sélectionnées
      }
      return newData
    })
  }

  const handleMatiereToggle = (matiereId) => {
    setFormData(prev => {
      const matiereIds = prev.matiereIds || []
      const isSelected = matiereIds.includes(matiereId)
      return {
        ...prev,
        matiereIds: isSelected
          ? matiereIds.filter(id => id !== matiereId)
          : [...matiereIds, matiereId]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-classe" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>
            <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
            {isEdit ? 'Modifier la classe' : 'Nouvelle classe'}
          </h5>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-section">
              <h6 className="section-title"><i className="bi bi-building"></i> Informations de base</h6>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required">Nom de la classe</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: 6ème A, Terminale C..."
                    value={formData.nom}
                    onChange={(e) => handleChange('nom', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Cycle</label>
                  <select
                    className="form-select"
                    value={formData.cycleId}
                    onChange={(e) => handleChange('cycleId', parseInt(e.target.value) || '')}
                    required
                  >
                    <option value="">Sélectionner le cycle...</option>
                    {cycles.map(cycle => (
                      <option key={cycle.id} value={cycle.id}>{cycle.nom}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Niveau</label>
                  <select
                    className="form-select"
                    value={formData.niveauId}
                    onChange={(e) => handleChange('niveauId', parseInt(e.target.value) || '')}
                    disabled={!formData.cycleId}
                    required
                  >
                    <option value="">Sélectionner le niveau...</option>
                    {filteredNiveaux.map(niveau => (
                      <option key={niveau.id} value={niveau.id}>{niveau.nom}</option>
                    ))}
                  </select>
                </div>
                {hasSpecialites && (
                  <div className="form-group">
                    <label className="form-label required">Spécialité</label>
                    <select
                      className="form-select"
                      value={formData.specialiteId}
                      onChange={(e) => handleChange('specialiteId', parseInt(e.target.value) || '')}
                      required={hasSpecialites}
                    >
                      <option value="">Sélectionner la spécialité...</option>
                      {filteredSpecialites.map(spec => (
                        <option key={spec.id} value={spec.id}>{spec.nom}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h6 className="section-title"><i className="bi bi-gear"></i> Configuration</h6>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required">Capacité maximale</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="50"
                    value={formData.capacite}
                    onChange={(e) => handleChange('capacite', parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Salle</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Salle 101"
                    value={formData.salle}
                    onChange={(e) => handleChange('salle', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Statut</label>
                  <select
                    className="form-select"
                    value={formData.statut}
                    onChange={(e) => handleChange('statut', e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Archivée">Archivée</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sélection des matières */}
            <div className="form-section">
              <h6 className="section-title"><i className="bi bi-book"></i> Matières à enseigner ({formData.matiereIds?.length || 0} sélectionnée{(formData.matiereIds?.length || 0) > 1 ? 's' : ''})</h6>
              <div className="matieres-selection">
                {allMatieres.length > 0 ? (
                  allMatieres.map((matiere) => (
                    <label key={matiere.id} className="matiere-checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.matiereIds?.includes(matiere.id) || false}
                        onChange={() => handleMatiereToggle(matiere.id)}
                        className="matiere-checkbox"
                      />
                      <span className="matiere-name">{matiere.matiereNom || matiere.nom}</span>
                    </label>
                  ))
                ) : (
                  <span className="text-muted">{formData.niveauId ? 'Chargement des matières...' : 'Sélectionnez un niveau pour voir les matières'}</span>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <i className="bi bi-check-lg"></i> {isEdit ? 'Enregistrer' : 'Créer la classe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Composant principal
export default function StructureScolaire() {
  const [classes, setClasses] = useState([])
  const [cycles, setCycles] = useState([])
  const [niveaux, setNiveaux] = useState([])
  const [specialites, setSpecialites] = useState([])
  const [professeurs, setProfesseurs] = useState([])
  const [stats, setStats] = useState({ totalClasses: 0, totalEleves: 0, totalCapacite: 0, tauxRemplissage: 0 })
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [selectedClasse, setSelectedClasse] = useState(null)
  const [filterCycle, setFilterCycle] = useState('')
  const [filterStatut, setFilterStatut] = useState('Active')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('cards')

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [classesData, cyclesData, niveauxData, specialitesData, professeursData, statsData] = await Promise.all([
          classeService.getAllClasses(),
          classeService.getAllCycles(),
          classeService.getAllNiveaux(),
          classeService.getAllSpecialites(),
          classeService.getAllProfesseurs(),
          classeService.getStats(),
        ])
        setClasses(classesData)
        setCycles(cyclesData)
        setNiveaux(niveauxData)
        setSpecialites(specialitesData)
        setProfesseurs(professeursData)
        setStats(statsData)
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filtrer les classes
  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      if (filterCycle && c.cycle !== filterCycle) return false
      if (filterStatut && c.statut !== filterStatut) return false
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        return c.nom.toLowerCase().includes(search)
      }
      return true
    })
  }, [classes, filterCycle, filterStatut, searchTerm])

  // Grouper par cycle
  const classesByCycle = useMemo(() => {
    return filteredClasses.reduce((acc, classe) => {
      if (!acc[classe.cycle]) acc[classe.cycle] = []
      acc[classe.cycle].push(classe)
      return acc
    }, {})
  }, [filteredClasses])

  const handleOpenModal = (classe = null) => {
    setSelectedClasse(classe)
    setShowModal(true)
  }

  const handleLoadMatieres = async (cycleName, specialite) => {
    return classeService.getMatieresByCycle(cycleName, specialite)
  }

  const handleSave = async (data) => {
    try {
      // Nettoyer les données: convertir les chaînes vides en null
      const cleanedData = {
        ...data,
        specialiteId: data.specialiteId || null,
      }

      if (selectedClasse) {
        const updated = await classeService.updateClasse(selectedClasse.id, cleanedData)
        setClasses(prev => prev.map(c => c.id === selectedClasse.id ? updated : c))
      } else {
        const newClasse = await classeService.createClasse(cleanedData)
        setClasses(prev => [...prev, newClasse])
      }
      // Recharger les stats
      const newStats = await classeService.getStats()
      setStats(newStats)
      setShowModal(false)
      setSelectedClasse(null)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleArchive = async (id) => {
    if (confirm('Voulez-vous vraiment archiver cette classe ?')) {
      try {
        const archived = await classeService.archiveClasse(id)
        setClasses(prev => prev.map(c => c.id === id ? archived : c))
        const newStats = await classeService.getStats()
        setStats(newStats)
      } catch (error) {
        console.error('Erreur lors de l\'archivage:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="structure-scolaire-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
        <style>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 16px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top-color: #2D3E6f;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="structure-scolaire-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">
              <i className="bi bi-building me-2"></i>
              Structure Scolaire
            </h1>
            <p className="page-subtitle">Gestion des cycles, niveaux et classes</p>
          </div>
          <button className="btn-primary-lg" onClick={() => handleOpenModal()}>
            <i className="bi bi-plus-lg"></i> Nouvelle classe
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="bi bi-building"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalClasses}</span>
            <span className="stat-label">Classes actives</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <i className="bi bi-people"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalEleves}</span>
            <span className="stat-label">Élèves inscrits</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="bi bi-person-plus"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalCapacite}</span>
            <span className="stat-label">Capacité totale</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="bi bi-graph-up"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.tauxRemplissage}%</span>
            <span className="stat-label">Taux de remplissage</span>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="filters-bar">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Rechercher une classe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters">
          <select
            className="filter-select"
            value={filterCycle}
            onChange={(e) => setFilterCycle(e.target.value)}
          >
            <option value="">Tous les cycles</option>
            {cycles.map(cycle => (
              <option key={cycle.id} value={cycle.nom}>{cycle.nom}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="Active">Active</option>
            <option value="Archivée">Archivée</option>
          </select>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              <i className="bi bi-grid-3x3-gap"></i>
            </button>
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <i className="bi bi-list-ul"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      {viewMode === 'cards' ? (
        <div className="classes-by-cycle">
          {Object.entries(classesByCycle).map(([cycle, cycleClasses]) => (
            <div key={cycle} className="cycle-section">
              <div className="cycle-header">
                <h2 className="cycle-title">
                  <span className={`cycle-badge ${cycle.toLowerCase()}`}>{cycle}</span>
                  <span className="cycle-count">{cycleClasses.length} classe{cycleClasses.length > 1 ? 's' : ''}</span>
                </h2>
              </div>
              <div className="classes-grid">
                {cycleClasses.map(classe => (
                  <div key={classe.id} className={`classe-card ${classe.statut === 'Archivée' ? 'archived' : ''}`}>
                    <div className="classe-card-header">
                      <h3 className="classe-nom">{classe.nom}</h3>
                      <span className={`classe-statut ${classe.statut === 'Active' ? 'active' : 'archived'}`}>
                        {classe.statut}
                      </span>
                    </div>
                    <div className="classe-card-body">
                      <div className="classe-info-row">
                        <span className="info-label"><i className="bi bi-layers"></i> Niveau</span>
                        <span className="info-value">{classe.niveau}</span>
                      </div>
                      {classe.specialite && (
                        <div className="classe-info-row">
                          <span className="info-label"><i className="bi bi-bookmark"></i> Spécialité</span>
                          <span className="info-value">{classe.specialite}</span>
                        </div>
                      )}
                      <div className="classe-info-row">
                        <span className="info-label"><i className="bi bi-door-open"></i> Salle</span>
                        <span className="info-value">{classe.salle || '—'}</span>
                      </div>
                      <div className="classe-effectif">
                        <div className="effectif-bar">
                          <div
                            className="effectif-fill"
                            style={{ width: `${(classe.effectif / classe.capacite) * 100}%` }}
                          ></div>
                        </div>
                        <span className="effectif-text">
                          {classe.effectif} / {classe.capacite} élèves
                        </span>
                      </div>
                    </div>
                    <div className="classe-card-footer">
                      <button className="btn-icon" title="Voir détails">
                        <i className="bi bi-eye"></i>
                      </button>
                      <button className="btn-icon" title="Modifier" onClick={() => handleOpenModal(classe)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      {classe.statut === 'Active' && (
                        <button className="btn-icon danger" title="Archiver" onClick={() => handleArchive(classe.id)}>
                          <i className="bi bi-archive"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="classes-table-container">
          <table className="classes-table">
            <thead>
              <tr>
                <th>Classe</th>
                <th>Cycle</th>
                <th>Niveau</th>
                <th>Spécialité</th>
                <th>Effectif</th>
                <th>Salle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map(classe => (
                <tr key={classe.id} className={classe.statut === 'Archivée' ? 'archived' : ''}>
                  <td><strong>{classe.nom}</strong></td>
                  <td><span className={`cycle-badge-sm ${classe.cycle.toLowerCase()}`}>{classe.cycle}</span></td>
                  <td>{classe.niveau}</td>
                  <td>{classe.specialite || '—'}</td>
                  <td>
                    <div className="effectif-cell">
                      <span>{classe.effectif}/{classe.capacite}</span>
                      <div className="effectif-mini-bar">
                        <div style={{ width: `${(classe.effectif / classe.capacite) * 100}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td>{classe.salle || '—'}</td>
                  <td>
                    <span className={`statut-badge ${classe.statut === 'Active' ? 'active' : 'archived'}`}>
                      {classe.statut}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn-icon-sm" title="Modifier" onClick={() => handleOpenModal(classe)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      {classe.statut === 'Active' && (
                        <button className="btn-icon-sm danger" title="Archiver" onClick={() => handleArchive(classe.id)}>
                          <i className="bi bi-archive"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ClasseModal
          classe={selectedClasse}
          cycles={cycles}
          niveaux={niveaux}
          specialites={specialites}
          professeurs={professeurs}
          onClose={() => { setShowModal(false); setSelectedClasse(null); }}
          onSave={handleSave}
          onLoadMatieres={handleLoadMatieres}
        />
      )}

      <style>{`
        .structure-scolaire-page {
          padding: 24px;
          background: #f5f6fa;
          min-height: 100%;
        }

        /* Header */
        .page-header {
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          display: flex;
          align-items: center;
        }

        .page-title i {
          color: #2D3E6f;
        }

        .page-subtitle {
          color: #6b7280;
          margin: 4px 0 0;
        }

        .btn-primary-lg {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #2D3E6f;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary-lg:hover {
          background: #243256;
          transform: translateY(-1px);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(45, 62, 111, 0.08);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-icon.blue { background: #dbeafe; color: #2563eb; }
        .stat-icon.green { background: #d1fae5; color: #059669; }
        .stat-icon.orange { background: #fed7aa; color: #ea580c; }
        .stat-icon.purple { background: #e9d5ff; color: #9333ea; }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #6b7280;
          margin-top: 4px;
        }

        /* Filters */
        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-box i {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-box input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.9rem;
          background: white;
        }

        .search-box input:focus {
          outline: none;
          border-color: #2D3E6f;
          box-shadow: 0 0 0 3px rgba(45, 62, 111, 0.1);
        }

        .filters {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .filter-select {
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
        }

        .view-toggle {
          display: flex;
          background: #e5e7eb;
          border-radius: 8px;
          padding: 4px;
        }

        .toggle-btn {
          padding: 8px 12px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
        }

        .toggle-btn.active {
          background: white;
          color: #2D3E6f;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        /* Cycle Section */
        .cycle-section {
          margin-bottom: 32px;
        }

        .cycle-header {
          margin-bottom: 16px;
        }

        .cycle-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
        }

        .cycle-badge {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
        }

        .cycle-badge.fondamental { background: #dbeafe; color: #1e40af; }
        .cycle-badge.collège { background: #d1fae5; color: #065f46; }
        .cycle-badge.lycée { background: #fef3c7; color: #92400e; }

        .cycle-badge-sm {
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .cycle-badge-sm.fondamental { background: #dbeafe; color: #1e40af; }
        .cycle-badge-sm.collège { background: #d1fae5; color: #065f46; }
        .cycle-badge-sm.lycée { background: #fef3c7; color: #92400e; }

        .cycle-count {
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 400;
        }

        /* Classes Grid */
        .classes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .classe-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(45, 62, 111, 0.08);
          overflow: hidden;
          transition: all 0.2s;
        }

        .classe-card:hover {
          box-shadow: 0 4px 16px rgba(45, 62, 111, 0.12);
          transform: translateY(-2px);
        }

        .classe-card.archived {
          opacity: 0.7;
        }

        .classe-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .classe-nom {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .classe-statut {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .classe-statut.active {
          background: #d1fae5;
          color: #065f46;
        }

        .classe-statut.archived {
          background: #f3f4f6;
          color: #6b7280;
        }

        .classe-card-body {
          padding: 16px 20px;
        }

        .classe-info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dashed #e5e7eb;
        }

        .classe-info-row:last-of-type {
          border-bottom: none;
        }

        .info-label {
          font-size: 0.85rem;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .info-value {
          font-size: 0.9rem;
          font-weight: 500;
          color: #1f2937;
        }

        .classe-effectif {
          margin-top: 16px;
        }

        .effectif-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .effectif-fill {
          height: 100%;
          background: linear-gradient(90deg, #2D3E6f, #4a5d9e);
          border-radius: 4px;
          transition: width 0.3s;
        }

        .effectif-text {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .classe-card-footer {
          display: flex;
          gap: 8px;
          padding: 12px 20px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }

        .btn-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #f3f4f6;
          color: #2D3E6f;
          border-color: #2D3E6f;
        }

        .btn-icon.danger:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #dc2626;
        }

        /* Table View */
        .classes-table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(45, 62, 111, 0.08);
          overflow: hidden;
        }

        .classes-table {
          width: 100%;
          border-collapse: collapse;
        }

        .classes-table th,
        .classes-table td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        .classes-table th {
          background: #f9fafb;
          font-weight: 600;
          font-size: 0.85rem;
          color: #4b5563;
        }

        .classes-table tr:hover {
          background: #f9fafb;
        }

        .classes-table tr.archived {
          opacity: 0.6;
        }

        .effectif-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .effectif-mini-bar {
          width: 60px;
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
        }

        .effectif-mini-bar div {
          height: 100%;
          background: #2D3E6f;
          border-radius: 2px;
        }

        .statut-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .statut-badge.active {
          background: #d1fae5;
          color: #065f46;
        }

        .statut-badge.archived {
          background: #f3f4f6;
          color: #6b7280;
        }

        .actions-cell {
          display: flex;
          gap: 8px;
        }

        .btn-icon-sm {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: white;
          color: #6b7280;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .btn-icon-sm:hover {
          background: #f3f4f6;
          color: #2D3E6f;
        }

        .btn-icon-sm.danger:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-classe {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h5 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          display: flex;
          align-items: center;
        }

        .modal-header h5 i {
          color: #2D3E6f;
        }

        .btn-close-modal {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: #f3f4f6;
          border-radius: 8px;
          color: #6b7280;
          cursor: pointer;
        }

        .btn-close-modal:hover {
          background: #e5e7eb;
          color: #1f2937;
        }

        .modal-body {
          padding: 24px;
        }

        .form-section {
          margin-bottom: 24px;
        }

        .form-section:last-child {
          margin-bottom: 0;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #2D3E6f;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #374151;
        }

        .form-label.required::after {
          content: '*';
          color: #dc2626;
          margin-left: 4px;
        }

        .form-control,
        .form-select {
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .form-control:focus,
        .form-select:focus {
          outline: none;
          border-color: #2D3E6f;
          box-shadow: 0 0 0 3px rgba(45, 62, 111, 0.1);
        }

        .matieres-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .matieres-selection {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
          max-height: 300px;
          overflow-y: auto;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .matiere-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #e5e7eb;
        }

        .matiere-checkbox-label:hover {
          background: #f3f4f6;
          border-color: #2D3E6f;
        }

        .matiere-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #2D3E6f;
        }

        .matiere-name {
          font-size: 0.85rem;
          color: #374151;
          flex: 1;
        }

        .matiere-badge {
          padding: 6px 12px;
          background: #f3f4f6;
          border-radius: 6px;
          font-size: 0.8rem;
          color: #4b5563;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .btn-primary {
          padding: 10px 20px;
          background: #2D3E6f;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-primary:hover {
          background: #243256;
        }

        .btn-primary:disabled,
        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .text-muted {
          color: #9ca3af;
          font-style: italic;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .structure-scolaire-page {
            padding: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filters-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: none;
          }

          .filters {
            flex-wrap: wrap;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .classes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
