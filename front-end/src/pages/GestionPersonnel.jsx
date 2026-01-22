import { useState, useMemo, useEffect } from 'react'
import { enseignantService } from '../services'

// Fonction de mapping pour les enseignants depuis l'API
const mapEnseignantFromApi = (e) => ({
  id: e.id,
  nom: e.nom,
  prenom: e.prenom,
  specialite: e.specialite || e.specialitePrincipale || 'Non définie',
  telephone: e.telephone || '',
  email: e.email || '',
  classes: e.classes || [],
  statut: e.actif !== false ? 'Actif' : 'Inactif',
  dateEmbauche: e.dateEmbauche || '',
  heuresTotal: e.heuresTotal || 0,
})

// Fonction de mapping pour le personnel administratif depuis l'API
const mapAdminFromApi = (a) => ({
  id: a.id,
  nom: a.nom,
  prenom: a.prenom,
  poste: a.poste || a.fonction || 'Non défini',
  departement: a.departement || '',
  telephone: a.telephone || '',
  email: a.email || '',
  statut: a.actif !== false ? 'Actif' : 'Inactif',
  dateEmbauche: a.dateEmbauche || '',
})

// Modal pour ajouter/modifier un membre du personnel
function PersonnelModal({ onClose, personnel = null, type = 'enseignant', onSave }) {
  const isEdit = !!personnel
  const [formData, setFormData] = useState({
    nom: personnel?.nom || '',
    prenom: personnel?.prenom || '',
    email: personnel?.email || '',
    telephone: personnel?.telephone || '',
    dateNaissance: personnel?.dateNaissance || '',
    adresse: personnel?.adresse || '',
    cin: personnel?.cin || '',
    dateEmbauche: personnel?.dateEmbauche || '',
    type: personnel?.type || type,
    statut: personnel?.statut || 'Actif',
    // Spécifique enseignant
    specialite: personnel?.specialite || '',
    matieres: personnel?.matieres || [],
    classes: personnel?.classes || [],
    // Spécifique administration
    poste: personnel?.poste || personnel?.fonction || '',
    departement: personnel?.departement || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const matieresList = ['Arabe', 'Français', 'Anglais', 'Mathématiques', 'Physique-Chimie', 'SVT', 'Histoire-Géo', 'Philosophie', 'Éducation islamique', 'Sport']
  const classesList = ['1ère Fond.', '2ème Fond.', '3ème Fond.', '4ème Fond.', '5ème Fond.', '6ème Fond.', '1ère Collège', '2ème Collège', '3ème Collège', '4ème Collège', '1ère Lycée', '2ème Lycée', 'Bac']
  const postes = ['Directeur', 'Directeur adjoint', 'Secrétaire', 'Comptable', 'Surveillant général', 'Surveillant', 'Agent de sécurité', 'Agent d\'entretien']
  const departements = ['Direction', 'Secrétariat', 'Comptabilité', 'Surveillance', 'Maintenance']

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.nom || !formData.prenom) {
      setError('Veuillez remplir tous les champs obligatoires (Nom et Prénom)')
      return
    }
    if (!formData.telephone) {
      setError('Le numéro de téléphone est obligatoire')
      return
    }
    if (!formData.dateEmbauche) {
      setError('La date d\'embauche est obligatoire')
      return
    }
    if (formData.type === 'administration' && !formData.poste) {
      setError('Le poste est obligatoire pour le personnel administratif')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const dataToSave = {
        ...formData,
        statut: formData.statut
      }

      if (isEdit) {
        await enseignantService.update(personnel.id, dataToSave, formData.type)
      } else {
        await enseignantService.create(dataToSave, formData.type)
      }

      // Notifier le parent du succès
      onSave()
      onClose()
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-personnel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h5>
            <i className={`bi ${formData.type === 'enseignant' ? 'bi-person-workspace' : 'bi-person-badge'} me-2`}></i>
            {isEdit ? 'Modifier' : 'Ajouter'} - {formData.type === 'enseignant' ? 'Enseignant' : 'Personnel administratif'}
          </h5>
          <button className="btn-close-modal" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Type de personnel */}
          <div className="type-selector">
            <button
              type="button"
              className={`type-btn ${formData.type === 'enseignant' ? 'active' : ''}`}
              onClick={() => handleChange('type', 'enseignant')}
            >
              <i className="bi bi-person-workspace"></i>
              Enseignant
            </button>
            <button
              type="button"
              className={`type-btn ${formData.type === 'administration' ? 'active' : ''}`}
              onClick={() => handleChange('type', 'administration')}
            >
              <i className="bi bi-person-badge"></i>
              Administration
            </button>
          </div>

          {/* Informations personnelles */}
          <h6 className="section-title"><i className="bi bi-person"></i> Informations personnelles</h6>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Nom</label>
              <input type="text" className="form-control" value={formData.nom} onChange={e => handleChange('nom', e.target.value)} placeholder="Nom de famille" />
            </div>
            <div className="form-group">
              <label className="form-label required">Prénom</label>
              <input type="text" className="form-control" value={formData.prenom} onChange={e => handleChange('prenom', e.target.value)} placeholder="Prénom" />
            </div>
            <div className="form-group">
              <label className="form-label">CIN</label>
              <input type="text" className="form-control" value={formData.cin} onChange={e => handleChange('cin', e.target.value)} placeholder="Numéro CIN" />
            </div>
            <div className="form-group">
              <label className="form-label">Date de naissance</label>
              <input type="date" className="form-control" value={formData.dateNaissance} onChange={e => handleChange('dateNaissance', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label required">Téléphone</label>
              <input type="tel" className="form-control" value={formData.telephone} onChange={e => handleChange('telephone', e.target.value)} placeholder="+222 XX XXX XXX" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="email@exemple.com" />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Adresse</label>
              <input type="text" className="form-control" value={formData.adresse} onChange={e => handleChange('adresse', e.target.value)} placeholder="Adresse complète" />
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="alert-error">
              <i className="bi bi-exclamation-triangle-fill"></i>
              {error}
            </div>
          )}

          {/* Informations professionnelles */}
          <h6 className="section-title mt-3"><i className="bi bi-briefcase"></i> Informations professionnelles</h6>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Date d'embauche</label>
              <input type="date" className="form-control" value={formData.dateEmbauche} onChange={e => handleChange('dateEmbauche', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Statut</label>
              <select className="form-select" value={formData.statut} onChange={e => handleChange('statut', e.target.value)}>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="En congé">En congé</option>
              </select>
            </div>
          </div>

          {/* Spécifique Enseignant */}
          {formData.type === 'enseignant' && (
            <>
              <h6 className="section-title mt-3"><i className="bi bi-book"></i> Affectations</h6>
              <div className="form-group">
                <label className="form-label">Spécialité principale</label>
                <select className="form-select" value={formData.specialite} onChange={e => handleChange('specialite', e.target.value)}>
                  <option value="">Sélectionner...</option>
                  {matieresList.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="form-group mt-3">
                <label className="form-label">Matières enseignées</label>
                <div className="checkbox-grid">
                  {matieresList.map(m => (
                    <label key={m} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.matieres.includes(m)}
                        onChange={() => handleMultiSelect('matieres', m)}
                      />
                      <span className="checkbox-box"><i className="bi bi-check"></i></span>
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group mt-3">
                <label className="form-label">Classes assignées</label>
                <div className="checkbox-grid">
                  {classesList.map(c => (
                    <label key={c} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.classes.includes(c)}
                        onChange={() => handleMultiSelect('classes', c)}
                      />
                      <span className="checkbox-box"><i className="bi bi-check"></i></span>
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Spécifique Administration */}
          {formData.type === 'administration' && (
            <>
              <h6 className="section-title mt-3"><i className="bi bi-building"></i> Poste</h6>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required">Poste</label>
                  <select className="form-select" value={formData.poste} onChange={e => handleChange('poste', e.target.value)}>
                    <option value="">Sélectionner le poste...</option>
                    {postes.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Département</label>
                  <select className="form-select" value={formData.departement} onChange={e => handleChange('departement', e.target.value)}>
                    <option value="">Sélectionner...</option>
                    {departements.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Annuler</button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <i className="bi bi-hourglass-split"></i>
                Enregistrement...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg"></i>
                {isEdit ? 'Modifier' : 'Ajouter'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GestionPersonnel({ defaultTab = 'enseignants' }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [showModal, setShowModal] = useState(false)
  const [selectedPersonnel, setSelectedPersonnel] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [viewMode, setViewMode] = useState('cards')
  const [notification, setNotification] = useState(null)

  // State pour les données de l'API
  const [enseignants, setEnseignants] = useState([])
  const [administration, setAdministration] = useState([])
  const [loading, setLoading] = useState(true)

  // Charger les données depuis l'API
  const loadData = async () => {
    try {
      setLoading(true)
      const [enseignantsData, adminData] = await Promise.all([
        enseignantService.getAllEnseignants(),
        enseignantService.getAllPersonnelAdmin()
      ])
      setEnseignants(enseignantsData.map(mapEnseignantFromApi))
      setAdministration(adminData.map(mapAdminFromApi))
    } catch (error) {
      console.error('Erreur lors du chargement du personnel:', error)
      showNotification('Erreur lors du chargement des données', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Afficher une notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Gérer la sauvegarde (create/update)
  const handleSave = async () => {
    showNotification(selectedPersonnel ? 'Personnel modifié avec succès!' : 'Personnel ajouté avec succès!', 'success')
    await loadData()
  }

  // Gérer la suppression
  const handleDelete = async (id, nom, prenom, type) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${prenom} ${nom} ?`)) {
      return
    }

    try {
      await enseignantService.delete(id, type)
      showNotification('Personnel supprimé avec succès!', 'success')
      await loadData()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      showNotification('Erreur lors de la suppression: ' + error.message, 'error')
    }
  }

  const filteredEnseignants = useMemo(() => {
    return enseignants.filter(e => {
      const matchSearch = `${e.nom} ${e.prenom} ${e.specialite}`.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatut = !filterStatut || e.statut === filterStatut
      return matchSearch && matchStatut
    })
  }, [searchTerm, filterStatut, enseignants])

  const filteredAdministration = useMemo(() => {
    return administration.filter(a => {
      const matchSearch = `${a.nom} ${a.prenom} ${a.poste}`.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatut = !filterStatut || a.statut === filterStatut
      return matchSearch && matchStatut
    })
  }, [searchTerm, filterStatut, administration])

  const stats = {
    totalEnseignants: enseignants.length,
    enseignantsActifs: enseignants.filter(e => e.statut === 'Actif').length,
    totalAdmin: administration.length,
    adminActifs: administration.filter(a => a.statut === 'Actif').length,
  }

  const handleEdit = (person) => {
    setSelectedPersonnel(person)
    setShowModal(true)
  }

  const handleAdd = () => {
    setSelectedPersonnel(null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedPersonnel(null)
  }

  return (
    <div className="gestion-personnel">
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
              <i className="bi bi-people-fill me-2"></i>
              Ressources Humaines
            </h1>
            <p className="text-muted">Gestion des enseignants et du personnel administratif</p>
          </div>
          <button className="btn-add" onClick={handleAdd}>
            <i className="bi bi-plus-lg"></i>
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon teachers">
            <i className="bi bi-person-workspace"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalEnseignants}</span>
            <span className="stat-label">Enseignants</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.enseignantsActifs}</span>
            <span className="stat-label">Enseignants actifs</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon admin">
            <i className="bi bi-person-badge"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalAdmin}</span>
            <span className="stat-label">Administration</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total">
            <i className="bi bi-people"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalEnseignants + stats.totalAdmin}</span>
            <span className="stat-label">Total personnel</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'enseignants' ? 'active' : ''}`} onClick={() => setActiveTab('enseignants')}>
            <i className="bi bi-person-workspace"></i>
            Enseignants
            <span className="tab-badge">{enseignants.length}</span>
          </button>
          <button className={`tab ${activeTab === 'administration' ? 'active' : ''}`} onClick={() => setActiveTab('administration')}>
            <i className="bi bi-person-badge"></i>
            Administration
            <span className="tab-badge">{administration.length}</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="filter-select" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
            <option value="En congé">En congé</option>
          </select>
        </div>
        <div className="toolbar-right">
          <div className="view-toggle">
            <button className={viewMode === 'cards' ? 'active' : ''} onClick={() => setViewMode('cards')}>
              <i className="bi bi-grid-3x3-gap"></i>
            </button>
            <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>
              <i className="bi bi-list-ul"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-area">
        {loading ? (
          <div className="loading-container">
            <i className="bi bi-hourglass-split"></i>
            <p>Chargement des données...</p>
          </div>
        ) : (
          <>
            {activeTab === 'enseignants' && (
              viewMode === 'cards' ? (
                <div className="personnel-grid">
                  {filteredEnseignants.map(enseignant => (
                    <div key={enseignant.id} className="personnel-card">
                      <div className="card-header">
                        <div className="avatar">
                          <i className="bi bi-person"></i>
                        </div>
                        <div className="card-actions">
                          <button onClick={() => handleEdit({ ...enseignant, type: 'enseignant' })}><i className="bi bi-pencil"></i></button>
                          <button className="delete" onClick={() => handleDelete(enseignant.id, enseignant.nom, enseignant.prenom, 'enseignant')}><i className="bi bi-trash"></i></button>
                        </div>
                      </div>
                  <div className="card-body">
                    <h4 className="name">{enseignant.prenom} {enseignant.nom}</h4>
                    <span className="specialite">{enseignant.specialite}</span>
                    <span className={`status-badge ${enseignant.statut.toLowerCase().replace(' ', '-')}`}>
                      {enseignant.statut}
                    </span>
                  </div>
                  <div className="card-footer">
                    <div className="info-row">
                      <i className="bi bi-telephone"></i>
                      <span>{enseignant.telephone}</span>
                    </div>
                    <div className="info-row">
                      <i className="bi bi-mortarboard"></i>
                      <span>{enseignant.classes.length} classes</span>
                    </div>
                    <div className="info-row">
                      <i className="bi bi-clock-history"></i>
                      <span>{enseignant.heuresTotal}h enseignées</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Spécialité</th>
                    <th>Classes</th>
                    <th>Téléphone</th>
                    <th>Heures</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnseignants.map(enseignant => (
                    <tr key={enseignant.id}>
                      <td>
                        <div className="cell-name">
                          <div className="mini-avatar"><i className="bi bi-person"></i></div>
                          <span>{enseignant.prenom} {enseignant.nom}</span>
                        </div>
                      </td>
                      <td>{enseignant.specialite}</td>
                      <td>{enseignant.classes.join(', ')}</td>
                      <td>{enseignant.telephone}</td>
                      <td>{enseignant.heuresTotal}h</td>
                      <td>
                        <span className={`status-badge ${enseignant.statut.toLowerCase().replace(' ', '-')}`}>
                          {enseignant.statut}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button onClick={() => handleEdit({ ...enseignant, type: 'enseignant' })}><i className="bi bi-pencil"></i></button>
                          <button className="delete" onClick={() => handleDelete(enseignant.id, enseignant.nom, enseignant.prenom, 'enseignant')}><i className="bi bi-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              )
            )}

            {activeTab === 'administration' && (
              viewMode === 'cards' ? (
                <div className="personnel-grid">
                  {filteredAdministration.map(admin => (
                    <div key={admin.id} className="personnel-card admin-card">
                      <div className="card-header">
                        <div className="avatar admin">
                          <i className="bi bi-person-badge"></i>
                        </div>
                        <div className="card-actions">
                          <button onClick={() => handleEdit({ ...admin, type: 'administration' })}><i className="bi bi-pencil"></i></button>
                          <button className="delete" onClick={() => handleDelete(admin.id, admin.nom, admin.prenom, 'administration')}><i className="bi bi-trash"></i></button>
                        </div>
                      </div>
                  <div className="card-body">
                    <h4 className="name">{admin.prenom} {admin.nom}</h4>
                    <span className="specialite">{admin.poste}</span>
                    <span className="departement">{admin.departement}</span>
                    <span className={`status-badge ${admin.statut.toLowerCase()}`}>
                      {admin.statut}
                    </span>
                  </div>
                  <div className="card-footer">
                    <div className="info-row">
                      <i className="bi bi-telephone"></i>
                      <span>{admin.telephone}</span>
                    </div>
                    <div className="info-row">
                      <i className="bi bi-envelope"></i>
                      <span>{admin.email}</span>
                    </div>
                    <div className="info-row">
                      <i className="bi bi-calendar"></i>
                      <span>Depuis {new Date(admin.dateEmbauche).getFullYear()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Poste</th>
                    <th>Département</th>
                    <th>Téléphone</th>
                    <th>Email</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdministration.map(admin => (
                    <tr key={admin.id}>
                      <td>
                        <div className="cell-name">
                          <div className="mini-avatar admin"><i className="bi bi-person-badge"></i></div>
                          <span>{admin.prenom} {admin.nom}</span>
                        </div>
                      </td>
                      <td>{admin.poste}</td>
                      <td>{admin.departement}</td>
                      <td>{admin.telephone}</td>
                      <td>{admin.email}</td>
                      <td>
                        <span className={`status-badge ${admin.statut.toLowerCase()}`}>
                          {admin.statut}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button onClick={() => handleEdit({ ...admin, type: 'administration' })}><i className="bi bi-pencil"></i></button>
                          <button className="delete" onClick={() => handleDelete(admin.id, admin.nom, admin.prenom, 'administration')}><i className="bi bi-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              )
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <PersonnelModal
          onClose={handleCloseModal}
          personnel={selectedPersonnel}
          type={activeTab === 'enseignants' ? 'enseignant' : 'administration'}
          onSave={handleSave}
        />
      )}

      <style>{`
        .gestion-personnel {
          padding: 24px;
          background: #f8f9fa;
          min-height: calc(100vh - 64px);
          position: relative;
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

        .page-header { margin-bottom: 24px; }

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
          transition: all 0.2s;
        }

        .btn-add:hover { background: #1e2a4d; }

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

        .stat-icon.teachers { background: #dbeafe; color: #2563eb; }
        .stat-icon.active { background: #d1fae5; color: #059669; }
        .stat-icon.admin { background: #fef3c7; color: #d97706; }
        .stat-icon.total { background: #ede9fe; color: #7c3aed; }

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
          transition: all 0.2s;
        }

        .tab:hover { color: #2D3E6f; }

        .tab.active {
          color: #2D3E6f;
          border-bottom-color: #2D3E6f;
        }

        .tab-badge {
          background: #e5e7eb;
          color: #6b7280;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.75rem;
        }

        .tab.active .tab-badge {
          background: #2D3E6f;
          color: white;
        }

        /* Toolbar */
        .toolbar {
          background: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
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
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          width: 250px;
        }

        .search-box input:focus {
          outline: none;
          border-color: #2D3E6f;
        }

        .filter-select {
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
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

        .view-toggle button.active {
          background: #2D3E6f;
          color: white;
        }

        /* Content */
        .content-area {
          background: white;
          border-radius: 0 0 12px 12px;
          padding: 20px;
          min-height: 400px;
        }

        /* Cards Grid */
        .personnel-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .personnel-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .personnel-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .personnel-card .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 16px;
          background: linear-gradient(135deg, #2D3E6f 0%, #4f5d8a 100%);
        }

        .admin-card .card-header {
          background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
        }

        .avatar {
          width: 60px;
          height: 60px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .card-actions {
          display: flex;
          gap: 4px;
        }

        .card-actions button {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .card-actions button:hover { background: rgba(255,255,255,0.3); }
        .card-actions button.delete:hover { background: #dc2626; }

        .personnel-card .card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .personnel-card .name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .specialite {
          font-size: 0.9rem;
          color: #2D3E6f;
          font-weight: 500;
        }

        .departement {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          width: fit-content;
        }

        .status-badge.actif { background: #d1fae5; color: #059669; }
        .status-badge.inactif { background: #fee2e2; color: #dc2626; }
        .status-badge.en-congé { background: #fef3c7; color: #d97706; }

        .personnel-card .card-footer {
          padding: 12px 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .info-row i { color: #9ca3af; }

        /* Table */
        .table-container { overflow-x: auto; }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          text-align: left;
          padding: 12px 16px;
          background: #f9fafb;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.85rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .data-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.9rem;
        }

        .data-table tr:hover { background: #f9fafb; }

        .cell-name {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mini-avatar {
          width: 36px;
          height: 36px;
          background: #2D3E6f;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.9rem;
        }

        .mini-avatar.admin { background: #d97706; }

        .table-actions {
          display: flex;
          gap: 8px;
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

        .table-actions button:hover { background: #e5e7eb; color: #2D3E6f; }
        .table-actions button.delete:hover { background: #fee2e2; color: #dc2626; }

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

        .modal-personnel {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #2D3E6f 0%, #3d5291 100%);
          color: white;
        }

        .modal-header h5 { margin: 0; font-size: 1.2rem; }

        .btn-close-modal {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
          opacity: 0.8;
        }

        .btn-close-modal:hover { opacity: 1; }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .type-selector {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .type-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .type-btn:hover { border-color: #2D3E6f; color: #2D3E6f; }

        .type-btn.active {
          background: #eef2ff;
          border-color: #2D3E6f;
          color: #2D3E6f;
        }

        .section-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #2D3E6f;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mt-3 { margin-top: 20px; }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .form-group { display: flex; flex-direction: column; }
        .form-group.full-width { grid-column: 1 / -1; }

        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-label.required::after { content: " *"; color: #dc2626; }

        .form-control, .form-select {
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .form-control:focus, .form-select:focus {
          outline: none;
          border-color: #2D3E6f;
          box-shadow: 0 0 0 3px rgba(45, 62, 111, 0.1);
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .checkbox-item:hover { background: #f3f4f6; }

        .checkbox-item input { display: none; }

        .checkbox-box {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
          transition: all 0.2s;
        }

        .checkbox-item input:checked + .checkbox-box {
          background: #2D3E6f;
          border-color: #2D3E6f;
          color: white;
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
          font-weight: 500;
          cursor: pointer;
        }

        .btn-secondary:hover { background: #5a6268; }

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

        .btn-primary:hover { background: #1e2a4d; }

        @media (max-width: 768px) {
          .gestion-personnel { padding: 16px; }
          .form-grid, .checkbox-grid { grid-template-columns: 1fr; }
          .type-selector { flex-direction: column; }
          .search-box input { width: 100%; }
        }
      `}</style>
    </div>
  )
}
