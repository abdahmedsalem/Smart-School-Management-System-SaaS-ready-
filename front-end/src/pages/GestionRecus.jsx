import { useState, useMemo } from 'react'
import { jsPDF } from 'jspdf'

// Mock data des reçus
const mockRecus = [
  { id: 1, numero: 'REC-20260106-001', eleve: 'Mohamed Ould Ahmed', matricule: 'ELV-2024-001', classe: '3ème Lycée - C', montant: 2000, date: '06/01/2026', modePaiement: 'Espèces', statut: 'valide' },
  { id: 2, numero: 'REC-20260105-002', eleve: 'Fatima Mint Sidi', matricule: 'ELV-2024-002', classe: '2ème Lycée - A', montant: 2000, date: '05/01/2026', modePaiement: 'Virement', statut: 'valide' },
  { id: 3, numero: 'REC-20260105-003', eleve: 'Ahmed Ould Cheikh', matricule: 'ELV-2024-003', classe: '4ème Collège', montant: 1500, date: '05/01/2026', modePaiement: 'Espèces', statut: 'valide' },
  { id: 4, numero: 'REC-20260104-004', eleve: 'Aissata Mint Mohamed', matricule: 'ELV-2024-004', classe: '6ème Primaire', montant: 1000, date: '04/01/2026', modePaiement: 'Mobile Money', statut: 'valide' },
  { id: 5, numero: 'REC-20260104-005', eleve: 'Sidi Ould Abdallah', matricule: 'ELV-2024-005', classe: '3ème Collège', montant: 800, date: '04/01/2026', modePaiement: 'Espèces', statut: 'valide' },
  { id: 6, numero: 'REC-20260103-006', eleve: 'Mariem Mint Salem', matricule: 'ELV-2024-006', classe: '1ère Lycée - D', montant: 2000, date: '03/01/2026', modePaiement: 'Chèque', statut: 'valide' },
  { id: 7, numero: 'REC-20260103-007', eleve: 'Cheikh Ould Amar', matricule: 'ELV-2024-007', classe: '2ème Collège', montant: 1500, date: '03/01/2026', modePaiement: 'Virement', statut: 'annule' },
  { id: 8, numero: 'REC-20260102-008', eleve: 'Khadija Mint Ali', matricule: 'ELV-2024-008', classe: '5ème Primaire', montant: 1000, date: '02/01/2026', modePaiement: 'Espèces', statut: 'valide' },
  { id: 9, numero: 'REC-20251228-009', eleve: 'Omar Ould Mohamed', matricule: 'ELV-2024-009', classe: '4ème Primaire', montant: 1000, date: '28/12/2025', modePaiement: 'Espèces', statut: 'valide' },
  { id: 10, numero: 'REC-20251228-010', eleve: 'Aminata Mint Cheikh', matricule: 'ELV-2024-010', classe: '3ème Lycée - D', montant: 1500, date: '28/12/2025', modePaiement: 'Mobile Money', statut: 'valide' },
]

const classes = [
  "3ème Lycée - C", "3ème Lycée - D", "2ème Lycée - A", "1ère Lycée - D",
  "4ème Collège", "3ème Collège", "2ème Collège",
  "6ème Primaire", "5ème Primaire", "4ème Primaire"
]

const modesPaiement = ['Espèces', 'Virement', 'Chèque', 'Mobile Money']

