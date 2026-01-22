import { useState, useMemo } from 'react'

// Structure des frais par niveau
const fraisParNiveau = [
  { id: 1, cycle: 'Fondamental', niveau: '6ème Primaire', fraisMensuel: 1000, fraisInscription: 500, fraisAnnuel: 10000 },
  { id: 2, cycle: 'Fondamental', niveau: '5ème Primaire', fraisMensuel: 1000, fraisInscription: 500, fraisAnnuel: 10000 },
  { id: 3, cycle: 'Fondamental', niveau: '4ème Primaire', fraisMensuel: 1000, fraisInscription: 500, fraisAnnuel: 10000 },
  { id: 4, cycle: 'Fondamental', niveau: '3ème Primaire', fraisMensuel: 1000, fraisInscription: 500, fraisAnnuel: 10000 },
  { id: 5, cycle: 'Fondamental', niveau: '2ème Primaire', fraisMensuel: 1000, fraisInscription: 500, fraisAnnuel: 10000 },
  { id: 6, cycle: 'Fondamental', niveau: '1ère Primaire', fraisMensuel: 1000, fraisInscription: 500, fraisAnnuel: 10000 },
  { id: 7, cycle: 'Collège', niveau: '4ème Collège', fraisMensuel: 1500, fraisInscription: 750, fraisAnnuel: 15000 },
  { id: 8, cycle: 'Collège', niveau: '3ème Collège', fraisMensuel: 1500, fraisInscription: 750, fraisAnnuel: 15000 },
  { id: 9, cycle: 'Collège', niveau: '2ème Collège', fraisMensuel: 1500, fraisInscription: 750, fraisAnnuel: 15000 },
  { id: 10, cycle: 'Collège', niveau: '1ère Collège', fraisMensuel: 1500, fraisInscription: 750, fraisAnnuel: 15000 },
  { id: 11, cycle: 'Lycée', niveau: '3ème Lycée', specialite: 'C', fraisMensuel: 2000, fraisInscription: 1000, fraisAnnuel: 20000 },
  { id: 12, cycle: 'Lycée', niveau: '3ème Lycée', specialite: 'D', fraisMensuel: 2000, fraisInscription: 1000, fraisAnnuel: 20000 },
  { id: 13, cycle: 'Lycée', niveau: '2ème Lycée', specialite: 'A', fraisMensuel: 2000, fraisInscription: 1000, fraisAnnuel: 20000 },
  { id: 14, cycle: 'Lycée', niveau: '2ème Lycée', specialite: 'O', fraisMensuel: 2000, fraisInscription: 1000, fraisAnnuel: 20000 },
  { id: 15, cycle: 'Lycée', niveau: '1ère Lycée', specialite: 'C', fraisMensuel: 2000, fraisInscription: 1000, fraisAnnuel: 20000 },
  { id: 16, cycle: 'Lycée', niveau: '1ère Lycée', specialite: 'D', fraisMensuel: 2000, fraisInscription: 1000, fraisAnnuel: 20000 },
]

// Réductions et bourses
const reductions = [
  { id: 1, type: 'Bourse complète', reduction: 100, description: 'Exonération totale des frais' },
  { id: 2, type: 'Demi-bourse', reduction: 50, description: '50% de réduction sur les frais mensuels' },
  { id: 3, type: 'Fratrie (2 enfants)', reduction: 10, description: '10% de réduction pour le 2ème enfant' },
  { id: 4, type: 'Fratrie (3+ enfants)', reduction: 20, description: '20% de réduction à partir du 3ème enfant' },
  { id: 5, type: 'Personnel école', reduction: 25, description: '25% de réduction pour le personnel' },
  { id: 6, type: 'Paiement anticipé', reduction: 5, description: '5% de réduction si paiement annuel en avance' },
]

