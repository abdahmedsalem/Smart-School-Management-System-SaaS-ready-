import { useState, useEffect, useCallback, useMemo } from 'react'
import { presenceService } from '../services/presenceService'
import { paiementService } from '../services/paiementService'
import { notesService } from '../services/notesService'
import { classeService } from '../services/classeService'

// Skeleton Loading Component pour les cartes dans les tabs
function TabContentSkeleton({ type = 'profil' }) {
  // Skeleton pour l'onglet Profil (3 cartes + stats)
  if (type === 'profil') {
    return (
      <div className="tab-pane">
        <div className="content-grid-3">
          {[1, 2, 3].map(cardIndex => (
            <div key={cardIndex} className="info-card">
              <div className="skeleton-card-header">
                <div className="skeleton-box skeleton-icon"></div>
                <div className="skeleton-box skeleton-title"></div>
              </div>
              <div className="skeleton-card-body">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="skeleton-info-row">
                    <div className="skeleton-box skeleton-label"></div>
                    <div className="skeleton-box skeleton-value"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="stats-grid" style={{ marginTop: 24 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card">
              <div className="skeleton-box skeleton-stat-icon"></div>
              <div className="skeleton-stat-content">
                <div className="skeleton-box skeleton-stat-value"></div>
                <div className="skeleton-box skeleton-stat-label"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Skeleton pour les onglets avec tableau (Notes, Présences, Paiements)
  if (type === 'table') {
    return (
      <div className="tab-pane">
        <div className="info-card">
          <div className="skeleton-card-header">
            <div className="skeleton-box skeleton-icon"></div>
            <div className="skeleton-box skeleton-title"></div>
          </div>
          <div className="skeleton-table">
            {/* Header */}
            <div className="skeleton-table-header">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton-box skeleton-th"></div>
              ))}
            </div>
            {/* Rows */}
            {[1, 2, 3, 4, 5, 6].map(row => (
              <div key={row} className="skeleton-table-row">
                {[1, 2, 3, 4, 5].map(cell => (
                  <div key={cell} className="skeleton-box skeleton-td"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Skeleton pour l'onglet Scolarité (2 cartes côte à côte)
  if (type === 'scolarite') {
    return (
      <div className="tab-pane">
        <div className="content-grid-2">
          {[1, 2].map(cardIndex => (
            <div key={cardIndex} className="info-card">
              <div className="skeleton-card-header">
                <div className="skeleton-box skeleton-icon"></div>
                <div className="skeleton-box skeleton-title"></div>
              </div>
              <div className="skeleton-card-body">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="skeleton-info-row">
                    <div className="skeleton-box skeleton-label"></div>
                    <div className="skeleton-box skeleton-value"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Skeleton pour l'onglet Documents (grille de documents)
  if (type === 'documents') {
    return (
      <div className="tab-pane">
        <div className="documents-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="document-card">
              <div className="skeleton-box skeleton-doc-icon"></div>
              <div className="skeleton-box skeleton-doc-name"></div>
              <div className="skeleton-box skeleton-doc-status"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

export default function EleveDetail({ eleve, onBack }) {
  const [activeTab, setActiveTab] = useState('profil')
  const [showAddDocModal, setShowAddDocModal] = useState(false)
  const [showAddNoteModal, setShowAddNoteModal] = useState(false)
  const [showAddPaiementModal, setShowAddPaiementModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // États pour les données dynamiques
  const [presences, setPresences] = useState([])
  const [paiements, setPaiements] = useState([])
  const [soldeEleve, setSoldeEleve] = useState(null)
  const [notes, setNotes] = useState([])
  const [classe, setClasse] = useState(null)

  // Charger les données de l'élève
  const loadEleveData = useCallback(async () => {
    if (!eleve?.id) return

    setLoading(true)
    try {
      const [presencesData, paiementsData, soldeData, notesData] = await Promise.all([
        presenceService.getPresences({ eleveId: eleve.id }).catch(() => []),
        paiementService.getByEleve(eleve.id).catch(() => []),
        paiementService.getSoldeEleve(eleve.id).catch(() => null),
        notesService.getNotesByEleve(eleve.id).catch(() => []),
      ])

      setPresences(presencesData)
      setPaiements(paiementsData)
      setSoldeEleve(soldeData)
      setNotes(notesData)

      // Charger les infos de la classe si l'élève a une classeId
      if (eleve.classeId) {
        try {
          const classes = await classeService.getAllClasses()
          const classeFound = classes.find(c => c.id === eleve.classeId)
          setClasse(classeFound)
        } catch (e) {
          console.error('Erreur chargement classe:', e)
        }
      }
    } catch (error) {
      console.error('Erreur chargement données élève:', error)
    } finally {
      setLoading(false)
    }
  }, [eleve?.id, eleve?.classeId])

  useEffect(() => {
    loadEleveData()
  }, [loadEleveData])

  // Formater la date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  // Calculer l'âge
  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return '-'
    const today = new Date()
    const birthDate = new Date(dateNaissance)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return `${age} ans`
  }

  // Statistiques de présences calculées
  const presencesStats = useMemo(() => {
    const total = presences.length
    const present = presences.filter(p => p.statut === 'PRESENT' || p.statut === 'Present' || p.statut === 'Présent').length
    const absent = presences.filter(p => p.statut === 'ABSENT' || p.statut === 'Absent').length
    const retard = presences.filter(p => p.statut === 'RETARD' || p.statut === 'Retard' || p.statut === 'En retard').length
    const tauxPresence = total > 0 ? ((present / total) * 100).toFixed(1) : 0

    return { totalJours: total, present, absent, retard, tauxPresence }
  }, [presences])

  // Grouper les notes par matière
  const notesByMatiere = useMemo(() => {
    const grouped = {}
    notes.forEach(note => {
      const matiereName = note.matiereNom || note.matiere || 'Autre'
      if (!grouped[matiereName]) {
        grouped[matiereName] = {
          matiere: matiereName,
          coef: note.coefficient || 1,
          notes: [],
          total: 0,
          count: 0
        }
      }
      grouped[matiereName].notes.push({
        type: note.type || 'Note',
        note: note.valeur,
        sur: 20,
        date: note.dateNote
      })
      grouped[matiereName].total += note.valeur
      grouped[matiereName].count++
    })

    // Calculer les moyennes
    Object.values(grouped).forEach(m => {
      m.moyenne = m.count > 0 ? (m.total / m.count).toFixed(2) : 0
    })

    return Object.values(grouped)
  }, [notes])

  // Calculer la moyenne générale
  const moyenneGenerale = useMemo(() => {
    if (notesByMatiere.length === 0) return '-'
    let totalPoints = 0
    let totalCoef = 0
    notesByMatiere.forEach(m => {
      totalPoints += parseFloat(m.moyenne) * m.coef
      totalCoef += m.coef
    })
    return totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : '-'
  }, [notesByMatiere])

  // Résumé financier
  const financeResume = useMemo(() => {
    if (soldeEleve) {
      return {
        fraisAnnuel: soldeEleve.totalDu || 0,
        fraisPaye: soldeEleve.totalPaye || 0,
        resteAPayer: soldeEleve.solde || 0,
        statut: soldeEleve.solde <= 0 ? 'Payé' : soldeEleve.totalPaye > 0 ? 'Partiel' : 'Non payé'
      }
    }
    // Calcul à partir des paiements
    const totalPaye = paiements.reduce((sum, p) => sum + (p.montant || 0), 0)
    return {
      fraisAnnuel: 0,
      fraisPaye: totalPaye,
      resteAPayer: 0,
      statut: totalPaye > 0 ? 'Partiel' : 'Non payé'
    }
  }, [soldeEleve, paiements])

  const tabs = [
    { id: 'profil', label: 'Profil', icon: 'bi-person-fill' },
    { id: 'scolarite', label: 'Scolarité', icon: 'bi-mortarboard-fill' },
    { id: 'notes', label: 'Notes & Bulletins', icon: 'bi-journal-text' },
    { id: 'presences', label: 'Présences', icon: 'bi-calendar-check-fill' },
    { id: 'paiements', label: 'Paiements', icon: 'bi-credit-card-fill' },
    { id: 'documents', label: 'Documents', icon: 'bi-folder-fill' },
  ]

  const getStatusColor = (statut) => {
    const s = statut?.toLowerCase()
    if (s === 'present' || s === 'présent') return 'status-green'
    if (s === 'absent') return 'status-red'
    if (s === 'retard' || s === 'en retard') return 'status-orange'
    return ''
  }

  const getPaiementStatusColor = (statut) => {
    switch (statut) {
      case 'Payé': return '#059669'
      case 'Partiel': return '#d97706'
      case 'Non payé':
      case 'En retard': return '#dc2626'
      default: return '#6b7280'
    }
  }

  // Documents statiques (à remplacer par API quand disponible)
  const documents = [
    { id: 1, nom: 'Certificat de naissance', type: 'pdf', categorie: 'État civil', obligatoire: true, present: !!eleve?.certificatNaissance },
    { id: 2, nom: 'Photo d\'identité', type: 'jpg', categorie: 'Identité', obligatoire: true, present: !!eleve?.photo },
    { id: 3, nom: 'Certificat de scolarité', type: 'pdf', categorie: 'Scolarité', obligatoire: true, present: false },
    { id: 4, nom: 'Carnet de vaccination', type: 'pdf', categorie: 'Santé', obligatoire: true, present: false },
    { id: 5, nom: 'Certificat médical', type: 'pdf', categorie: 'Santé', obligatoire: true, present: false },
    { id: 6, nom: 'Copie CIN parent', type: 'pdf', categorie: 'État civil', obligatoire: true, present: false },
  ]

  if (!eleve) {
    return (
      <div className="eleve-detail-page">
        <div className="no-eleve">
          <i className="bi bi-exclamation-circle"></i>
          <p>Aucun élève sélectionné</p>
          <button className="btn-action btn-back" onClick={onBack}>
            <i className="bi bi-arrow-left"></i> Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="eleve-detail-page">
      {/* Header Card avec infos principales */}
      <div className="profile-header-card">
        <div className="profile-left">
          <div className="profile-photo">
            {eleve.photo ? (
              <img src={eleve.photo} alt={eleve.prenom} />
            ) : (
              <div className="photo-placeholder">
                <i className="bi bi-person-fill"></i>
              </div>
            )}
            <span className={`status-indicator ${eleve.statut === 'Actif' || eleve.statut === 'actif' ? 'active' : 'inactive'}`}></span>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{eleve.prenom} {eleve.nom}</h1>
            <div className="profile-badges">
              <span className="badge-matricule">
                <i className="bi bi-hash"></i> {eleve.matricule || '-'}
              </span>
              <span className="badge-classe">
                <i className="bi bi-mortarboard"></i> {classe?.nom || eleve.classe || eleve.classeNom || '-'}
              </span>
              <span className={`badge-statut ${eleve.statut === 'Actif' || eleve.statut === 'actif' ? 'actif' : 'inactif'}`}>
                {eleve.statut || 'Actif'}
              </span>
            </div>
            <div className="profile-quick-info">
              <span><i className="bi bi-calendar3"></i> {formatDate(eleve.dateNaissance)} ({calculateAge(eleve.dateNaissance)})</span>
              <span><i className="bi bi-geo-alt"></i> {eleve.wilaya || eleve.adresse || '-'}</span>
              <span><i className="bi bi-telephone"></i> {eleve.telPere || eleve.telMere || eleve.telephone || '-'}</span>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          <button className="btn-action btn-edit">
            <i className="bi bi-pencil-fill"></i> Modifier
          </button>
          
          <button className="btn-action btn-print">
            <i className="bi bi-printer-fill"></i> Imprimer fiche
          </button>
          <button className="btn-action btn-back" onClick={onBack}>
            <i className="bi bi-arrow-left"></i> Retour
          </button>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="tabs-container">
        <div className="tabs-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`bi ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="tab-content">
        {/* ONGLET PROFIL */}
        {activeTab === 'profil' && (
          loading ? <TabContentSkeleton type="profil" /> : (
          <div className="tab-pane">
            <div className="content-grid-3">
              {/* Informations Personnelles */}
              <div className="info-card">
                <div className="info-card-header">
                  <i className="bi bi-person-vcard"></i>
                  <span>Informations Personnelles</span>
                </div>
                <div className="info-card-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Nom complet</label>
                      <span>{eleve.prenom} {eleve.nom}</span>
                    </div>
                    <div className="info-item">
                      <label>Date de naissance</label>
                      <span>{formatDate(eleve.dateNaissance)}</span>
                    </div>
                    <div className="info-item">
                      <label>Lieu de naissance</label>
                      <span>{eleve.lieuNaissance || '-'}</span>
                    </div>
                    <div className="info-item">
                      <label>Sexe</label>
                      <span>{eleve.sexe || '-'}</span>
                    </div>
                    <div className="info-item">
                      <label>Nationalité</label>
                      <span>{eleve.nationalite || 'Mauritanienne'}</span>
                    </div>
                    <div className="info-item">
                      <label>Âge</label>
                      <span>{calculateAge(eleve.dateNaissance)}</span>
                    </div>
                    <div className="info-item full-width">
                      <label>Adresse</label>
                      <span>{eleve.adresse || '-'}</span>
                    </div>
                    <div className="info-item">
                      <label>Wilaya</label>
                      <span>{eleve.wilaya || '-'}</span>
                    </div>
                    <div className="info-item">
                      <label>Moughataa</label>
                      <span>{eleve.moughataa || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Parents */}
              <div className="info-card">
                <div className="info-card-header">
                  <i className="bi bi-people-fill"></i>
                  <span>Parents / Tuteurs</span>
                </div>
                <div className="info-card-body">
                  <div className="parent-section">
                    <h4 className="parent-title"><i className="bi bi-person"></i> Père</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Nom</label>
                        <span>{eleve.nomPere || '-'}</span>
                      </div>
                      <div className="info-item">
                        <label>Profession</label>
                        <span>{eleve.professionPere || '-'}</span>
                      </div>
                      <div className="info-item">
                        <label>Téléphone</label>
                        <span className="clickable">{eleve.telPere || '-'}</span>
                      </div>
                      <div className="info-item">
                        <label>Email</label>
                        <span className="clickable">{eleve.emailPere || '-'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="parent-section">
                    <h4 className="parent-title"><i className="bi bi-person"></i> Mère</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Nom</label>
                        <span>{eleve.nomMere || '-'}</span>
                      </div>
                      <div className="info-item">
                        <label>Profession</label>
                        <span>{eleve.professionMere || '-'}</span>
                      </div>
                      <div className="info-item">
                        <label>Téléphone</label>
                        <span className="clickable">{eleve.telMere || '-'}</span>
                      </div>
                    </div>
                  </div>
                  {(eleve.tuteurNom || eleve.tuteurTel) && (
                    <div className="parent-section">
                      <h4 className="parent-title"><i className="bi bi-person-badge"></i> Tuteur</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Nom</label>
                          <span>{eleve.tuteurNom || '-'}</span>
                        </div>
                        <div className="info-item">
                          <label>Téléphone</label>
                          <span className="clickable">{eleve.tuteurTel || '-'}</span>
                        </div>
                        <div className="info-item">
                          <label>Relation</label>
                          <span>{eleve.tuteurRelation || '-'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations Médicales */}
              <div className="info-card">
                <div className="info-card-header">
                  <i className="bi bi-heart-pulse-fill"></i>
                  <span>Informations Médicales</span>
                </div>
                <div className="info-card-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Groupe sanguin</label>
                      <span className="badge-blood">{eleve.groupeSanguin || '-'}</span>
                    </div>
                    <div className="info-item">
                      <label>Allergies</label>
                      <span>{eleve.allergies || 'Aucune'}</span>
                    </div>
                    <div className="info-item full-width">
                      <label>Maladies chroniques</label>
                      <span>{eleve.maladiesChroniques || 'Aucune'}</span>
                    </div>
                    <div className="info-item full-width">
                      <label>Contact d'urgence</label>
                      <span className="emergency">{eleve.contactUrgence || eleve.telPere || eleve.telMere || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )
        )}

        {/* ONGLET SCOLARITÉ */}
        {activeTab === 'scolarite' && (
          loading ? <TabContentSkeleton type="scolarite" /> : (
          <div className="tab-pane">
            <div className="content-grid-2">
              {/* Inscription actuelle */}
              <div className="info-card">
                <div className="info-card-header">
                  <i className="bi bi-bookmark-star-fill"></i>
                  <span>Inscription Actuelle</span>
                </div>
                <div className="info-card-body">
                  <div className="current-enrollment">
                    <div className="enrollment-main">
                      <div className="enrollment-class">
                        <span className="class-label">Classe</span>
                        <span className="class-value">{classe?.nom || eleve.classe || eleve.classeNom || '-'}</span>
                      </div>
                      <div className="enrollment-details">
                        <div className="detail-item">
                          <i className="bi bi-layers"></i>
                          <span>Niveau: {classe?.niveau || eleve.niveau || '-'}</span>
                        </div>
                        <div className="detail-item">
                          <i className="bi bi-calendar-range"></i>
                          <span>Cycle: {classe?.cycle || '-'}</span>
                        </div>
                        <div className="detail-item">
                          <i className="bi bi-calendar-check"></i>
                          <span>Inscrit le: {formatDate(eleve.dateInscription)}</span>
                        </div>
                        <div className="detail-item">
                          <i className="bi bi-upc"></i>
                          <span>Matricule: {eleve.matricule || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance rapide */}
              <div className="info-card">
                <div className="info-card-header">
                  <i className="bi bi-graph-up"></i>
                  <span>Performance Actuelle</span>
                </div>
                <div className="info-card-body">
                  <div className="performance-summary">
                    <div className="performance-main">
                      <div className="moyenne-circle">
                        <span className="moyenne-value">{moyenneGenerale}</span>
                        <span className="moyenne-label">/ 20</span>
                      </div>
                      <span className="moyenne-text">Moyenne Générale</span>
                    </div>
                    <div className="performance-stats">
                      <div className="stat-item">
                        <span className="stat-value">{notesByMatiere.length}</span>
                        <span className="stat-label">Matières</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{notes.length}</span>
                        <span className="stat-label">Notes</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{presencesStats.tauxPresence}%</span>
                        <span className="stat-label">Présence</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations scolaires */}
              <div className="info-card full-width">
                <div className="info-card-header">
                  <i className="bi bi-info-circle"></i>
                  <span>Informations Scolaires</span>
                </div>
                <div className="info-card-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Ancien établissement</label>
                      <span>{eleve.ancienEtablissement || '-'}</span>
                    </div>
                    <div className="info-item">
                      <label>Date d'inscription</label>
                      <span>{formatDate(eleve.dateInscription)}</span>
                    </div>
                    <div className="info-item">
                      <label>Effectif de la classe</label>
                      <span>{classe?.effectif || '-'} élèves</span>
                    </div>
                    <div className="info-item">
                      <label>Capacité de la classe</label>
                      <span>{classe?.capacite || '-'} places</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )
        )}

        {/* ONGLET NOTES & BULLETINS */}
        {activeTab === 'notes' && (
          loading ? <TabContentSkeleton type="table" /> : (
          <div className="tab-pane">
            <div className="notes-header">
              <div className="notes-filters">
                <select className="form-select">
                  <option>Toutes les périodes</option>
                  <option>Trimestre 1</option>
                  <option>Trimestre 2</option>
                  <option>Trimestre 3</option>
                </select>
              </div>
              <button className="btn-action btn-add" onClick={() => setShowAddNoteModal(true)}>
                <i className="bi bi-plus-lg"></i> Ajouter note
              </button>
            </div>

            {notesByMatiere.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-journal-x"></i>
                <p>Aucune note enregistrée pour cet élève</p>
              </div>
            ) : (
              <div className="content-grid-2">
                {/* Notes par matière */}
                <div className="info-card">
                  <div className="info-card-header">
                    <i className="bi bi-journal-bookmark-fill"></i>
                    <span>Notes par Matière</span>
                  </div>
                  <div className="info-card-body no-padding">
                    <table className="data-table notes-table">
                      <thead>
                        <tr>
                          <th>Matière</th>
                          <th>Coef</th>
                          <th>Notes</th>
                          <th>Moyenne</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notesByMatiere.map((m, index) => (
                          <tr key={index}>
                            <td><strong>{m.matiere}</strong></td>
                            <td className="center">{m.coef}</td>
                            <td>
                              <div className="notes-chips">
                                {m.notes.map((n, i) => (
                                  <span key={i} className="note-chip" title={`${n.type} - ${formatDate(n.date)}`}>
                                    {n.note}/{n.sur}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="center">
                              <span className={`moyenne-badge ${parseFloat(m.moyenne) >= 14 ? 'good' : parseFloat(m.moyenne) >= 10 ? 'average' : 'low'}`}>
                                {m.moyenne}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="total-row">
                          <td colSpan="3"><strong>Moyenne Générale</strong></td>
                          <td className="center">
                            <span className="moyenne-badge general">{moyenneGenerale}</span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Résumé des notes */}
                <div className="info-card">
                  <div className="info-card-header">
                    <i className="bi bi-bar-chart-fill"></i>
                    <span>Résumé</span>
                  </div>
                  <div className="info-card-body">
                    <div className="notes-summary">
                      <div className="summary-item">
                        <span className="summary-label">Total des notes</span>
                        <span className="summary-value">{notes.length}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Matières évaluées</span>
                        <span className="summary-value">{notesByMatiere.length}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Moyenne générale</span>
                        <span className="summary-value highlight">{moyenneGenerale}/20</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Meilleure matière</span>
                        <span className="summary-value">
                          {notesByMatiere.length > 0
                            ? notesByMatiere.reduce((a, b) => parseFloat(a.moyenne) > parseFloat(b.moyenne) ? a : b).matiere
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          )
        )}

        {/* ONGLET PRÉSENCES */}
        {activeTab === 'presences' && (
          loading ? <TabContentSkeleton type="table" /> : (
          <div className="tab-pane">
            {/* Stats rapides */}
            <div className="presence-stats-grid">
              <div className="presence-stat-card green">
                <div className="stat-icon"><i className="bi bi-check-circle-fill"></i></div>
                <div className="stat-content">
                  <span className="stat-value">{presencesStats.present}</span>
                  <span className="stat-label">Présences</span>
                </div>
                <span className="stat-percent">{presencesStats.tauxPresence}%</span>
              </div>
              <div className="presence-stat-card red">
                <div className="stat-icon"><i className="bi bi-x-circle-fill"></i></div>
                <div className="stat-content">
                  <span className="stat-value">{presencesStats.absent}</span>
                  <span className="stat-label">Absences</span>
                </div>
              </div>
              <div className="presence-stat-card orange">
                <div className="stat-icon"><i className="bi bi-clock-fill"></i></div>
                <div className="stat-content">
                  <span className="stat-value">{presencesStats.retard}</span>
                  <span className="stat-label">Retards</span>
                </div>
              </div>
              <div className="presence-stat-card blue">
                <div className="stat-icon"><i className="bi bi-calendar3"></i></div>
                <div className="stat-content">
                  <span className="stat-value">{presencesStats.totalJours}</span>
                  <span className="stat-label">Jours totaux</span>
                </div>
              </div>
            </div>

            {/* Historique détaillé */}
            <div className="info-card">
              <div className="info-card-header">
                <i className="bi bi-list-check"></i>
                <span>Historique des Présences</span>
              </div>
              <div className="info-card-body no-padding">
                {presences.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-calendar-x"></i>
                    <p>Aucun enregistrement de présence</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Heure</th>
                        <th>Remarque</th>
                      </tr>
                    </thead>
                    <tbody>
                      {presences.slice(0, 20).map((p, index) => (
                        <tr key={index}>
                          <td><strong>{formatDate(p.date)}</strong></td>
                          <td>
                            <span className={`status-badge ${getStatusColor(p.statut)}`}>
                              {p.statut}
                            </span>
                          </td>
                          <td>{p.heureArrivee || p.heure || '-'}</td>
                          <td className="remarque">{p.remarque || p.motif || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
          )
        )}

        {/* ONGLET PAIEMENTS */}
        {activeTab === 'paiements' && (
          loading ? <TabContentSkeleton type="table" /> : (
          <div className="tab-pane">
            {/* Résumé financier */}
            <div className="finance-summary">
              <div className="finance-card total">
                <div className="finance-icon"><i className="bi bi-cash-stack"></i></div>
                <div className="finance-content">
                  <span className="finance-label">Frais annuel</span>
                  <span className="finance-value">{financeResume.fraisAnnuel.toLocaleString()} MRU</span>
                </div>
              </div>
              <div className="finance-card paid">
                <div className="finance-icon"><i className="bi bi-check2-circle"></i></div>
                <div className="finance-content">
                  <span className="finance-label">Montant payé</span>
                  <span className="finance-value">{financeResume.fraisPaye.toLocaleString()} MRU</span>
                </div>
              </div>
              <div className="finance-card remaining">
                <div className="finance-icon"><i className="bi bi-hourglass-split"></i></div>
                <div className="finance-content">
                  <span className="finance-label">Reste à payer</span>
                  <span className="finance-value">{financeResume.resteAPayer.toLocaleString()} MRU</span>
                </div>
              </div>
              <div className="finance-card status">
                <div className="finance-icon"><i className="bi bi-info-circle"></i></div>
                <div className="finance-content">
                  <span className="finance-label">Statut</span>
                  <span className="finance-value" style={{ color: getPaiementStatusColor(financeResume.statut) }}>
                    {financeResume.statut}
                  </span>
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            {financeResume.fraisAnnuel > 0 && (
              <div className="payment-progress-card">
                <div className="progress-header">
                  <span>Progression des paiements</span>
                  <span>{((financeResume.fraisPaye / financeResume.fraisAnnuel) * 100).toFixed(0)}%</span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(financeResume.fraisPaye / financeResume.fraisAnnuel) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Actions et historique */}
            <div className="info-card">
              <div className="info-card-header">
                <i className="bi bi-receipt"></i>
                <span>Historique des Paiements</span>
                <button className="btn-action btn-add" onClick={() => setShowAddPaiementModal(true)}>
                  <i className="bi bi-plus-lg"></i> Enregistrer paiement
                </button>
              </div>
              <div className="info-card-body no-padding">
                {paiements.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-credit-card-2-back"></i>
                    <p>Aucun paiement enregistré</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Référence</th>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Montant</th>
                        <th>Mode</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paiements.map((p, index) => (
                        <tr key={index}>
                          <td><code>{p.reference || p.id}</code></td>
                          <td>{formatDate(p.datePaiement || p.date)}</td>
                          <td>{p.description || p.typeFrais || '-'}</td>
                          <td><strong>{(p.montant || 0).toLocaleString()} MRU</strong></td>
                          <td>{p.modePaiement || p.mode || '-'}</td>
                          <td>
                            <span className={`status-badge ${p.statut === 'Validé' || p.statut === 'VALIDE' ? 'status-green' : 'status-orange'}`}>
                              {p.statut || 'En attente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
          )
        )}

        {/* ONGLET DOCUMENTS */}
        {activeTab === 'documents' && (
          loading ? <TabContentSkeleton type="documents" /> : (
          <div className="tab-pane">
            {/* Stats documents */}
            <div className="docs-stats">
              <div className="docs-stat">
                <span className="docs-stat-value">{documents.filter(d => d.present).length}</span>
                <span className="docs-stat-label">Documents fournis</span>
              </div>
              <div className="docs-stat warning">
                <span className="docs-stat-value">{documents.filter(d => d.obligatoire && !d.present).length}</span>
                <span className="docs-stat-label">Documents manquants</span>
              </div>
              <div className="docs-stat">
                <span className="docs-stat-value">{documents.filter(d => d.obligatoire).length}</span>
                <span className="docs-stat-label">Documents requis</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <i className="bi bi-archive-fill"></i>
                <span>Dossier Administratif</span>
                <button className="btn-action btn-add" onClick={() => setShowAddDocModal(true)}>
                  <i className="bi bi-upload"></i> Ajouter document
                </button>
              </div>
              <div className="info-card-body">
                <div className="documents-grid">
                  {documents.map((doc) => (
                    <div key={doc.id} className={`document-card ${!doc.present ? 'missing' : ''}`}>
                      <div className="doc-icon">
                        <i className={`bi ${doc.type === 'pdf' ? 'bi-file-earmark-pdf-fill' : 'bi-file-earmark-image-fill'} ${doc.type === 'pdf' ? 'pdf' : 'img'}`}></i>
                        {doc.obligatoire && <span className="obligatoire-badge">Requis</span>}
                      </div>
                      <div className="doc-info">
                        <h4>{doc.nom}</h4>
                        <span className="doc-meta">
                          {doc.present ? (
                            <span className="doc-present">Fourni</span>
                          ) : (
                            <span className="doc-missing">Non fourni</span>
                          )}
                        </span>
                        <span className="doc-category">{doc.categorie}</span>
                      </div>
                      <div className="doc-actions">
                        {doc.present ? (
                          <>
                            <button className="btn-icon" title="Télécharger">
                              <i className="bi bi-download"></i>
                            </button>
                            <button className="btn-icon" title="Visualiser">
                              <i className="bi bi-eye"></i>
                            </button>
                          </>
                        ) : (
                          <button className="btn-upload">
                            <i className="bi bi-upload"></i> Ajouter
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )
        )}
      </div>

      {/* Modal Ajout Document */}
      {showAddDocModal && (
        <div className="modal-overlay" onClick={() => setShowAddDocModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5><i className="bi bi-upload me-2"></i>Ajouter un document</h5>
              <button className="btn-close-modal" onClick={() => setShowAddDocModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Type de document</label>
                <select className="form-select">
                  <option>Certificat de naissance</option>
                  <option>Photo d'identité</option>
                  <option>Certificat de scolarité</option>
                  <option>Bulletin scolaire</option>
                  <option>Certificat médical</option>
                  <option>Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fichier</label>
                <div className="file-upload-zone">
                  <i className="bi bi-cloud-arrow-up"></i>
                  <p>Glissez-déposez ou cliquez pour sélectionner</p>
                  <span>PDF, JPG, PNG (max. 5 MB)</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddDocModal(false)}>Annuler</button>
              <button className="btn-primary">
                <i className="bi bi-check-lg"></i> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout Note */}
      {showAddNoteModal && (
        <div className="modal-overlay" onClick={() => setShowAddNoteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5><i className="bi bi-journal-plus me-2"></i>Ajouter une note</h5>
              <button className="btn-close-modal" onClick={() => setShowAddNoteModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Matière</label>
                  <select className="form-select">
                    <option value="">Sélectionner...</option>
                    <option value="mathematiques">Mathématiques</option>
                    <option value="francais">Français</option>
                    <option value="arabe">Arabe</option>
                    <option value="sciences">Sciences</option>
                    <option value="histoire">Histoire-Géo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Type d'évaluation</label>
                  <select className="form-select">
                    <option value="">Sélectionner...</option>
                    <option value="devoir">Devoir</option>
                    <option value="interrogation">Interrogation</option>
                    <option value="examen">Examen</option>
                    <option value="tp">TP / Pratique</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Note obtenue</label>
                  <input type="number" step="0.5" min="0" max="20" className="form-control" placeholder="15" />
                </div>
                <div className="form-group">
                  <label>Note sur</label>
                  <input type="number" min="1" className="form-control" placeholder="20" defaultValue="20" />
                </div>
              </div>
              <div className="form-group">
                <label>Date de l'évaluation</label>
                <input type="date" className="form-control" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddNoteModal(false)}>Annuler</button>
              <button className="btn-primary">
                <i className="bi bi-check-lg"></i> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout Paiement */}
      {showAddPaiementModal && (
        <div className="modal-overlay" onClick={() => setShowAddPaiementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5><i className="bi bi-credit-card me-2"></i>Enregistrer un paiement</h5>
              <button className="btn-close-modal" onClick={() => setShowAddPaiementModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-info-box">
                <span>Reste à payer: <strong>{financeResume.resteAPayer.toLocaleString()} MRU</strong></span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Montant (MRU)</label>
                  <input type="number" className="form-control" placeholder="2000" />
                </div>
                <div className="form-group">
                  <label>Date de paiement</label>
                  <input type="date" className="form-control" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mode de paiement</label>
                  <select className="form-select">
                    <option>Espèces</option>
                    <option>Virement bancaire</option>
                    <option>Chèque</option>
                    <option>Mobile Money</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input type="text" className="form-control" placeholder="Frais mensuel" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddPaiementModal(false)}>Annuler</button>
              <button className="btn-primary">
                <i className="bi bi-check-lg"></i> Enregistrer & Générer reçu
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .eleve-detail-page {
          padding: 20px;
          background: #f5f6fa;
          min-height: 100%;
        }

        .no-eleve {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #6b7280;
        }

        .no-eleve i {
          font-size: 4rem;
          margin-bottom: 16px;
          color: #d1d5db;
        }

        .loading-overlay {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px;
          color: #6b7280;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #e5e7eb;
          border-top-color: #2D3E6f;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #9ca3af;
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 12px;
          color: #d1d5db;
        }

        /* Profile Header */
        .profile-header-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          border-radius: 12px;
          padding: 20px 24px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(45, 62, 111, 0.08);
          flex-wrap: wrap;
          gap: 16px;
        }

        .profile-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .profile-photo {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          border: 3px solid #e5e7eb;
        }

        .profile-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          color: #9ca3af;
          font-size: 2rem;
        }

        .status-indicator {
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid white;
        }

        .status-indicator.active {
          background: #10b981;
        }

        .status-indicator.inactive {
          background: #ef4444;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .profile-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .profile-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .badge-matricule, .badge-classe {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: #f3f4f6;
          border-radius: 6px;
          font-size: 0.8rem;
          color: #4b5563;
        }

        .badge-statut {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge-statut.actif {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-statut.inactif {
          background: #fee2e2;
          color: #991b1b;
        }

        .profile-quick-info {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .profile-quick-info span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .profile-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-edit {
          background: #2D3E6f;
          color: white;
        }

        .btn-edit:hover {
          background: #243256;
        }

        .btn-message {
          background: #10b981;
          color: white;
        }

        .btn-message:hover {
          background: #059669;
        }

        .btn-print {
          background: #f59e0b;
          color: white;
        }

        .btn-print:hover {
          background: #d97706;
        }

        .btn-back {
          background: white;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        }

        .btn-back:hover {
          background: #f9fafb;
        }

        .btn-add {
          background: #2D3E6f;
          color: white;
          margin-left: auto;
        }

        .btn-add:hover {
          background: #243256;
        }

        /* Tabs */
        .tabs-container {
          background: white;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(45, 62, 111, 0.08);
        }

        .tabs-nav {
          display: flex;
          gap: 4px;
          overflow-x: auto;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          background: transparent;
          border-radius: 8px;
          color: #6b7280;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .tab-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .tab-btn.active {
          background: #2D3E6f;
          color: white;
        }

        .tab-content {
          min-height: 400px;
        }

        .tab-pane {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Content Grids */
        .content-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .content-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        /* Info Cards */
        .info-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(45, 62, 111, 0.08);
          overflow: hidden;
        }

        .info-card.full-width {
          grid-column: span 2;
        }

        .info-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 20px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #2D3E6f;
        }

        .info-card-header i {
          font-size: 1.1rem;
        }

        .info-card-body {
          padding: 20px;
        }

        .info-card-body.no-padding {
          padding: 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-item.full-width {
          grid-column: span 2;
        }

        .info-item label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-item span {
          font-size: 0.9rem;
          color: #1f2937;
          font-weight: 500;
        }

        .info-item span.clickable {
          color: #2D3E6f;
          cursor: pointer;
        }

        .info-item span.clickable:hover {
          text-decoration: underline;
        }

        /* Parent Section */
        .parent-section {
          padding-bottom: 16px;
          margin-bottom: 16px;
          border-bottom: 1px dashed #e5e7eb;
        }

        .parent-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 0;
        }

        .parent-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 12px;
        }

        /* Badges */
        .badge-blood {
          display: inline-block;
          padding: 4px 12px;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 6px;
          font-weight: 600;
        }

        .emergency {
          color: #dc2626 !important;
          font-weight: 600 !important;
        }

        /* Performance Summary */
        .performance-summary {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .performance-main {
          text-align: center;
        }

        .moyenne-circle {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 4px;
        }

        .moyenne-circle .moyenne-value {
          font-size: 3rem;
          font-weight: 700;
          color: #2D3E6f;
        }

        .moyenne-circle .moyenne-label {
          font-size: 1.2rem;
          color: #9ca3af;
        }

        .moyenne-text {
          font-size: 0.9rem;
          color: #6b7280;
          margin-top: 4px;
        }

        .performance-stats {
          display: flex;
          gap: 24px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .stat-item .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-item .stat-label {
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
        }

        /* Enrollment */
        .current-enrollment {
          padding: 16px;
          background: linear-gradient(135deg, #2D3E6f 0%, #4a5d9e 100%);
          border-radius: 12px;
          color: white;
        }

        .enrollment-main {
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .enrollment-class {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-right: 24px;
          border-right: 1px solid rgba(255,255,255,0.2);
        }

        .class-label {
          font-size: 0.75rem;
          opacity: 0.8;
          text-transform: uppercase;
        }

        .class-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .enrollment-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        /* Data Table */
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.85rem;
        }

        .data-table th {
          background: #f9fafb;
          font-weight: 600;
          color: #4b5563;
        }

        .data-table td {
          color: #1f2937;
        }

        .data-table td.center {
          text-align: center;
        }

        .data-table .total-row {
          background: #f9fafb;
        }

        .data-table .total-row td {
          font-weight: 600;
        }

        /* Notes */
        .notes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .notes-filters {
          display: flex;
          gap: 8px;
        }

        .notes-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .note-chip {
          padding: 4px 10px;
          background: #f3f4f6;
          border-radius: 4px;
          font-size: 0.8rem;
          color: #4b5563;
        }

        .moyenne-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .moyenne-badge.good {
          background: #d1fae5;
          color: #065f46;
        }

        .moyenne-badge.average {
          background: #fef3c7;
          color: #92400e;
        }

        .moyenne-badge.low {
          background: #fee2e2;
          color: #991b1b;
        }

        .moyenne-badge.general {
          background: #2D3E6f;
          color: white;
        }

        .notes-summary {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .summary-label {
          font-size: 0.9rem;
          color: #6b7280;
        }

        .summary-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .summary-value.highlight {
          color: #2D3E6f;
        }

        /* Présences */
        .presence-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .presence-stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(45, 62, 111, 0.08);
        }

        .presence-stat-card .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .presence-stat-card.green .stat-icon { background: #d1fae5; color: #059669; }
        .presence-stat-card.red .stat-icon { background: #fee2e2; color: #dc2626; }
        .presence-stat-card.orange .stat-icon { background: #fef3c7; color: #d97706; }
        .presence-stat-card.blue .stat-icon { background: #dbeafe; color: #2563eb; }

        .presence-stat-card .stat-content {
          display: flex;
          flex-direction: column;
        }

        .presence-stat-card .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .presence-stat-card .stat-label {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .presence-stat-card .stat-percent {
          margin-left: auto;
          font-size: 1.25rem;
          font-weight: 600;
          color: #059669;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.status-green { background: #d1fae5; color: #065f46; }
        .status-badge.status-red { background: #fee2e2; color: #991b1b; }
        .status-badge.status-orange { background: #fef3c7; color: #92400e; }

        .remarque {
          font-style: italic;
          color: #6b7280;
        }

        /* Finance */
        .finance-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .finance-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(45, 62, 111, 0.08);
        }

        .finance-card .finance-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .finance-card.total .finance-icon { background: #dbeafe; color: #2563eb; }
        .finance-card.paid .finance-icon { background: #d1fae5; color: #059669; }
        .finance-card.remaining .finance-icon { background: #fef3c7; color: #d97706; }
        .finance-card.status .finance-icon { background: #f3f4f6; color: #6b7280; }

        .finance-content {
          display: flex;
          flex-direction: column;
        }

        .finance-label {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .finance-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }

        .payment-progress-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(45, 62, 111, 0.08);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 0.9rem;
          color: #374151;
        }

        .progress-bar-container {
          height: 10px;
          background: #e5e7eb;
          border-radius: 5px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #2D3E6f, #10b981);
          border-radius: 5px;
          transition: width 0.5s ease;
        }

        /* Documents */
        .docs-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
        }

        .docs-stat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(45, 62, 111, 0.08);
        }

        .docs-stat.warning {
          background: #fef3c7;
        }

        .docs-stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
        }

        .docs-stat.warning .docs-stat-value {
          color: #d97706;
        }

        .docs-stat-label {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .document-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
        }

        .document-card.missing {
          background: #fef3c7;
          border-color: #fcd34d;
        }

        .doc-icon {
          position: relative;
          font-size: 2rem;
        }

        .doc-icon .pdf { color: #dc2626; }
        .doc-icon .img { color: #2563eb; }

        .obligatoire-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          padding: 2px 6px;
          background: #dc2626;
          color: white;
          font-size: 0.6rem;
          border-radius: 4px;
        }

        .doc-info {
          flex: 1;
        }

        .doc-info h4 {
          margin: 0 0 4px;
          font-size: 0.9rem;
          color: #1f2937;
        }

        .doc-meta {
          display: flex;
          gap: 8px;
          font-size: 0.75rem;
        }

        .doc-present { color: #059669; }
        .doc-missing { color: #d97706; }

        .doc-category {
          display: block;
          font-size: 0.7rem;
          color: #9ca3af;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .doc-actions {
          display: flex;
          gap: 6px;
        }

        .btn-icon {
          width: 36px;
          height: 36px;
          border: none;
          background: white;
          border-radius: 8px;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: #2D3E6f;
          color: white;
        }

        .btn-upload {
          padding: 8px 16px;
          background: #2D3E6f;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-upload:hover {
          background: #243256;
        }

        /* Modals */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
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
          font-size: 1.1rem;
          color: #1f2937;
          display: flex;
          align-items: center;
        }

        .btn-close-modal {
          background: transparent;
          border: none;
          color: #6b7280;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 4px;
        }

        .btn-close-modal:hover {
          color: #1f2937;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-control, .form-select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #1f2937;
          transition: border-color 0.2s;
        }

        .form-control:focus, .form-select:focus {
          outline: none;
          border-color: #2D3E6f;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: #2D3E6f;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-primary:hover {
          background: #243256;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: white;
          color: #6b7280;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .btn-secondary:hover {
          background: #f9fafb;
        }

        .file-upload-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          background: #f9fafb;
          cursor: pointer;
          transition: all 0.2s;
        }

        .file-upload-zone:hover {
          border-color: #2D3E6f;
          background: #f3f4f6;
        }

        .file-upload-zone i {
          font-size: 2.5rem;
          color: #9ca3af;
          margin-bottom: 12px;
        }

        .file-upload-zone p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .file-upload-zone span {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 4px;
        }

        .payment-info-box {
          padding: 12px 16px;
          background: #fef3c7;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          color: #92400e;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .content-grid-3 {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 992px) {
          .content-grid-2,
          .content-grid-3 {
            grid-template-columns: 1fr;
          }

          .info-card.full-width {
            grid-column: span 1;
          }

          .presence-stats-grid,
          .finance-summary {
            grid-template-columns: repeat(2, 1fr);
          }

          .profile-header-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .profile-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }

        @media (max-width: 576px) {
          .presence-stats-grid,
          .finance-summary {
            grid-template-columns: 1fr;
          }

          .tabs-nav {
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .tab-btn span {
            display: none;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .profile-left {
            flex-direction: column;
            text-align: center;
            width: 100%;
          }

          .profile-badges {
            justify-content: center;
          }

          .profile-quick-info {
            justify-content: center;
          }
        }

        /* Skeleton Loading Styles */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .skeleton-box {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 20px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .skeleton-icon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
        }

        .skeleton-title {
          width: 150px;
          height: 18px;
        }

        .skeleton-card-body {
          padding: 20px;
        }

        .skeleton-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .skeleton-info-row:last-child {
          margin-bottom: 0;
        }

        .skeleton-label {
          width: 80px;
          height: 12px;
        }

        .skeleton-value {
          width: 120px;
          height: 16px;
        }

        .skeleton-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
        }

        .skeleton-stat-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          margin-left: 12px;
        }

        .skeleton-stat-value {
          width: 60px;
          height: 24px;
        }

        .skeleton-stat-label {
          width: 80px;
          height: 14px;
        }

        .skeleton-table {
          padding: 0;
        }

        .skeleton-table-header {
          display: flex;
          gap: 16px;
          padding: 12px 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .skeleton-th {
          flex: 1;
          height: 16px;
        }

        .skeleton-table-row {
          display: flex;
          gap: 16px;
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .skeleton-td {
          flex: 1;
          height: 14px;
        }

        .skeleton-doc-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
        }

        .skeleton-doc-name {
          width: 140px;
          height: 16px;
          margin-top: 12px;
        }

        .skeleton-doc-status {
          width: 80px;
          height: 12px;
          margin-top: 8px;
        }

        .documents-grid .document-card.skeleton {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }
      `}</style>
    </div>
  )
}
