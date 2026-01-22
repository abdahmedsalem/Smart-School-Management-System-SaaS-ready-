import { useState, useMemo, useEffect } from 'react'
import { examenService, classeService } from '../services'

// Fonction de mapping pour les examens depuis l'API
const mapExamenFromApi = (e) => ({
  id: e.id,
  nom: e.nom || e.titre || '',
  type: e.typeExamen || e.type || 'Devoir', // Utilise typeExamen de la base
  typeExamenId: e.typeExamenId,
  matiere: e.matiere || e.matiereNom || '',
  matiereId: e.matiereId,
  classe: e.classe || e.classeNom || '',
  classeId: e.classeId,
  periodeId: e.periodeId,
  date: e.date || '',
  heure: e.heureDebut || e.heure || '08:00',
  heureFin: e.heureFin || '',
  duree: e.duree || 60,
  totalPoints: e.totalPoints || 20,
  statut: e.statut || 'planifie',
  salle: e.salle || '',
  salleId: e.salleId,
  surveillant: e.surveillant || '',
  surveillantId: e.surveillantId,
  anneeScolaire: e.anneeScolaire || '2024-2025',
  commentaire: e.commentaire || '',
})

const salles = ['Salle 101', 'Salle 102', 'Salle 103', 'Labo Physique', 'Labo SVT']

