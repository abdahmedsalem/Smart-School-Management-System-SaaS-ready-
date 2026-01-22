import React, { useState, useMemo, useEffect } from "react"
import { useFilterStore } from "../stores/useFilterStore"
import FilterDrawer from "../components/FilterDrawer"
import DataTable from "../components/DataTable"
import ClasseDetail from "./ClasseDetail"
import { classeService } from "../services"

// Mapper les données API vers le format attendu par le frontend
const mapClasseFromApi = (classe) => ({
  id: classe.id,
  nom: classe.nom,
  niveau: classe.cycle || classe.cycleName || "Non défini",
  annee: classe.niveau || classe.niveauName || "",
  section: classe.nom?.split(' ').pop() || "",
  specialite: classe.specialite || classe.specialiteName || null,
  effectif: classe.effectif || 0,
  salle: classe.salle || "",
  statut: classe.statut || "Active"
})

const filterOptions = {
  niveaux: ["Fondamental", "Collège", "Lycée"],
  annees: ["1ère Année", "2ème Année", "3ème Année", "4ème Année", "5ème Année", "6ème Année"],
  specialites: ["C", "D", "A", "O"],
  statuts: ["Active", "Inactive"],
}

// Export Dropdown Component
function ExportDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <div className="export-dropdown" ref={dropdownRef}>
      <button className="btn-export-trigger" onClick={() => setIsOpen(!isOpen)}>
        <i className="bi bi-download"></i>
        <span>Export</span>
        <i className={`bi bi-chevron-down export-chevron ${isOpen ? 'open' : ''}`}></i>
      </button>
      {isOpen && (
        <div className="export-dropdown-menu">
          <button className="export-dropdown-item" onClick={() => { alert("Export PDF"); setIsOpen(false) }}>
            <i className="bi bi-file-earmark-pdf text-danger"></i>
            <span>Export PDF</span>
          </button>
          <button className="export-dropdown-item" onClick={() => { alert("Export Excel"); setIsOpen(false) }}>
            <i className="bi bi-file-earmark-excel text-success"></i>
            <span>Export Excel</span>
          </button>
        </div>
      )}
    </div>
  )
}

// Action Dropdown Component
function ActionDropdown({ row, onViewDetail, onEdit }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const handleClick = (e) => {
    e.stopPropagation()
    if (onViewDetail) {
      onViewDetail(row.original)
    }
    setIsOpen(false)
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(row.original)
    }
    setIsOpen(false)
  }

  return (
    <div className="action-dropdown" ref={dropdownRef}>
      <button className="btn-action-menu" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}>
        <i className="bi bi-three-dots-vertical"></i>
      </button>
      {isOpen && (
        <div className="action-dropdown-menu">
          <button className="action-dropdown-item" onClick={handleClick}>
            <i className="bi bi-eye text-primary"></i>
            <span>Voir détails</span>
          </button>
          <button className="action-dropdown-item" onClick={handleEditClick}>
            <i className="bi bi-pencil text-warning"></i>
            <span>Modifier</span>
          </button>
          <button className="action-dropdown-item" onClick={(e) => { e.stopPropagation(); alert(`Élèves de: ${row.original.nom}`); setIsOpen(false) }}>
            <i className="bi bi-people text-info"></i>
            <span>Voir élèves</span>
          </button>
          <div className="action-dropdown-divider"></div>
          <button className="action-dropdown-item text-danger" onClick={(e) => { e.stopPropagation(); if (confirm(`Supprimer ${row.original.nom} ?`)) alert("Supprimé"); setIsOpen(false) }}>
            <i className="bi bi-trash"></i>
            <span>Supprimer</span>
          </button>
        </div>
      )}
    </div>
  )
}

// Badge Filter Active Component
function BadgeFilterActive({ item, onRemove }) {
  return (
    <span className="active-filter-badge">
      <span className="badge-text">
        <span className="active-filter-text">{item.title}</span>:
        <span className="active-filter-value">{item.display}</span>
      </span>
      <button type="button" onClick={() => onRemove(item.name)} className="close">
        <span>&times;</span>
      </button>
    </span>
  )
}

