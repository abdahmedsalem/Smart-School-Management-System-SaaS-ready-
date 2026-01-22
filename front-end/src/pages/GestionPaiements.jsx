import { useState, useMemo, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import { paiementService, classeService } from '../services'

// Fonction de mapping pour les paiements depuis l'API
const mapPaiementFromApi = (p) => {
  const totalPaye = p.montantPaye || p.totalPaye || 0
  const fraisMensuel = p.montant || p.fraisMensuel || 0
  let statut = p.statut || 'retard'

  // Déterminer le statut basé sur les montants si non fourni
  if (totalPaye >= fraisMensuel) {
    statut = 'paye'
  } else if (totalPaye > 0) {
    statut = 'partiel'
  } else {
    statut = 'retard'
  }

  return {
    id: p.id,
    nom: p.eleve?.nom || p.nom || '',
    prenom: p.eleve?.prenom || p.prenom || '',
    matricule: p.eleve?.matricule || p.matricule || '',
    classe: p.eleve?.classe?.nom || p.classe || '',
    fraisMensuel: fraisMensuel,
    totalPaye: totalPaye,
    statut: statut,
  }
}

const mois = [
  "Janvier 2024",
  "Février 2024",
  "Mars 2024",
  "Avril 2024",
  "Mai 2024",
  "Juin 2024"
]

export default function GestionPaiements() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClasse, setFilterClasse] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterMois, setFilterMois] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // State pour les données de l'API
  const [paiements, setPaiements] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [paiementsData, classesData] = await Promise.all([
          paiementService.getAll(),
          classeService.getAllClasses()
        ])
        setPaiements(paiementsData.map(mapPaiementFromApi))
        setClasses(classesData.map(c => c.nom))
      } catch (error) {
        console.error('Erreur lors du chargement des paiements:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filtrage des données
  const filteredData = useMemo(() => {
    let result = [...paiements]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(item =>
        item.nom.toLowerCase().includes(search) ||
        item.prenom.toLowerCase().includes(search) ||
        item.matricule.toLowerCase().includes(search)
      )
    }

    if (filterClasse) {
      result = result.filter(item => item.classe === filterClasse)
    }

    if (filterStatut) {
      result = result.filter(item => item.statut === filterStatut)
    }

    return result
  }, [searchTerm, filterClasse, filterStatut, paiements])

  // Calcul des statistiques
  const stats = useMemo(() => {
    const data = filterClasse ? filteredData : paiements
    const totalEleves = data.length
    const elevesPaies = data.filter(e => e.statut === 'paye').length
    const elevesPartiels = data.filter(e => e.statut === 'partiel').length
    const elevesRetard = data.filter(e => e.statut === 'retard').length
    const totalPaye = data.reduce((acc, e) => acc + e.totalPaye, 0)
    const totalAttendu = data.reduce((acc, e) => acc + e.fraisMensuel, 0)
    const totalRestant = totalAttendu - totalPaye

    return {
      totalEleves,
      elevesPaies,
      elevesPartiels,
      elevesRetard,
      totalPaye,
      totalAttendu,
      totalRestant
    }
  }, [filteredData, filterClasse, paiements])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Fonction pour calculer le montant restant
  const getMontantRestant = (eleve) => {
    return eleve.fraisMensuel - eleve.totalPaye
  }

  // Fonction pour formater les montants
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR').format(montant)
  }

  // Fonction pour générer le reçu PDF
  const generateRecuPDF = (eleve) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
    const receiptNumber = `REC-${Date.now().toString().slice(-8)}`

    // En-tête avec fond coloré
    doc.setFillColor(45, 62, 111) // #2D3E6f
    doc.rect(0, 0, pageWidth, 45, 'F')

    // Titre de l'école
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

    // Informations du reçu
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.text(`N° Reçu: ${receiptNumber}`, 20, 80)
    doc.text(`Date: ${currentDate}`, pageWidth - 20, 80, { align: 'right' })

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

    // Colonne gauche
    doc.text('Nom complet:', 30, 118)
    doc.setFont('helvetica', 'bold')
    doc.text(`${eleve.prenom} ${eleve.nom}`, 70, 118)

    doc.setFont('helvetica', 'normal')
    doc.text('Matricule:', 30, 128)
    doc.setFont('helvetica', 'bold')
    doc.text(eleve.matricule, 70, 128)

    // Colonne droite
    doc.setFont('helvetica', 'normal')
    doc.text('Classe:', 120, 118)
    doc.setFont('helvetica', 'bold')
    doc.text(eleve.classe, 145, 118)

    // Détails du paiement
    doc.setTextColor(45, 62, 111)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('DÉTAILS DU PAIEMENT', 30, 160)

    // Tableau des paiements
    doc.setDrawColor(200, 200, 200)
    doc.setFillColor(45, 62, 111)
    doc.rect(20, 165, pageWidth - 40, 12, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Description', 25, 173)
    doc.text('Montant', pageWidth - 25, 173, { align: 'right' })

    // Ligne frais mensuels
    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'normal')
    doc.setFillColor(255, 255, 255)
    doc.rect(20, 177, pageWidth - 40, 12, 'S')
    doc.text('Frais mensuels', 25, 185)
    doc.text(`${formatMontant(eleve.fraisMensuel)} MRU`, pageWidth - 25, 185, { align: 'right' })

    // Ligne montant payé
    doc.setFillColor(240, 253, 244)
    doc.rect(20, 189, pageWidth - 40, 12, 'F')
    doc.setDrawColor(200, 200, 200)
    doc.rect(20, 189, pageWidth - 40, 12, 'S')
    doc.setTextColor(5, 150, 105)
    doc.setFont('helvetica', 'bold')
    doc.text('Montant payé', 25, 197)
    doc.text(`${formatMontant(eleve.totalPaye)} MRU`, pageWidth - 25, 197, { align: 'right' })

    // Ligne restant (si applicable)
    const restant = eleve.fraisMensuel - eleve.totalPaye
    if (restant > 0) {
      doc.setFillColor(254, 243, 199)
      doc.rect(20, 201, pageWidth - 40, 12, 'F')
      doc.rect(20, 201, pageWidth - 40, 12, 'S')
      doc.setTextColor(217, 119, 6)
      doc.text('Reste à payer', 25, 209)
      doc.text(`${formatMontant(restant)} MRU`, pageWidth - 25, 209, { align: 'right' })
    }

    // Statut du paiement
    const yStatut = restant > 0 ? 230 : 220
    doc.setFontSize(11)
    if (eleve.statut === 'paye') {
      doc.setTextColor(5, 150, 105)
      doc.setFont('helvetica', 'bold')
      doc.text('✓ PAIEMENT COMPLET', pageWidth / 2, yStatut, { align: 'center' })
    } else if (eleve.statut === 'partiel') {
      doc.setTextColor(217, 119, 6)
      doc.setFont('helvetica', 'bold')
      doc.text('⚠ PAIEMENT PARTIEL', pageWidth / 2, yStatut, { align: 'center' })
    }

    // Zone de signature
    doc.setDrawColor(200, 200, 200)
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    doc.line(20, 265, 80, 265)
    doc.text('Signature du responsable', 25, 272)

    doc.line(pageWidth - 80, 265, pageWidth - 20, 265)
    doc.text('Cachet de l\'établissement', pageWidth - 75, 272)

    // Pied de page
    doc.setFillColor(248, 249, 250)
    doc.rect(0, 280, pageWidth, 20, 'F')
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(8)
    doc.text('Ce reçu est généré automatiquement et fait foi de paiement.', pageWidth / 2, 288, { align: 'center' })
    doc.text(`Document généré le ${currentDate}`, pageWidth / 2, 294, { align: 'center' })

    // Télécharger le PDF
    doc.save(`Recu_${eleve.matricule}_${Date.now()}.pdf`)
  }

  // Fonction pour imprimer le reçu
  const printRecu = (eleve) => {
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
    const receiptNumber = `REC-${Date.now().toString().slice(-8)}`
    const restant = eleve.fraisMensuel - eleve.totalPaye

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reçu - ${eleve.prenom} ${eleve.nom}</title>
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
          .payment-table .amount { text-align: right; font-weight: 600; }
          .payment-table .paid { background: #f0fdf4; color: #059669; }
          .payment-table .remaining { background: #fef3c7; color: #d97706; }
          .status { text-align: center; padding: 12px; border-radius: 8px; font-weight: 600; margin-bottom: 25px; }
          .status.complete { background: #d1fae5; color: #059669; }
          .status.partial { background: #fef3c7; color: #d97706; }
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
              <span>N° Reçu: ${receiptNumber}</span>
              <span>Date: ${currentDate}</span>
            </div>
            <div class="student-info">
              <h3>INFORMATIONS DE L'ÉLÈVE</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Nom complet</label>
                  <span>${eleve.prenom} ${eleve.nom}</span>
                </div>
                <div class="info-item">
                  <label>Matricule</label>
                  <span>${eleve.matricule}</span>
                </div>
                <div class="info-item">
                  <label>Classe</label>
                  <span>${eleve.classe}</span>
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
                  <td>Frais mensuels</td>
                  <td class="amount">${formatMontant(eleve.fraisMensuel)} MRU</td>
                </tr>
                <tr class="paid">
                  <td><strong>Montant payé</strong></td>
                  <td class="amount"><strong>${formatMontant(eleve.totalPaye)} MRU</strong></td>
                </tr>
                ${restant > 0 ? `
                <tr class="remaining">
                  <td><strong>Reste à payer</strong></td>
                  <td class="amount"><strong>${formatMontant(restant)} MRU</strong></td>
                </tr>
                ` : ''}
              </tbody>
            </table>
            <div class="status ${eleve.statut === 'paye' ? 'complete' : 'partial'}">
              ${eleve.statut === 'paye' ? '✓ PAIEMENT COMPLET' : '⚠ PAIEMENT PARTIEL'}
            </div>
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
            Ce reçu est généré automatiquement et fait foi de paiement.<br>
            Document généré le ${currentDate}
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

  return (
    <div className="gestion-paiements">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">
              <i className="bi bi-credit-card-2-front me-2"></i>
              Gestion des Paiements
            </h1>
            <p className="page-subtitle">Gérez les paiements des élèves par classe et par période</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">
              <i className="bi bi-download"></i>
              <span>Exporter</span>
            </button>
            <button className="btn-primary">
              <i className="bi bi-plus-lg"></i>
              <span>Nouveau paiement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalEleves}</span>
            <span className="stat-label">Total élèves</span>
          </div>
        </div>
        <div className="stat-card stat-paye">
          <div className="stat-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.elevesPaies}</span>
            <span className="stat-label">Élèves payés</span>
          </div>
        </div>
        <div className="stat-card stat-partiel">
          <div className="stat-icon">
            <i className="bi bi-pie-chart-fill"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.elevesPartiels}</span>
            <span className="stat-label">Paiements partiels</span>
          </div>
        </div>
        <div className="stat-card stat-retard">
          <div className="stat-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.elevesRetard}</span>
            <span className="stat-label">En retard</span>
          </div>
        </div>
        <div className="stat-card stat-montant-paye">
          <div className="stat-icon">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatMontant(stats.totalPaye)}</span>
            <span className="stat-label">Total payé (MRU)</span>
          </div>
        </div>
        <div className="stat-card stat-montant-restant">
          <div className="stat-icon">
            <i className="bi bi-wallet2"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatMontant(stats.totalRestant)}</span>
            <span className="stat-label">Restant (MRU)</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="filters-section">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Rechercher par nom ou matricule..."
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
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="paye">Payé</option>
            <option value="partiel">Partiel</option>
            <option value="retard">En retard</option>
          </select>
          <select
            className="filter-select"
            value={filterMois}
            onChange={(e) => setFilterMois(e.target.value)}
          >
            <option value="">Tous les mois</option>
            {mois.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {(filterClasse || filterStatut || filterMois || searchTerm) && (
            <button
              className="btn-clear-filters"
              onClick={() => {
                setSearchTerm('')
                setFilterClasse('')
                setFilterStatut('')
                setFilterMois('')
              }}
            >
              <i className="bi bi-x-lg"></i>
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-wrapper">
          <table className="paiements-table">
            <thead>
              <tr>
                <th>Nom de l'élève</th>
                <th>Matricule / ID</th>
                <th>Classe</th>
                <th>Frais mensuels</th>
                <th>Statut paiement</th>
                <th>Total payé</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(eleve => (
                <tr key={eleve.id}>
                  <td>
                    <div className="eleve-cell">
                      <div className="eleve-avatar">
                        <i className="bi bi-person-fill"></i>
                      </div>
                      <span className="eleve-nom">{eleve.prenom} {eleve.nom}</span>
                    </div>
                  </td>
                  <td>
                    <span className="matricule-badge">{eleve.matricule}</span>
                  </td>
                  <td>
                    <span className="classe-badge">{eleve.classe}</span>
                  </td>
                  <td>
                    <span className="montant">{formatMontant(eleve.fraisMensuel)} MRU</span>
                  </td>
                  <td>
                    <span className={`statut-badge statut-${eleve.statut}`}>
                      <i className={`bi ${
                        eleve.statut === 'paye' ? 'bi-check-circle-fill' :
                        eleve.statut === 'partiel' ? 'bi-pie-chart-fill' :
                        'bi-exclamation-triangle-fill'
                      }`}></i>
                      {eleve.statut === 'paye' ? 'Payé' :
                       eleve.statut === 'partiel' ? 'Partiel' :
                       'En retard'}
                    </span>
                  </td>
                  <td>
                    {eleve.statut === 'paye' ? (
                      <span className="montant-paye">{formatMontant(eleve.totalPaye)} MRU</span>
                    ) : (
                      <div className="montant-partiel-wrapper">
                        <span className={`montant-${eleve.statut}`}>
                          {formatMontant(eleve.totalPaye)} MRU
                        </span>
                        <span className="montant-restant-small">
                          Reste: {formatMontant(getMontantRestant(eleve))} MRU
                        </span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="actions-cell">
                      {eleve.statut !== 'paye' && (
                        <button className="action-btn action-pay" title="Enregistrer paiement">
                          <i className="bi bi-credit-card"></i>
                        </button>
                      )}
                      {eleve.totalPaye > 0 && (
                        <>
                          <button
                            className="action-btn action-recu"
                            title="Générer reçu PDF"
                            onClick={() => generateRecuPDF(eleve)}
                          >
                            <i className="bi bi-file-earmark-pdf"></i>
                          </button>
                          <button
                            className="action-btn action-print"
                            title="Imprimer reçu"
                            onClick={() => printRecu(eleve)}
                          >
                            <i className="bi bi-printer"></i>
                          </button>
                        </>
                      )}
                      {eleve.statut === 'retard' && (
                        <button className="action-btn action-remind" title="Envoyer rappel">
                          <i className="bi bi-bell"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination-section">
          <span className="pagination-info">
            Affichage {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)} sur {filteredData.length} élèves
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .gestion-paiements {
          padding: 20px;
          background: #f5f6fa;
          min-height: 100%;
        }

        /* Page Header */
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

        .btn-primary:hover {
          background: #243256;
        }

        .btn-secondary {
          background: white;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .btn-secondary:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
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
        .stat-paye .stat-icon { background: #d1fae5; color: #059669; }
        .stat-partiel .stat-icon { background: #fef3c7; color: #d97706; }
        .stat-retard .stat-icon { background: #fee2e2; color: #dc2626; }
        .stat-montant-paye .stat-icon { background: #d1fae5; color: #059669; }
        .stat-montant-restant .stat-icon { background: #fef3c7; color: #d97706; }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.4rem;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
        }

        /* Filters Section */
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
          transition: all 0.2s;
        }

        .search-box input:focus {
          outline: none;
          border-color: #2D3E6f;
          box-shadow: 0 0 0 3px rgba(45, 62, 111, 0.1);
        }

        .filters-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.85rem;
          background: white;
          color: #374151;
          cursor: pointer;
          min-width: 160px;
        }

        .filter-select:focus {
          outline: none;
          border-color: #2D3E6f;
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
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-clear-filters:hover {
          background: #fecaca;
        }

        /* Table Card */
        .table-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        .table-wrapper {
          overflow-x: auto;
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

        /* Cell Styles */
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

        .eleve-nom {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1f2937;
        }

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

        .statut-paye { background: #d1fae5; color: #059669; }
        .statut-partiel { background: #fef3c7; color: #d97706; }
        .statut-retard { background: #fee2e2; color: #dc2626; }

        .montant-paye { font-weight: 600; color: #059669; }
        .montant-partiel { font-weight: 600; color: #d97706; }
        .montant-retard { font-weight: 600; color: #dc2626; }

        .montant-partiel-wrapper {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .montant-restant-small {
          font-size: 0.7rem;
          color: #9ca3af;
        }

        /* Actions */
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

        .action-btn:hover { background: #f3f4f6; }
        .action-pay:hover { color: #2D3E6f; border-color: #2D3E6f; }
        .action-recu:hover { color: #dc2626; border-color: #dc2626; }
        .action-print:hover { color: #059669; border-color: #059669; }
        .action-remind:hover { color: #d97706; border-color: #d97706; }

        /* Pagination */
        .pagination-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-top: 1px solid #e9ecef;
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
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 992px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .header-content {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions button {
            flex: 1;
          }
        }

        @media (max-width: 768px) {
          .gestion-paiements {
            padding: 12px;
          }

          .filters-row {
            flex-direction: column;
          }

          .filter-select {
            width: 100%;
          }

          .pagination-section {
            flex-direction: column;
            gap: 12px;
          }
        }

        @media (max-width: 576px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .header-actions {
            flex-direction: column;
          }

          .header-actions button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