// Modal création examen
function ExamenModal({ onClose, examen = null, classes = [], matieres = [], selectedClasseId = null, typeExamens = [], selectedTrimestre = 1, onSave }) {
  const isEdit = !!examen
  const [modalClasseId, setModalClasseId] = useState(examen?.classeId || selectedClasseId)
  const [modalMatieres, setModalMatieres] = useState([])
  const [matieresLoaded, setMatieresLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    nom: examen?.nom || '',
    typeExamenId: examen?.typeExamenId || (typeExamens[0]?.id || ''),
    matiereId: examen?.matiereId ? Number(examen.matiereId) : '',
    matiere: examen?.matiere || '',
    classeId: examen?.classeId || selectedClasseId || '',
    classe: examen?.classe || '',
    periodeId: examen?.periodeId || selectedTrimestre,
    date: examen?.date || '',
    heureDebut: examen?.heure || '08:00',
    heureFin: examen?.heureFin || '10:00',
    duree: examen?.duree || 60,
    totalPoints: examen?.totalPoints || 20,
    salle: examen?.salle || '',
    statut: examen?.statut || 'planifie',
    anneeScolaire: examen?.anneeScolaire || '2024-2025',
    commentaire: examen?.commentaire || '',
  })

  // Charger les matières quand la classe change dans le modal
  useEffect(() => {
    if (!modalClasseId) {
      setModalMatieres([])
      setMatieresLoaded(true)
      return
    }
    const loadMatieresForClasse = async () => {
      try {
        setMatieresLoaded(false)
        const matieresData = await fetch(`http://localhost:8080/api/classes/${modalClasseId}/matieres`).then(r => r.json())
        console.log('Matières chargées pour classe', modalClasseId, ':', matieresData)
        setModalMatieres(matieresData)
        setMatieresLoaded(true)
      } catch (error) {
        console.error('Erreur lors du chargement des matières:', error)
        setModalMatieres([])
        setMatieresLoaded(true)
      }
    }
    loadMatieresForClasse()
  }, [modalClasseId])

  const handleSave = async () => {
    if (!formData.nom || !formData.matiereId || !modalClasseId || !formData.date) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const payload = {
        nom: formData.nom,
        matiereId: Number(formData.matiereId),
        classeId: Number(modalClasseId),
        periodeId: Number(formData.periodeId),
        date: formData.date,
        heureDebut: formData.heureDebut,
        heureFin: formData.heureFin,
        duree: Number(formData.duree),
        totalPoints: Number(formData.totalPoints),
        statut: formData.statut,
        typeExamenId: Number(formData.typeExamenId),
        anneeScolaire: formData.anneeScolaire,
        commentaire: formData.commentaire,
      }

      const url = isEdit
        ? `http://localhost:8080/api/examens/${examen.id}`
        : 'http://localhost:8080/api/examens'

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || 'Erreur lors de la sauvegarde')
      }

      onSave && onSave()
      onClose()
    } catch (err) {
      console.error('Erreur sauvegarde examen:', err)
      setError(err.message || 'Erreur lors de la sauvegarde de l\'examen')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-examen" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h5><i className="bi bi-journal-plus me-2"></i>{isEdit ? 'Modifier' : 'Planifier'} un examen</h5>
          <button className="btn-close-modal" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert-error">
              <i className="bi bi-exclamation-triangle-fill"></i>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label required">Nom de l'examen</label>
            <input type="text" className="form-control" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} placeholder="Ex: Devoir 1 - Mathématiques" />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Type d'examen</label>
              <select className="form-select" value={formData.typeExamenId} onChange={e => setFormData({ ...formData, typeExamenId: e.target.value })}>
                <option value="">Sélectionner...</option>
                {typeExamens.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">Trimestre</label>
              <select className="form-select" value={formData.periodeId} onChange={e => setFormData({ ...formData, periodeId: Number(e.target.value) })}>
                <option value={1}>Trimestre 1</option>
                <option value={2}>Trimestre 2</option>
                <option value={3}>Trimestre 3</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Classe</label>
              <select
                className="form-select"
                value={modalClasseId || ''}
                onChange={e => {
                  const classeId = e.target.value ? Number(e.target.value) : null
                  setModalClasseId(classeId)
                  const selectedClasse = classes.find(c => c.id === classeId)
                  setFormData({ ...formData, classeId: classeId, classe: selectedClasse?.nom || '', matiereId: '', matiere: '' })
                }}
              >
                <option value="">Sélectionner...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">Matière</label>
              <select
                className="form-select"
                value={formData.matiereId ? String(formData.matiereId) : ''}
                onChange={e => {
                  const matiereId = e.target.value ? Number(e.target.value) : ''
                  const selectedMatiere = modalMatieres.find(m => Number(m.matiereId) === matiereId)
                  console.log('Matière sélectionnée:', matiereId, selectedMatiere)
                  setFormData({ ...formData, matiereId: matiereId, matiere: selectedMatiere?.matiereNom || '' })
                }}
                disabled={!modalClasseId || !matieresLoaded}
              >
                <option value="">{matieresLoaded ? 'Sélectionner une matière...' : 'Chargement...'}</option>
                {modalMatieres.map(m => (
                  <option key={m.id} value={String(m.matiereId)}>{m.matiereNom}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Date</label>
              <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Total Points</label>
              <input type="number" className="form-control" value={formData.totalPoints} onChange={e => setFormData({ ...formData, totalPoints: Number(e.target.value) })} min="1" max="100" />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Heure début</label>
              <input type="time" className="form-control" value={formData.heureDebut} onChange={e => setFormData({ ...formData, heureDebut: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Heure fin</label>
              <input type="time" className="form-control" value={formData.heureFin} onChange={e => setFormData({ ...formData, heureFin: e.target.value })} />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Durée (minutes)</label>
              <select className="form-select" value={formData.duree} onChange={e => setFormData({ ...formData, duree: Number(e.target.value) })}>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1h</option>
                <option value="90">1h30</option>
                <option value="120">2h</option>
                <option value="180">3h</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Statut</label>
              <select className="form-select" value={formData.statut} onChange={e => setFormData({ ...formData, statut: e.target.value })}>
                <option value="planifie">Planifié</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Commentaire</label>
            <textarea className="form-control" rows="3" value={formData.commentaire} onChange={e => setFormData({ ...formData, commentaire: e.target.value })} placeholder="Instructions ou commentaires..."></textarea>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>Annuler</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <><i className="bi bi-hourglass-split"></i> Enregistrement...</>
            ) : (
              <><i className="bi bi-check-lg"></i> {isEdit ? 'Modifier' : 'Planifier'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal saisie des notes d'examen
function SaisieNotesModal({ onClose, examen }) {
  const [notes, setNotes] = useState({})
  const [resultats, setResultats] = useState([])
  const [loading, setLoading] = useState(true)

  // Charger les résultats depuis l'API
  useEffect(() => {
    const loadResultats = async () => {
      try {
        setLoading(true)
        const data = await examenService.getResultats(examen.id)
        const mappedResultats = data.map(r => ({
          eleveId: r.eleve?.id || r.eleveId,
          nom: r.eleve ? `${r.eleve.prenom} ${r.eleve.nom}` : r.nom || '',
          note: r.note,
          rang: r.rang || 0
        }))
        setResultats(mappedResultats)
        const initial = {}
        mappedResultats.forEach(r => { initial[r.eleveId] = r.note })
        setNotes(initial)
      } catch (error) {
        console.error('Erreur lors du chargement des résultats:', error)
        setResultats([])
      } finally {
        setLoading(false)
      }
    }
    loadResultats()
  }, [examen.id])

  const handleSave = () => {
    console.log('Notes enregistrées:', { examenId: examen.id, notes })
    alert('Notes enregistrées avec succès!')
    onClose()
  }

  const stats = useMemo(() => {
    const vals = Object.values(notes).filter(v => v !== '' && v !== undefined).map(Number)
    if (vals.length === 0) return { moyenne: 0, min: 0, max: 0, reussite: 0 }
    return {
      moyenne: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2),
      min: Math.min(...vals),
      max: Math.max(...vals),
      reussite: Math.round((vals.filter(v => v >= 10).length / vals.length) * 100)
    }
  }, [notes])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-notes" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h5><i className="bi bi-pencil-square me-2"></i>Saisie des notes</h5>
            <p className="modal-subtitle">{examen.nom} - {examen.classe}</p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="stats-bar">
            <div className="stat-item">
              <span className="label">Moyenne</span>
              <span className={`value ${stats.moyenne >= 10 ? 'good' : 'bad'}`}>{stats.moyenne}</span>
            </div>
            <div className="stat-item">
              <span className="label">Min</span>
              <span className="value">{stats.min}</span>
            </div>
            <div className="stat-item">
              <span className="label">Max</span>
              <span className="value">{stats.max}</span>
            </div>
            <div className="stat-item">
              <span className="label">Réussite</span>
              <span className={`value ${stats.reussite >= 50 ? 'good' : 'bad'}`}>{stats.reussite}%</span>
            </div>
          </div>

          <table className="notes-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Élève</th>
                <th>Note /20</th>
                <th>Appréciation</th>
              </tr>
            </thead>
            <tbody>
              {resultats.map((r, index) => (
                <tr key={r.eleveId}>
                  <td>{index + 1}</td>
                  <td className="eleve-name">{r.nom}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      className={`note-input ${notes[r.eleveId] !== undefined ? (notes[r.eleveId] >= 10 ? 'pass' : 'fail') : ''}`}
                      value={notes[r.eleveId] || ''}
                      onChange={e => {
                        const val = e.target.value
                        if (val === '' || (Number(val) >= 0 && Number(val) <= 20)) {
                          setNotes(prev => ({ ...prev, [r.eleveId]: val === '' ? '' : Number(val) }))
                        }
                      }}
                      placeholder="--"
                    />
                  </td>
                  <td>
                    {notes[r.eleveId] !== undefined && notes[r.eleveId] !== '' && (
                      <span className={`appreciation ${notes[r.eleveId] >= 16 ? 'excellent' : notes[r.eleveId] >= 14 ? 'bien' : notes[r.eleveId] >= 10 ? 'passable' : 'insuffisant'}`}>
                        {notes[r.eleveId] >= 16 ? 'Excellent' : notes[r.eleveId] >= 14 ? 'Bien' : notes[r.eleveId] >= 10 ? 'Passable' : 'Insuffisant'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn-primary" onClick={handleSave}>
            <i className="bi bi-check-lg"></i> Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GestionExamens() {
  const [activeTab, setActiveTab] = useState('calendrier')
  const [showModal, setShowModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [selectedExamen, setSelectedExamen] = useState(null)
  const [filterClasse, setFilterClasse] = useState('')
  const [filterMatiere, setFilterMatiere] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [viewMode, setViewMode] = useState('liste')

  // State pour les données de l'API
  const [examens, setExamens] = useState([])
  const [classes, setClasses] = useState([]) // Stockera les objets classe complets
  const [matieres, setMatieres] = useState([])
  const [typeExamens, setTypeExamens] = useState([]) // Types d'examens depuis la base
  const [loading, setLoading] = useState(true)
  const [selectedClasseId, setSelectedClasseId] = useState(null)
  const [selectedTrimestre, setSelectedTrimestre] = useState(null) // null = tous les trimestres

  // Charger les classes, types d'examens et tous les examens au démarrage
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        const [classesData, typeExamensData, allExamensData] = await Promise.all([
          classeService.getAllClasses(),
          fetch('http://localhost:8080/api/type-examens').then(r => r.json()).catch(() => []),
          fetch('http://localhost:8080/api/examens').then(r => r.json()).catch(() => [])
        ])
        setClasses(classesData)
        setTypeExamens(typeExamensData)
        // Stocker tous les examens pour affichage initial
        console.log('Examens chargés:', allExamensData)
        setExamens(allExamensData.map(mapExamenFromApi))
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()
  }, [])

  // Charger examens et matières quand une classe est sélectionnée
  useEffect(() => {
    // Si aucune classe sélectionnée, charger tous les examens
    if (!selectedClasseId) {
      const loadAllExamens = async () => {
        try {
          setLoading(true)
          const allExamensData = await fetch('http://localhost:8080/api/examens').then(r => r.json()).catch(() => [])
          // Filtrer par trimestre si nécessaire
          const examensFiltres = allExamensData.filter(ex => !selectedTrimestre || ex.periodeId === selectedTrimestre)
          setExamens(examensFiltres.map(mapExamenFromApi))
          setMatieres([])
        } catch (error) {
          console.error('Erreur chargement examens:', error)
        } finally {
          setLoading(false)
        }
      }
      loadAllExamens()
      return
    }

    const loadDataForClasse = async () => {
      try {
        setLoading(true)
        const [examensData, matieresData] = await Promise.all([
          fetch(`http://localhost:8080/api/examens/classe/${selectedClasseId}`).then(r => r.json()),
          fetch(`http://localhost:8080/api/classes/${selectedClasseId}/matieres`).then(r => r.json())
        ])

        // Filtrer par trimestre sélectionné (si un trimestre est choisi)
        const examensFiltres = selectedTrimestre
          ? examensData.filter(ex => ex.periodeId === selectedTrimestre)
          : examensData
        setExamens(examensFiltres.map(mapExamenFromApi))
        setMatieres(matieresData)
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
        setExamens([])
        setMatieres([])
      } finally {
        setLoading(false)
      }
    }
    loadDataForClasse()
  }, [selectedClasseId, selectedTrimestre])

  const filteredExamens = useMemo(() => {
    return examens.filter(e => {
      const matchClasse = !filterClasse || e.classe === filterClasse
      const matchMatiere = !filterMatiere || e.matiere === filterMatiere
      const matchStatut = !filterStatut || e.statut === filterStatut
      return matchClasse && matchMatiere && matchStatut
    })
  }, [filterClasse, filterMatiere, filterStatut, examens])

  const stats = {
    total: examens.length,
    planifies: examens.filter(e => e.statut === 'planifie').length,
    termines: examens.filter(e => e.statut === 'termine').length,
    prochainExamen: examens.filter(e => e.statut === 'planifie').sort((a, b) => new Date(a.date) - new Date(b.date))[0]
  }

  const handleEdit = (examen) => {
    setSelectedExamen(examen)
    setShowModal(true)
  }

  const handleSaisieNotes = (examen) => {
    setSelectedExamen(examen)
    setShowNotesModal(true)
  }

  const getTypeColor = (type) => {
    const colors = {
      'Devoir': '#8b5cf6',
      'Examen': '#ef4444',
      // Anciennes valeurs pour compatibilité
      'controle': '#3b82f6',
      'devoir': '#8b5cf6',
      'examen': '#ef4444',
      'rattrapage': '#f59e0b'
    }
    return colors[type] || '#6b7280'
  }

  const getTypeLabel = (type) => {
    // Les types viennent maintenant de la base avec leur nom exact
    return type || 'Non défini'
  }

  // Fonction pour supprimer un examen
  const handleDelete = async (examenId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8080/api/examens/${examenId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      // Recharger les examens
      if (selectedClasseId) {
        const data = await fetch(`http://localhost:8080/api/examens/classe/${selectedClasseId}`).then(r => r.json())
        const examensFiltres = data.filter(ex => ex.periodeId === selectedTrimestre)
        setExamens(examensFiltres.map(mapExamenFromApi))
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression de l\'examen')
    }
  }

  return (
    <div className="gestion-examens">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">
              <i className="bi bi-journal-text me-2"></i>
              Examens & Évaluations
            </h1>
            <p className="text-muted">Planification des examens et saisie des notes</p>
          </div>
          <button className="btn-add" onClick={() => { setSelectedExamen(null); setShowModal(true) }}>
            <i className="bi bi-plus-lg"></i>
            <span>Planifier un examen</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><i className="bi bi-journal-text"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total examens</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon planifie"><i className="bi bi-calendar-event"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.planifies}</span>
            <span className="stat-label">Planifiés</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon termine"><i className="bi bi-check-circle"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.termines}</span>
            <span className="stat-label">Terminés</span>
          </div>
        </div>
        {stats.prochainExamen && (
          <div className="stat-card prochain">
            <div className="stat-icon prochain"><i className="bi bi-alarm"></i></div>
            <div className="stat-info">
              <span className="stat-value">{new Date(stats.prochainExamen.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              <span className="stat-label">Prochain: {stats.prochainExamen.matiere}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'calendrier' ? 'active' : ''}`} onClick={() => setActiveTab('calendrier')}>
            <i className="bi bi-calendar3"></i> Calendrier
          </button>
          <button className={`tab ${activeTab === 'resultats' ? 'active' : ''}`} onClick={() => setActiveTab('resultats')}>
            <i className="bi bi-graph-up"></i> Résultats
          </button>
          <button className={`tab ${activeTab === 'statistiques' ? 'active' : ''}`} onClick={() => setActiveTab('statistiques')}>
            <i className="bi bi-bar-chart"></i> Statistiques
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content-card">
        {/* Tab Calendrier */}
        {activeTab === 'calendrier' && (
          <div className="tab-content">
            <div className="toolbar">
              <div className="toolbar-left">
                <select
                  className="filter-select"
                  value={selectedClasseId || ''}
                  onChange={e => {
                    const classeId = e.target.value ? Number(e.target.value) : null
                    setSelectedClasseId(classeId)
                    setFilterClasse(classes.find(c => c.id === classeId)?.nom || '')
                    setFilterMatiere('') // Reset matière filter when classe changes
                  }}
                >
                  <option value="">Toutes les classes</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
                <select
                  className="filter-select"
                  value={selectedTrimestre || ''}
                  onChange={e => setSelectedTrimestre(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Tous les trimestres</option>
                  <option value={1}>Trimestre 1</option>
                  <option value={2}>Trimestre 2</option>
                  <option value={3}>Trimestre 3</option>
                </select>
                <select
                  className="filter-select"
                  value={filterMatiere}
                  onChange={e => setFilterMatiere(e.target.value)}
                  disabled={!selectedClasseId}
                >
                  <option value="">Toutes les matières</option>
                  {matieres.map(m => <option key={m.id} value={m.matiereNom}>{m.matiereNom}</option>)}
                </select>
                <select
                  className="filter-select"
                  value={filterStatut}
                  onChange={e => setFilterStatut(e.target.value)}
                  disabled={!selectedClasseId}
                >
                  <option value="">Tous les statuts</option>
                  <option value="planifie">Planifié</option>
                  <option value="termine">Terminé</option>
                </select>
              </div>
              <div className="toolbar-right">
                <div className="view-toggle">
                  <button className={viewMode === 'liste' ? 'active' : ''} onClick={() => setViewMode('liste')}>
                    <i className="bi bi-list-ul"></i>
                  </button>
                  <button className={viewMode === 'cards' ? 'active' : ''} onClick={() => setViewMode('cards')}>
                    <i className="bi bi-grid"></i>
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'liste' ? (
              <table className="examens-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Examen</th>
                    <th>Type</th>
                    <th>Matière</th>
                    <th>Classe</th>
                    <th>Durée</th>
                    <th>Salle</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExamens.map(examen => (
                    <tr key={examen.id}>
                      <td className="date-cell">
                        <span className="date">{new Date(examen.date).toLocaleDateString('fr-FR')}</span>
                        <span className="heure">{examen.heure}</span>
                      </td>
                      <td className="nom-cell">{examen.nom}</td>
                      <td>
                        <span className="type-badge" style={{ background: `${getTypeColor(examen.type)}20`, color: getTypeColor(examen.type) }}>
                          {getTypeLabel(examen.type)}
                        </span>
                      </td>
                      <td>{examen.matiere}</td>
                      <td>{examen.classe}</td>
                      <td>{examen.duree} min</td>
                      <td>{examen.salle}</td>
                      <td>
                        <span className={`statut-badge ${examen.statut}`}>
                          {examen.statut === 'planifie' ? 'Planifié' : 'Terminé'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {examen.statut === 'termine' && (
                            <button onClick={() => handleSaisieNotes(examen)} title="Saisir/Voir notes">
                              <i className="bi bi-pencil-square"></i>
                            </button>
                          )}
                          <button onClick={() => handleEdit(examen)} title="Modifier">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="delete" onClick={() => handleDelete(examen.id)} title="Supprimer">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="examens-grid">
                {filteredExamens.map(examen => (
                  <div key={examen.id} className={`examen-card ${examen.statut}`}>
                    <div className="examen-header" style={{ borderLeftColor: getTypeColor(examen.type) }}>
                      <span className="type-badge" style={{ background: `${getTypeColor(examen.type)}20`, color: getTypeColor(examen.type) }}>
                        {getTypeLabel(examen.type)}
                      </span>
                      <span className={`statut-badge ${examen.statut}`}>
                        {examen.statut === 'planifie' ? 'Planifié' : 'Terminé'}
                      </span>
                    </div>
                    <div className="examen-body">
                      <h4>{examen.nom}</h4>
                      <div className="examen-info">
                        <span><i className="bi bi-calendar3"></i> {new Date(examen.date).toLocaleDateString('fr-FR')}</span>
                        <span><i className="bi bi-clock"></i> {examen.heure} ({examen.duree} min)</span>
                        <span><i className="bi bi-book"></i> {examen.matiere}</span>
                        <span><i className="bi bi-people"></i> {examen.classe}</span>
                        <span><i className="bi bi-door-open"></i> {examen.salle}</span>
                      </div>
                    </div>
                    <div className="examen-footer">
                      {examen.statut === 'termine' && (
                        <button className="btn-notes" onClick={() => handleSaisieNotes(examen)}>
                          <i className="bi bi-pencil-square"></i> Notes
                        </button>
                      )}
                      <button className="btn-edit" onClick={() => handleEdit(examen)}>
                        <i className="bi bi-pencil"></i> Modifier
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(examen.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Résultats */}
        {activeTab === 'resultats' && (
          <div className="tab-content">
            <div className="toolbar">
              <div className="toolbar-left">
                <select
                  className="filter-select"
                  value={selectedClasseId || ''}
                  onChange={e => {
                    const classeId = e.target.value ? Number(e.target.value) : null
                    setSelectedClasseId(classeId)
                    setFilterClasse(classes.find(c => c.id === classeId)?.nom || '')
                  }}
                >
                  <option value="">Sélectionner une classe...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
            </div>

            <div className="resultats-list">
              {examens.filter(e => e.statut === 'termine').map(examen => {
                const moyenne = examen.moyenne || 0
                return (
                  <div key={examen.id} className="resultat-card">
                    <div className="resultat-header">
                      <div className="resultat-info">
                        <h4>{examen.nom}</h4>
                        <span className="resultat-meta">
                          {examen.classe} • {new Date(examen.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="resultat-moyenne">
                        <span className={`moyenne ${moyenne >= 10 ? 'pass' : 'fail'}`}>{moyenne}</span>
                        <span className="label">Moyenne</span>
                      </div>
                    </div>
                    <div className="resultat-body">
                      <div className="mini-stats">
                        <div className="mini-stat">
                          <span className="value">{examen.nbReussi || '-'}</span>
                          <span className="label">Réussi</span>
                        </div>
                        <div className="mini-stat">
                          <span className="value">{examen.nbEchec || '-'}</span>
                          <span className="label">Échec</span>
                        </div>
                        <div className="mini-stat">
                          <span className="value">{examen.noteMax || '-'}</span>
                          <span className="label">Max</span>
                        </div>
                        <div className="mini-stat">
                          <span className="value">{examen.noteMin || '-'}</span>
                          <span className="label">Min</span>
                        </div>
                      </div>
                    </div>
                    <div className="resultat-footer">
                      <button className="btn-view" onClick={() => handleSaisieNotes(examen)}>
                        <i className="bi bi-eye"></i> Voir les notes
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab Statistiques */}
        {activeTab === 'statistiques' && (
          <div className="tab-content">
            <div className="stats-section">
              <h3>Analyse des performances</h3>

              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4>Moyennes par matière</h4>
                  <div className="subject-bars">
                    {['Mathématiques', 'Français', 'Arabe', 'Physique'].map((m, i) => (
                      <div key={m} className="subject-row">
                        <span className="subject-name">{m}</span>
                        <div className="bar-container">
                          <div className="bar" style={{ width: `${[65, 72, 78, 58][i]}%` }}></div>
                        </div>
                        <span className="subject-value">{[13, 14.4, 15.6, 11.6][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-card">
                  <h4>Taux de réussite</h4>
                  <div className="donut-chart">
                    <div className="donut">
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
                          strokeDasharray="72, 100"
                        />
                      </svg>
                      <span className="donut-value">72%</span>
                    </div>
                    <div className="donut-legend">
                      <span className="legend-item pass"><i className="bi bi-circle-fill"></i> Réussi (72%)</span>
                      <span className="legend-item fail"><i className="bi bi-circle-fill"></i> Échec (28%)</span>
                    </div>
                  </div>
                </div>

                <div className="analytics-card full-width">
                  <h4>Évolution des moyennes par trimestre</h4>
                  <div className="line-chart">
                    <div className="chart-area">
                      {['T1', 'T2', 'T3'].map((t, i) => (
                        <div key={t} className="chart-point" style={{ left: `${i * 45 + 10}%`, bottom: `${[50, 62, 70][i]}%` }}>
                          <span className="point-value">{[12.5, 13.8, 14.5][i]}</span>
                          <span className="point-dot"></span>
                        </div>
                      ))}
                      <svg className="chart-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline points="10,50 55,38 100,30" fill="none" stroke="#2D3E6f" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className="chart-labels">
                      <span>Trimestre 1</span>
                      <span>Trimestre 2</span>
                      <span>Trimestre 3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <ExamenModal
          onClose={() => setShowModal(false)}
          examen={selectedExamen}
          classes={classes}
          matieres={matieres}
          selectedClasseId={selectedClasseId}
          typeExamens={typeExamens}
          selectedTrimestre={selectedTrimestre}
          onSave={() => {
            // Recharger les examens après sauvegarde
            if (selectedClasseId) {
              fetch(`http://localhost:8080/api/examens/classe/${selectedClasseId}`)
                .then(r => r.json())
                .then(data => {
                  const examensFiltres = data.filter(ex => ex.periodeId === selectedTrimestre)
                  setExamens(examensFiltres.map(mapExamenFromApi))
                })
            }
          }}
        />
      )}

      {showNotesModal && selectedExamen && (
        <SaisieNotesModal
          onClose={() => setShowNotesModal(false)}
          examen={selectedExamen}
        />
      )}

      <style>{`
        .gestion-examens {
          padding: 24px;
          background: #f8f9fa;
          min-height: calc(100vh - 64px);
        }

        .page-header { margin-bottom: 24px; }
        .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .page-title { font-size: 1.75rem; font-weight: 700; color: #2D3E6f; margin: 0; }
        .text-muted { color: #6b7280; margin: 0; }

        .btn-add {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #2D3E6f;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

        .stat-icon.total { background: #dbeafe; color: #2563eb; }
        .stat-icon.planifie { background: #fef3c7; color: #d97706; }
        .stat-icon.termine { background: #d1fae5; color: #059669; }
        .stat-icon.prochain { background: #fee2e2; color: #dc2626; }

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

        .filter-select {
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
        }

        .view-toggle {
          display: flex;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .view-toggle button {
          padding: 10px 14px;
          background: white;
          border: none;
          color: #6b7280;
          cursor: pointer;
        }

        .view-toggle button.active { background: #2D3E6f; color: white; }

        /* Table */
        .examens-table {
          width: 100%;
          border-collapse: collapse;
        }

        .examens-table th {
          text-align: left;
          padding: 12px;
          background: #f9fafb;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.85rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .examens-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .examens-table tr:hover { background: #f9fafb; }

        .date-cell { display: flex; flex-direction: column; }
        .date-cell .date { font-weight: 500; }
        .date-cell .heure { font-size: 0.85rem; color: #6b7280; }

        .nom-cell { font-weight: 500; }

        .type-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .statut-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .statut-badge.planifie { background: #fef3c7; color: #d97706; }
        .statut-badge.termine { background: #d1fae5; color: #059669; }

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
        .table-actions button.delete:hover { background: #dc2626; }

        /* Cards Grid */
        .examens-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .examen-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .examen-header {
          padding: 12px 16px;
          border-left: 4px solid #2D3E6f;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .examen-body {
          padding: 16px;
        }

        .examen-body h4 { margin: 0 0 12px; color: #1f2937; }

        .examen-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .examen-info span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .examen-footer {
          padding: 12px 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
        }

        .btn-notes, .btn-edit, .btn-delete {
          flex: 1;
          padding: 8px;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn-notes { background: #2D3E6f; color: white; border: none; }
        .btn-edit { background: white; color: #374151; border: 1px solid #e5e7eb; }
        .btn-delete { background: #fee2e2; color: #dc2626; border: 1px solid #dc2626; }
        .btn-delete:hover { background: #dc2626; color: white; }

        /* Resultats */
        .resultats-list { display: flex; flex-direction: column; gap: 16px; }

        .resultat-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }

        .resultat-header {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
        }

        .resultat-info h4 { margin: 0 0 4px; color: #1f2937; }
        .resultat-meta { font-size: 0.85rem; color: #6b7280; }

        .resultat-moyenne {
          text-align: center;
        }

        .resultat-moyenne .moyenne {
          display: block;
          font-size: 2rem;
          font-weight: 700;
        }

        .resultat-moyenne .moyenne.pass { color: #059669; }
        .resultat-moyenne .moyenne.fail { color: #dc2626; }

        .resultat-moyenne .label { font-size: 0.75rem; color: #6b7280; }

        .resultat-body { padding: 16px; }

        .mini-stats {
          display: flex;
          justify-content: space-around;
        }

        .mini-stat { text-align: center; }
        .mini-stat .value { display: block; font-size: 1.25rem; font-weight: 700; color: #1f2937; }
        .mini-stat .label { font-size: 0.75rem; color: #6b7280; }

        .resultat-footer {
          padding: 12px 16px;
          border-top: 1px solid #e5e7eb;
        }

        .btn-view {
          width: 100%;
          padding: 10px;
          background: #2D3E6f;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        /* Statistics */
        .stats-section h3 { margin: 0 0 20px; color: #1f2937; }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .analytics-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
        }

        .analytics-card.full-width { grid-column: 1 / -1; }

        .analytics-card h4 { margin: 0 0 16px; color: #374151; }

        .subject-bars { display: flex; flex-direction: column; gap: 12px; }

        .subject-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .subject-name { width: 100px; font-size: 0.9rem; }

        .bar-container {
          flex: 1;
          height: 10px;
          background: #e5e7eb;
          border-radius: 5px;
          overflow: hidden;
        }

        .bar-container .bar {
          height: 100%;
          background: linear-gradient(90deg, #2D3E6f, #4f5d8a);
          border-radius: 5px;
        }

        .subject-value { width: 40px; font-weight: 600; }

        .donut-chart {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .donut {
          width: 120px;
          height: 120px;
          position: relative;
        }

        .donut svg { transform: rotate(-90deg); }

        .donut-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .donut-legend { display: flex; flex-direction: column; gap: 8px; }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
        }

        .legend-item.pass i { color: #059669; }
        .legend-item.fail i { color: #e5e7eb; }

        .line-chart { position: relative; }

        .chart-area {
          height: 150px;
          position: relative;
          border-left: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
        }

        .chart-point {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .point-value { font-size: 0.85rem; font-weight: 600; color: #2D3E6f; }

        .point-dot {
          width: 12px;
          height: 12px;
          background: #2D3E6f;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .chart-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .chart-labels {
          display: flex;
          justify-content: space-around;
          margin-top: 8px;
          font-size: 0.85rem;
          color: #6b7280;
        }

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

        .modal-examen, .modal-notes {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-notes { max-width: 700px; }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 24px;
          background: linear-gradient(135deg, #2D3E6f 0%, #3d5291 100%);
          color: white;
        }

        .modal-header h5 { margin: 0; }
        .modal-subtitle { margin: 4px 0 0; opacity: 0.9; font-size: 0.9rem; }

        .btn-close-modal {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .form-group { margin-bottom: 16px; }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

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

        .form-control:disabled, .form-select:disabled {
          background-color: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .filter-select:disabled {
          background-color: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

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

        /* Notes Table in Modal */
        .stats-bar {
          display: flex;
          justify-content: space-around;
          padding: 12px;
          background: #f0f9ff;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .stats-bar .stat-item { text-align: center; }
        .stats-bar .label { display: block; font-size: 0.75rem; color: #6b7280; }
        .stats-bar .value { display: block; font-size: 1.25rem; font-weight: 700; }
        .stats-bar .value.good { color: #059669; }
        .stats-bar .value.bad { color: #dc2626; }

        .notes-table {
          width: 100%;
          border-collapse: collapse;
        }

        .notes-table th {
          text-align: left;
          padding: 12px;
          background: #f9fafb;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .notes-table td { padding: 12px; border-bottom: 1px solid #f3f4f6; }

        .eleve-name { font-weight: 500; }

        .note-input {
          width: 70px;
          padding: 8px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          text-align: center;
          font-weight: 600;
        }

        .note-input:focus { outline: none; border-color: #2D3E6f; }
        .note-input.pass { border-color: #059669; color: #059669; }
        .note-input.fail { border-color: #dc2626; color: #dc2626; }

        .appreciation {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .appreciation.excellent { background: #dbeafe; color: #2563eb; }
        .appreciation.bien { background: #d1fae5; color: #059669; }
        .appreciation.passable { background: #fef3c7; color: #d97706; }
        .appreciation.insuffisant { background: #fee2e2; color: #dc2626; }

        /* Alert Error */
        .alert-error {
          background: #fee2e2;
          border: 1px solid #dc2626;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          font-size: 0.875rem;
        }

        .alert-error i {
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .gestion-examens { padding: 16px; }
          .form-grid { grid-template-columns: 1fr; }
          .examens-grid { grid-template-columns: 1fr; }
          .analytics-grid { grid-template-columns: 1fr; }
          .donut-chart { flex-direction: column; }
        }
      `}</style>
    </div>
  )
}