export default function GestionClasses() {
  const GROUP_ID = "classes"
  const store = useFilterStore(GROUP_ID)
  const { filters, active, update, remove, clear } = store()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [classeToEdit, setClasseToEdit] = useState(null)
  const [selectedNiveauId, setSelectedNiveauId] = useState("") // ID du niveau sélectionné
  const [selectedClasse, setSelectedClasse] = useState(null)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [availableNiveaux, setAvailableNiveaux] = useState([]) // Tous les niveaux disponibles
  const [availableMatieres, setAvailableMatieres] = useState([])
  const [selectedMatieres, setSelectedMatieres] = useState([])
  const [formData, setFormData] = useState({
    nom: "",
    section: "",
    salle: "",
    statut: "Active"
  })

  // Charger les niveaux disponibles au démarrage
  useEffect(() => {
    const loadNiveaux = async () => {
      try {
        const [niveauxData, cyclesData] = await Promise.all([
          fetch('http://localhost:8080/api/niveaux').then(r => r.json()),
          fetch('http://localhost:8080/api/cycles').then(r => r.json())
        ])

        // Trier les cycles par ordre
        const sortedCycles = cyclesData.sort((a, b) => a.ordre - b.ordre)

        // Combiner les niveaux avec leurs cycles et grouper par cycle
        const niveauxWithCycles = niveauxData.map(niveau => {
          const cycle = sortedCycles.find(c => c.id === niveau.cycleId)
          return {
            ...niveau,
            cycleNom: cycle?.nom || '',
            cycleOrdre: cycle?.ordre || 0,
            displayName: niveau.nom // Ex: "1ère année", "2ème année"
          }
        })

        // Trier les niveaux par cycle puis par ordre
        niveauxWithCycles.sort((a, b) => {
          if (a.cycleOrdre !== b.cycleOrdre) return a.cycleOrdre - b.cycleOrdre
          return a.ordre - b.ordre
        })

        setAvailableNiveaux(niveauxWithCycles)
        console.log('📚 Niveaux chargés:', niveauxWithCycles.length)
      } catch (error) {
        console.error('❌ Erreur chargement niveaux:', error)
      }
    }
    loadNiveaux()
  }, [])

  // Charger les classes depuis l'API
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true)
        const data = await classeService.getAllClasses()
        setClasses(data.map(mapClasseFromApi))
      } catch (error) {
        console.error("Erreur lors du chargement des classes:", error)
      } finally {
        setLoading(false)
      }
    }
    loadClasses()
  }, [])

  // Charger les matières disponibles quand le niveau change
  useEffect(() => {
    const loadMatieres = async () => {
      if (!selectedNiveauId) {
        console.log("⚠️ Aucun niveau sélectionné")
        setAvailableMatieres([])
        if (!editMode) {
          setSelectedMatieres([])
        }
        return
      }

      try {
        const niveauObj = availableNiveaux.find(n => n.id === Number(selectedNiveauId))
        console.log(`📖 Chargement des matières pour: ${niveauObj?.displayName || selectedNiveauId}`)

        // Charger les matières pour ce niveau
        const response = await fetch(`http://localhost:8080/api/matieres/filtered?niveauId=${selectedNiveauId}`)
        const data = await response.json()
        console.log(`📚 ${data.length} matières chargées pour le niveau ${selectedNiveauId}`)

        if (data.length > 0) {
          console.log("   Matières disponibles:")
          data.forEach(m => {
            console.log(`     - ${m.matiereNom || m.nom} (ID: ${m.id}, Coef: ${m.coefficient})`)
          })
        }

        setAvailableMatieres(data)
      } catch (error) {
        console.error("❌ Erreur lors du chargement des matières:", error)
        setAvailableMatieres([])
        if (!editMode) setSelectedMatieres([])
      }
    }
    loadMatieres()
  }, [selectedNiveauId, editMode, availableNiveaux])

  // Gérer la sélection/désélection des matières
  const toggleMatiere = (matiereNiveauId) => {
    setSelectedMatieres(prev =>
      prev.includes(matiereNiveauId)
        ? prev.filter(id => id !== matiereNiveauId)
        : [...prev, matiereNiveauId]
    )
  }

  // Ouvrir le modal en mode édition
  const handleEditClasse = async (classe) => {
    console.log("🔧 Édition de la classe:", classe)
    setEditMode(true)
    setClasseToEdit(classe)

    // Pré-remplir le formulaire
    setFormData({
      nom: classe.nom,
      section: classe.section || "",
      salle: classe.salle || "",
      statut: classe.statut || "Active"
    })

    // Définir le niveau sélectionné
    if (classe.niveauId) {
      setSelectedNiveauId(String(classe.niveauId))

      try {
        // Charger les matières disponibles pour ce niveau
        const response = await fetch(`http://localhost:8080/api/matieres/filtered?niveauId=${classe.niveauId}`)
        const matieresData = await response.json()
        console.log(`📚 Matières disponibles chargées pour niveau ${classe.niveauId}:`, matieresData.length, "matières")
        setAvailableMatieres(matieresData)

        // Charger les matières de la classe
        if (classe.id) {
          const cmResponse = await fetch(`http://localhost:8080/api/classe-matieres/classe/${classe.id}`)
          const classeMatieresData = await cmResponse.json()
          console.log("🔍 ClasseMatieres reçues de l'API:", classeMatieresData)

          // Extraire les IDs de matiere-niveau (convertir en Number pour correspondre aux IDs de availableMatieres)
          const matiereNiveauIds = classeMatieresData.map(cm => Number(cm.matiereNiveauId)).filter(Boolean)
          console.log("✅ MatiereNiveauIds à sélectionner:", matiereNiveauIds)

          setSelectedMatieres(matiereNiveauIds)
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement des matières:", error)
        setAvailableMatieres([])
        setSelectedMatieres([])
      }
    }

    // Ouvrir le modal
    setShowAddModal(true)
  }

  // Réinitialiser le formulaire
  const resetForm = () => {
    setEditMode(false)
    setClasseToEdit(null)
    setSelectedNiveauId("")
    setAvailableMatieres([])
    setSelectedMatieres([])
    setFormData({
      nom: "",
      section: "",
      salle: "",
      statut: "Active"
    })
  }

  // Fermer le modal et réinitialiser
  const closeModal = () => {
    setShowAddModal(false)
    resetForm()
  }

  // Navigation vers détail classe
  const handleViewDetail = (classe) => {
    setSelectedClasse(classe)
  }

  // Colonnes du tableau
  const tableColumns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "nom", header: "Nom de la classe" },
    {
      accessorKey: "niveau",
      header: "Niveau",
      cell: ({ getValue }) => {
        const value = getValue()
        const colors = {
          "Fondamental": "bg-primary",
          "Collège": "bg-info",
          "Lycée": "bg-warning"
        }
        return <span className={`badge ${colors[value] || 'bg-secondary'}`}>{value}</span>
      }
    },
    { accessorKey: "annee", header: "Année" },
    {
      accessorKey: "specialite",
      header: "Spécialité",
      cell: ({ getValue }) => {
        const value = getValue()
        if (!value) return <span className="text-muted">-</span>
        const colors = {
          "C": "bg-danger",
          "D": "bg-success",
          "A": "bg-purple",
          "O": "bg-orange"
        }
        return <span className={`badge ${colors[value] || 'bg-secondary'}`}>{value}</span>
      }
    },
    { accessorKey: "effectif", header: "Effectif" },
    { accessorKey: "enseignant", header: "Enseignant principal" },
    { accessorKey: "salle", header: "Salle" },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ getValue }) => {
        const value = getValue()
        return (
          <span className={`badge ${value === "Active" ? "bg-success" : "bg-secondary"}`}>
            {value}
          </span>
        )
      }
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => <ActionDropdown row={row} onViewDetail={handleViewDetail} onEdit={handleEditClasse} />,
    },
  ]

  // IMPORTANT: useMemo doit être appelé AVANT tout return conditionnel
  const filteredData = useMemo(() => {
    let result = [...classes]
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(item =>
        item.nom?.toLowerCase().includes(searchLower) ||
        item.enseignant?.toLowerCase().includes(searchLower)
      )
    }
    if (filters.niveau) result = result.filter(item => item.niveau === filters.niveau)
    if (filters.annee) result = result.filter(item => item.annee === filters.annee)
    if (filters.specialite) result = result.filter(item => item.specialite === filters.specialite)
    if (filters.statut) result = result.filter(item => item.statut === filters.statut)
    return result
  }, [filters, classes])

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="gestion-classes" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement des classes...</p>
        </div>
      </div>
    )
  }

  // Si une classe est sélectionnée, afficher le détail
  if (selectedClasse) {
    return (
      <ClasseDetail
        classe={selectedClasse}
        onBack={() => setSelectedClasse(null)}
      />
    )
  }

  return (
    <div className="gestion-classes">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">
              <i className="bi bi-building me-2 text-primary"></i>
              Gestion des Classes
            </h1>
            <p className="text-muted">Gérez toutes les classes du système</p>
          </div>
          <div className="header-actions">
            <FilterDrawer
              group_id={GROUP_ID}
              title="Filtres Classes"
              subtitle="Affiner votre recherche de classes"
              width="420px"
            >
              <div className="filter-group">
                <label className="form-label">Recherche</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher par nom..."
                  onChange={(e) => {
                    const val = e.target.value
                    if (val) update("search", val, { title: "Recherche", display: val })
                    else remove("search")
                  }}
                />
              </div>
              <div className="filter-group">
                <label className="form-label">Niveau</label>
                <select
                  className="form-select"
                  onChange={(e) => {
                    const val = e.target.value
                    if (val) update("niveau", val, { title: "Niveau", display: val })
                    else remove("niveau")
                  }}
                >
                  <option value="">Tous les niveaux</option>
                  {filterOptions.niveaux.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="form-label">Année</label>
                <select
                  className="form-select"
                  onChange={(e) => {
                    const val = e.target.value
                    if (val) update("annee", val, { title: "Année", display: val })
                    else remove("annee")
                  }}
                >
                  <option value="">Toutes les années</option>
                  {filterOptions.annees.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="form-label">Spécialité (Lycée)</label>
                <select
                  className="form-select"
                  onChange={(e) => {
                    const val = e.target.value
                    if (val) update("specialite", val, { title: "Spécialité", display: val })
                    else remove("specialite")
                  }}
                >
                  <option value="">Toutes les spécialités</option>
                  {filterOptions.specialites.map(s => <option key={s} value={s}>Série {s}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="form-label">Statut</label>
                <select
                  className="form-select"
                  onChange={(e) => {
                    const val = e.target.value
                    if (val) update("statut", val, { title: "Statut", display: val })
                    else remove("statut")
                  }}
                >
                  <option value="">Tous les statuts</option>
                  {filterOptions.statuts.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </FilterDrawer>
            <button className="btn-add" onClick={() => setShowAddModal(true)}>
              <i className="bi bi-plus-lg"></i>
              <span>Ajouter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {active.length > 0 && (
        <div className="active-filters-bar">
          <span className="filters-label">Filtres actifs :</span>
          {active.map((item, index) => (
            <BadgeFilterActive key={item.name || index} item={item} onRemove={remove} />
          ))}
          <button className="btn-clear-all" onClick={clear}>Tout effacer</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="table-toolbar">
        <div className="toolbar-left">
          <i className="bi bi-eye text-muted"></i>
          <span className="text-muted">{filteredData.length} classes</span>
        </div>
        <div className="toolbar-right">
          <ExportDropdown />
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Rechercher..."
              onChange={(e) => {
                const val = e.target.value
                if (val) update("search", val, { title: "Recherche", display: val })
                else remove("search")
              }}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="card-body">
          <DataTable
            data={filteredData}
            columns={tableColumns}
            pageSize={10}
          />
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>
                <i className={`bi ${editMode ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
                {editMode ? 'Modifier la classe' : 'Ajouter une classe'}
              </h5>
              <button className="btn-close" onClick={closeModal}></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Niveau Scolaire</label>
                    <select
                      className="form-select"
                      value={selectedNiveauId}
                      onChange={(e) => setSelectedNiveauId(e.target.value)}
                      required
                    >
                      <option value="">Sélectionner un niveau...</option>
                      {availableNiveaux.map(niveau => (
                        <option key={niveau.id} value={niveau.id}>
                          {niveau.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nom de la classe</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: 6ème A"
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: A, B, C..."
                      value={formData.section}
                      onChange={(e) => setFormData({...formData, section: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Salle</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: Salle 101"
                      value={formData.salle}
                      onChange={(e) => setFormData({...formData, salle: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Statut</label>
                    <select
                      className="form-select"
                      value={formData.statut}
                      onChange={(e) => setFormData({...formData, statut: e.target.value})}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Section Matières */}
                {availableMatieres.length > 0 && (
                  <div className="form-group matieres-section">
                    <label className="form-label">
                      <i className="bi bi-book me-2"></i>
                      Matières ({availableMatieres.length} disponibles)
                    </label>
                    <div className="matieres-grid">
                      {availableMatieres.map((matiere) => (
                        <div key={matiere.id} className="matiere-checkbox-item">
                          <input
                            type="checkbox"
                            id={`matiere-${matiere.id}`}
                            checked={selectedMatieres.includes(Number(matiere.id))}
                            onChange={() => toggleMatiere(Number(matiere.id))}
                            className="matiere-checkbox"
                          />
                          <label htmlFor={`matiere-${matiere.id}`} className="matiere-label">
                            <span className="matiere-name">
                              {matiere.matiereNom || matiere.nom || `Matière #${matiere.id}`}
                            </span>
                            <span className="matiere-coefficient">
                              {matiere.matiereCode || matiere.code} • Coef: {matiere.coefficient}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="selected-count">
                      {selectedMatieres.length} matière(s) sélectionnée(s)
                    </div>
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Annuler</button>
              <button className="btn-primary" onClick={() => {
                console.log("Mode:", editMode ? "Édition" : "Ajout");
                console.log("Données du formulaire:", formData);
                console.log("Niveau sélectionné ID:", selectedNiveauId);
                console.log("Matières sélectionnées:", selectedMatieres);

                if (!selectedNiveauId) {
                  alert("Veuillez sélectionner un niveau scolaire");
                  return;
                }

                if (editMode) {
                  alert(`Classe "${formData.nom}" modifiée avec ${selectedMatieres.length} matières (démo)`);
                } else {
                  alert(`Classe "${formData.nom}" ajoutée avec ${selectedMatieres.length} matières (démo)`);
                }
                closeModal();
              }}>
                <i className="bi bi-check-lg me-1"></i>
                {editMode ? 'Modifier' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gestion-classes {
          padding: 24px;
          background: #f8f9fa;
          min-height: calc(100vh - 64px);
        }

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
          color: #2D3E6f;
          margin: 0;
        }

        .text-muted {
          color: #6b7280;
          margin: 0;
        }

        .text-primary {
          color: #2D3E6f !important;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .btn-add {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #2D3E6f;
          color: white;
          border: 1px solid #2D3E6f;
          border-radius: 5px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-add:hover {
          background: #243256;
          border-color: #243256;
        }

        .btn-add i {
          font-weight: 700;
          font-size: 16px;
        }

        .btn-add span {
          padding-inline-start: 5px;
          font-weight: 600;
        }

        /* Active Filters */
        .active-filters-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .filters-label {
          font-size: 0.875rem;
          color: #6c757d;
          font-weight: 500;
        }

        .active-filter-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          background: #fff;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .active-filter-text {
          font-weight: 600;
          color: #2D3E6f;
        }

        .active-filter-value {
          color: #2D3E6f;
          margin-left: 4px;
        }

        .active-filter-badge .close {
          background: none;
          border: none;
          color: #6c757d;
          margin-left: 8px;
          font-size: 1.1rem;
          cursor: pointer;
        }

        .active-filter-badge .close:hover {
          color: #dc3545;
        }

        .btn-clear-all {
          padding: 6px 14px;
          background: #fff;
          border: 1px solid #dc3545;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #dc3545;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-clear-all:hover {
          background: #dc3545;
          color: #fff;
        }

        /* Toolbar */
        .table-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .toolbar-left, .toolbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
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
          border: 1px solid #2D3E6f;
          border-radius: 8px;
          font-size: 0.875rem;
          width: 200px;
          background: white;
        }

        .search-box input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(45, 62, 111, 0.1);
        }

        /* Export Dropdown */
        .export-dropdown {
          position: relative;
        }

        .btn-export-trigger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border: 1px solid #2D3E6f;
          background: white;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          color: #2D3E6f;
          transition: all 0.2s;
        }

        .btn-export-trigger:hover {
          background: #2D3E6f;
          color: white;
        }

        .export-chevron {
          font-size: 0.75rem;
          transition: transform 0.2s;
        }

        .export-chevron.open {
          transform: rotate(180deg);
        }

        .export-dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          z-index: 1000;
          min-width: 180px;
          padding: 8px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .export-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #2D3E6f;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-dropdown-item:hover {
          background: #f8f9fa;
          border-color: #2D3E6f;
        }

        .export-dropdown-item .text-danger { color: #dc3545; }
        .export-dropdown-item .text-success { color: #198754; }

        /* Action Dropdown */
        .action-dropdown {
          position: relative;
        }

        .btn-action-menu {
          padding: 8px;
          background: transparent;
          border: none;
          border-radius: 50%;
          color: #6b7280;
          cursor: pointer;
        }

        .btn-action-menu:hover {
          background: #f3f4f6;
        }

        .action-dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          z-index: 1000;
          min-width: 200px;
          padding: 8px 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .action-dropdown-item {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          padding: 12px 20px;
          font-size: 15px;
          color: #1f2937;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .action-dropdown-item:hover {
          background: #f5f5f5;
        }

        .action-dropdown-item i {
          font-size: 20px;
          width: 24px;
        }

        .action-dropdown-item.text-danger { color: #dc3545; }
        .action-dropdown-item.text-danger:hover { background: #fef2f2; }
        .text-primary { color: #2563eb !important; }
        .text-warning { color: #f59e0b !important; }
        .text-info { color: #06b6d4 !important; }

        .action-dropdown-divider {
          height: 1px;
          margin: 8px 0;
          background: #e5e7eb;
        }

        /* Card */
        .card {
          background: white;
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(45, 62, 111, 0.08);
        }

        .card-body {
          padding: 24px;
        }

        /* Badge */
        .badge {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .bg-success {
          background: #198754 !important;
          color: white;
        }

        .bg-secondary {
          background: #6c757d !important;
          color: white;
        }

        .bg-primary {
          background: #2D3E6f !important;
          color: white;
        }

        .bg-info {
          background: #0dcaf0 !important;
          color: #000;
        }

        .bg-warning {
          background: #ffc107 !important;
          color: #000;
        }

        .bg-danger {
          background: #dc3545 !important;
          color: white;
        }

        .bg-purple {
          background: #6f42c1 !important;
          color: white;
        }

        .bg-orange {
          background: #fd7e14 !important;
          color: white;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(45, 62, 111, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 25px 50px rgba(45, 62, 111, 0.35);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #2D3E6f 0%, #3d5291 100%);
          color: white;
          border-radius: 16px 16px 0 0;
        }

        .modal-header h5 {
          margin: 0;
          font-size: 1.25rem;
        }

        .modal-header .btn-close {
          filter: invert(1);
          background: transparent;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-control, .form-select {
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .form-control:focus, .form-select:focus {
          outline: none;
          border-color: #2D3E6f;
          box-shadow: 0 0 0 3px rgba(45, 62, 111, 0.1);
        }

        .btn-secondary {
          padding: 10px 20px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
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
          background: #1e2a4d;
        }

        .filter-group {
          margin-bottom: 0;
        }

        /* Matieres Section */
        .matieres-section {
          margin-top: 24px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .matieres-section .form-label {
          display: flex;
          align-items: center;
          font-size: 1rem;
          font-weight: 600;
          color: #2D3E6f;
          margin-bottom: 12px;
        }

        .matieres-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }

        .matiere-checkbox-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .matiere-checkbox-item:hover {
          border-color: #2D3E6f;
          box-shadow: 0 2px 4px rgba(45, 62, 111, 0.1);
        }

        .matiere-checkbox {
          margin-top: 2px;
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #2D3E6f;
        }

        .matiere-label {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          user-select: none;
        }

        .matiere-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1f2937;
        }

        .matiere-coefficient {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .selected-count {
          text-align: center;
          padding: 8px;
          background: #2D3E6f;
          color: white;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .gestion-classes {
            padding: 16px;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .table-toolbar {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .toolbar-right {
            width: 100%;
            justify-content: space-between;
          }

          .search-box input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
