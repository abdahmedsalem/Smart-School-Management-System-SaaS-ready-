import { useState, useMemo } from 'react'
import { jsPDF } from 'jspdf'

// Mock data des classes avec résumé paiements
const mockClasses = [
  {
    id: 1,
    nom: "6ème Primaire",
    cycle: "Fondamental",
    effectif: 25,
    fraisMensuel: 1000,
    totalAttendu: 25000,
    totalPaye: 22000,
    elevesPaies: 18,
    elevesPartiels: 4,
    elevesRetard: 3
  },
  {
    id: 2,
    nom: "5ème Primaire",
    cycle: "Fondamental",
    effectif: 28,
    fraisMensuel: 1000,
    totalAttendu: 28000,
    totalPaye: 24000,
    elevesPaies: 20,
    elevesPartiels: 5,
    elevesRetard: 3
  },
  {
    id: 3,
    nom: "4ème Collège",
    cycle: "Collège",
    effectif: 30,
    fraisMensuel: 1500,
    totalAttendu: 45000,
    totalPaye: 38000,
    elevesPaies: 22,
    elevesPartiels: 5,
    elevesRetard: 3
  },
  {
    id: 4,
    nom: "3ème Collège",
    cycle: "Collège",
    effectif: 32,
    fraisMensuel: 1500,
    totalAttendu: 48000,
    totalPaye: 42000,
    elevesPaies: 24,
    elevesPartiels: 5,
    elevesRetard: 3
  },
  {
    id: 5,
    nom: "2ème Collège",
    cycle: "Collège",
    effectif: 28,
    fraisMensuel: 1500,
    totalAttendu: 42000,
    totalPaye: 35000,
    elevesPaies: 20,
    elevesPartiels: 4,
    elevesRetard: 4
  },
  {
    id: 6,
    nom: "1ère Collège",
    cycle: "Collège",
    effectif: 26,
    fraisMensuel: 1500,
    totalAttendu: 39000,
    totalPaye: 33000,
    elevesPaies: 18,
    elevesPartiels: 5,
    elevesRetard: 3
  },
  {
    id: 7,
    nom: "3ème Lycée - C",
    cycle: "Lycée",
    specialite: "C",
    effectif: 28,
    fraisMensuel: 2000,
    totalAttendu: 56000,
    totalPaye: 48000,
    elevesPaies: 20,
    elevesPartiels: 5,
    elevesRetard: 3
  },
  {
    id: 8,
    nom: "3ème Lycée - D",
    cycle: "Lycée",
    specialite: "D",
    effectif: 26,
    fraisMensuel: 2000,
    totalAttendu: 52000,
    totalPaye: 44000,
    elevesPaies: 18,
    elevesPartiels: 5,
    elevesRetard: 3
  },
  {
    id: 9,
    nom: "2ème Lycée - A",
    cycle: "Lycée",
    specialite: "A",
    effectif: 24,
    fraisMensuel: 2000,
    totalAttendu: 48000,
    totalPaye: 40000,
    elevesPaies: 16,
    elevesPartiels: 5,
    elevesRetard: 3
  },
  {
    id: 10,
    nom: "1ère Lycée - O",
    cycle: "Lycée",
    specialite: "O",
    effectif: 22,
    fraisMensuel: 2000,
    totalAttendu: 44000,
    totalPaye: 38000,
    elevesPaies: 16,
    elevesPartiels: 4,
    elevesRetard: 2
  },
]

const cycles = ["Fondamental", "Collège", "Lycée"]
const specialites = ["C", "D", "A", "O"]

