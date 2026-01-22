import { useState } from 'react'

export default function ClasseDetail({ classe, onBack }) {
  const [activeTab, setActiveTab] = useState('informations')

  // Utiliser les données de la classe passée ou des valeurs par défaut
  const classeData = {
    nom: classe?.nom || '3ème Lycée - Spécialité C',
    cycle: classe?.niveau || 'Lycée',
    specialite: classe?.specialite || null,
    nombreEleves: classe?.effectif || 28,
    annee: classe?.annee || '3ème Année',
    salle: classe?.salle || 'Salle 309',
    anneeScolaireLabel: '2023-2024',
    effectif: classe?.effectif || 28,
    paiementsJour: Math.round((classe?.effectif || 28) * 0.82),
    montantPaiements: `${(classe?.effectif || 28) * 2000} MRU`,
    montantMensuel: '2000 MRU',
    retards: Math.round((classe?.effectif || 28) * 0.18),
    montantRetards: `${Math.round((classe?.effectif || 28) * 0.18) * 2000} MRU`,
    matieres: classe?.niveau === 'Lycée' ? 8 : classe?.niveau === 'Collège' ? 10 : 6,
    statut: classe?.statut || 'Active',
  }

  // Onglets
  const tabs = [
    { id: 'informations', label: 'Informations générales', icon: 'bi-info-circle' },
    { id: 'eleves', label: 'Liste des élèves', icon: 'bi-people', count: classeData.effectif },
    { id: 'paiements', label: 'Paiements', icon: 'bi-credit-card' },
    { id: 'matieres', label: 'Matières & enseignants', icon: 'bi-book' },
    { id: 'presences', label: 'Présences / Absences', icon: 'bi-calendar-check' },
    { id: 'documents', label: 'Documents', icon: 'bi-folder' },
  ]

  return (
    <div className="classe-detail-page">
      {/* Header Card */}
      <div className="classe-header-card">
        <div className="header-left">
          <div className="classe-icon">
            <i className="bi bi-mortarboard-fill"></i>
          </div>
          <div className="classe-info">
            <h1 className="classe-nom">{classeData.nom}</h1>
            <div className="classe-meta">
              <span className="meta-item">Cycle: <strong>{classeData.cycle}</strong></span>
              {classeData.specialite && (
                <span className="meta-item">Spécialité: <strong>{classeData.specialite}</strong></span>
              )}
            </div>
            <div className="classe-meta">
              <span className="meta-item">
                <i className="bi bi-people"></i> Nombre d'élèves: <strong>{classeData.nombreEleves}</strong>
              </span>
              <span className="meta-item">
                <i className="bi bi-calendar"></i> Année: <strong>{classeData.annee}</strong>
              </span>
              <span className="meta-item">
                <i className="bi bi-calendar3"></i> {classeData.anneeScolaireLabel}
              </span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-modifier">
            <i className="bi bi-pencil-fill"></i> Modifier classe
          </button>
          <button className="btn-retour" onClick={onBack}>
            <i className="bi bi-arrow-left"></i> Retour
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card stat-blue">
          <div className="stat-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{classeData.effectif}</span>
            <span className="stat-label">Élèves</span>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{classeData.paiementsJour}</span>
            <span className="stat-label">Paiements à jour</span>
            <span className="stat-sub">{classeData.montantPaiements} / Mois</span>
            <span className="stat-sub">{classeData.montantMensuel} par mois</span>
          </div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{classeData.retards}</span>
            <span className="stat-label">Retards paiements</span>
            <span className="stat-sub">{classeData.montantRetards} en attente</span>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon">
            <i className="bi bi-book-fill"></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{classeData.matieres}</span>
            <span className="stat-label">Matières enseignées</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`bi ${tab.icon}`}></i>
            <span>{tab.label}</span>
            {tab.count && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'informations' && (
          <div className="info-section">
            <div className="info-card">
              <div className="info-card-header">
                <i className="bi bi-info-circle-fill"></i>
                <span>Informations générales</span>
              </div>
              <div className="info-card-body">
                <div className="info-grid-modern">
                  <div className="info-cell">
                    <span className="info-cell-label">Cycle</span>
                    <span className="info-cell-value">{classeData.cycle}</span>
                  </div>
                  <div className="info-cell">
                    <span className="info-cell-label">Année scolaire</span>
                    <span className="info-cell-value">{classeData.anneeScolaireLabel}</span>
                  </div>
                  <div className="info-cell">
                    <span className="info-cell-label">Niveau</span>
                    <span className="info-cell-value">{classeData.annee}</span>
                  </div>
                  {classeData.specialite && (
                    <div className="info-cell">
                      <span className="info-cell-label">Spécialité</span>
                      <span className="info-cell-value">{classeData.specialite}</span>
                    </div>
                  )}
                  <div className="info-cell">
                    <span className="info-cell-label">Salle</span>
                    <span className="info-cell-value">{classeData.salle}</span>
                  </div>
                  <div className="info-cell">
                    <span className="info-cell-label">Effectif</span>
                    <span className="info-cell-value">{classeData.effectif} élèves sur 35 max</span>
                  </div>
                  <div className="info-cell">
                    <span className="info-cell-label">Statut</span>
                    <span className={`info-cell-value status-badge ${classeData.statut === 'Active' ? 'status-active' : 'status-inactive'}`}>
                      {classeData.statut}
                    </span>
                  </div>
                </div>
                <div className="comment-section">
                  <label className="comment-label">Commentaires</label>
                  <textarea className="comment-textarea" placeholder="Ajouter un commentaire..."></textarea>
                </div>
                <div className="info-actions">
                  <button className="btn-enregistrer">
                    <i className="bi bi-check-lg"></i> Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'eleves' && (
          <div className="eleves-section">
            <div className="info-card">
              <div className="info-card-header">
                <i className="bi bi-people-fill"></i>
                <span>Liste des élèves ({classeData.effectif})</span>
              </div>
              <div className="info-card-body">
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Date naissance</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Ould Ahmed</td>
                      <td>Mohamed</td>
                      <td>15/03/2007</td>
                      <td><span className="badge-green">Actif</span></td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Mint Sidi</td>
                      <td>Fatima</td>
                      <td>22/07/2007</td>
                      <td><span className="badge-green">Actif</span></td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>Ould Cheikh</td>
                      <td>Ahmed</td>
                      <td>10/11/2006</td>
                      <td><span className="badge-green">Actif</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'paiements' && (
          <div className="paiements-section">
            {/* Stats paiements améliorées */}
            <div className="paiements-stats">
              <div className="paiement-stat-card stat-paye">
                <div className="paiement-stat-icon">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <div className="paiement-stat-info">
                  <span className="paiement-stat-value">18</span>
                  <span className="paiement-stat-label">Élèves payés</span>
                </div>
              </div>
              <div className="paiement-stat-card stat-partiel">
                <div className="paiement-stat-icon">
                  <i className="bi bi-pie-chart-fill"></i>
                </div>
                <div className="paiement-stat-info">
                  <span className="paiement-stat-value">5</span>
                  <span className="paiement-stat-label">Paiements partiels</span>
                </div>
              </div>
              <div className="paiement-stat-card stat-retard">
                <div className="paiement-stat-icon">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div className="paiement-stat-info">
                  <span className="paiement-stat-value">5</span>
                  <span className="paiement-stat-label">En retard</span>
                </div>
              </div>
              <div className="paiement-stat-card stat-montant-paye">
                <div className="paiement-stat-icon">
                  <i className="bi bi-cash-stack"></i>
                </div>
                <div className="paiement-stat-info">
                  <span className="paiement-stat-value">41,000</span>
                  <span className="paiement-stat-label">Total payé (MRU)</span>
                </div>
              </div>
              <div className="paiement-stat-card stat-montant-restant">
                <div className="paiement-stat-icon">
                  <i className="bi bi-wallet2"></i>
                </div>
                <div className="paiement-stat-info">
                  <span className="paiement-stat-value">15,000</span>
                  <span className="paiement-stat-label">Restant (MRU)</span>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="paiements-toolbar">
              <div className="toolbar-left">
                <div className="search-input-wrapper">
                  <i className="bi bi-search"></i>
                  <input type="text" placeholder="Rechercher par nom ou matricule..." className="search-input" />
                </div>
                <select className="filter-select">
                  <option value="">Tous les statuts</option>
                  <option value="paye">Payé</option>
                  <option value="partiel">Partiel</option>
                  <option value="retard">En retard</option>
                </select>
              </div>
              <div className="toolbar-right">
                <button className="btn-export-paiement">
                  <i className="bi bi-download"></i>
                  <span>Exporter</span>
                </button>
                <button className="btn-add-paiement">
                  <i className="bi bi-plus-lg"></i>
                  <span>Nouveau paiement</span>
                </button>
              </div>
            </div>

            {/* Tableau paiements amélioré */}
            <div className="paiements-table-wrapper">
              <table className="paiements-table">
                <thead>
                  <tr>
                    <th>Nom de l'élève</th>
                    <th>Matricule / ID</th>
                    <th>Frais mensuels</th>
                    <th>Statut de paiement</th>
                    <th>Total payé</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Élève avec statut Payé - pas de bouton "Enregistrer paiement" */}
                  <tr>
                    <td>
                      <div className="eleve-cell">
                        <div className="eleve-avatar">
                          <i className="bi bi-person-fill"></i>
                        </div>
                        <span className="eleve-nom">Mohamed Ould Ahmed</span>
                      </div>
                    </td>
                    <td><span className="matricule-badge">ELV-2024-001</span></td>
                    <td><span className="montant">2,000 MRU</span></td>
                    <td><span className="statut-badge statut-paye"><i className="bi bi-check-circle-fill"></i> Payé</span></td>
                    <td><span className="montant-paye">2,000 MRU</span></td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn action-recu" title="Générer reçu">
                          <i className="bi bi-file-earmark-pdf"></i>
                        </button>
                        <button className="action-btn action-print" title="Imprimer reçu">
                          <i className="bi bi-printer"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Élève avec statut Payé */}
                  <tr>
                    <td>
                      <div className="eleve-cell">
                        <div className="eleve-avatar">
                          <i className="bi bi-person-fill"></i>
                        </div>
                        <span className="eleve-nom">Fatima Mint Sidi</span>
                      </div>
                    </td>
                    <td><span className="matricule-badge">ELV-2024-002</span></td>
                    <td><span className="montant">2,000 MRU</span></td>
                    <td><span className="statut-badge statut-paye"><i className="bi bi-check-circle-fill"></i> Payé</span></td>
                    <td><span className="montant-paye">2,000 MRU</span></td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn action-recu" title="Générer reçu">
                          <i className="bi bi-file-earmark-pdf"></i>
                        </button>
                        <button className="action-btn action-print" title="Imprimer reçu">
                          <i className="bi bi-printer"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Élève avec statut Partiel - affiche bouton "Enregistrer paiement" */}
                  <tr>
                    <td>
                      <div className="eleve-cell">
                        <div className="eleve-avatar">
                          <i className="bi bi-person-fill"></i>
                        </div>
                        <span className="eleve-nom">Ahmed Ould Cheikh</span>
                      </div>
                    </td>
                    <td><span className="matricule-badge">ELV-2024-003</span></td>
                    <td><span className="montant">2,000 MRU</span></td>
                    <td><span className="statut-badge statut-partiel"><i className="bi bi-pie-chart-fill"></i> Partiel</span></td>
                    <td>
                      <div className="montant-partiel-wrapper">
                        <span className="montant-partiel">1,200 MRU</span>
                        <span className="montant-restant-small">Reste: 800 MRU</span>
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn action-pay" title="Enregistrer paiement">
                          <i className="bi bi-credit-card"></i>
                        </button>
                        <button className="action-btn action-recu" title="Générer reçu">
                          <i className="bi bi-file-earmark-pdf"></i>
                        </button>
                        <button className="action-btn action-print" title="Imprimer reçu">
                          <i className="bi bi-printer"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Élève avec statut Partiel */}
                  <tr>
                    <td>
                      <div className="eleve-cell">
                        <div className="eleve-avatar">
                          <i className="bi bi-person-fill"></i>
                        </div>
                        <span className="eleve-nom">Mariem Mint Abdallah</span>
                      </div>
                    </td>
                    <td><span className="matricule-badge">ELV-2024-004</span></td>
                    <td><span className="montant">2,000 MRU</span></td>
                    <td><span className="statut-badge statut-partiel"><i className="bi bi-pie-chart-fill"></i> Partiel</span></td>
                    <td>
                      <div className="montant-partiel-wrapper">
                        <span className="montant-partiel">500 MRU</span>
                        <span className="montant-restant-small">Reste: 1,500 MRU</span>
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn action-pay" title="Enregistrer paiement">
                          <i className="bi bi-credit-card"></i>
                        </button>
                        <button className="action-btn action-recu" title="Générer reçu">
                          <i className="bi bi-file-earmark-pdf"></i>
                        </button>
                        <button className="action-btn action-print" title="Imprimer reçu">
                          <i className="bi bi-printer"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Élève avec statut En retard - affiche bouton "Enregistrer paiement" */}
                  <tr>
                    <td>
                      <div className="eleve-cell">
                        <div className="eleve-avatar">
                          <i className="bi bi-person-fill"></i>
                        </div>
                        <span className="eleve-nom">Aissata Mint Mohamed</span>
                      </div>
                    </td>
                    <td><span className="matricule-badge">ELV-2024-005</span></td>
                    <td><span className="montant">2,000 MRU</span></td>
                    <td><span className="statut-badge statut-retard"><i className="bi bi-exclamation-triangle-fill"></i> En retard</span></td>
                    <td>
                      <div className="montant-partiel-wrapper">
                        <span className="montant-retard">0 MRU</span>
                        <span className="montant-restant-small">Reste: 2,000 MRU</span>
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn action-pay" title="Enregistrer paiement">
                          <i className="bi bi-credit-card"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Autre élève En retard */}
                  <tr>
                    <td>
                      <div className="eleve-cell">
                        <div className="eleve-avatar">
                          <i className="bi bi-person-fill"></i>
                        </div>
                        <span className="eleve-nom">Sidi Ould Abdallah</span>
                      </div>
                    </td>
                    <td><span className="matricule-badge">ELV-2024-006</span></td>
                    <td><span className="montant">2,000 MRU</span></td>
                    <td><span className="statut-badge statut-retard"><i className="bi bi-exclamation-triangle-fill"></i> En retard</span></td>
                    <td>
                      <div className="montant-partiel-wrapper">
                        <span className="montant-retard">0 MRU</span>
                        <span className="montant-restant-small">Reste: 2,000 MRU</span>
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn action-pay" title="Enregistrer paiement">
                          <i className="bi bi-credit-card"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Élève Payé */}
                  <tr>
                    <td>
                      <div className="eleve-cell">
                        <div className="eleve-avatar">
                          <i className="bi bi-person-fill"></i>
                        </div>
                        <span className="eleve-nom">Khadija Mint Salem</span>
                      </div>
                    </td>
                    <td><span className="matricule-badge">ELV-2024-007</span></td>
                    <td><span className="montant">2,000 MRU</span></td>
                    <td><span className="statut-badge statut-paye"><i className="bi bi-check-circle-fill"></i> Payé</span></td>
                    <td><span className="montant-paye">2,000 MRU</span></td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn action-recu" title="Générer reçu">
                          <i className="bi bi-file-earmark-pdf"></i>
                        </button>
                        <button className="action-btn action-print" title="Imprimer reçu">
                          <i className="bi bi-printer"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="paiements-pagination">
              <span className="pagination-info">Affichage 1-7 sur {classeData.effectif} élèves</span>
              <div className="pagination-controls">
                <button className="pagination-btn" disabled><i className="bi bi-chevron-left"></i></button>
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn">2</button>
                <button className="pagination-btn">3</button>
                <button className="pagination-btn"><i className="bi bi-chevron-right"></i></button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matieres' && (
          <div className="matieres-section">
            {/* Liste des matières et enseignants */}
            <div className="info-card">
              <div className="info-card-header">
                <i className="bi bi-book-fill"></i>
                <span>Matières & enseignants</span>
              </div>
              <div className="info-card-body">
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>Matière</th>
                      <th>Enseignant</th>
                      <th>Heures/semaine</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="matiere-badge matiere-maths"><i className="bi bi-calculator"></i> Mathématiques</span></td>
                      <td>M. Mohamed Ould Amar</td>
                      <td>6h</td>
                    </tr>
                    <tr>
                      <td><span className="matiere-badge matiere-physique"><i className="bi bi-lightning"></i> Physique-Chimie</span></td>
                      <td>Mme. Fatima Mint Ali</td>
                      <td>5h</td>
                    </tr>
                    <tr>
                      <td><span className="matiere-badge matiere-francais"><i className="bi bi-chat-quote"></i> Français</span></td>
                      <td>M. Ahmed Ould Salem</td>
                      <td>4h</td>
                    </tr>
                    <tr>
                      <td><span className="matiere-badge matiere-arabe"><i className="bi bi-translate"></i> Arabe</span></td>
                      <td>Mme. Aissata Mint Sidi</td>
                      <td>4h</td>
                    </tr>
                    <tr>
                      <td><span className="matiere-badge matiere-anglais"><i className="bi bi-globe"></i> Anglais</span></td>
                      <td>M. Sidi Ould Mohamed</td>
                      <td>3h</td>
                    </tr>
                    <tr>
                      <td><span className="matiere-badge matiere-svt"><i className="bi bi-tree"></i> SVT</span></td>
                      <td>Mme. Mariem Mint Ahmed</td>
                      <td>3h</td>
                    </tr>
                    <tr>
                      <td><span className="matiere-badge matiere-histoire"><i className="bi bi-clock-history"></i> Histoire-Géo</span></td>
                      <td>M. Abdallah Ould Sidi</td>
                      <td>3h</td>
                    </tr>
                    <tr>
                      <td><span className="matiere-badge matiere-sport"><i className="bi bi-dribbble"></i> Sport</span></td>
                      <td>M. Omar Ould Cheikh</td>
                      <td>2h</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Emploi du temps */}
            <div className="info-card mt-20">
              <div className="info-card-header">
                <i className="bi bi-calendar-week-fill"></i>
                <span>Emploi du temps</span>
                <div className="header-actions-right">
                  <button className="btn-print-emploi">
                    <i className="bi bi-printer"></i>
                    <span>Imprimer</span>
                  </button>
                  <button className="btn-export-emploi">
                    <i className="bi bi-download"></i>
                    <span>Exporter PDF</span>
                  </button>
                </div>
              </div>
              <div className="info-card-body">
                <div className="emploi-du-temps">
                  <table className="emploi-table">
                    <thead>
                      <tr>
                        <th className="time-col">Horaire</th>
                        <th>Lundi</th>
                        <th>Mardi</th>
                        <th>Mercredi</th>
                        <th>Jeudi</th>
                        <th>Vendredi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="time-cell">08:00 - 09:00</td>
                        <td><div className="cours-cell matiere-maths"><span className="cours-nom">Mathématiques</span><span className="cours-prof">M. Ould Amar</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-francais"><span className="cours-nom">Français</span><span className="cours-prof">M. Ould Salem</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-arabe"><span className="cours-nom">Arabe</span><span className="cours-prof">Mme. Mint Sidi</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-physique"><span className="cours-nom">Physique-Chimie</span><span className="cours-prof">Mme. Mint Ali</span><span className="cours-salle">Labo</span></div></td>
                        <td><div className="cours-cell matiere-maths"><span className="cours-nom">Mathématiques</span><span className="cours-prof">M. Ould Amar</span><span className="cours-salle">Salle 309</span></div></td>
                      </tr>
                      <tr>
                        <td className="time-cell">09:00 - 10:00</td>
                        <td><div className="cours-cell matiere-maths"><span className="cours-nom">Mathématiques</span><span className="cours-prof">M. Ould Amar</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-francais"><span className="cours-nom">Français</span><span className="cours-prof">M. Ould Salem</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-arabe"><span className="cours-nom">Arabe</span><span className="cours-prof">Mme. Mint Sidi</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-physique"><span className="cours-nom">Physique-Chimie</span><span className="cours-prof">Mme. Mint Ali</span><span className="cours-salle">Labo</span></div></td>
                        <td><div className="cours-cell matiere-anglais"><span className="cours-nom">Anglais</span><span className="cours-prof">M. Ould Mohamed</span><span className="cours-salle">Salle 309</span></div></td>
                      </tr>
                      <tr className="pause-row">
                        <td className="time-cell">10:00 - 10:15</td>
                        <td colSpan="5"><div className="pause-cell"><i className="bi bi-cup-hot"></i> Pause</div></td>
                      </tr>
                      <tr>
                        <td className="time-cell">10:15 - 11:15</td>
                        <td><div className="cours-cell matiere-physique"><span className="cours-nom">Physique-Chimie</span><span className="cours-prof">Mme. Mint Ali</span><span className="cours-salle">Labo</span></div></td>
                        <td><div className="cours-cell matiere-svt"><span className="cours-nom">SVT</span><span className="cours-prof">Mme. Mint Ahmed</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-maths"><span className="cours-nom">Mathématiques</span><span className="cours-prof">M. Ould Amar</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-histoire"><span className="cours-nom">Histoire-Géo</span><span className="cours-prof">M. Ould Sidi</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-francais"><span className="cours-nom">Français</span><span className="cours-prof">M. Ould Salem</span><span className="cours-salle">Salle 309</span></div></td>
                      </tr>
                      <tr>
                        <td className="time-cell">11:15 - 12:15</td>
                        <td><div className="cours-cell matiere-anglais"><span className="cours-nom">Anglais</span><span className="cours-prof">M. Ould Mohamed</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-svt"><span className="cours-nom">SVT</span><span className="cours-prof">Mme. Mint Ahmed</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-maths"><span className="cours-nom">Mathématiques</span><span className="cours-prof">M. Ould Amar</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-histoire"><span className="cours-nom">Histoire-Géo</span><span className="cours-prof">M. Ould Sidi</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-arabe"><span className="cours-nom">Arabe</span><span className="cours-prof">Mme. Mint Sidi</span><span className="cours-salle">Salle 309</span></div></td>
                      </tr>
                      <tr className="pause-row">
                        <td className="time-cell">12:15 - 14:00</td>
                        <td colSpan="5"><div className="pause-cell pause-dejeuner"><i className="bi bi-egg-fried"></i> Pause déjeuner</div></td>
                      </tr>
                      <tr>
                        <td className="time-cell">14:00 - 15:00</td>
                        <td><div className="cours-cell matiere-arabe"><span className="cours-nom">Arabe</span><span className="cours-prof">Mme. Mint Sidi</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-maths"><span className="cours-nom">Mathématiques</span><span className="cours-prof">M. Ould Amar</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell empty-cell"></div></td>
                        <td><div className="cours-cell matiere-anglais"><span className="cours-nom">Anglais</span><span className="cours-prof">M. Ould Mohamed</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-svt"><span className="cours-nom">SVT</span><span className="cours-prof">Mme. Mint Ahmed</span><span className="cours-salle">Salle 309</span></div></td>
                      </tr>
                      <tr>
                        <td className="time-cell">15:00 - 16:00</td>
                        <td><div className="cours-cell matiere-histoire"><span className="cours-nom">Histoire-Géo</span><span className="cours-prof">M. Ould Sidi</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-sport"><span className="cours-nom">Sport</span><span className="cours-prof">M. Ould Cheikh</span><span className="cours-salle">Terrain</span></div></td>
                        <td><div className="cours-cell empty-cell"></div></td>
                        <td><div className="cours-cell matiere-francais"><span className="cours-nom">Français</span><span className="cours-prof">M. Ould Salem</span><span className="cours-salle">Salle 309</span></div></td>
                        <td><div className="cours-cell matiere-sport"><span className="cours-nom">Sport</span><span className="cours-prof">M. Ould Cheikh</span><span className="cours-salle">Terrain</span></div></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Légende */}
                <div className="emploi-legende">
                  <span className="legende-title">Légende:</span>
                  <div className="legende-items">
                    <span className="legende-item"><span className="legende-color matiere-maths"></span>Mathématiques</span>
                    <span className="legende-item"><span className="legende-color matiere-physique"></span>Physique-Chimie</span>
                    <span className="legende-item"><span className="legende-color matiere-francais"></span>Français</span>
                    <span className="legende-item"><span className="legende-color matiere-arabe"></span>Arabe</span>
                    <span className="legende-item"><span className="legende-color matiere-anglais"></span>Anglais</span>
                    <span className="legende-item"><span className="legende-color matiere-svt"></span>SVT</span>
                    <span className="legende-item"><span className="legende-color matiere-histoire"></span>Histoire-Géo</span>
                    <span className="legende-item"><span className="legende-color matiere-sport"></span>Sport</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'presences' && (
          <div className="presences-section">
            <div className="info-card">
              <div className="info-card-header">
                <i className="bi bi-calendar-check-fill"></i>
                <span>Présences / Absences</span>
              </div>
              <div className="info-card-body">
                <p className="text-muted">Suivi des présences et absences...</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-section">
            <div className="info-card">
              <div className="info-card-header">
                <i className="bi bi-folder-fill"></i>
                <span>Documents</span>
              </div>
              <div className="info-card-body">
                <p className="text-muted">Documents de la classe...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .classe-detail-page {
          padding: 20px;
          background: #f5f6fa;
          min-height: 100%;
        }

        /* Header Card */
        .classe-header-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-left {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .classe-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .classe-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .classe-nom {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .classe-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 0.8rem;
          color: #6b7280;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .meta-item strong {
          color: #374151;
        }

        .meta-item i {
          color: #9ca3af;
        }

        .header-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-modifier {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-modifier:hover {
          background: #2563eb;
        }

        .btn-retour {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: white;
          color: #6b7280;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-retour:hover {
          background: #f9fafb;
        }

        /* Stats Cards */
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .stat-blue .stat-icon {
          background: #dbeafe;
          color: #2563eb;
        }

        .stat-green .stat-icon {
          background: #d1fae5;
          color: #059669;
        }

        .stat-orange .stat-icon {
          background: #fed7aa;
          color: #ea580c;
        }

        .stat-purple .stat-icon {
          background: #e9d5ff;
          color: #9333ea;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .stat-sub {
          font-size: 0.7rem;
          color: #9ca3af;
        }

        /* Tabs Navigation */
        .tabs-navigation {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
          background: white;
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #f3f4f6;
          border: none;
          border-radius: 6px;
          font-size: 0.8rem;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          background: #e5e7eb;
        }

        .tab-btn.active {
          background: #3b82f6;
          color: white;
        }

        .tab-count {
          background: rgba(255,255,255,0.2);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.7rem;
        }

        .tab-btn.active .tab-count {
          background: rgba(255,255,255,0.3);
        }

        /* Tab Content */
        .tab-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        /* Info Card */
        .info-card {
          overflow: hidden;
        }

        .info-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .info-card-header i {
          color: #3b82f6;
          font-size: 1rem;
        }

        .info-card-header span {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }

        .info-card-body {
          padding: 20px;
        }

        /* Info Grid Modern */
        .info-grid-modern {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .info-cell {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border: 1px solid #e9ecef;
          transition: all 0.2s ease;
        }

        .info-cell:hover {
          background: #f1f3f5;
          border-color: #dee2e6;
        }

        .info-cell-label {
          font-size: 0.7rem;
          color: #6c757d;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-cell-value {
          font-size: 0.9rem;
          color: #212529;
          font-weight: 600;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          width: fit-content;
        }

        .status-active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        /* Comment Section */
        .comment-section {
          margin-bottom: 20px;
        }

        .comment-label {
          display: block;
          font-size: 0.75rem;
          color: #6c757d;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .comment-textarea {
          width: 100%;
          min-height: 100px;
          padding: 12px 14px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.85rem;
          resize: vertical;
          background: #f8f9fa;
          color: #212529;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .comment-textarea:focus {
          outline: none;
          border-color: #2D3E6f;
          background: white;
          box-shadow: 0 0 0 3px rgba(45, 62, 111, 0.1);
        }

        .comment-textarea::placeholder {
          color: #adb5bd;
        }

        /* Info Actions */
        .info-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid #e9ecef;
        }

        .btn-enregistrer {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #2D3E6f;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-enregistrer:hover {
          background: #243256;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(45, 62, 111, 0.25);
        }

        /* Simple Table */
        .simple-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }

        .simple-table th {
          text-align: left;
          padding: 10px 12px;
          background: #f9fafb;
          color: #6b7280;
          font-weight: 500;
          border-bottom: 1px solid #e5e7eb;
        }

        .simple-table td {
          padding: 10px 12px;
          color: #374151;
          border-bottom: 1px solid #f3f4f6;
        }

        .badge-green {
          display: inline-block;
          padding: 2px 8px;
          background: #d1fae5;
          color: #065f46;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .text-muted {
          color: #9ca3af;
          font-size: 0.85rem;
        }

        /* Matières Section */
        .matieres-section {
          padding: 20px;
        }

        .mt-20 {
          margin-top: 20px;
        }

        .matiere-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .matiere-maths {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .matiere-physique {
          background: #fce7f3;
          color: #be185d;
        }

        .matiere-francais {
          background: #e0e7ff;
          color: #4338ca;
        }

        .matiere-arabe {
          background: #d1fae5;
          color: #047857;
        }

        .matiere-anglais {
          background: #fef3c7;
          color: #b45309;
        }

        .matiere-svt {
          background: #dcfce7;
          color: #15803d;
        }

        .matiere-histoire {
          background: #fed7aa;
          color: #c2410c;
        }

        .matiere-sport {
          background: #e9d5ff;
          color: #7c3aed;
        }

        /* Header actions in card */
        .header-actions-right {
          margin-left: auto;
          display: flex;
          gap: 8px;
        }

        .btn-print-emploi,
        .btn-export-emploi {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-print-emploi {
          background: white;
          border: 1px solid #e5e7eb;
          color: #374151;
        }

        .btn-print-emploi:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .btn-export-emploi {
          background: #2D3E6f;
          border: none;
          color: white;
        }

        .btn-export-emploi:hover {
          background: #243256;
        }

        /* Emploi du temps */
        .emploi-du-temps {
          overflow-x: auto;
        }

        .emploi-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .emploi-table th {
          padding: 12px 8px;
          background: #f8f9fa;
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
          text-align: center;
          border: 1px solid #e9ecef;
        }

        .emploi-table th.time-col {
          width: 100px;
          background: #2D3E6f;
          color: white;
        }

        .emploi-table td {
          padding: 4px;
          border: 1px solid #e9ecef;
          vertical-align: top;
          height: 80px;
        }

        .time-cell {
          background: #f8f9fa;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-align: center;
          vertical-align: middle !important;
        }

        .cours-cell {
          height: 100%;
          padding: 8px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          transition: all 0.2s;
        }

        .cours-cell:hover {
          transform: scale(1.02);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .cours-nom {
          font-size: 0.75rem;
          font-weight: 700;
        }

        .cours-prof {
          font-size: 0.65rem;
          opacity: 0.8;
        }

        .cours-salle {
          font-size: 0.6rem;
          opacity: 0.7;
          margin-top: auto;
        }

        .empty-cell {
          background: #f9fafb;
          border: 2px dashed #e5e7eb;
        }

        .pause-row td {
          height: 40px;
        }

        .pause-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 100%;
          background: #f3f4f6;
          border-radius: 8px;
          color: #6b7280;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .pause-dejeuner {
          background: #fef3c7;
          color: #b45309;
        }

        /* Légende emploi du temps */
        .emploi-legende {
          margin-top: 20px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .legende-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
        }

        .legende-items {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .legende-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .legende-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
        }

        .legende-color.matiere-maths { background: #dbeafe; }
        .legende-color.matiere-physique { background: #fce7f3; }
        .legende-color.matiere-francais { background: #e0e7ff; }
        .legende-color.matiere-arabe { background: #d1fae5; }
        .legende-color.matiere-anglais { background: #fef3c7; }
        .legende-color.matiere-svt { background: #dcfce7; }
        .legende-color.matiere-histoire { background: #fed7aa; }
        .legende-color.matiere-sport { background: #e9d5ff; }

        /* Paiements Section */
        .paiements-section {
          padding: 20px;
        }

        .paiements-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .paiement-stat-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid #e9ecef;
        }

        .paiement-stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .stat-total .paiement-stat-icon {
          background: #e0e7ff;
          color: #4f46e5;
        }

        .stat-paye .paiement-stat-icon {
          background: #d1fae5;
          color: #059669;
        }

        .stat-partiel .paiement-stat-icon {
          background: #fef3c7;
          color: #d97706;
        }

        .stat-attente .paiement-stat-icon {
          background: #fef3c7;
          color: #d97706;
        }

        .stat-retard .paiement-stat-icon {
          background: #fee2e2;
          color: #dc2626;
        }

        .stat-montant-paye .paiement-stat-icon {
          background: #d1fae5;
          color: #059669;
        }

        .stat-montant-restant .paiement-stat-icon {
          background: #fef3c7;
          color: #d97706;
        }

        .paiement-stat-info {
          display: flex;
          flex-direction: column;
        }

        .paiement-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .paiement-stat-label {
          font-size: 0.8rem;
          color: #6b7280;
        }

        /* Paiements Toolbar */
        .paiements-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .paiements-toolbar .toolbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-input-wrapper i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-input {
          padding: 10px 12px 10px 38px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.85rem;
          width: 250px;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #2D3E6f;
          box-shadow: 0 0 0 3px rgba(45, 62, 111, 0.1);
        }

        .filter-select {
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.85rem;
          background: white;
          color: #374151;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: #2D3E6f;
        }

        .paiements-toolbar .toolbar-right {
          display: flex;
          gap: 10px;
        }

        .btn-export-paiement {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-export-paiement:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .btn-add-paiement {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: #2D3E6f;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-add-paiement:hover {
          background: #243256;
        }

        /* Paiements Table */
        .paiements-table-wrapper {
          background: white;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          overflow: hidden;
        }

        .paiements-table {
          width: 100%;
          border-collapse: collapse;
        }

        .paiements-table thead {
          background: #f8f9fa;
        }

        .paiements-table th {
          padding: 14px 16px;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e9ecef;
        }

        .paiements-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .paiements-table tbody tr:hover {
          background: #f9fafb;
        }

        .paiements-table tbody tr:last-child td {
          border-bottom: none;
        }

        .table-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #2D3E6f;
        }

        .eleve-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .eleve-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-size: 1rem;
        }

        .eleve-info {
          display: flex;
          flex-direction: column;
        }

        .eleve-nom {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1f2937;
        }

        .eleve-id {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .classe-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #e0e7ff;
          color: #4f46e5;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .montant {
          font-weight: 600;
          color: #1f2937;
        }

        .statut-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .statut-paye {
          background: #d1fae5;
          color: #059669;
        }

        .statut-partiel {
          background: #fef3c7;
          color: #d97706;
        }

        .statut-attente {
          background: #fef3c7;
          color: #d97706;
        }

        .statut-retard {
          background: #fee2e2;
          color: #dc2626;
        }

        /* Matricule badge */
        .matricule-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #f3f4f6;
          color: #374151;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          font-family: 'Consolas', 'Monaco', monospace;
        }

        /* Montant styles */
        .montant-paye {
          font-weight: 600;
          color: #059669;
        }

        .montant-partiel {
          font-weight: 600;
          color: #d97706;
        }

        .montant-retard {
          font-weight: 600;
          color: #dc2626;
        }

        .montant-partiel-wrapper {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .montant-restant-small {
          font-size: 0.7rem;
          color: #9ca3af;
        }

        /* Action recu button */
        .action-recu:hover {
          color: #dc2626;
          border-color: #dc2626;
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
          transition: all 0.2s;
          color: #6b7280;
        }

        .action-btn:hover {
          background: #f3f4f6;
        }

        .action-view:hover {
          color: #2563eb;
          border-color: #2563eb;
        }

        .action-print:hover {
          color: #059669;
          border-color: #059669;
        }

        .action-pay:hover {
          color: #d97706;
          border-color: #d97706;
        }

        .action-remind:hover {
          color: #dc2626;
          border-color: #dc2626;
        }

        /* Pagination */
        .paiements-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          margin-top: 16px;
        }

        .pagination-info {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .pagination-controls {
          display: flex;
          gap: 6px;
        }

        .pagination-btn {
          min-width: 36px;
          height: 36px;
          padding: 0 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          color: #374151;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .pagination-btn.active {
          background: #2D3E6f;
          border-color: #2D3E6f;
          color: white;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 1400px) {
          .paiements-stats {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 1200px) {
          .info-grid-modern {
            grid-template-columns: repeat(3, 1fr);
          }

          .paiements-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 992px) {
          .stats-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .info-grid-modern {
            grid-template-columns: repeat(2, 1fr);
          }

          .classe-header-card {
            flex-direction: column;
          }

          .paiements-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .paiements-toolbar .toolbar-left,
          .paiements-toolbar .toolbar-right {
            width: 100%;
            justify-content: space-between;
          }

          .search-input {
            width: 100%;
            flex: 1;
          }

          .paiements-table-wrapper {
            overflow-x: auto;
          }
        }

        @media (max-width: 576px) {
          .classe-detail-page {
            padding: 12px;
          }

          .stats-cards {
            grid-template-columns: 1fr;
          }

          .info-grid-modern {
            grid-template-columns: 1fr;
          }

          .tabs-navigation {
            overflow-x: auto;
            flex-wrap: nowrap;
          }

          .tab-btn {
            white-space: nowrap;
          }

          .info-actions {
            justify-content: center;
          }

          .btn-enregistrer {
            width: 100%;
            justify-content: center;
          }

          .paiements-stats {
            grid-template-columns: 1fr;
          }

          .paiements-toolbar .toolbar-left,
          .paiements-toolbar .toolbar-right {
            flex-direction: column;
            gap: 8px;
          }

          .filter-select {
            width: 100%;
          }

          .btn-export-paiement,
          .btn-add-paiement {
            width: 100%;
            justify-content: center;
          }

          .paiements-pagination {
            flex-direction: column;
            gap: 12px;
            align-items: center;
          }
        }
      `}</style>
    </div>
  )
}
