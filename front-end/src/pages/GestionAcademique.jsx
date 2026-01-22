import { useState, useMemo, useEffect } from 'react'
import { matiereService, classeService, eleveService, notesService, bulletinsService, examenService } from '../services'

// Modal saisie des notes
function SaisieNotesModal({ onClose, classe, matiere, classeMatiereId, matiereId, trimestre, periodeId, eleves = [], onSave, examenId = null }) {
  const [notes, setNotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [typeNote, setTypeNote] = useState(examenId ? 'Examen' : 'Devoir') // Devoir, Contrôle, Examen

  // Initialiser les notes (charger depuis l'API si disponibles)
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true)
        const initial = {}

        // Pour chaque élève, essayer de charger ses notes existantes
        for (const eleve of eleves) {
          try {
            const notesEleve = await notesService.getNotesByEleve(eleve.id, periodeId)
            const noteMatiere = notesEleve.find(n => n.matiereId === matiereId)
            initial[eleve.id] = noteMatiere ? noteMatiere.valeur.toString() : ''
          } catch (err) {
            initial[eleve.id] = ''
          }
        }

        setNotes(initial)
      } catch (err) {
        console.error('Erreur chargement notes:', err)
        // Fallback: initialiser vide
        const initial = {}
        eleves.forEach(e => {
          initial[e.id] = ''
        })
        setNotes(initial)
      } finally {
        setLoading(false)
      }
    }

    loadNotes()
  }, [eleves, matiereId, periodeId])

  const handleNoteChange = (eleveId, value) => {
    const num = parseFloat(value)
    if (value === '' || (num >= 0 && num <= 20)) {
      setNotes(prev => ({ ...prev, [eleveId]: value }))
    }
  }

  const handleSaveNotes = async () => {
    try {
      setSaving(true)
      setError(null)

      // Préparer les notes à sauvegarder (uniquement celles remplies)
      const notesToSave = []
      Object.entries(notes).forEach(([eleveId, valeur]) => {
        if (valeur !== '' && valeur !== undefined) {
          notesToSave.push({
            eleveId: parseInt(eleveId),
            classeMatiereId: classeMatiereId,  // Utiliser classeMatiereId en priorité
            matiereId: matiereId,              // Garder pour compatibilité
            periodeId: periodeId,
            valeur: parseFloat(valeur),
            type: typeNote,
            dateNote: new Date().toISOString().split('T')[0],
            anneeScolaire: '2024-2025',
            examenId: examenId // Peut être null pour devoirs/contrôles ou un ID pour examens
          })
        }
      })

      if (notesToSave.length === 0) {
        setError('Aucune note à enregistrer')
        setSaving(false)
        return
      }

      // Sauvegarder en masse
      await notesService.createNotesBulk(notesToSave)

      // Notifier le parent
      onSave && onSave()
      onClose()
    } catch (err) {
      console.error('Erreur sauvegarde notes:', err)
      setError(err.message || 'Erreur lors de la sauvegarde des notes')
      setSaving(false)
    }
  }

  const moyenne = useMemo(() => {
    const vals = Object.values(notes).filter(v => v !== '').map(Number)
    if (vals.length === 0) return 0
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
  }, [notes])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-notes" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h5><i className="bi bi-pencil-square me-2"></i>Saisie des notes</h5>
            <p className="modal-subtitle">{classe} - {typeof matiere === 'string' ? matiere : matiere?.nom} - Trimestre {trimestre}</p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Affichage des erreurs */}
          {error && (
            <div className="alert-error">
              <i className="bi bi-exclamation-triangle-fill"></i>
              {error}
            </div>
          )}

          {/* Indicateur de chargement */}
          {loading ? (
            <div className="loading-container">
              <i className="bi bi-hourglass-split"></i>
              <p>Chargement des notes...</p>
            </div>
          ) : (
            <>
              <div className="type-note-selector">
                <label>Type de note:</label>
                <select value={typeNote} onChange={e => setTypeNote(e.target.value)} className="type-select" disabled={examenId}>
                  <option value="Devoir">Devoir</option>
                  <option value="Contrôle">Contrôle</option>
                  <option value="Examen">Examen</option>
                  <option value="Interrogation">Interrogation</option>
                </select>
                {examenId && (
                  <span className="examen-badge">
                    <i className="bi bi-clipboard-check"></i> Notes d'examen
                  </span>
                )}
              </div>

              <div className="moyenne-indicateur">
                <span>Moyenne de la classe</span>
                <span className={`moyenne-value ${moyenne >= 10 ? 'good' : 'bad'}`}>{moyenne}/20</span>
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
              {eleves.map((eleve, index) => (
                <tr key={eleve.id}>
                  <td>{index + 1}</td>
                  <td className="eleve-name">{eleve.prenom} {eleve.nom}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      className={`note-input ${notes[eleve.id] !== '' ? (Number(notes[eleve.id]) >= 10 ? 'pass' : 'fail') : ''}`}
                      value={notes[eleve.id] || ''}
                      onChange={e => handleNoteChange(eleve.id, e.target.value)}
                      placeholder="--"
                    />
                  </td>
                  <td className="appreciation">
                    {notes[eleve.id] !== '' && notes[eleve.id] !== undefined && (
                      <span className={Number(notes[eleve.id]) >= 16 ? 'excellent' : Number(notes[eleve.id]) >= 14 ? 'bien' : Number(notes[eleve.id]) >= 10 ? 'passable' : 'insuffisant'}>
                        {Number(notes[eleve.id]) >= 16 ? 'Excellent' : Number(notes[eleve.id]) >= 14 ? 'Bien' : Number(notes[eleve.id]) >= 10 ? 'Passable' : 'Insuffisant'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>Annuler</button>
          <button className="btn-primary" onClick={handleSaveNotes} disabled={saving || loading}>
            {saving ? (
              <>
                <i className="bi bi-hourglass-split"></i> Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg"></i> Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal génération bulletin
function BulletinModal({ onClose, eleve, matieres = [], trimestre = 1, examens = [] }) {
  const [notesData, setNotesData] = useState([])
  const [loading, setLoading] = useState(true)

  // Charger les notes de l'élève depuis l'API
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8080/api/notes/eleve/${eleve.id}/periode/${trimestre}`)
        if (response.ok) {
          const data = await response.json()
          setNotesData(data)
        }
      } catch (error) {
        console.error('Erreur chargement notes:', error)
      } finally {
        setLoading(false)
      }
    }
    loadNotes()
  }, [eleve.id, trimestre])

  // Organiser les notes par matière avec devoir et examen
  const notesByMatiere = useMemo(() => {
    const result = {}
    matieres.forEach(m => {
      result[m.matiereId] = {
        nom: m.matiereNom,
        coefficient: m.coefficient,
        devoir: null,
        examen: null
      }
    })

    // Créer un map examenId -> typeExamen pour catégoriser les notes
    const examenTypeMap = {}
    examens.forEach(ex => {
      examenTypeMap[ex.id] = ex.typeExamen // "Devoir" ou "Examen"
    })

    notesData.forEach(note => {
      if (result[note.matiereId]) {
        // Déterminer le type basé sur l'examen associé ou le champ type de la note
        let noteType = note.type
        if (note.examenId && examenTypeMap[note.examenId]) {
          noteType = examenTypeMap[note.examenId]
        }

        if (noteType === 'Devoir' || noteType === 'Contrôle' || noteType === 'Interrogation') {
          result[note.matiereId].devoir = note.valeur
        } else if (noteType === 'Examen') {
          result[note.matiereId].examen = note.valeur
        }
      }
    })

    return result
  }, [matieres, notesData, examens])

  // Calculer la moyenne d'une matière (devoir + examen) / 2
  const getMoyenne = (matiereData) => {
    const devoir = matiereData.devoir
    const examen = matiereData.examen

    if (devoir === null && examen === null) return null
    if (devoir === null) return examen
    if (examen === null) return devoir

    return ((devoir + examen) / 2).toFixed(2)
  }

  // Calculer la moyenne générale pondérée par les coefficients
  const moyenneGenerale = useMemo(() => {
    let totalPoints = 0
    let totalCoef = 0

    Object.values(notesByMatiere).forEach(m => {
      const moy = getMoyenne(m)
      if (moy !== null) {
        totalPoints += parseFloat(moy) * m.coefficient
        totalCoef += m.coefficient
      }
    })

    if (totalCoef === 0) return '0.00'
    return (totalPoints / totalCoef).toFixed(2)
  }, [notesByMatiere])

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    alert('Export PDF en cours... (fonctionnalité à implémenter avec jsPDF)')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-bulletin" onClick={e => e.stopPropagation()}>
        <div className="modal-header bulletin-header">
          <h5><i className="bi bi-file-earmark-text me-2"></i>Bulletin scolaire - Trimestre {trimestre}</h5>
          <button className="btn-close-modal" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <i className="bi bi-hourglass-split"></i>
              <p>Chargement des notes...</p>
            </div>
          ) : (
            <div className="bulletin-preview">
              {/* En-tête bulletin */}
              <div className="bulletin-top">
                <div className="school-info">
                  <h3>EduGestion</h3>
                  <p>Établissement scolaire privé</p>
                  <p>Année scolaire 2024-2025</p>
                </div>
                <div className="bulletin-title">
                  <h2>BULLETIN DE NOTES</h2>
                  <p>Trimestre {trimestre}</p>
                </div>
              </div>

              {/* Info élève */}
              <div className="student-info-bulletin">
                <div className="info-row-bulletin">
                  <span className="label">Nom et prénom:</span>
                  <span className="value">{eleve.prenom} {eleve.nom}</span>
                </div>
                <div className="info-row-bulletin">
                  <span className="label">Classe:</span>
                  <span className="value">{eleve.classe}</span>
                </div>
              </div>

              {/* Tableau des notes */}
              <table className="bulletin-table">
                <thead>
                  <tr>
                    <th>Matière</th>
                    <th>Coef</th>
                    <th>Devoir</th>
                    <th>Examen</th>
                    <th>Moyenne</th>
                    <th>Appréciation</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(notesByMatiere).map(([matiereId, data]) => {
                    const moy = getMoyenne(data)
                    const moyNum = moy !== null ? parseFloat(moy) : 0
                    return (
                      <tr key={matiereId}>
                        <td className="matiere-cell">{data.nom}</td>
                        <td>{data.coefficient}</td>
                        <td className={data.devoir === null ? 'absent' : ''}>
                          {data.devoir !== null ? data.devoir.toFixed(2) : 'Abs'}
                        </td>
                        <td className={data.examen === null ? 'absent' : ''}>
                          {data.examen !== null ? data.examen.toFixed(2) : 'Abs'}
                        </td>
                        <td className={`moyenne-cell ${moy === null ? 'absent' : moyNum >= 10 ? 'pass' : 'fail'}`}>
                          {moy !== null ? moy : 'Abs'}
                        </td>
                        <td className="appreciation-cell">
                          {moy === null ? '-' : moyNum >= 16 ? 'Excellent' : moyNum >= 14 ? 'Bien' : moyNum >= 10 ? 'Passable' : 'Insuffisant'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td colSpan="4">MOYENNE GÉNÉRALE</td>
                    <td className={`moyenne-cell ${parseFloat(moyenneGenerale) >= 10 ? 'pass' : 'fail'}`}>{moyenneGenerale}</td>
                    <td>{parseFloat(moyenneGenerale) >= 10 ? 'Admis' : 'Non admis'}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Observations */}
              <div className="bulletin-observations">
                <h4>Observations du conseil de classe</h4>
                <p>{parseFloat(moyenneGenerale) >= 16 ? 'Excellent travail. Félicitations!' : parseFloat(moyenneGenerale) >= 14 ? 'Bon travail. Continuez ainsi.' : parseFloat(moyenneGenerale) >= 10 ? 'Travail satisfaisant. Peut mieux faire.' : 'Travail insuffisant. Des efforts sont nécessaires.'}</p>
              </div>

              {/* Signatures */}
              <div className="bulletin-signatures">
                <div className="signature">
                  <span>Le Directeur</span>
                  <div className="signature-line"></div>
                </div>
                <div className="signature">
                  <span>Parent/Tuteur</span>
                  <div className="signature-line"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handlePrint}>
            <i className="bi bi-printer"></i> Imprimer
          </button>
          <button className="btn-primary" onClick={handleExportPDF}>
            <i className="bi bi-file-pdf"></i> Export PDF
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GestionAcademique({ defaultTab = 'matieres' }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [selectedClasse, setSelectedClasse] = useState('')
  const [selectedTrimestre, setSelectedTrimestre] = useState(1)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [showBulletinModal, setShowBulletinModal] = useState(false)
  const [selectedMatiere, setSelectedMatiere] = useState(null)
  const [selectedEleve, setSelectedEleve] = useState(null)
  const [notification, setNotification] = useState(null)

  // State pour les données de l'API
  const [classes, setClasses] = useState([])
  const [classesData, setClassesData] = useState([]) // Objets complets des classes avec ID
  const [eleves, setEleves] = useState([])
  const [matieresApi, setMatieresApi] = useState([])
  const [examens, setExamens] = useState([])
  const [selectedExamen, setSelectedExamen] = useState(null)
  const [typeNote, setTypeNote] = useState('') // '' = tous, ou ID du type
  const [typeExamens, setTypeExamens] = useState([]) // Types d'examens depuis la base
  const [loading, setLoading] = useState(true)
  const [elevesMoyennes, setElevesMoyennes] = useState({}) // {eleveId: {t1: moyenne, t2: moyenne, t3: moyenne}}

  // Afficher une notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Charger les classes et types d'examens au démarrage
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)

        // Charger classes et types d'examens en parallèle
        const [classesApiData, typeExamensData] = await Promise.all([
          classeService.getAllClasses(),
          fetch('http://localhost:8080/api/type-examens').then(r => r.json()).catch(() => [])
        ])

        const classeNames = classesApiData.map(c => c.nom)
        setClasses(classeNames)
        setClassesData(classesApiData)
        setTypeExamens(typeExamensData)

        if (classeNames.length > 0 && !selectedClasse) {
          setSelectedClasse(classeNames[0])
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()
  }, [])

  // Charger les élèves et les matières de la classe quand la classe change
  useEffect(() => {
    const loadClasseData = async () => {
      if (!selectedClasse) {
        setEleves([])
        setMatieresApi([])
        return
      }
      try {
        setLoading(true)

        // Trouver l'ID de la classe sélectionnée
        const classeObj = classesData.find(c => c.nom === selectedClasse)
        if (!classeObj) {
          console.warn('Classe non trouvée:', selectedClasse)
          setEleves([])
          setMatieresApi([])
          return
        }

        // Charger les élèves ET les matières de la classe en parallèle
        console.log('📖 Chargement données pour classe:', selectedClasse, 'ID:', classeObj.id)

        const [elevesData, classeMatiereData] = await Promise.all([
          eleveService.getAll({ classeId: classeObj.id }),
          fetch(`http://localhost:8080/api/classe-matieres/classe/${classeObj.id}`).then(r => {
            if (!r.ok) {
              console.error('❌ Erreur chargement ClasseMatieres:', r.status, r.statusText)
              throw new Error(`HTTP ${r.status}`)
            }
            return r.json()
          })
        ])

        console.log('✅ ClasseMatieres reçues:', classeMatiereData)
        console.log('   Nombre de matières:', classeMatiereData.length)
        if (classeMatiereData.length > 0) {
          console.log('   Détails:')
          classeMatiereData.forEach(cm => {
            console.log(`     - ${cm.matiereNom} (ID: ${cm.id}, MatiereID: ${cm.matiereId}, Coef: ${cm.coefficient})`)
          })
        } else {
          console.warn('⚠️ Aucune matière trouvée pour cette classe!')
        }

        setEleves(elevesData.map(e => ({
          id: e.id,
          nom: e.nom,
          prenom: e.prenom,
          classe: e.classe?.nom || selectedClasse,
          notes: e.notes || {}
        })))

        // Mettre à jour matieresApi avec les ClasseMatiere (contient id, matiereNom, coefficient)
        setMatieresApi(classeMatiereData)
        console.log('✅ matieresApi mis à jour avec', classeMatiereData.length, 'matière(s)')
      } catch (error) {
        console.error('Erreur lors du chargement des données de la classe:', error)
        showNotification('Erreur lors du chargement des données', 'error')
        setEleves([])
        setMatieresApi([])
      } finally {
        setLoading(false)
      }
    }
    loadClasseData()
  }, [selectedClasse, classesData])

  // Charger les examens quand la classe ou le trimestre change
  useEffect(() => {
    const loadExamens = async () => {
      if (!selectedClasse || !selectedTrimestre) {
        setExamens([])
        setSelectedExamen(null)
        return
      }
      try {
        // Trouver l'ID de la classe sélectionnée
        const classeObj = classesData.find(c => c.nom === selectedClasse)
        if (!classeObj) {
          console.warn('Classe non trouvée dans classesData:', selectedClasse)
          setExamens([])
          return
        }

        // Charger les examens pour cette classe via l'endpoint spécifique
        console.log('🔍 Chargement examens pour:', {
          classeNom: selectedClasse,
          classeId: classeObj.id,
          trimestre: selectedTrimestre
        })

        const response = await fetch(`http://localhost:8080/api/examens/classe/${classeObj.id}`)
        if (!response.ok) {
          console.error('❌ Erreur HTTP:', response.status, response.statusText)
          throw new Error('Erreur lors du chargement des examens')
        }
        const examensData = await response.json()
        console.log('📚 Examens reçus de l\'API:', examensData)
        console.log('   Nombre d\'examens:', examensData.length)

        if (examensData.length > 0) {
          console.log('   Détails des examens:')
          examensData.forEach(ex => {
            console.log(`     - ${ex.nom}: periodeId=${ex.periodeId}, matiereId=${ex.matiereId}, statut=${ex.statut}`)
          })
        }

        // Filtrer par période (trimestre)
        const examensFiltres = examensData.filter(ex => {
          const match = ex.periodeId === selectedTrimestre
          if (!match) {
            console.log(`   ⚠️ Examen "${ex.nom}" exclu: periodeId=${ex.periodeId} !== ${selectedTrimestre}`)
          }
          return match
        })
        console.log('✅ Examens après filtrage par période:', examensFiltres.length, 'examen(s)')

        setExamens(examensFiltres)
        setSelectedExamen(null) // Reset la sélection
      } catch (error) {
        console.error('Erreur lors du chargement des examens:', error)
        setExamens([])
      }
    }
    loadExamens()
  }, [selectedClasse, selectedTrimestre, classesData])

  // Charger les moyennes des élèves pour l'onglet bulletins
  useEffect(() => {
    const loadElevesMoyennes = async () => {
      if (activeTab !== 'bulletins' || eleves.length === 0 || matieresApi.length === 0) {
        return
      }

      const moyennes = {}

      // Pour chaque élève, charger ses notes pour chaque trimestre
      for (const eleve of eleves) {
        moyennes[eleve.id] = { t1: null, t2: null, t3: null }

        for (const trimestre of [1, 2, 3]) {
          try {
            const response = await fetch(`http://localhost:8080/api/notes/eleve/${eleve.id}/periode/${trimestre}`)
            if (response.ok) {
              const notesData = await response.json()

              // Calculer la moyenne pondérée pour ce trimestre
              let totalPoints = 0
              let totalCoef = 0

              // Organiser les notes par matière
              const notesByMatiere = {}
              matieresApi.forEach(m => {
                notesByMatiere[m.matiereId] = { coefficient: m.coefficient, devoir: null, examen: null }
              })

              notesData.forEach(note => {
                if (notesByMatiere[note.matiereId]) {
                  if (note.type === 'Devoir' || note.type === 'Contrôle' || note.type === 'Interrogation') {
                    notesByMatiere[note.matiereId].devoir = note.valeur
                  } else if (note.type === 'Examen') {
                    notesByMatiere[note.matiereId].examen = note.valeur
                  }
                }
              })

              // Calculer la moyenne générale
              Object.values(notesByMatiere).forEach(m => {
                let moy = null
                if (m.devoir !== null && m.examen !== null) {
                  moy = (m.devoir + m.examen) / 2
                } else if (m.devoir !== null) {
                  moy = m.devoir
                } else if (m.examen !== null) {
                  moy = m.examen
                }

                if (moy !== null) {
                  totalPoints += moy * m.coefficient
                  totalCoef += m.coefficient
                }
              })

              if (totalCoef > 0) {
                moyennes[eleve.id][`t${trimestre}`] = (totalPoints / totalCoef).toFixed(2)
              }
            }
          } catch (error) {
            console.error(`Erreur chargement notes élève ${eleve.id} trimestre ${trimestre}:`, error)
          }
        }
      }

      setElevesMoyennes(moyennes)
    }

    loadElevesMoyennes()
  }, [activeTab, eleves, matieresApi])

  // Matières disponibles: seulement les matières qui ont des examens pour ce trimestre et type sélectionné
  const matieresDisponibles = useMemo(() => {
    if (!selectedClasse) {
      console.log('❌ Pas de classe sélectionnée')
      return []
    }

    console.log('=== Calcul matieresDisponibles ===')
    console.log('Classe sélectionnée:', selectedClasse)
    console.log('Type sélectionné:', typeNote || 'Tous')
    console.log('matieresApi (total):', matieresApi.length, 'matières')
    console.log('examens (total):', examens.length, 'examens')

    // Filtrer les examens par type si un type est sélectionné (par ID)
    const examensFiltres = typeNote
      ? examens.filter(ex => ex.typeExamenId === Number(typeNote))
      : examens

    console.log('examens après filtre type:', examensFiltres.length, 'examens')

    // Extraire les matiereId des examens filtrés (convertir en Number)
    const matiereIdsAvecExamen = examensFiltres.map(ex => Number(ex.matiereId))
    console.log('MatiereIds avec examen:', matiereIdsAvecExamen)

    // Filtrer les matières pour ne garder que celles qui ont un examen
    const matieresFiltrees = matieresApi.filter(m => {
      const match = matiereIdsAvecExamen.includes(Number(m.matiereId))
      return match
    })

    console.log('✅ Matières avec examens:', matieresFiltrees.length, 'matière(s)')

    return matieresFiltrees
  }, [selectedClasse, matieresApi, examens, typeNote])

  // Stats
  const stats = {
    totalMatieres: matieresApi.length,
    notesEnregistrees: eleves.reduce((acc, e) => acc + Object.keys(e.notes || {}).length, 0),
    moyenneGenerale: 12.5,  // TODO: Calculate from real data
    bulletinsGeneres: eleves.length
  }

  const handleSaisieNotes = (matiereNom) => {
    // Vérifier qu'une classe est sélectionnée
    if (!selectedClasse) {
      showNotification('Veuillez sélectionner une classe', 'error')
      return
    }

    // Vérifier qu'il y a des élèves
    if (eleves.length === 0) {
      showNotification('Aucun élève trouvé dans cette classe', 'error')
      return
    }

    // Trouver la ClasseMatiere dans matieresApi (qui contient id=classeMatiereId, matiereNom, matiereId)
    const classeMatiereObj = matieresApi.find(m => m.matiereNom === matiereNom)

    if (!classeMatiereObj) {
      showNotification(`Matière "${matiereNom}" non trouvée dans la base de données`, 'error')
      return
    }

    // Si mode Examen, trouver l'examen correspondant à cette matière
    let examenId = null
    if (typeNote === 'Examen') {
      const examenMatiere = examens.find(ex => ex.matiereId === classeMatiereObj.matiereId)
      if (examenMatiere) {
        examenId = examenMatiere.id
      }
    }

    // Passer le classeMatiereId (qui est le champ "id" de ClasseMatiereDTO)
    setSelectedMatiere({
      nom: matiereNom,
      classeMatiereId: classeMatiereObj.id,  // ID de la relation ClasseMatiere
      matiereId: classeMatiereObj.matiereId   // ID de la matière (pour compatibilité)
    })
    setSelectedExamen(examenId)
    setShowNotesModal(true)
  }

  // Recharger les données après sauvegarde
  const handleNotesSaved = async () => {
    showNotification('Notes enregistrées avec succès!', 'success')
    // Recharger les élèves pour actualiser les notes
    if (selectedClasse) {
      try {
        const classeObj = classesData.find(c => c.nom === selectedClasse)
        if (classeObj) {
          const data = await eleveService.getAll({ classeId: classeObj.id })
          setEleves(data.map(e => ({
            id: e.id,
            nom: e.nom,
            prenom: e.prenom,
            classe: e.classe?.nom || selectedClasse,
            notes: e.notes || {}
          })))
        }
      } catch (error) {
        console.error('Erreur rechargement:', error)
      }
    }
  }

  const handleVoirBulletin = (eleve) => {
    setSelectedEleve(eleve)
    setShowBulletinModal(true)
  }

  return (
    <div className="gestion-academique">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <i className={`bi ${notification.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">
              <i className="bi bi-mortarboard-fill me-2"></i>
              Gestion Académique
            </h1>
            <p className="text-muted">Matières, notes et bulletins scolaires</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon matieres"><i className="bi bi-book"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalMatieres}</span>
            <span className="stat-label">Matières</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon notes"><i className="bi bi-pencil-square"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.notesEnregistrees}</span>
            <span className="stat-label">Notes saisies</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon moyenne"><i className="bi bi-graph-up"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.moyenneGenerale}</span>
            <span className="stat-label">Moyenne générale</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bulletins"><i className="bi bi-file-earmark-text"></i></div>
          <div className="stat-info">
            <span className="stat-value">{stats.bulletinsGeneres}</span>
            <span className="stat-label">Bulletins générés</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'matieres' ? 'active' : ''}`} onClick={() => setActiveTab('matieres')}>
            <i className="bi bi-book"></i> Matières
          </button>
          <button className={`tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
            <i className="bi bi-pencil-square"></i> Notes
          </button>
          <button className={`tab ${activeTab === 'bulletins' ? 'active' : ''}`} onClick={() => setActiveTab('bulletins')}>
            <i className="bi bi-file-earmark-text"></i> Bulletins
          </button>
          <button className={`tab ${activeTab === 'statistiques' ? 'active' : ''}`} onClick={() => setActiveTab('statistiques')}>
            <i className="bi bi-bar-chart"></i> Statistiques
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content-card">
        {/* Tab Matières */}
        {activeTab === 'matieres' && (
          <div className="tab-content">
            <div className="filter-bar">
              <select className="filter-select" value={selectedClasse} onChange={e => setSelectedClasse(e.target.value)}>
                <option value="">Sélectionner une classe</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="matieres-grid">
              {matieresApi.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-inbox"></i>
                  <p>Aucune matière disponible</p>
                </div>
              ) : (
                matieresApi.map((matiereObj) => (
                  <div key={matiereObj.id} className="matiere-card">
                    <div className="matiere-icon">
                      <i className="bi bi-book"></i>
                    </div>
                    <div className="matiere-info">
                      <h4>{matiereObj.matiereNom}</h4>
                      <span>Coefficient: {matiereObj.coefficient || 2}</span>
                    </div>
                    <div className="matiere-actions">
                      <button className="btn-icon"><i className="bi bi-pencil"></i></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab Notes */}
        {activeTab === 'notes' && (
          <div className="tab-content">
            <div className="filter-bar">
              <select className="filter-select" value={selectedClasse} onChange={e => setSelectedClasse(e.target.value)}>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="filter-select" value={selectedTrimestre} onChange={e => setSelectedTrimestre(Number(e.target.value))}>
                <option value={1}>Trimestre 1</option>
                <option value={2}>Trimestre 2</option>
                <option value={3}>Trimestre 3</option>
              </select>
              <select className="filter-select" value={typeNote} onChange={e => setTypeNote(e.target.value)}>
                <option value="">Tous les types</option>
                {typeExamens.map(type => (
                  <option key={type.id} value={type.id}>{type.nom}</option>
                ))}
              </select>
            </div>

            <div className="notes-grid">
              {/* Vérifier d'abord si une classe est sélectionnée */}
              {!selectedClasse ? (
                <div className="empty-state">
                  <i className="bi bi-info-circle"></i>
                  <p>Veuillez sélectionner une classe</p>
                </div>
              ) : loading ? (
                <div className="empty-state">
                  <i className="bi bi-hourglass-split"></i>
                  <p>Chargement des matières...</p>
                </div>
              ) : matieresDisponibles.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-inbox"></i>
                  <p>
                    Aucune matière assignée à la classe <strong>{selectedClasse}</strong>.
                  </p>
                  <small style={{marginTop: '10px', color: '#666', display: 'block'}}>
                    <i className="bi bi-lightbulb"></i> Astuce: Assignez des matières à cette classe dans le module Configuration.
                  </small>
                </div>
              ) : (
                matieresDisponibles.map((matiereObj) => (
                  <div key={matiereObj.id} className="note-card" onClick={() => handleSaisieNotes(matiereObj.matiereNom)}>
                    <div className="note-header">
                      <span className="matiere-name">
                        {matiereObj.matiereNom}
                        <span style={{fontSize: '0.85em', color: '#666', marginLeft: '8px'}}>
                          (Coef. {matiereObj.coefficient})
                        </span>
                      </span>
                      <span className="note-status completed">
                        <i className="bi bi-check-circle"></i>
                      </span>
                    </div>
                  <div className="note-stats">
                    <div className="note-stat">
                      <span className="label">Élèves</span>
                      <span className="value">25</span>
                    </div>
                    <div className="note-stat">
                      <span className="label">Moyenne</span>
                      <span className="value">12.5</span>
                    </div>
                    <div className="note-stat">
                      <span className="label">Min</span>
                      <span className="value">6</span>
                    </div>
                    <div className="note-stat">
                      <span className="label">Max</span>
                      <span className="value">18</span>
                    </div>
                  </div>
                  <button className="btn-saisie">
                    <i className="bi bi-pencil-square"></i> Saisir les notes
                  </button>
                </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab Bulletins */}
        {activeTab === 'bulletins' && (
          <div className="tab-content">
            <div className="filter-bar">
              <select className="filter-select" value={selectedClasse} onChange={e => setSelectedClasse(e.target.value)}>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button className="btn-generate-all">
                <i className="bi bi-file-earmark-plus"></i> Générer tous les bulletins
              </button>
            </div>

            {eleves.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-inbox"></i>
                <p>Aucun élève trouvé dans cette classe</p>
              </div>
            ) : (
              <table className="bulletins-table">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Élève</th>
                    <th>Moy. T1</th>
                    <th>Moy. T2</th>
                    <th>Moy. T3</th>
                    <th>Moy. Annuelle</th>
                    <th>Rang</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eleves.map((eleve, index) => {
                  const moyennes = elevesMoyennes[eleve.id] || { t1: null, t2: null, t3: null }
                  const moyT1 = moyennes.t1 !== null ? parseFloat(moyennes.t1) : null
                  const moyT2 = moyennes.t2 !== null ? parseFloat(moyennes.t2) : null
                  const moyT3 = moyennes.t3 !== null ? parseFloat(moyennes.t3) : null

                  // Calculer moyenne annuelle (seulement avec les trimestres disponibles)
                  const trimestresDisponibles = [moyT1, moyT2, moyT3].filter(m => m !== null)
                  const moyAnnuelle = trimestresDisponibles.length > 0
                    ? (trimestresDisponibles.reduce((a, b) => a + b, 0) / trimestresDisponibles.length).toFixed(2)
                    : null

                  return (
                    <tr key={eleve.id}>
                      <td>{index + 1}</td>
                      <td className="eleve-cell">{eleve.prenom} {eleve.nom}</td>
                      <td className={moyT1 !== null ? (moyT1 >= 10 ? 'pass' : 'fail') : ''}>
                        {moyT1 !== null ? moyT1.toFixed(2) : '-'}
                      </td>
                      <td className={moyT2 !== null ? (moyT2 >= 10 ? 'pass' : 'fail') : ''}>
                        {moyT2 !== null ? moyT2.toFixed(2) : '-'}
                      </td>
                      <td className={moyT3 !== null ? (moyT3 >= 10 ? 'pass' : 'fail') : ''}>
                        {moyT3 !== null ? moyT3.toFixed(2) : '-'}
                      </td>
                      <td className={`moyenne ${moyAnnuelle !== null ? (parseFloat(moyAnnuelle) >= 10 ? 'pass' : 'fail') : ''}`}>
                        {moyAnnuelle !== null ? moyAnnuelle : '-'}
                      </td>
                      <td className="rang">{index + 1}</td>
                      <td>
                        <div className="table-actions">
                          <button onClick={() => handleVoirBulletin(eleve)} title="Voir bulletin">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button title="Imprimer"><i className="bi bi-printer"></i></button>
                          <button title="PDF"><i className="bi bi-file-pdf"></i></button>
                        </div>
                      </td>
                    </tr>
                  )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab Statistiques */}
        {activeTab === 'statistiques' && (
          <div className="tab-content">
            <div className="stats-section">
              <h3><i className="bi bi-graph-up me-2"></i>Analyse des performances</h3>

              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4>Distribution des notes</h4>
                  <div className="distribution-chart">
                    <div className="bar-group">
                      <div className="bar" style={{ height: '20%' }}><span>5%</span></div>
                      <span className="bar-label">0-5</span>
                    </div>
                    <div className="bar-group">
                      <div className="bar" style={{ height: '35%' }}><span>15%</span></div>
                      <span className="bar-label">5-10</span>
                    </div>
                    <div className="bar-group">
                      <div className="bar good" style={{ height: '60%' }}><span>35%</span></div>
                      <span className="bar-label">10-14</span>
                    </div>
                    <div className="bar-group">
                      <div className="bar good" style={{ height: '50%' }}><span>30%</span></div>
                      <span className="bar-label">14-16</span>
                    </div>
                    <div className="bar-group">
                      <div className="bar excellent" style={{ height: '30%' }}><span>15%</span></div>
                      <span className="bar-label">16-20</span>
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <h4>Moyennes par matière</h4>
                  <div className="subject-stats">
                    {['Mathématiques', 'Français', 'Arabe', 'Physique'].map((m, i) => (
                      <div key={m} className="subject-row">
                        <span className="subject-name">{m}</span>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${[65, 72, 78, 58][i]}%` }}></div>
                        </div>
                        <span className="subject-avg">{[13, 14.4, 15.6, 11.6][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-card full-width">
                  <h4>Comparaison des classes</h4>
                  <div className="class-comparison">
                    {['3ème A', '3ème B', '4ème A', '2ème Lycée'].map((c, i) => (
                      <div key={c} className="class-item">
                        <span className="class-name">{c}</span>
                        <div className="class-bar-container">
                          <div className="class-bar" style={{ width: `${[75, 68, 82, 71][i]}%` }}>
                            <span>{[15, 13.6, 16.4, 14.2][i]}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showNotesModal && (
        <SaisieNotesModal
          onClose={() => setShowNotesModal(false)}
          classe={selectedClasse}
          matiere={selectedMatiere?.nom || selectedMatiere}
          classeMatiereId={selectedMatiere?.classeMatiereId || null}
          matiereId={selectedMatiere?.matiereId || null}
          trimestre={selectedTrimestre}
          periodeId={selectedTrimestre}
          eleves={eleves}
          onSave={handleNotesSaved}
          examenId={selectedExamen}
        />
      )}

      {showBulletinModal && selectedEleve && (
        <BulletinModal
          onClose={() => setShowBulletinModal(false)}
          eleve={selectedEleve}
          matieres={matieresApi}
          trimestre={selectedTrimestre}
          examens={examens}
        />
      )}

      <style>{`
        .gestion-academique {
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

        .stat-icon.matieres { background: #dbeafe; color: #2563eb; }
        .stat-icon.notes { background: #fef3c7; color: #d97706; }
        .stat-icon.moyenne { background: #d1fae5; color: #059669; }
        .stat-icon.bulletins { background: #ede9fe; color: #7c3aed; }

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
        }

        .tab:hover { color: #2D3E6f; }
        .tab.active { color: #2D3E6f; border-bottom-color: #2D3E6f; }

        /* Content */
        .content-card {
          background: white;
          border-radius: 0 0 12px 12px;
          padding: 20px;
          min-height: 500px;
        }

        .tab-content { animation: fadeIn 0.3s ease; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .filter-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
          min-width: 180px;
        }

        .btn-generate-all {
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

        /* Matières Grid */
        .matieres-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
        }

        .matiere-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .matiere-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-color: #2D3E6f;
        }

        .matiere-icon {
          width: 48px;
          height: 48px;
          background: #2D3E6f;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
        }

        .matiere-info { flex: 1; }
        .matiere-info h4 { margin: 0 0 4px; font-size: 1rem; color: #1f2937; }
        .matiere-info span { font-size: 0.85rem; color: #6b7280; }

        .btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #e5e7eb;
          border: none;
          color: #6b7280;
          cursor: pointer;
        }

        .btn-icon:hover { background: #2D3E6f; color: white; }

        /* Notes Grid */
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .note-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .note-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .matiere-name { font-weight: 600; color: #1f2937; }

        .note-status { color: #059669; }

        .note-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }

        .note-stat {
          text-align: center;
          padding: 8px;
          background: white;
          border-radius: 6px;
        }

        .note-stat .label { display: block; font-size: 0.7rem; color: #6b7280; }
        .note-stat .value { display: block; font-weight: 600; color: #1f2937; }

        .btn-saisie {
          width: 100%;
          padding: 10px;
          background: #2D3E6f;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-saisie:hover { background: #1e2a4d; }

        /* Bulletins Table */
        .bulletins-table {
          width: 100%;
          border-collapse: collapse;
        }

        .bulletins-table th {
          text-align: left;
          padding: 12px;
          background: #f9fafb;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.85rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .bulletins-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .bulletins-table tr:hover { background: #f9fafb; }

        .eleve-cell { font-weight: 500; color: #1f2937; }

        .pass { color: #059669; }
        .fail { color: #dc2626; }

        .moyenne { font-weight: 700; }
        .rang { font-weight: 600; color: #2D3E6f; }

        .table-actions {
          display: flex;
          gap: 6px;
        }

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

        /* Statistics */
        .stats-section h3 {
          font-size: 1.1rem;
          color: #1f2937;
          margin-bottom: 20px;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .analytics-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
        }

        .analytics-card.full-width { grid-column: 1 / -1; }

        .analytics-card h4 {
          margin: 0 0 16px;
          font-size: 1rem;
          color: #374151;
        }

        .distribution-chart {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          height: 150px;
          padding-top: 20px;
        }

        .bar-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .bar {
          width: 40px;
          background: #fecaca;
          border-radius: 4px 4px 0 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 4px;
          font-size: 0.7rem;
          color: #dc2626;
        }

        .bar.good { background: #bbf7d0; color: #059669; }
        .bar.excellent { background: #dbeafe; color: #2563eb; }

        .bar-label { font-size: 0.75rem; color: #6b7280; }

        .subject-stats { display: flex; flex-direction: column; gap: 12px; }

        .subject-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .subject-name { width: 100px; font-size: 0.9rem; color: #374151; }

        .progress-bar {
          flex: 1;
          height: 10px;
          background: #e5e7eb;
          border-radius: 5px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2D3E6f, #4f5d8a);
          border-radius: 5px;
        }

        .subject-avg { font-weight: 600; color: #1f2937; width: 40px; }

        .class-comparison { display: flex; flex-direction: column; gap: 12px; }

        .class-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .class-name { width: 100px; font-size: 0.9rem; color: #374151; }

        .class-bar-container {
          flex: 1;
          background: #e5e7eb;
          border-radius: 6px;
          height: 28px;
        }

        .class-bar {
          height: 100%;
          background: linear-gradient(90deg, #2D3E6f, #4f5d8a);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 10px;
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
        }

        /* Modal Notes */
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

        .modal-notes, .modal-bulletin {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-bulletin { max-width: 800px; }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 24px;
          background: linear-gradient(135deg, #2D3E6f 0%, #3d5291 100%);
          color: white;
        }

        .modal-header h5 { margin: 0; font-size: 1.2rem; }
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

        .type-note-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding: 12px 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .type-note-selector label {
          font-weight: 500;
          color: #374151;
        }

        .type-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .type-select:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .examen-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #dbeafe;
          color: #2563eb;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .moyenne-indicateur {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .moyenne-value {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .moyenne-value.good { color: #059669; }
        .moyenne-value.bad { color: #dc2626; }

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

        .notes-table td {
          padding: 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .eleve-name { font-weight: 500; }

        .note-input {
          width: 70px;
          padding: 8px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          text-align: center;
          font-weight: 600;
          font-size: 1rem;
        }

        .note-input:focus {
          outline: none;
          border-color: #2D3E6f;
        }

        .note-input.pass { border-color: #059669; color: #059669; }
        .note-input.fail { border-color: #dc2626; color: #dc2626; }

        .appreciation span {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .appreciation .excellent { background: #dbeafe; color: #2563eb; }
        .appreciation .bien { background: #d1fae5; color: #059669; }
        .appreciation .passable { background: #fef3c7; color: #d97706; }
        .appreciation .insuffisant { background: #fee2e2; color: #dc2626; }

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
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-primary {
          padding: 10px 20px;
          background: #2D3E6f;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Bulletin Preview */
        .bulletin-preview {
          border: 1px solid #e5e7eb;
          padding: 24px;
          background: white;
        }

        .bulletin-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #2D3E6f;
        }

        .school-info h3 { margin: 0; color: #2D3E6f; }
        .school-info p { margin: 4px 0; font-size: 0.85rem; color: #6b7280; }

        .bulletin-title { text-align: right; }
        .bulletin-title h2 { margin: 0; color: #2D3E6f; }
        .bulletin-title p { margin: 4px 0; color: #6b7280; }

        .student-info-bulletin {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .info-row-bulletin { display: flex; gap: 8px; }
        .info-row-bulletin .label { color: #6b7280; }
        .info-row-bulletin .value { font-weight: 600; color: #1f2937; }

        .bulletin-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .bulletin-table th, .bulletin-table td {
          border: 1px solid #e5e7eb;
          padding: 10px;
          text-align: center;
        }

        .bulletin-table th {
          background: #2D3E6f;
          color: white;
          font-weight: 600;
        }

        .bulletin-table .matiere-cell { text-align: left; font-weight: 500; }

        .bulletin-table .moyenne-cell { font-weight: 700; }
        .bulletin-table .moyenne-cell.pass { color: #059669; }
        .bulletin-table .moyenne-cell.fail { color: #dc2626; }
        .bulletin-table .moyenne-cell.absent { color: #f59e0b; font-style: italic; }
        .bulletin-table td.absent { color: #f59e0b; font-style: italic; }

        .bulletin-table .total-row {
          background: #f3f4f6;
          font-weight: 600;
        }

        .bulletin-observations {
          padding: 16px;
          background: #f0f9ff;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .bulletin-observations h4 { margin: 0 0 8px; color: #0369a1; font-size: 0.95rem; }
        .bulletin-observations p { margin: 0; color: #374151; }

        .bulletin-signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
        }

        .signature { text-align: center; }
        .signature span { font-weight: 500; color: #374151; }
        .signature-line {
          width: 150px;
          height: 1px;
          background: #374151;
          margin-top: 40px;
        }

        /* Notification */
        .notification {
          position: fixed;
          top: 24px;
          right: 24px;
          padding: 16px 20px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 2000;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .notification.success {
          background: #d1fae5;
          color: #059669;
          border: 1px solid #059669;
        }

        .notification.error {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #dc2626;
        }

        .notification i {
          font-size: 1.25rem;
        }

        /* Alert Error in Modal */
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

        /* Loading Container */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .loading-container i {
          font-size: 3rem;
          margin-bottom: 16px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .loading-container p {
          font-size: 1rem;
          margin: 0;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 16px;
          display: block;
        }

        .empty-state p {
          font-size: 1rem;
          margin: 0;
        }

        @media (max-width: 768px) {
          .gestion-academique { padding: 16px; }
          .analytics-grid { grid-template-columns: 1fr; }
          .notes-grid { grid-template-columns: 1fr; }
          .matieres-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