export default function PaiementsClasse() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCycle, setFilterCycle] = useState('')
  const [filterSpecialite, setFilterSpecialite] = useState('')
  const [selectedClasse, setSelectedClasse] = useState(null)

  // Filtrage des données
  const filteredData = useMemo(() => {
    let result = [...mockClasses]

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(item => item.nom.toLowerCase().includes(search))
    }

    if (filterCycle) {
      result = result.filter(item => item.cycle === filterCycle)
    }

    if (filterSpecialite) {
      result = result.filter(item => item.specialite === filterSpecialite)
    }

    return result
  }, [searchTerm, filterCycle, filterSpecialite])

  // Calcul des statistiques globales
  const stats = useMemo(() => {
    const data = filteredData
    const totalClasses = data.length
    const totalEleves = data.reduce((acc, c) => acc + c.effectif, 0)
    const totalPaies = data.reduce((acc, c) => acc + c.elevesPaies, 0)
    const totalPartiels = data.reduce((acc, c) => acc + c.elevesPartiels, 0)
    const totalRetard = data.reduce((acc, c) => acc + c.elevesRetard, 0)
    const montantTotal = data.reduce((acc, c) => acc + c.totalAttendu, 0)
    const montantPaye = data.reduce((acc, c) => acc + c.totalPaye, 0)
    const montantRestant = montantTotal - montantPaye

    return {
      totalClasses,
      totalEleves,
      totalPaies,
      totalPartiels,
      totalRetard,
      montantTotal,
      montantPaye,
      montantRestant,
      tauxRecouvrement: montantTotal > 0 ? Math.round((montantPaye / montantTotal) * 100) : 0
    }
  }, [filteredData])

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR').format(montant)
  }

  const getTauxPaiement = (classe) => {
    return Math.round((classe.totalPaye / classe.totalAttendu) * 100)
  }

  // Export tous les reçus d'une classe
  const exportRecusClasse = (classe) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    // En-tête
    doc.setFillColor(45, 62, 111)
    doc.rect(0, 0, pageWidth, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('RAPPORT DE PAIEMENTS', pageWidth / 2, 18, { align: 'center' })
    doc.setFontSize(12)
    doc.text(classe.nom, pageWidth / 2, 30, { align: 'center' })

    // Info date
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Généré le ${currentDate}`, 20, 55)

    // Statistiques
    doc.setFillColor(248, 249, 250)
    doc.roundedRect(20, 65, pageWidth - 40, 45, 3, 3, 'F')

    doc.setTextColor(45, 62, 111)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('RÉSUMÉ DES PAIEMENTS', 30, 78)

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Effectif: ${classe.effectif} élèves`, 30, 92)
    doc.text(`Élèves payés: ${classe.elevesPaies}`, 30, 102)
    doc.text(`Paiements partiels: ${classe.elevesPartiels}`, 100, 92)
    doc.text(`En retard: ${classe.elevesRetard}`, 100, 102)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(5, 150, 105)
    doc.text(`Total collecté: ${formatMontant(classe.totalPaye)} MRU`, pageWidth - 30, 92, { align: 'right' })
    doc.setTextColor(217, 119, 6)
    doc.text(`Restant: ${formatMontant(classe.totalAttendu - classe.totalPaye)} MRU`, pageWidth - 30, 102, { align: 'right' })

    // Pied de page
    doc.setFillColor(248, 249, 250)
    doc.rect(0, 280, pageWidth, 20, 'F')
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Document généré automatiquement - École Exemple', pageWidth / 2, 290, { align: 'center' })

    doc.save(`Rapport_Paiements_${classe.nom.replace(/\s+/g, '_')}.pdf`)
  }

  // Export Excel (CSV)
  const exportExcel = () => {
    const headers = ['Classe', 'Cycle', 'Effectif', 'Frais Mensuel', 'Total Attendu', 'Total Payé', 'Restant', 'Élèves Payés', 'Partiels', 'En Retard', 'Taux']
    const rows = filteredData.map(c => [
      c.nom,
      c.cycle,
      c.effectif,
      c.fraisMensuel,
      c.totalAttendu,
      c.totalPaye,
      c.totalAttendu - c.totalPaye,
      c.elevesPaies,
      c.elevesPartiels,
      c.elevesRetard,
      `${getTauxPaiement(c)}%`
    ])

    const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Paiements_Classes_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="paiements-classe">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">
              <i className="bi bi-building"></i>
              Paiements par Classe
            </h1>
            <p className="page-subtitle">Vue consolidée des paiements par classe, cycle et spécialité</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={exportExcel}>
              <i className="bi bi-file-earmark-excel"></i>
              <span>Export Excel</span>
            </button>
            <button className="btn-primary">
              <i className="bi bi-download"></i>
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-classes">
          <div className="stat-icon">
            <i className="bi bi-building"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalClasses}</span>
            <span className="stat-label">Classes</span>
          </div>
        </div>
        <div className="stat-card stat-eleves">
          <div className="stat-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalEleves}</span>
            <span className="stat-label">Élèves total</span>
          </div>
        </div>
        <div className="stat-card stat-paye">
          <div className="stat-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalPaies}</span>
            <span className="stat-label">Élèves payés</span>
          </div>
        </div>
        <div className="stat-card stat-partiel">
          <div className="stat-icon">
            <i className="bi bi-pie-chart-fill"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalPartiels}</span>
            <span className="stat-label">Partiels</span>
          </div>
        </div>
        <div className="stat-card stat-retard">
          <div className="stat-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalRetard}</span>
            <span className="stat-label">En retard</span>
          </div>
        </div>
        <div className="stat-card stat-montant">
          <div className="stat-icon">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatMontant(stats.montantPaye)}</span>
            <span className="stat-label">Total collecté (MRU)</span>
          </div>
        </div>
        <div className="stat-card stat-restant">
          <div className="stat-icon">
            <i className="bi bi-wallet2"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatMontant(stats.montantRestant)}</span>
            <span className="stat-label">Restant (MRU)</span>
          </div>
        </div>
        <div className="stat-card stat-taux">
          <div className="stat-icon">
            <i className="bi bi-percent"></i>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.tauxRecouvrement}%</span>
            <span className="stat-label">Taux global</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Rechercher une classe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters-row">
          <select
            className="filter-select"
            value={filterCycle}
            onChange={(e) => setFilterCycle(e.target.value)}
          >
            <option value="">Tous les cycles</option>
            {cycles.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filterSpecialite}
            onChange={(e) => setFilterSpecialite(e.target.value)}
          >
            <option value="">Toutes les spécialités</option>
            {specialites.map(s => (
              <option key={s} value={s}>Spécialité {s}</option>
            ))}
          </select>
          {(filterCycle || filterSpecialite || searchTerm) && (
            <button
              className="btn-clear-filters"
              onClick={() => {
                setSearchTerm('')
                setFilterCycle('')
                setFilterSpecialite('')
              }}
            >
              <i className="bi bi-x-lg"></i>
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Classes Cards */}
      <div className="classes-grid">
        {filteredData.map(classe => (
          <div key={classe.id} className="classe-card">
            <div className="classe-header">
              <div className="classe-title">
                <h3>{classe.nom}</h3>
                <span className={`cycle-badge cycle-${classe.cycle.toLowerCase()}`}>
                  {classe.cycle}
                </span>
              </div>
              <div className="classe-effectif">
                <i className="bi bi-people-fill"></i>
                <span>{classe.effectif} élèves</span>
              </div>
            </div>

            <div className="classe-stats">
              <div className="classe-stat">
                <span className="stat-label">Payés</span>
                <span className="stat-value paye">{classe.elevesPaies}</span>
              </div>
              <div className="classe-stat">
                <span className="stat-label">Partiels</span>
                <span className="stat-value partiel">{classe.elevesPartiels}</span>
              </div>
              <div className="classe-stat">
                <span className="stat-label">Retard</span>
                <span className="stat-value retard">{classe.elevesRetard}</span>
              </div>
            </div>

            <div className="classe-progress">
              <div className="progress-header">
                <span>Progression</span>
                <span className="progress-percent">{getTauxPaiement(classe)}%</span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${getTauxPaiement(classe)}%` }}
                ></div>
              </div>
            </div>

            <div className="classe-montants">
              <div className="montant-item">
                <span className="montant-label">Collecté</span>
                <span className="montant-value collecte">{formatMontant(classe.totalPaye)} MRU</span>
              </div>
              <div className="montant-item">
                <span className="montant-label">Restant</span>
                <span className="montant-value restant">{formatMontant(classe.totalAttendu - classe.totalPaye)} MRU</span>
              </div>
            </div>

            <div className="classe-actions">
              <button
                className="btn-action btn-view"
                title="Voir les élèves"
              >
                <i className="bi bi-eye"></i>
                <span>Détails</span>
              </button>
              <button
                className="btn-action btn-export"
                title="Exporter les reçus"
                onClick={() => exportRecusClasse(classe)}
              >
                <i className="bi bi-file-earmark-pdf"></i>
                <span>Rapport</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .paiements-classe {
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
          grid-template-columns: repeat(8, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .stat-classes .stat-icon { background: #e0e7ff; color: #4f46e5; }
        .stat-eleves .stat-icon { background: #dbeafe; color: #2563eb; }
        .stat-paye .stat-icon { background: #d1fae5; color: #059669; }
        .stat-partiel .stat-icon { background: #fef3c7; color: #d97706; }
        .stat-retard .stat-icon { background: #fee2e2; color: #dc2626; }
        .stat-montant .stat-icon { background: #d1fae5; color: #059669; }
        .stat-restant .stat-icon { background: #fef3c7; color: #d97706; }
        .stat-taux .stat-icon { background: #f3e8ff; color: #7c3aed; }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-label {
          font-size: 0.7rem;
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
          cursor: pointer;
          min-width: 160px;
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
        }

        /* Classes Grid */
        .classes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .classe-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          transition: all 0.2s;
        }

        .classe-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .classe-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .classe-title h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 6px 0;
        }

        .cycle-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .cycle-fondamental { background: #d1fae5; color: #059669; }
        .cycle-collège { background: #dbeafe; color: #2563eb; }
        .cycle-lycée { background: #f3e8ff; color: #7c3aed; }

        .classe-effectif {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 0.85rem;
        }

        .classe-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .classe-stat {
          text-align: center;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .classe-stat .stat-label {
          display: block;
          font-size: 0.7rem;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .classe-stat .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .classe-stat .stat-value.paye { color: #059669; }
        .classe-stat .stat-value.partiel { color: #d97706; }
        .classe-stat .stat-value.retard { color: #dc2626; }

        .classe-progress {
          margin-bottom: 16px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #6b7280;
          margin-bottom: 6px;
        }

        .progress-percent {
          font-weight: 700;
          color: #2D3E6f;
        }

        .progress-bar-container {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #2D3E6f, #4f5d8f);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .classe-montants {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .montant-item {
          display: flex;
          flex-direction: column;
        }

        .montant-label {
          font-size: 0.7rem;
          color: #6b7280;
        }

        .montant-value {
          font-size: 1rem;
          font-weight: 700;
        }

        .montant-value.collecte { color: #059669; }
        .montant-value.restant { color: #d97706; }

        .classe-actions {
          display: flex;
          gap: 10px;
        }

        .btn-action {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-view {
          background: #e0e7ff;
          color: #4f46e5;
          border: none;
        }

        .btn-view:hover {
          background: #c7d2fe;
        }

        .btn-export {
          background: white;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .btn-export:hover {
          background: #fef2f2;
        }

        /* Responsive */
        @media (max-width: 1600px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 992px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .classes-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .paiements-classe {
            padding: 12px;
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

          .filters-row {
            flex-direction: column;
          }

          .filter-select {
            width: 100%;
          }
        }

        @media (max-width: 576px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