// Historique des modifications
const historique = [
  { id: 1, date: '15/12/2025', utilisateur: 'Admin', action: 'Modification', details: 'Frais Lycée augmentés de 1800 à 2000 MRU', niveau: '3ème Lycée' },
  { id: 2, date: '10/12/2025', utilisateur: 'Admin', action: 'Ajout', details: 'Nouvelle réduction Fratrie (3+ enfants) créée', niveau: '-' },
  { id: 3, date: '01/09/2025', utilisateur: 'Direction', action: 'Modification', details: 'Frais Collège augmentés de 1200 à 1500 MRU', niveau: 'Collège' },
  { id: 4, date: '01/09/2025', utilisateur: 'Direction', action: 'Modification', details: 'Frais Primaire maintenus à 1000 MRU', niveau: 'Fondamental' },
]

// Élèves avec réductions spéciales
const elevesReductions = [
  { id: 1, nom: 'Mohamed Ould Ahmed', matricule: 'ELV-2024-001', classe: '3ème Lycée - C', typeReduction: 'Demi-bourse', reduction: 50, fraisOriginal: 2000, fraisActuel: 1000 },
  { id: 2, nom: 'Fatima Mint Sidi', matricule: 'ELV-2024-002', classe: '2ème Lycée - A', typeReduction: 'Fratrie (2 enfants)', reduction: 10, fraisOriginal: 2000, fraisActuel: 1800 },
  { id: 3, nom: 'Ahmed Ould Cheikh', matricule: 'ELV-2024-003', classe: '4ème Collège', typeReduction: 'Bourse complète', reduction: 100, fraisOriginal: 1500, fraisActuel: 0 },
  { id: 4, nom: 'Aissata Mint Mohamed', matricule: 'ELV-2024-004', classe: '6ème Primaire', typeReduction: 'Personnel école', reduction: 25, fraisOriginal: 1000, fraisActuel: 750 },
]