export default function GestionRecus() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClasse, setFilterClasse] = useState('')
  const [filterMode, setFilterMode] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [selectedRecus, setSelectedRecus] = useState([])
  const [showRecuModal, setShowRecuModal] = useState(false)
  const [selectedRecu, setSelectedRecu] = useState(null)

  // Filtrage des données
  const filteredData = useMemo(() => {
    let result = [...mockRecus]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(item =>
        item.eleve.toLowerCase().includes(search) ||
        item.matricule.toLowerCase().includes(search) ||
        item.numero.toLowerCase().includes(search)
      )
    }

    if (filterClasse) {
      result = result.filter(item => item.classe === filterClasse)
    }

    if (filterMode) {
      result = result.filter(item => item.modePaiement === filterMode)
    }

    if (filterStatut) {
      result = result.filter(item => item.statut === filterStatut)
    }

    return result
  }, [searchTerm, filterClasse, filterMode, filterStatut])

  // Statistiques
  const stats = useMemo(() => {
    const total = filteredData.length
    const valides = filteredData.filter(r => r.statut === 'valide').length
    const annules = filteredData.filter(r => r.statut === 'annule').length
    const montantTotal = filteredData
      .filter(r => r.statut === 'valide')
      .reduce((acc, r) => acc + r.montant, 0)

    return { total, valides, annules, montantTotal }
  }, [filteredData])

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR').format(montant)
  }

  // Toggle selection
  const toggleSelection = (id) => {
    setSelectedRecus(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedRecus.length === filteredData.length) {
      setSelectedRecus([])
    } else {
      setSelectedRecus(filteredData.map(r => r.id))
    }
  }

  // Génération PDF
  const generatePDF = (recu) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    // En-tête
    doc.setFillColor(45, 62, 111)
    doc.rect(0, 0, pageWidth, 45, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('ÉCOLE EXEMPLE', pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('123 Rue de l\'Éducation, Nouakchott, Mauritanie', pageWidth / 2, 28, { align: 'center' })
    doc.text('Tél: +222 XX XX XX XX | Email: contact@ecole-exemple.mr', pageWidth / 2, 35, { align: 'center' })

    // Titre du reçu
    doc.setTextColor(45, 62, 111)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('REÇU DE PAIEMENT', pageWidth / 2, 60, { align: 'center' })

    // Ligne décorative
    doc.setDrawColor(45, 62, 111)
    doc.setLineWidth(0.5)
    doc.line(60, 65, pageWidth - 60, 65)

    // Infos reçu
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.text(`N° Reçu: ${recu.numero}`, 20, 80)
    doc.text(`Date: ${recu.date}`, pageWidth - 20, 80, { align: 'right' })

    // Cadre informations élève
    doc.setFillColor(248, 249, 250)
    doc.roundedRect(20, 90, pageWidth - 40, 50, 3, 3, 'F')

    doc.setTextColor(45, 62, 111)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMATIONS DE L\'ÉLÈVE', 30, 103)

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Nom complet:', 30, 118)
    doc.setFont('helvetica', 'bold')
    doc.text(recu.eleve, 70, 118)

    doc.setFont('helvetica', 'normal')
    doc.text('Matricule:', 30, 128)
    doc.setFont('helvetica', 'bold')
    doc.text(recu.matricule, 70, 128)

    doc.setFont('helvetica', 'normal')
    doc.text('Classe:', 120, 118)
    doc.setFont('helvetica', 'bold')
    doc.text(recu.classe, 145, 118)

    // Détails du paiement
    doc.setTextColor(45, 62, 111)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('DÉTAILS DU PAIEMENT', 30, 160)

    // Tableau
    doc.setFillColor(45, 62, 111)
    doc.rect(20, 165, pageWidth - 40, 12, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Description', 25, 173)
    doc.text('Montant', pageWidth - 25, 173, { align: 'right' })

    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'normal')
    doc.rect(20, 177, pageWidth - 40, 12, 'S')
    doc.text('Frais de scolarité', 25, 185)
    doc.text(`${formatMontant(recu.montant)} MRU`, pageWidth - 25, 185, { align: 'right' })

    doc.setFillColor(240, 253, 244)
    doc.rect(20, 189, pageWidth - 40, 12, 'F')
    doc.setDrawColor(200, 200, 200)
    doc.rect(20, 189, pageWidth - 40, 12, 'S')
    doc.setTextColor(5, 150, 105)
    doc.setFont('helvetica', 'bold')
    doc.text('Mode de paiement', 25, 197)
    doc.text(recu.modePaiement, pageWidth - 25, 197, { align: 'right' })

    // Montant total
    doc.setFillColor(45, 62, 111)
    doc.rect(20, 210, pageWidth - 40, 14, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.text('TOTAL PAYÉ', 25, 219)
    doc.text(`${formatMontant(recu.montant)} MRU`, pageWidth - 25, 219, { align: 'right' })

    // Zone de signature
    doc.setDrawColor(200, 200, 200)
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    doc.line(20, 255, 80, 255)
    doc.text('Signature du responsable', 25, 262)

    doc.line(pageWidth - 80, 255, pageWidth - 20, 255)
    doc.text('Cachet de l\'établissement', pageWidth - 75, 262)

    // Pied de page
    doc.setFillColor(248, 249, 250)
    doc.rect(0, 280, pageWidth, 20, 'F')
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(8)
    doc.text('Ce reçu est généré automatiquement et fait foi de paiement.', pageWidth / 2, 288, { align: 'center' })
    doc.text(`Document généré le ${currentDate}`, pageWidth / 2, 294, { align: 'center' })

    doc.save(`${recu.numero}.pdf`)
  }

  // Impression
  const printRecu = (recu) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reçu ${recu.numero}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #333; }
          .receipt { max-width: 600px; margin: 0 auto; border: 2px solid #2D3E6f; border-radius: 8px; overflow: hidden; }
          .header { background: #2D3E6f; color: white; padding: 20px; text-align: center; }
          .header h1 { font-size: 24px; margin-bottom: 8px; }
          .header p { font-size: 12px; opacity: 0.9; }
          .content { padding: 25px; }
          .receipt-title { text-align: center; color: #2D3E6f; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #2D3E6f; padding-bottom: 10px; }
          .receipt-info { display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 20px; }
          .student-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .student-info h3 { color: #2D3E6f; font-size: 14px; margin-bottom: 12px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .info-item label { font-size: 11px; color: #666; }
          .info-item span { display: block; font-weight: 600; font-size: 13px; }
          .payment-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .payment-table th { background: #2D3E6f; color: white; padding: 10px; text-align: left; font-size: 12px; }
          .payment-table td { padding: 10px; border-bottom: 1px solid #eee; font-size: 12px; }
          .payment-table .total-row { background: #2D3E6f; color: white; font-weight: bold; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
          .signature-box { text-align: center; }
          .signature-line { width: 150px; border-top: 1px solid #999; margin-bottom: 5px; }
          .signature-label { font-size: 10px; color: #666; }
          .footer { background: #f8f9fa; padding: 12px; text-align: center; font-size: 10px; color: #999; }
          @media print { body { padding: 0; } .receipt { border: none; } }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>ÉCOLE EXEMPLE</h1>
            <p>123 Rue de l'Éducation, Nouakchott, Mauritanie</p>
            <p>Tél: +222 XX XX XX XX | Email: contact@ecole-exemple.mr</p>
          </div>
          <div class="content">
            <h2 class="receipt-title">REÇU DE PAIEMENT</h2>
            <div class="receipt-info">
              <span>N° Reçu: ${recu.numero}</span>
              <span>Date: ${recu.date}</span>
            </div>
            <div class="student-info">
              <h3>INFORMATIONS DE L'ÉLÈVE</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Nom complet</label>
                  <span>${recu.eleve}</span>
                </div>
                <div class="info-item">
                  <label>Matricule</label>
                  <span>${recu.matricule}</span>
                </div>
                <div class="info-item">
                  <label>Classe</label>
                  <span>${recu.classe}</span>
                </div>
                <div class="info-item">
                  <label>Mode de paiement</label>
                  <span>${recu.modePaiement}</span>
                </div>
              </div>
            </div>
            <table class="payment-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Frais de scolarité</td>
                  <td style="text-align: right;">${formatMontant(recu.montant)} MRU</td>
                </tr>
                <tr class="total-row">
                  <td><strong>TOTAL PAYÉ</strong></td>
                  <td style="text-align: right;"><strong>${formatMontant(recu.montant)} MRU</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="signatures">
              <div class="signature-box">
                <div class="signature-line"></div>
                <span class="signature-label">Signature du responsable</span>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <span class="signature-label">Cachet de l'établissement</span>
              </div>
            </div>
          </div>
          <div class="footer">
            Ce reçu est généré automatiquement et fait foi de paiement.
          </div>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  // Voir détails reçu
  const viewRecu = (recu) => {
    setSelectedRecu(recu)
    setShowRecuModal(true)
  }

  return (
    <div className="gestion-recus">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">
              <i className="bi bi-receipt"></i>
              Gestion des Reçus
            </h1>
            <p className="page-subtitle">Historique et gestion de tous les reçus de paiement</p>
          </div>
          <div className="header-actions">
            {selectedRecus.length > 0 && (
              <button className="btn-secondary">
                <i className="bi bi-download"></i>
                <span>Télécharger ({selectedRecus.length})</span>
              </button>
            )}
            <button className="btn-primary">
              <i className="bi bi-file-earmark-pdf"></i>
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">
            <i className="bi bi-receipt"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total reçus</span>
          </div>
        </div>
        <div className="stat-card stat-valide">
          <div className="stat-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.valides}</span>
            <span className="stat-label">Reçus valides</span>
          </div>
        </div>
        <div className="stat-card stat-annule">
          <div className="stat-icon">
            <i className="bi bi-x-circle-fill"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.annules}</span>
            <span className="stat-label">Reçus annulés</span>
          </div>
        </div>
        <div className="stat-card stat-montant">
          <div className="stat-icon">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatMontant(stats.montantTotal)}</span>
            <span className="stat-label">Montant total (MRU)</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Rechercher par nom, matricule ou numéro de reçu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters-row">
          <select
            className="filter-select"
            value={filterClasse}
            onChange={(e) => setFilterClasse(e.target.value)}
          >
            <option value="">Toutes les classes</option>
            {classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
          >
            <option value="">Tous les modes</option>
            {modesPaiement.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="valide">Valide</option>
            <option value="annule">Annulé</option>
          </select>
          <div className="date-filters">
            <input
              type="date"
              className="date-input"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              placeholder="Date début"
            />
            <span className="date-separator">à</span>
            <input
              type="date"
              className="date-input"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              placeholder="Date fin"
            />
          </div>
          {(filterClasse || filterMode || filterStatut || searchTerm) && (
            <button
              className="btn-clear-filters"
              onClick={() => {
                setSearchTerm('')
                setFilterClasse('')
                setFilterMode('')
                setFilterStatut('')
              }}
            >
              <i className="bi bi-x-lg"></i>
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-wrapper">
          <table className="recus-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedRecus.length === filteredData.length && filteredData.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>N° Reçu</th>
                <th>Élève</th>
                <th>Matricule</th>
                <th>Classe</th>
                <th>Montant</th>
                <th>Mode</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(recu => (
                <tr key={recu.id} className={recu.statut === 'annule' ? 'row-annule' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRecus.includes(recu.id)}
                      onChange={() => toggleSelection(recu.id)}
                    />
                  </td>
                  <td>
                    <span className="numero-recu">{recu.numero}</span>
                  </td>
                  <td>
                    <div className="eleve-cell">
                      <div className="eleve-avatar">
                        <i className="bi bi-person-fill"></i>
                      </div>
                      <span className="eleve-nom">{recu.eleve}</span>
                    </div>
                  </td>
                  <td>
                    <span className="matricule-badge">{recu.matricule}</span>
                  </td>
                  <td>
                    <span className="classe-badge">{recu.classe}</span>
                  </td>
                  <td>
                    <span className="montant">{formatMontant(recu.montant)} MRU</span>
                  </td>
                  <td>
                    <span className={`mode-badge mode-${recu.modePaiement.toLowerCase().replace(' ', '-')}`}>
                      {recu.modePaiement}
                    </span>
                  </td>
                  <td>
                    <span className="date">{recu.date}</span>
                  </td>
                  <td>
                    <span className={`statut-badge statut-${recu.statut}`}>
                      {recu.statut === 'valide' ? (
                        <>
                          <i className="bi bi-check-circle-fill"></i>
                          Valide
                        </>
                      ) : (
                        <>
                          <i className="bi bi-x-circle-fill"></i>
                          Annulé
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="action-btn action-view"
                        title="Voir le reçu"
                        onClick={() => viewRecu(recu)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        className="action-btn action-pdf"
                        title="Télécharger PDF"
                        onClick={() => generatePDF(recu)}
                        disabled={recu.statut === 'annule'}
                      >
                        <i className="bi bi-file-earmark-pdf"></i>
                      </button>
                      <button
                        className="action-btn action-print"
                        title="Imprimer"
                        onClick={() => printRecu(recu)}
                        disabled={recu.statut === 'annule'}
                      >
                        <i className="bi bi-printer"></i>
                      </button>
                      <button
                        className="action-btn action-email"
                        title="Envoyer par email"
                        disabled={recu.statut === 'annule'}
                      >
                        <i className="bi bi-envelope"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Détail Reçu */}
      {showRecuModal && selectedRecu && (
        <div className="modal-overlay" onClick={() => setShowRecuModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reçu {selectedRecu.numero}</h3>
              <button className="modal-close" onClick={() => setShowRecuModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="recu-preview">
                <div className="recu-header-preview">
                  <h2>ÉCOLE EXEMPLE</h2>
                  <p>123 Rue de l'Éducation, Nouakchott</p>
                </div>
                <h3 className="recu-title-preview">REÇU DE PAIEMENT</h3>
                <div className="recu-info-preview">
                  <span>N° {selectedRecu.numero}</span>
                  <span>{selectedRecu.date}</span>
                </div>
                <div className="recu-details-preview">
                  <div className="detail-row">
                    <span className="label">Élève:</span>
                    <span className="value">{selectedRecu.eleve}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Matricule:</span>
                    <span className="value">{selectedRecu.matricule}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Classe:</span>
                    <span className="value">{selectedRecu.classe}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Mode de paiement:</span>
                    <span className="value">{selectedRecu.modePaiement}</span>
                  </div>
                  <div className="detail-row total">
                    <span className="label">Montant payé:</span>
                    <span className="value">{formatMontant(selectedRecu.montant)} MRU</span>
                  </div>
                </div>
                {selectedRecu.statut === 'annule' && (
                  <div className="annule-watermark">ANNULÉ</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowRecuModal(false)}>
                Fermer
              </button>
              {selectedRecu.statut === 'valide' && (
                <>
                  <button className="btn-secondary" onClick={() => printRecu(selectedRecu)}>
                    <i className="bi bi-printer"></i>
                    Imprimer
                  </button>
                  <button className="btn-primary" onClick={() => generatePDF(selectedRecu)}>
                    <i className="bi bi-download"></i>
                    Télécharger PDF
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gestion-recus {
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

        .header-actions {
          display: flex;
          gap: 10px;
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

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .stat-total .stat-icon { background: #e0e7ff; color: #4f46e5; }
        .stat-valide .stat-icon { background: #d1fae5; color: #059669; }
        .stat-annule .stat-icon { background: #fee2e2; color: #dc2626; }
        .stat-montant .stat-icon { background: #d1fae5; color: #059669; }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
        }

        /* Filters */
        .filters-section {
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .search-box {
          position: relative;
          margin-bottom: 12px;
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
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .filters-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-select {
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.85rem;
          background: white;
          min-width: 150px;
        }

        .date-filters {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .date-input {
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.85rem;
        }

        .date-separator {
          color: #6b7280;
        }

        .btn-clear-filters {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        /* Table */
        .table-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .recus-table {
          width: 100%;
          border-collapse: collapse;
        }

        .recus-table th {
          padding: 14px 12px;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .checkbox-col {
          width: 40px;
        }

        .recus-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .row-annule {
          background: #fef2f2;
          opacity: 0.7;
        }

        .numero-recu {
          font-family: monospace;
          font-size: 0.85rem;
          color: #2D3E6f;
          font-weight: 600;
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
          font-size: 0.75rem;
        }

        .montant {
          font-weight: 700;
          color: #059669;
        }

        .mode-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .mode-espèces { background: #d1fae5; color: #059669; }
        .mode-virement { background: #dbeafe; color: #2563eb; }
        .mode-chèque { background: #fef3c7; color: #d97706; }
        .mode-mobile-money { background: #f3e8ff; color: #7c3aed; }

        .date {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .statut-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .statut-valide { background: #d1fae5; color: #059669; }
        .statut-annule { background: #fee2e2; color: #dc2626; }

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
          transition: all 0.2s;
        }

        .action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .action-view:hover:not(:disabled) { color: #2D3E6f; border-color: #2D3E6f; }
        .action-pdf:hover:not(:disabled) { color: #dc2626; border-color: #dc2626; }
        .action-print:hover:not(:disabled) { color: #059669; border-color: #059669; }
        .action-email:hover:not(:disabled) { color: #2563eb; border-color: #2563eb; }

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
          max-width: 500px;
          overflow: hidden;
        }

        .modal-large {
          max-width: 600px;
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

        .recu-preview {
          border: 2px solid #2D3E6f;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }

        .recu-header-preview {
          background: #2D3E6f;
          color: white;
          padding: 20px;
          text-align: center;
        }

        .recu-header-preview h2 {
          font-size: 1.25rem;
          margin: 0 0 4px 0;
        }

        .recu-header-preview p {
          font-size: 0.8rem;
          opacity: 0.9;
          margin: 0;
        }

        .recu-title-preview {
          text-align: center;
          color: #2D3E6f;
          font-size: 1.1rem;
          padding: 16px;
          border-bottom: 1px solid #e9ecef;
        }

        .recu-info-preview {
          display: flex;
          justify-content: space-between;
          padding: 12px 20px;
          font-size: 0.85rem;
          color: #6b7280;
          background: #f8f9fa;
        }

        .recu-details-preview {
          padding: 20px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-row .label {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .detail-row .value {
          font-weight: 600;
          color: #1f2937;
        }

        .detail-row.total {
          border-bottom: none;
          background: #f0fdf4;
          margin: 12px -20px -20px;
          padding: 16px 20px;
        }

        .detail-row.total .value {
          color: #059669;
          font-size: 1.1rem;
        }

        .annule-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 4rem;
          font-weight: 900;
          color: rgba(220, 38, 38, 0.2);
          pointer-events: none;
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

        /* Responsive */
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .gestion-recus {
            padding: 12px;
          }

          .header-content {
            flex-direction: column;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filters-row {
            flex-direction: column;
          }

          .filter-select,
          .date-input {
            width: 100%;
          }

          .date-filters {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
