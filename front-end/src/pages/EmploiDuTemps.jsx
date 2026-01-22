import { useState, useEffect, useCallback } from 'react'
import { emploiDuTempsService, classeService, enseignantService, matiereService, salleService } from '../services'

// Heures de cours (créneaux de 2 heures)
const heuresJour = [
  { id: 1, debut: '08:00', fin: '10:00' },
  { id: 2, debut: '10:00', fin: '12:00' },
  { id: 3, debut: '12:00', fin: '14:00' },
]

const joursMap = {
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi'
}

const jours = Object.values(joursMap)

// Fonction pour imprimer l'emploi du temps
const handlePrint = (titre) => {
  const printContent = document.querySelector('.schedule-container')
  if (!printContent) return

  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html>
      <head>
        <title>${titre}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #2D3E6f; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          th { background: #2D3E6f; color: white; }
          .seance-block { padding: 5px; }
          .seance-matiere { font-weight: bold; display: block; }
          .seance-enseignant { font-size: 0.9em; color: #666; display: block; }
          .seance-salle { font-size: 0.8em; color: #999; display: block; }
          @media print { body { -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>${titre}</h1>
        ${printContent.innerHTML}
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

// Fonction pour exporter en PDF (utilise l'impression navigateur)
const handleExportPDF = (titre) => {
  handlePrint(titre)
}

// Modal pour ajouter/modifier une séance
function SeanceModal({ onClose, jour, heure, classeId, classeNom, seance = null, seanceId = null, enseignants = [], salles = [], matieres = [], onSave, onDelete, defaultProfesseurId = null, classes = [], viewMode = 'classe' }) {
  const [formData, setFormData] = useState({
    matiereId: seance?.matiereId || '',
    professeurId: seance?.professeurId || (defaultProfesseurId ? String(defaultProfesseurId) : ''),
    salleId: seance?.salleId || '',
    classeId: classeId ? String(classeId) : '',
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!formData.matiereId || !formData.professeurId || !formData.salleId || !formData.classeId) {
      alert('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    try {
      const jourIndex = Object.keys(joursMap).find(k => joursMap[k] === jour)
      const heureObj = heuresJour.find(h => h.id === heure)

      const payload = {
        classeId: Number(formData.classeId),
        matiereId: Number(formData.matiereId),
        professeurId: Number(formData.professeurId),
        salleId: Number(formData.salleId),
        jourSemaine: Number(jourIndex),
        heureDebut: heureObj.debut,
        heureFin: heureObj.fin,
        anneeScolaire: '2024-2025'
      }

      if (seanceId) {
        await emploiDuTempsService.updateSeance(seanceId, payload)
      } else {
        await emploiDuTempsService.createSeance(payload)
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!seanceId) return
    if (!window.confirm('Supprimer cette séance ?')) return

    setLoading(true)
    try {
      await emploiDuTempsService.deleteSeance(seanceId)
      onDelete()
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-seance" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h5><i className="bi bi-calendar-plus me-2"></i>{seanceId ? 'Modifier' : 'Ajouter'} une séance</h5>
          <button className="btn-close-modal" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="seance-info">
            <span><i className="bi bi-calendar3"></i> {jour}</span>
            <span><i className="bi bi-clock"></i> {heuresJour.find(h => h.id === heure)?.debut} - {heuresJour.find(h => h.id === heure)?.fin}</span>
          </div>

          <div className="form-group">
            <label className="form-label required">Classe</label>
            <select className="form-select" value={formData.classeId} onChange={e => setFormData({ ...formData, classeId: e.target.value })}>
              <option value="">Sélectionner une classe...</option>
              {classes.map(c => <option key={c.id} value={String(c.id)}>{c.nom}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label required">Matière</label>
            <select className="form-select" value={formData.matiereId} onChange={e => setFormData({ ...formData, matiereId: e.target.value })}>
              <option value="">Sélectionner une matière...</option>
              {matieres.map(m => <option key={m.id} value={String(m.id)}>{m.nom}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label required">Enseignant</label>
            <select className="form-select" value={formData.professeurId} onChange={e => setFormData({ ...formData, professeurId: e.target.value })}>
              <option value="">Sélectionner un enseignant...</option>
              {enseignants.map(e => <option key={e.id} value={String(e.id)}>{e.nom}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label required">Salle</label>
            <select className="form-select" value={formData.salleId} onChange={e => setFormData({ ...formData, salleId: e.target.value })}>
              <option value="">Sélectionner une salle...</option>
              {salles.filter(s => s.disponible !== false).map(s => <option key={s.id} value={String(s.id)}>{s.nom} ({s.capacite} places)</option>)}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          {seanceId && (
            <button className="btn-danger" onClick={handleDelete} disabled={loading}>
              <i className="bi bi-trash"></i> Supprimer
            </button>
          )}
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Annuler</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            <i className="bi bi-check-lg"></i> {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal pour gérer les salles
function SalleModal({ onClose, salle = null, onSave }) {
  const [formData, setFormData] = useState({
    nom: salle?.nom || '',
    capacite: salle?.capacite || 30,
    type: salle?.type || 'Classe',
    equipements: salle?.equipements || '',
    disponible: salle?.disponible ?? true,
  })
  const [loading, setLoading] = useState(false)

  const types = ['Classe', 'Laboratoire', 'Informatique', 'Sport', 'Amphitheatre']

  const handleSave = async () => {
    if (!formData.nom) {
      alert('Veuillez entrer un nom')
      return
    }

    setLoading(true)
    try {
      const payload = {
        nom: formData.nom,
        capacite: Number(formData.capacite),
        type: formData.type,
        equipements: formData.equipements,
        disponible: formData.disponible
      }

      if (salle?.id) {
        await salleService.updateSalle(salle.id, payload)
      } else {
        await salleService.createSalle(payload)
      }

      onSave()
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-salle" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h5><i className="bi bi-door-open me-2"></i>{salle ? 'Modifier' : 'Ajouter'} une salle</h5>
          <button className="btn-close-modal" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Nom de la salle</label>
              <input type="text" className="form-control" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} placeholder="Ex: Salle 101" />
            </div>
            <div className="form-group">
              <label className="form-label">Capacité</label>
              <input type="number" className="form-control" value={formData.capacite} onChange={e => setFormData({ ...formData, capacite: Number(e.target.value) })} min="1" max="200" />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Disponibilité</label>
              <select className="form-select" value={formData.disponible ? 'oui' : 'non'} onChange={e => setFormData({ ...formData, disponible: e.target.value === 'oui' })}>
                <option value="oui">Disponible</option>
                <option value="non">Indisponible</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Equipements</label>
              <input type="text" className="form-control" value={formData.equipements} onChange={e => setFormData({ ...formData, equipements: e.target.value })} placeholder="Ex: Projecteur, Tableau blanc" />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Annuler</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            <i className="bi bi-check-lg"></i> {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EmploiDuTemps({ defaultTab = 'emploi' }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [selectedClasse, setSelectedClasse] = useState(null)
  const [selectedEnseignant, setSelectedEnseignant] = useState(null)
  const [viewMode, setViewMode] = useState('classe')
  const [showSeanceModal, setShowSeanceModal] = useState(false)
  const [showSalleModal, setShowSalleModal] = useState(false)
  const [selectedSeance, setSelectedSeance] = useState(null)
  const [selectedSeanceId, setSelectedSeanceId] = useState(null)
  const [selectedSalle, setSelectedSalle] = useState(null)
  const [selectedJour, setSelectedJour] = useState(null)
  const [selectedHeure, setSelectedHeure] = useState(null)
  const [searchSalle, setSearchSalle] = useState('')

  // State pour les données de l'API
  const [seances, setSeances] = useState([])
  const [allSeances, setAllSeances] = useState([])
  const [classes, setClasses] = useState([])
  const [enseignants, setEnseignants] = useState([])
  const [matieres, setMatieres] = useState([])
  const [salles, setSalles] = useState([])
  const [conflits, setConflits] = useState([])
  const [loading, setLoading] = useState(true)

  // Fonction pour détecter les conflits
  const detecterConflits = useCallback((seancesList) => {
    const conflitsDetectes = []

    for (let i = 0; i < seancesList.length; i++) {
      for (let j = i + 1; j < seancesList.length; j++) {
        const s1 = seancesList[i]
        const s2 = seancesList[j]

        // Même jour et même créneau horaire
        const memeJour = s1.jourSemaine === s2.jourSemaine
        const s1Debut = s1.heureDebut?.substring(0, 5)
        const s2Debut = s2.heureDebut?.substring(0, 5)
        const memeCreneau = s1Debut === s2Debut

        if (memeJour && memeCreneau) {
          // Conflit enseignant : même prof à 2 endroits
          if (s1.professeurId === s2.professeurId && s1.professeurId) {
            conflitsDetectes.push({
              id: `prof-${s1.id}-${s2.id}`,
              type: 'enseignant',
              severity: 'high',
              message: `L'enseignant "${s1.professeur || s1.professeurNom}" est assigné à deux cours en même temps`,
              jour: joursMap[s1.jourSemaine],
              heure: s1Debut,
              details: [
                { classe: s1.classe || s1.classeNom, matiere: s1.matiere || s1.matiereNom, salle: s1.salle || s1.salleNom },
                { classe: s2.classe || s2.classeNom, matiere: s2.matiere || s2.matiereNom, salle: s2.salle || s2.salleNom }
              ],
              seances: [s1, s2]
            })
          }

          // Conflit salle : même salle pour 2 cours
          if (s1.salleId === s2.salleId && s1.salleId) {
            conflitsDetectes.push({
              id: `salle-${s1.id}-${s2.id}`,
              type: 'salle',
              severity: 'high',
              message: `La salle "${s1.salle || s1.salleNom}" est utilisée par deux classes en même temps`,
              jour: joursMap[s1.jourSemaine],
              heure: s1Debut,
              details: [
                { classe: s1.classe || s1.classeNom, matiere: s1.matiere || s1.matiereNom, prof: s1.professeur || s1.professeurNom },
                { classe: s2.classe || s2.classeNom, matiere: s2.matiere || s2.matiereNom, prof: s2.professeur || s2.professeurNom }
              ],
              seances: [s1, s2]
            })
          }

          // Conflit classe : même classe avec 2 cours différents
          if (s1.classeId === s2.classeId && s1.classeId) {
            conflitsDetectes.push({
              id: `classe-${s1.id}-${s2.id}`,
              type: 'classe',
              severity: 'high',
              message: `La classe "${s1.classe || s1.classeNom}" a deux cours programmés en même temps`,
              jour: joursMap[s1.jourSemaine],
              heure: s1Debut,
              details: [
                { matiere: s1.matiere || s1.matiereNom, prof: s1.professeur || s1.professeurNom, salle: s1.salle || s1.salleNom },
                { matiere: s2.matiere || s2.matiereNom, prof: s2.professeur || s2.professeurNom, salle: s2.salle || s2.salleNom }
              ],
              seances: [s1, s2]
            })
          }
        }
      }
    }

    return conflitsDetectes
  }, [])

  // Charger toutes les séances pour la détection de conflits
  const loadAllSeances = useCallback(async () => {
    try {
      const data = await emploiDuTempsService.getAllSeances()
      setAllSeances(Array.isArray(data) ? data : [])
      const conflitsDetectes = detecterConflits(Array.isArray(data) ? data : [])
      setConflits(conflitsDetectes)
    } catch (error) {
      console.error('Erreur lors du chargement de toutes les séances:', error)
    }
  }, [detecterConflits])

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        const [classesData, enseignantsData, matieresData, sallesData] = await Promise.all([
          classeService.getAllClasses(),
          enseignantService.getAllEnseignants(),
          matiereService.getAllMatieres(),
          salleService.getAllSalles().catch(() => [])
        ])

        setClasses(classesData)
        setEnseignants(enseignantsData.map(e => ({
          id: e.id,
          nom: `${e.prenom || ''} ${e.nom}`.trim(),
          matiere: e.specialite || e.specialitePrincipale || ''
        })))
        setMatieres(matieresData)
        setSalles(sallesData)

        if (classesData.length > 0 && !selectedClasse) {
          setSelectedClasse(classesData[0])
        }

        // Charger toutes les séances pour les conflits
        await loadAllSeances()
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()
  }, [loadAllSeances])

  // Charger l'emploi du temps
  const loadEmploi = useCallback(async () => {
    try {
      let data = []
      if (viewMode === 'classe' && selectedClasse?.id) {
        data = await emploiDuTempsService.getByClasse(selectedClasse.id)
      } else if (viewMode === 'enseignant' && selectedEnseignant) {
        data = await emploiDuTempsService.getByProfesseur(selectedEnseignant)
      }
      setSeances(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erreur lors du chargement de l\'emploi du temps:', error)
      setSeances([])
    }
  }, [viewMode, selectedClasse, selectedEnseignant])

  useEffect(() => {
    loadEmploi()
  }, [loadEmploi])

  // Recharger les salles
  const loadSalles = async () => {
    try {
      const sallesData = await salleService.getAllSalles()
      setSalles(sallesData)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  // Convertir les seances en format grille
  const getSeanceForCell = (jour, heureId) => {
    const jourIndex = Object.keys(joursMap).find(k => joursMap[k] === jour)
    const heureObj = heuresJour.find(h => h.id === heureId)

    return seances.find(s => {
      const sJour = s.jourSemaine
      // Gérer les heures avec ou sans secondes (08:00 ou 08:00:00)
      const sDebut = s.heureDebut?.substring(0, 5)
      return sJour == jourIndex && sDebut === heureObj?.debut
    })
  }

  const stats = {
    totalSeances: allSeances.length,
    sallesDisponibles: salles.filter(s => s.disponible !== false).length,
    conflits: conflits.length,
    tauxOccupation: salles.length > 0 ? Math.round((salles.filter(s => s.disponible !== false).length / salles.length) * 100) : 0
  }

  const handleCellClick = (jour, heureId) => {
    const seance = getSeanceForCell(jour, heureId)
    setSelectedJour(jour)
    setSelectedHeure(heureId)
    setSelectedSeance(seance ? {
      matiereId: seance.matiereId,
      professeurId: seance.professeurId,
      salleId: seance.salleId
    } : null)
    setSelectedSeanceId(seance?.id || null)
    setShowSeanceModal(true)
  }

  const handleEditSalle = (salle) => {
    setSelectedSalle(salle)
    setShowSalleModal(true)
  }

  const handleAddSalle = () => {
    setSelectedSalle(null)
    setShowSalleModal(true)
  }

  const handleDeleteSalle = async (salleId) => {
    if (!window.confirm('Supprimer cette salle ?')) return
    try {
      await salleService.deleteSalle(salleId)
      loadSalles()
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const getMatiereColor = (matiere) => {
    const colors = {
      'Mathematiques': '#3b82f6',
      'Francais': '#8b5cf6',
      'Arabe': '#10b981',
      'Anglais': '#f59e0b',
      'Physique': '#ef4444',
      'Physique-Chimie': '#ef4444',
      'SVT': '#22c55e',
      'Sport': '#06b6d4',
      'Histoire-Geo': '#ec4899',
    }
    return colors[matiere] || '#6b7280'
  }

  const filteredSalles = salles.filter(s =>
    s.nom?.toLowerCase().includes(searchSalle.toLowerCase()) ||
    s.type?.toLowerCase().includes(searchSalle.toLowerCase())
  )

  if (loading) {
    return (
      <div className="emploi-du-temps">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
        <style>{`
          .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; }
          .spinner { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #2D3E6f; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  return (
    <div className="emploi-du-temps">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">
              <i className="bi bi-calendar3 me-2"></i>
              Emploi du Temps & Salles
            </h1>
            <p className="text-muted">Planification des cours et gestion des salles</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon seances"><i className="bi bi-calendar-check"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalSeances}</span>
            <span className="stat-label">Séances/semaine</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon salles"><i className="bi bi-door-open"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.sallesDisponibles}/{salles.length}</span>
            <span className="stat-label">Salles disponibles</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon conflits"><i className="bi bi-exclamation-triangle"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.conflits}</span>
            <span className="stat-label">Conflits détectés</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon occupation"><i className="bi bi-pie-chart"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.tauxOccupation}%</span>
            <span className="stat-label">Taux disponibilité</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'emploi' ? 'active' : ''}`} onClick={() => setActiveTab('emploi')}>
            <i className="bi bi-calendar3"></i> Emploi du temps
          </button>
          <button className={`tab ${activeTab === 'salles' ? 'active' : ''}`} onClick={() => setActiveTab('salles')}>
            <i className="bi bi-door-open"></i> Salles
          </button>
          <button className={`tab ${activeTab === 'conflits' ? 'active' : ''}`} onClick={() => setActiveTab('conflits')}>
            <i className="bi bi-exclamation-triangle"></i> Conflits
            {conflits.length > 0 && <span className="badge-count">{conflits.length}</span>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content-card">
        {/* Tab Emploi du temps */}
        {activeTab === 'emploi' && (
          <div className="tab-content">
            <div className="toolbar">
              <div className="toolbar-left">
                <div className="view-switcher">
                  <button className={viewMode === 'classe' ? 'active' : ''} onClick={() => {
                    setViewMode('classe')
                    if (classes.length > 0 && !selectedClasse) {
                      setSelectedClasse(classes[0])
                    }
                  }}>
                    <i className="bi bi-people"></i> Par classe
                  </button>
                  <button className={viewMode === 'enseignant' ? 'active' : ''} onClick={() => {
                    setViewMode('enseignant')
                    if (enseignants.length > 0 && !selectedEnseignant) {
                      setSelectedEnseignant(enseignants[0].id)
                    }
                  }}>
                    <i className="bi bi-person-workspace"></i> Par enseignant
                  </button>
                </div>

                {viewMode === 'classe' ? (
                  <select className="filter-select" value={selectedClasse?.id || ''} onChange={e => {
                    const cl = classes.find(c => c.id == e.target.value)
                    setSelectedClasse(cl)
                  }}>
                    <option value="">Sélectionner une classe</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                ) : (
                  <select className="filter-select" value={selectedEnseignant || ''} onChange={e => setSelectedEnseignant(e.target.value)}>
                    <option value="">Sélectionner un enseignant</option>
                    {enseignants.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                  </select>
                )}
              </div>
              <div className="toolbar-right">
                <button className="btn-export" onClick={() => handlePrint(viewMode === 'classe' ? `Emploi du temps - ${selectedClasse?.nom || ''}` : `Emploi du temps - ${enseignants.find(e => e.id == selectedEnseignant)?.nom || ''}`)}>
                  <i className="bi bi-printer"></i> Imprimer
                </button>
                <button className="btn-export" onClick={() => handleExportPDF(viewMode === 'classe' ? `Emploi du temps - ${selectedClasse?.nom || ''}` : `Emploi du temps - ${enseignants.find(e => e.id == selectedEnseignant)?.nom || ''}`)}>
                  <i className="bi bi-file-pdf"></i> Export PDF
                </button>
              </div>
            </div>

            {/* Grille emploi du temps */}
            <div className="schedule-container">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th className="time-col">Heure</th>
                    {jours.map(jour => (
                      <th key={jour}>{jour}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heuresJour.map(heure => (
                    <tr key={heure.id}>
                      <td className="time-cell">
                        <span className="time-start">{heure.debut}</span>
                        <span className="time-end">{heure.fin}</span>
                      </td>
                      {jours.map(jour => {
                        const seance = getSeanceForCell(jour, heure.id)
                        return (
                          <td
                            key={jour}
                            className={`schedule-cell ${seance ? 'has-seance' : ''}`}
                            onClick={() => handleCellClick(jour, heure.id)}
                          >
                            {seance ? (
                              <div className="seance-block" style={{ borderLeftColor: getMatiereColor(seance.matiere || seance.matiereNom) }}>
                                <span className="seance-matiere">{seance.matiere || seance.matiereNom}</span>
                                <span className="seance-enseignant">{seance.professeur || seance.professeurNom}</span>
                                <span className="seance-salle">{seance.salle || seance.salleNom}</span>
                              </div>
                            ) : (
                              <div className="empty-slot">
                                <i className="bi bi-plus"></i>
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Légende */}
            <div className="legend">
              <span className="legend-title">Cliquez sur une cellule pour ajouter/modifier une séance</span>
            </div>
          </div>
        )}

        {/* Tab Salles */}
        {activeTab === 'salles' && (
          <div className="tab-content">
            <div className="toolbar">
              <div className="toolbar-left">
                <div className="search-box">
                  <i className="bi bi-search"></i>
                  <input type="text" placeholder="Rechercher une salle..." value={searchSalle} onChange={e => setSearchSalle(e.target.value)} />
                </div>
              </div>
              <div className="toolbar-right">
                <button className="btn-add" onClick={handleAddSalle}>
                  <i className="bi bi-plus-lg"></i> Ajouter une salle
                </button>
              </div>
            </div>

            {filteredSalles.length === 0 ? (
              <div className="no-data">
                <i className="bi bi-door-open"></i>
                <p>Aucune salle trouvée</p>
              </div>
            ) : (
              <div className="salles-grid">
                {filteredSalles.map(salle => (
                  <div key={salle.id} className={`salle-card ${salle.disponible === false ? 'unavailable' : ''}`}>
                    <div className="salle-header">
                      <div className={`salle-icon ${salle.type?.toLowerCase()}`}>
                        <i className={`bi ${salle.type === 'Laboratoire' ? 'bi-flask' : salle.type === 'Informatique' ? 'bi-pc-display' : 'bi-door-open'}`}></i>
                      </div>
                      <div className="salle-actions">
                        <button onClick={() => handleEditSalle(salle)}><i className="bi bi-pencil"></i></button>
                        <button className="delete" onClick={() => handleDeleteSalle(salle.id)}><i className="bi bi-trash"></i></button>
                      </div>
                    </div>
                    <div className="salle-body">
                      <h4>{salle.nom}</h4>
                      <span className="salle-type">{salle.type}</span>
                      <div className="salle-details">
                        <span><i className="bi bi-people"></i> {salle.capacite} places</span>
                        <span className={`status ${salle.disponible !== false ? 'available' : 'unavailable'}`}>
                          <i className={`bi ${salle.disponible !== false ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
                          {salle.disponible !== false ? 'Disponible' : 'Indisponible'}
                        </span>
                      </div>
                      {salle.equipements && (
                        <div className="salle-equipements">
                          <i className="bi bi-tools"></i> {salle.equipements}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Conflits */}
        {activeTab === 'conflits' && (
          <div className="tab-content">
            <div className="toolbar">
              <div className="toolbar-left">
                <div className="conflits-summary">
                  <span className="summary-item">
                    <i className="bi bi-person-workspace"></i>
                    {conflits.filter(c => c.type === 'enseignant').length} conflits enseignant
                  </span>
                  <span className="summary-item">
                    <i className="bi bi-door-open"></i>
                    {conflits.filter(c => c.type === 'salle').length} conflits salle
                  </span>
                  <span className="summary-item">
                    <i className="bi bi-people"></i>
                    {conflits.filter(c => c.type === 'classe').length} conflits classe
                  </span>
                </div>
              </div>
              <div className="toolbar-right">
                <button className="btn-refresh" onClick={loadAllSeances}>
                  <i className="bi bi-arrow-clockwise"></i> Actualiser
                </button>
              </div>
            </div>

            {conflits.length === 0 ? (
              <div className="no-conflits">
                <i className="bi bi-check-circle"></i>
                <h3>Aucun conflit détecté</h3>
                <p>Tous les emplois du temps sont cohérents</p>
              </div>
            ) : (
              <div className="conflits-list">
                {conflits.map(conflit => (
                  <div key={conflit.id} className={`conflit-card ${conflit.type}`}>
                    <div className="conflit-left">
                      <i className={`bi ${conflit.type === 'enseignant' ? 'bi-person-exclamation' : conflit.type === 'salle' ? 'bi-door-open' : 'bi-people'}`}></i>
                    </div>
                    <div className="conflit-content">
                      <div className="conflit-header-row">
                        <span className={`conflit-type ${conflit.type}`}>
                          {conflit.type === 'enseignant' ? 'Enseignant' : conflit.type === 'salle' ? 'Salle' : 'Classe'}
                        </span>
                        <span className="conflit-separator">•</span>
                        <span className="conflit-when">{conflit.jour} à {conflit.heure}</span>
                      </div>
                      <p className="conflit-desc">{conflit.message}</p>
                      <div className="conflit-chips">
                        {conflit.details.map((detail, idx) => (
                          <span key={idx} className="chip">
                            {detail.classe || detail.matiere}{detail.salle ? ` (${detail.salle})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button className="conflit-btn" title="Résoudre" onClick={() => {
                      const seance = conflit.seances[0]
                      if (seance?.classeId) {
                        const classe = classes.find(c => c.id === seance.classeId)
                        if (classe) {
                          setSelectedClasse(classe)
                          setViewMode('classe')
                          setActiveTab('emploi')
                        }
                      }
                    }}>
                      <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showSeanceModal && (viewMode === 'classe' ? selectedClasse : selectedEnseignant) && (
        <SeanceModal
          onClose={() => setShowSeanceModal(false)}
          jour={selectedJour}
          heure={selectedHeure}
          classeId={selectedClasse?.id || ''}
          classeNom={selectedClasse?.nom || ''}
          seance={selectedSeance}
          seanceId={selectedSeanceId}
          enseignants={enseignants}
          salles={salles}
          matieres={matieres}
          classes={classes}
          onSave={loadEmploi}
          onDelete={loadEmploi}
          viewMode={viewMode}
          defaultProfesseurId={selectedEnseignant}
        />
      )}

      {showSalleModal && (
        <SalleModal
          onClose={() => setShowSalleModal(false)}
          salle={selectedSalle}
          onSave={loadSalles}
        />
      )}

      <style>{`
        .emploi-du-temps {
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
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-icon.seances { background: #dbeafe; color: #2563eb; }
        .stat-icon.salles { background: #d1fae5; color: #059669; }
        .stat-icon.conflits { background: #fef3c7; color: #d97706; }
        .stat-icon.occupation { background: #ede9fe; color: #7c3aed; }

        .stat-info { display: flex; flex-direction: column; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: #1f2937; }
        .stat-label { font-size: 0.85rem; color: #6b7280; }

        /* Tabs */
        .tabs-container {
          background: white;
          border-radius: 12px 12px 0 0;
          padding: 0 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .tabs { display: flex; gap: 8px; }

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
        }

        .tab:hover { color: #2D3E6f; }
        .tab.active { color: #2D3E6f; border-bottom-color: #2D3E6f; }

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

        .view-switcher {
          display: flex;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .view-switcher button {
          padding: 10px 16px;
          background: white;
          border: none;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .view-switcher button.active { background: #2D3E6f; color: white; }

        .filter-select {
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
          min-width: 180px;
        }

        .btn-export {
          padding: 10px 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-export:hover { background: #f9fafb; }

        .btn-add {
          padding: 10px 20px;
          background: #2D3E6f;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Schedule Table */
        .schedule-container { overflow-x: auto; }

        .schedule-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .schedule-table th {
          padding: 12px;
          background: #f9fafb;
          color: #374151;
          font-weight: 600;
          text-align: center;
          border: 1px solid #e5e7eb;
        }

        .time-col { width: 80px; }

        .time-cell {
          padding: 8px;
          background: #f9fafb;
          text-align: center;
          border: 1px solid #e5e7eb;
        }

        .time-start { display: block; font-weight: 600; color: #1f2937; }
        .time-end { display: block; font-size: 0.8rem; color: #6b7280; }

        .schedule-cell {
          border: 1px solid #e5e7eb;
          padding: 4px;
          height: 80px;
          vertical-align: top;
          cursor: pointer;
          transition: all 0.2s;
        }

        .schedule-cell:hover { background: #f0f9ff; }

        .seance-block {
          height: 100%;
          padding: 8px;
          background: white;
          border-radius: 6px;
          border-left: 3px solid #2D3E6f;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .seance-matiere { font-weight: 600; font-size: 0.85rem; color: #1f2937; }
        .seance-enseignant { font-size: 0.75rem; color: #6b7280; }
        .seance-salle { font-size: 0.7rem; color: #9ca3af; }

        .empty-slot {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d1d5db;
          font-size: 1.5rem;
        }

        .schedule-cell:hover .empty-slot { color: #2D3E6f; }

        .legend {
          margin-top: 20px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          text-align: center;
          color: #6b7280;
          font-size: 0.9rem;
        }

        /* Salles Grid */
        .salles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .salle-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .salle-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .salle-card.unavailable { opacity: 0.6; }

        .salle-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 16px;
          background: linear-gradient(135deg, #2D3E6f 0%, #4f5d8a 100%);
        }

        .salle-icon {
          width: 50px;
          height: 50px;
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .salle-icon.laboratoire { background: rgba(239, 68, 68, 0.3); }
        .salle-icon.informatique { background: rgba(59, 130, 246, 0.3); }

        .salle-actions { display: flex; gap: 4px; }

        .salle-actions button {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          cursor: pointer;
        }

        .salle-actions button:hover { background: rgba(255,255,255,0.3); }
        .salle-actions button.delete:hover { background: #dc2626; }

        .salle-body { padding: 16px; }
        .salle-body h4 { margin: 0 0 4px; font-size: 1.1rem; color: #1f2937; }
        .salle-type { font-size: 0.85rem; color: #6b7280; }

        .salle-details {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.85rem;
        }

        .salle-details span {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
        }

        .salle-details .status.available { color: #059669; }
        .salle-details .status.unavailable { color: #dc2626; }

        .salle-equipements {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px dashed #e5e7eb;
          font-size: 0.8rem;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .no-data {
          text-align: center;
          padding: 60px 20px;
          color: #9ca3af;
        }

        .no-data i { font-size: 3rem; margin-bottom: 16px; display: block; }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 20px;
        }

        .modal-seance, .modal-salle {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #2D3E6f 0%, #3d5291 100%);
          color: white;
        }

        .modal-header h5 { margin: 0; }

        .btn-close-modal {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
        }

        .modal-body { padding: 24px; }

        .seance-info {
          display: flex;
          gap: 16px;
          padding: 12px;
          background: #f0f9ff;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          color: #0369a1;
          flex-wrap: wrap;
        }

        .seance-info span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-group { margin-bottom: 16px; }

        .form-label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-label.required::after { content: " *"; color: #dc2626; }

        .form-control, .form-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .form-control:focus, .form-select:focus {
          outline: none;
          border-color: #2D3E6f;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .form-group.full-width { grid-column: span 2; }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .btn-primary {
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

        .btn-danger {
          padding: 10px 20px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-right: auto;
        }

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

        /* Badge count on tab */
        .badge-count {
          background: #dc2626;
          color: white;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 6px;
          font-weight: 600;
        }

        /* Conflits Tab Styles */
        .conflits-summary {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #f3f4f6;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #4b5563;
        }

        .btn-refresh {
          padding: 10px 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-refresh:hover { background: #f9fafb; }

        .no-conflits {
          text-align: center;
          padding: 80px 20px;
          color: #059669;
        }

        .no-conflits i {
          font-size: 4rem;
          margin-bottom: 16px;
          display: block;
        }

        .no-conflits h3 {
          margin: 0 0 8px;
          font-size: 1.5rem;
          color: #059669;
        }

        .no-conflits p {
          margin: 0;
          color: #6b7280;
        }

        .conflits-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .conflit-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          border-left: 3px solid #d97706;
          transition: box-shadow 0.2s;
        }

        .conflit-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .conflit-card.enseignant { border-left-color: #7c3aed; }
        .conflit-card.salle { border-left-color: #2563eb; }
        .conflit-card.classe { border-left-color: #dc2626; }

        .conflit-left {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          background: #fef3c7;
          color: #d97706;
          flex-shrink: 0;
        }

        .conflit-card.enseignant .conflit-left { background: #ede9fe; color: #7c3aed; }
        .conflit-card.salle .conflit-left { background: #dbeafe; color: #2563eb; }
        .conflit-card.classe .conflit-left { background: #fee2e2; color: #dc2626; }

        .conflit-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .conflit-header-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .conflit-type {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          background: #fef3c7;
          color: #92400e;
        }

        .conflit-type.enseignant { background: #ede9fe; color: #6d28d9; }
        .conflit-type.salle { background: #dbeafe; color: #1d4ed8; }
        .conflit-type.classe { background: #fee2e2; color: #b91c1c; }

        .conflit-separator {
          color: #d1d5db;
          font-size: 0.75rem;
        }

        .conflit-when {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .conflit-desc {
          font-size: 0.8rem;
          color: #374151;
          margin: 0;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .conflit-chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .chip {
          font-size: 0.7rem;
          padding: 2px 8px;
          background: #f3f4f6;
          border-radius: 4px;
          color: #6b7280;
        }

        .conflit-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: #f3f4f6;
          border: none;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .conflit-btn:hover {
          background: #2D3E6f;
          color: white;
        }

        @media (max-width: 768px) {
          .emploi-du-temps { padding: 16px; }
          .view-switcher { flex-direction: column; }
          .form-grid { grid-template-columns: 1fr; }
          .form-group.full-width { grid-column: span 1; }
          .salles-grid { grid-template-columns: 1fr; }
          .toolbar { flex-direction: column; align-items: stretch; }
          .conflits-summary { flex-direction: column; }
        }
      `}</style>
    </div>
  )
}