export default function GestionFrais() {
  const [activeTab, setActiveTab] = useState('parametrage')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddReductionModal, setShowAddReductionModal] = useState(false)
  const [selectedFrais, setSelectedFrais] = useState(null)
  const [filterCycle, setFilterCycle] = useState('')

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR').format(montant)
  }

  // Grouper les frais par cycle
  const fraisGroupes = useMemo(() => {
    let data = [...fraisParNiveau]
    if (filterCycle) {
      data = data.filter(f => f.cycle === filterCycle)
    }

    const grouped = {}
    data.forEach(f => {
      if (!grouped[f.cycle]) {
        grouped[f.cycle] = []
      }
      grouped[f.cycle].push(f)
    })
    return grouped
  }, [filterCycle])

  const handleEditFrais = (frais) => {
    setSelectedFrais(frais)
    setShowEditModal(true)
  }

  return (
    <div className="gestion-frais">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">
              <i className="bi bi-currency-exchange"></i>
              Gestion des Frais
            </h1>
            <p className="page-subtitle">Paramétrage des frais scolaires par niveau, classe et réductions</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => setShowAddReductionModal(true)}>
              <i className="bi bi-plus-lg"></i>
              <span>Nouvelle réduction</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'parametrage' ? 'active' : ''}`}
          onClick={() => setActiveTab('parametrage')}
        >
          <i className="bi bi-gear"></i>
          <span>Paramétrage des frais</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'reductions' ? 'active' : ''}`}
          onClick={() => setActiveTab('reductions')}
        >
          <i className="bi bi-percent"></i>
          <span>Réductions & Bourses</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'eleves' ? 'active' : ''}`}
          onClick={() => setActiveTab('eleves')}
        >
          <i className="bi bi-person-check"></i>
          <span>Élèves avec réduction</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'historique' ? 'active' : ''}`}
          onClick={() => setActiveTab('historique')}
        >
          <i className="bi bi-clock-history"></i>
          <span>Historique</span>
        </button>
      </div>

      {/* Content */}
      <div className="tab-content">
        {activeTab === 'parametrage' && (
          <div className="parametrage-section">
            {/* Filter */}
            <div className="filter-bar">
              <select
                className="filter-select"
                value={filterCycle}
                onChange={(e) => setFilterCycle(e.target.value)}
              >
                <option value="">Tous les cycles</option>
                <option value="Fondamental">Fondamental</option>
                <option value="Collège">Collège</option>
                <option value="Lycée">Lycée</option>
              </select>
            </div>

            {/* Frais par cycle */}
            {Object.entries(fraisGroupes).map(([cycle, frais]) => (
              <div key={cycle} className="cycle-section">
                <div className="cycle-header">
                  <div className="cycle-title">
                    <span className={`cycle-icon cycle-${cycle.toLowerCase()}`}>
                      {cycle === 'Fondamental' && <i className="bi bi-book"></i>}
                      {cycle === 'Collège' && <i className="bi bi-journal-text"></i>}
                      {cycle === 'Lycée' && <i className="bi bi-mortarboard"></i>}
                    </span>
                    <h3>{cycle}</h3>
                    <span className="cycle-count">{frais.length} niveaux</span>
                  </div>
                  <button className="btn-edit-all">
                    <i className="bi bi-pencil"></i>
                    <span>Modifier tous</span>
                  </button>
                </div>

                <div className="frais-table-wrapper">
                  <table className="frais-table">
                    <thead>
                      <tr>
                        <th>Niveau</th>
                        <th>Spécialité</th>
                        <th>Frais d'inscription</th>
                        <th>Frais mensuels</th>
                        <th>Total annuel</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {frais.map(f => (
                        <tr key={f.id}>
                          <td>
                            <span className="niveau-name">{f.niveau}</span>
                          </td>
                          <td>
                            {f.specialite ? (
                              <span className="specialite-badge">{f.specialite}</span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <span className="montant">{formatMontant(f.fraisInscription)} MRU</span>
                          </td>
                          <td>
                            <span className="montant montant-highlight">{formatMontant(f.fraisMensuel)} MRU</span>
                          </td>
                          <td>
                            <span className="montant montant-total">{formatMontant(f.fraisAnnuel)} MRU</span>
                          </td>
                          <td>
                            <button
                              className="btn-action-edit"
                              onClick={() => handleEditFrais(f)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reductions' && (
          <div className="reductions-section">
            <div className="reductions-grid">
              {reductions.map(r => (
                <div key={r.id} className="reduction-card">
                  <div className="reduction-header">
                    <span className="reduction-percent">-{r.reduction}%</span>
                    <button className="btn-edit-small">
                      <i className="bi bi-pencil"></i>
                    </button>
                  </div>
                  <h4 className="reduction-type">{r.type}</h4>
                  <p className="reduction-description">{r.description}</p>
                  <div className="reduction-footer">
                    <span className="reduction-status active">
                      <i className="bi bi-check-circle-fill"></i>
                      Actif
                    </span>
                  </div>
                </div>
              ))}

              {/* Add new reduction card */}
              <div
                className="reduction-card reduction-add"
                onClick={() => setShowAddReductionModal(true)}
              >
                <div className="add-icon">
                  <i className="bi bi-plus-lg"></i>
                </div>
                <span>Ajouter une réduction</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'eleves' && (
          <div className="eleves-section">
            <div className="section-header">
              <h3>Élèves bénéficiant de réductions</h3>
              <button className="btn-primary">
                <i className="bi bi-plus-lg"></i>
                <span>Attribuer une réduction</span>
              </button>
            </div>

            <div className="eleves-table-wrapper">
              <table className="eleves-table">
                <thead>
                  <tr>
                    <th>Élève</th>
                    <th>Matricule</th>
                    <th>Classe</th>
                    <th>Type de réduction</th>
                    <th>Réduction</th>
                    <th>Frais original</th>
                    <th>Frais actuel</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {elevesReductions.map(e => (
                    <tr key={e.id}>
                      <td>
                        <div className="eleve-cell">
                          <div className="eleve-avatar">
                            <i className="bi bi-person-fill"></i>
                          </div>
                          <span className="eleve-nom">{e.nom}</span>
                        </div>
                      </td>
                      <td>
                        <span className="matricule-badge">{e.matricule}</span>
                      </td>
                      <td>
                        <span className="classe-badge">{e.classe}</span>
                      </td>
                      <td>
                        <span className="reduction-type-badge">{e.typeReduction}</span>
                      </td>
                      <td>
                        <span className="reduction-value">-{e.reduction}%</span>
                      </td>
                      <td>
                        <span className="montant-original">{formatMontant(e.fraisOriginal)} MRU</span>
                      </td>
                      <td>
                        <span className="montant-actuel">{formatMontant(e.fraisActuel)} MRU</span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button className="action-btn action-edit" title="Modifier">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="action-btn action-delete" title="Supprimer">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'historique' && (
          <div className="historique-section">
            <div className="historique-list">
              {historique.map(h => (
                <div key={h.id} className="historique-item">
                  <div className="historique-icon">
                    {h.action === 'Modification' && <i className="bi bi-pencil-square"></i>}
                    {h.action === 'Ajout' && <i className="bi bi-plus-circle"></i>}
                    {h.action === 'Suppression' && <i className="bi bi-trash"></i>}
                  </div>
                  <div className="historique-content">
                    <div className="historique-header">
                      <span className={`action-badge action-${h.action.toLowerCase()}`}>
                        {h.action}
                      </span>
                      <span className="historique-niveau">{h.niveau}</span>
                    </div>
                    <p className="historique-details">{h.details}</p>
                    <div className="historique-meta">
                      <span className="historique-user">
                        <i className="bi bi-person"></i>
                        {h.utilisateur}
                      </span>
                      <span className="historique-date">
                        <i className="bi bi-calendar"></i>
                        {h.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedFrais && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifier les frais</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Niveau</label>
                <input type="text" value={selectedFrais.niveau} disabled />
              </div>
              <div className="form-group">
                <label>Frais d'inscription (MRU)</label>
                <input type="number" defaultValue={selectedFrais.fraisInscription} />
              </div>
              <div className="form-group">
                <label>Frais mensuels (MRU)</label>
                <input type="number" defaultValue={selectedFrais.fraisMensuel} />
              </div>
              <div className="form-info">
                <i className="bi bi-info-circle"></i>
                <span>Le total annuel sera calculé automatiquement (inscription + 10 mois)</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                Annuler
              </button>
              <button className="btn-save">
                <i className="bi bi-check-lg"></i>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gestion-frais {
          padding: 20px;
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
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .page-title i {
          color: #2D3E6f;
        }

        .page-subtitle {
          color: #6b7280;
          font-size: 0.9rem;
          margin-top: 4px;
        }

        .btn-primary, .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #2D3E6f;
          color: white;
          border: none;
        }

        .btn-secondary {
          background: white;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        /* Tabs */
        .tabs-container {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          background: white;
          padding: 8px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .tab-btn.active {
          background: #2D3E6f;
          color: white;
        }

        /* Content */
        .tab-content {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        /* Parametrage Section */
        .filter-bar {
          margin-bottom: 24px;
        }

        .filter-select {
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          min-width: 200px;
        }

        .cycle-section {
          margin-bottom: 32px;
        }

        .cycle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .cycle-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cycle-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .cycle-fondamental { background: #d1fae5; color: #059669; }
        .cycle-collège { background: #dbeafe; color: #2563eb; }
        .cycle-lycée { background: #f3e8ff; color: #7c3aed; }

        .cycle-title h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .cycle-count {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .btn-edit-all {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #374151;
          cursor: pointer;
        }

        .btn-edit-all:hover {
          background: #e5e7eb;
        }

        /* Frais Table */
        .frais-table-wrapper {
          overflow-x: auto;
        }

        .frais-table {
          width: 100%;
          border-collapse: collapse;
        }

        .frais-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          border-bottom: 2px solid #e9ecef;
        }

        .frais-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f3f4f6;
        }

        .niveau-name {
          font-weight: 600;
          color: #1f2937;
        }

        .specialite-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #e0e7ff;
          color: #4f46e5;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .text-muted {
          color: #9ca3af;
        }

        .montant {
          font-weight: 500;
          color: #374151;
        }

        .montant-highlight {
          color: #2D3E6f;
          font-weight: 700;
        }

        .montant-total {
          color: #059669;
          font-weight: 700;
        }

        .btn-action-edit {
          padding: 8px 10px;
          background: #f3f4f6;
          border: none;
          border-radius: 6px;
          color: #374151;
          cursor: pointer;
        }

        .btn-action-edit:hover {
          background: #2D3E6f;
          color: white;
        }

        /* Reductions Section */
        .reductions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .reduction-card {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 20px;
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .reduction-card:hover {
          border-color: #2D3E6f;
        }

        .reduction-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .reduction-percent {
          font-size: 1.75rem;
          font-weight: 800;
          color: #059669;
        }

        .btn-edit-small {
          padding: 6px 8px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          color: #6b7280;
          cursor: pointer;
        }

        .reduction-type {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .reduction-description {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0 0 16px 0;
        }

        .reduction-footer {
          display: flex;
          justify-content: space-between;
        }

        .reduction-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .reduction-status.active {
          color: #059669;
        }

        .reduction-add {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border: 2px dashed #d1d5db;
          cursor: pointer;
          min-height: 180px;
        }

        .reduction-add:hover {
          border-color: #2D3E6f;
          background: #f8f9ff;
        }

        .add-icon {
          width: 48px;
          height: 48px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: #6b7280;
        }

        .reduction-add span {
          color: #6b7280;
          font-size: 0.9rem;
        }

        /* Eleves Section */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .eleves-table-wrapper {
          overflow-x: auto;
        }

        .eleves-table {
          width: 100%;
          border-collapse: collapse;
        }

        .eleves-table th {
          padding: 12px 14px;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          border-bottom: 2px solid #e9ecef;
        }

        .eleves-table td {
          padding: 14px;
          border-bottom: 1px solid #f3f4f6;
        }

        .eleve-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .eleve-avatar {
          width: 36px;
          height: 36px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .eleve-nom {
          font-weight: 600;
          color: #1f2937;
        }

        .matricule-badge {
          display: inline-block;
          padding: 4px 8px;
          background: #f3f4f6;
          color: #374151;
          border-radius: 4px;
          font-size: 0.8rem;
          font-family: monospace;
        }

        .classe-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #e0e7ff;
          color: #4f46e5;
          border-radius: 6px;
          font-size: 0.8rem;
        }

        .reduction-type-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #d1fae5;
          color: #059669;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .reduction-value {
          font-weight: 700;
          color: #059669;
        }

        .montant-original {
          text-decoration: line-through;
          color: #9ca3af;
        }

        .montant-actuel {
          font-weight: 700;
          color: #2D3E6f;
        }

        .actions-cell {
          display: flex;
          gap: 6px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #6b7280;
        }

        .action-edit:hover { color: #2D3E6f; border-color: #2D3E6f; }
        .action-delete:hover { color: #dc2626; border-color: #dc2626; }

        /* Historique Section */
        .historique-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .historique-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .historique-icon {
          width: 44px;
          height: 44px;
          background: #e0e7ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4f46e5;
          font-size: 1.1rem;
        }

        .historique-content {
          flex: 1;
        }

        .historique-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .action-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .action-modification { background: #fef3c7; color: #d97706; }
        .action-ajout { background: #d1fae5; color: #059669; }
        .action-suppression { background: #fee2e2; color: #dc2626; }

        .historique-niveau {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .historique-details {
          font-size: 0.9rem;
          color: #374151;
          margin: 0 0 8px 0;
        }

        .historique-meta {
          display: flex;
          gap: 16px;
        }

        .historique-user,
        .historique-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #9ca3af;
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
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 480px;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e9ecef;
        }

        .modal-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          color: #6b7280;
          cursor: pointer;
        }

        .modal-body {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-group input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .form-group input:disabled {
          background: #f3f4f6;
          color: #6b7280;
        }

        .form-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f3f4f6;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #e9ecef;
          justify-content: flex-end;
        }

        .btn-cancel {
          padding: 10px 20px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #374151;
          cursor: pointer;
        }

        .btn-save {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: #2D3E6f;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          color: white;
          cursor: pointer;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .tabs-container {
            flex-wrap: wrap;
          }

          .tab-btn {
            flex: 1;
            min-width: 150px;
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .gestion-frais {
            padding: 12px;
          }

          .header-content {
            flex-direction: column;
          }

          .tabs-container {
            flex-direction: column;
          }

          .tab-btn {
            width: 100%;
          }

          .reductions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
