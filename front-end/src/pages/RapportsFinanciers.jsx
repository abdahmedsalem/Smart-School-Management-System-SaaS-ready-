import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area
} from 'recharts'
import { jsPDF } from 'jspdf'

// Données pour les rapports
const paiementsMensuels = [
  { mois: 'Sep', percu: 180000, objectif: 200000, retard: 20000 },
  { mois: 'Oct', percu: 195000, objectif: 200000, retard: 15000 },
  { mois: 'Nov', percu: 185000, objectif: 200000, retard: 25000 },
  { mois: 'Dec', percu: 160000, objectif: 200000, retard: 40000 },
  { mois: 'Jan', percu: 190000, objectif: 200000, retard: 22000 },
  { mois: 'Fev', percu: 175000, objectif: 200000, retard: 18000 },
]

const paiementsParCycle = [
  { cycle: 'Fondamental', total: 150000, percu: 125000, eleves: 150 },
  { cycle: 'Collège', total: 255000, percu: 210000, eleves: 170 },
  { cycle: 'Lycée', total: 264000, percu: 215000, eleves: 132 },
]

const classesEnRetard = [
  { classe: '3ème Lycée - C', retard: 12000, eleves: 4, pourcentage: 14 },
  { classe: '2ème Collège', retard: 9000, eleves: 3, pourcentage: 11 },
  { classe: '1ère Lycée - D', retard: 8000, eleves: 2, pourcentage: 9 },
  { classe: '4ème Collège', retard: 7500, eleves: 3, pourcentage: 10 },
  { classe: '2ème Lycée - A', retard: 6000, eleves: 2, pourcentage: 8 },
]

const modePaiementStats = [
  { mode: 'Espèces', montant: 450000, count: 280, color: '#059669' },
  { mode: 'Virement', montant: 180000, count: 95, color: '#2563eb' },
  { mode: 'Mobile Money', montant: 120000, count: 78, color: '#7c3aed' },
  { mode: 'Chèque', montant: 50000, count: 25, color: '#d97706' },
]

const trimestres = [
  { nom: 'T1 (Sep-Nov)', percu: 560000, objectif: 600000, taux: 93 },
  { nom: 'T2 (Dec-Fev)', percu: 525000, objectif: 600000, taux: 88 },
  { nom: 'T3 (Mar-Mai)', percu: 0, objectif: 600000, taux: 0 },
]

export default function RapportsFinanciers() {
  const [periode, setPeriode] = useState('mois')
  const [annee, setAnnee] = useState('2025-2026')

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR').format(montant)
  }

  // Calculs globaux
  const statsGlobales = useMemo(() => {
    const totalPercu = paiementsMensuels.reduce((acc, m) => acc + m.percu, 0)
    const totalObjectif = paiementsMensuels.reduce((acc, m) => acc + m.objectif, 0)
    const totalRetard = paiementsMensuels.reduce((acc, m) => acc + m.retard, 0)
    const tauxGlobal = Math.round((totalPercu / totalObjectif) * 100)

    return {
      totalPercu,
      totalObjectif,
      totalRetard,
      tauxGlobal
    }
  }, [])

  // Export PDF du rapport
  const exportRapportPDF = () => {
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
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('RAPPORT FINANCIER', pageWidth / 2, 18, { align: 'center' })
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Année scolaire ${annee}`, pageWidth / 2, 30, { align: 'center' })

    // Date de génération
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(10)
    doc.text(`Généré le ${currentDate}`, 20, 55)

    // Résumé global
    doc.setFillColor(248, 249, 250)
    doc.roundedRect(20, 65, pageWidth - 40, 35, 3, 3, 'F')

    doc.setTextColor(45, 62, 111)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('RÉSUMÉ GLOBAL', 30, 78)

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total perçu: ${formatMontant(statsGlobales.totalPercu)} MRU`, 30, 92)
    doc.text(`Objectif: ${formatMontant(statsGlobales.totalObjectif)} MRU`, 100, 92)
    doc.text(`Taux de recouvrement: ${statsGlobales.tauxGlobal}%`, pageWidth - 30, 92, { align: 'right' })

    // Tableau par cycle
    let yPos = 115

    doc.setTextColor(45, 62, 111)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('PAIEMENTS PAR CYCLE', 20, yPos)

    yPos += 10

    // Header tableau
    doc.setFillColor(45, 62, 111)
    doc.rect(20, yPos, pageWidth - 40, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.text('Cycle', 25, yPos + 7)
    doc.text('Élèves', 80, yPos + 7)
    doc.text('Total attendu', 110, yPos + 7)
    doc.text('Perçu', 150, yPos + 7)
    doc.text('Taux', pageWidth - 25, yPos + 7, { align: 'right' })

    yPos += 10

    // Rows
    doc.setTextColor(60, 60, 60)
    paiementsParCycle.forEach((cycle, index) => {
      const bgColor = index % 2 === 0 ? [255, 255, 255] : [248, 249, 250]
      doc.setFillColor(...bgColor)
      doc.rect(20, yPos, pageWidth - 40, 10, 'F')

      doc.text(cycle.cycle, 25, yPos + 7)
      doc.text(cycle.eleves.toString(), 80, yPos + 7)
      doc.text(`${formatMontant(cycle.total)} MRU`, 110, yPos + 7)
      doc.text(`${formatMontant(cycle.percu)} MRU`, 150, yPos + 7)
      doc.text(`${Math.round((cycle.percu / cycle.total) * 100)}%`, pageWidth - 25, yPos + 7, { align: 'right' })

      yPos += 10
    })

    // Classes en retard
    yPos += 15

    doc.setTextColor(45, 62, 111)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('CLASSES AVEC LE PLUS DE RETARDS', 20, yPos)

    yPos += 10

    doc.setFillColor(254, 226, 226)
    doc.rect(20, yPos, pageWidth - 40, 10, 'F')
    doc.setTextColor(220, 38, 38)
    doc.setFontSize(9)
    doc.text('Classe', 25, yPos + 7)
    doc.text('Élèves en retard', 80, yPos + 7)
    doc.text('Montant dû', 140, yPos + 7)

    yPos += 10

    doc.setTextColor(60, 60, 60)
    classesEnRetard.slice(0, 5).forEach((classe, index) => {
      doc.text(classe.classe, 25, yPos + 7)
      doc.text(`${classe.eleves} élèves (${classe.pourcentage}%)`, 80, yPos + 7)
      doc.text(`${formatMontant(classe.retard)} MRU`, 140, yPos + 7)
      yPos += 10
    })

    // Pied de page
    doc.setFillColor(248, 249, 250)
    doc.rect(0, 280, pageWidth, 20, 'F')
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(8)
    doc.text('Rapport généré automatiquement - École Exemple', pageWidth / 2, 290, { align: 'center' })

    doc.save(`Rapport_Financier_${annee.replace('/', '-')}.pdf`)
  }

  // Export Excel (CSV)
  const exportExcel = () => {
    const headers = ['Mois', 'Montant Perçu', 'Objectif', 'Montant en Retard', 'Taux']
    const rows = paiementsMensuels.map(m => [
      m.mois,
      m.percu,
      m.objectif,
      m.retard,
      `${Math.round((m.percu / m.objectif) * 100)}%`
    ])

    const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Rapport_Financier_${annee.replace('/', '-')}.csv`
    link.click()
  }

  return (
    <div className="rapports-financiers">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">
              <i className="bi bi-file-earmark-bar-graph"></i>
              Rapports Financiers
            </h1>
            <p className="page-subtitle">Analyse et suivi des performances financières</p>
          </div>
          <div className="header-actions">
            <select
              className="periode-select"
              value={annee}
              onChange={(e) => setAnnee(e.target.value)}
            >
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
            </select>
            <button className="btn-secondary" onClick={exportExcel}>
              <i className="bi bi-file-earmark-excel"></i>
              <span>Excel</span>
            </button>
            <button className="btn-primary" onClick={exportRapportPDF}>
              <i className="bi bi-file-earmark-pdf"></i>
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total perçu</span>
            <span className="kpi-badge success">Cette année</span>
          </div>
          <div className="kpi-value">{formatMontant(statsGlobales.totalPercu)} <span>MRU</span></div>
          <div className="kpi-footer">
            <span className="kpi-trend up">
              <i className="bi bi-arrow-up"></i>
              +8.5% vs année précédente
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Objectif annuel</span>
          </div>
          <div className="kpi-value">{formatMontant(statsGlobales.totalObjectif)} <span>MRU</span></div>
          <div className="kpi-progress">
            <div className="progress-bar" style={{ width: `${statsGlobales.tauxGlobal}%` }}></div>
          </div>
          <div className="kpi-footer">
            <span>{statsGlobales.tauxGlobal}% atteint</span>
          </div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-header">
            <span className="kpi-label">Montant en retard</span>
            <span className="kpi-badge warning">À recouvrer</span>
          </div>
          <div className="kpi-value">{formatMontant(statsGlobales.totalRetard)} <span>MRU</span></div>
          <div className="kpi-footer">
            <span className="kpi-trend down">
              <i className="bi bi-arrow-down"></i>
              -12% vs mois dernier
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Taux de recouvrement</span>
          </div>
          <div className="kpi-value large">{statsGlobales.tauxGlobal}<span>%</span></div>
          <div className="kpi-gauge">
            <svg viewBox="0 0 100 50">
              <path
                d="M 10,50 A 40,40 0 0,1 90,50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <path
                d="M 10,50 A 40,40 0 0,1 90,50"
                fill="none"
                stroke="#059669"
                strokeWidth="8"
                strokeDasharray={`${statsGlobales.tauxGlobal * 1.26}, 126`}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Évolution mensuelle */}
        <div className="chart-card span-2">
          <div className="chart-header">
            <h3>
              <i className="bi bi-graph-up"></i>
              Évolution mensuelle des paiements
            </h3>
            <div className="chart-tabs">
              <button className={periode === 'mois' ? 'active' : ''} onClick={() => setPeriode('mois')}>
                Mensuel
              </button>
              <button className={periode === 'trimestre' ? 'active' : ''} onClick={() => setPeriode('trimestre')}>
                Trimestriel
              </button>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={paiementsMensuels} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorPercu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D3E6f" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2D3E6f" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRetard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip
                  formatter={(value) => [`${formatMontant(value)} MRU`, '']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                />
                <Line type="monotone" dataKey="objectif" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Objectif" />
                <Area type="monotone" dataKey="percu" stroke="#2D3E6f" strokeWidth={2} fillOpacity={1} fill="url(#colorPercu)" name="Perçu" />
                <Area type="monotone" dataKey="retard" stroke="#dc2626" strokeWidth={2} fillOpacity={1} fill="url(#colorRetard)" name="Retard" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par cycle */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>
              <i className="bi bi-pie-chart-fill"></i>
              Répartition par cycle
            </h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paiementsParCycle.map(c => ({ name: c.cycle, value: c.percu }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill="#059669" />
                  <Cell fill="#2563eb" />
                  <Cell fill="#7c3aed" />
                </Pie>
                <Tooltip formatter={(value) => [`${formatMontant(value)} MRU`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend-vertical">
              {paiementsParCycle.map((c, i) => (
                <div key={i} className="legend-item">
                  <span className="legend-color" style={{ background: ['#059669', '#2563eb', '#7c3aed'][i] }}></span>
                  <span className="legend-label">{c.cycle}</span>
                  <span className="legend-value">{formatMontant(c.percu)} MRU</span>
                  <span className="legend-percent">{Math.round((c.percu / c.total) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modes de paiement */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>
              <i className="bi bi-credit-card"></i>
              Modes de paiement
            </h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={modePaiementStats} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v/1000}k`} />
                <YAxis type="category" dataKey="mode" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`${formatMontant(value)} MRU`, '']} />
                <Bar dataKey="montant" radius={[0, 4, 4, 0]}>
                  {modePaiementStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mode-stats">
              {modePaiementStats.map((m, i) => (
                <div key={i} className="mode-stat-item">
                  <span className="mode-label">{m.mode}</span>
                  <span className="mode-count">{m.count} transactions</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance trimestrielle */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>
              <i className="bi bi-calendar3"></i>
              Performance trimestrielle
            </h3>
          </div>
          <div className="chart-body">
            <div className="trimestre-list">
              {trimestres.map((t, i) => (
                <div key={i} className={`trimestre-item ${t.taux === 0 ? 'inactive' : ''}`}>
                  <div className="trimestre-header">
                    <span className="trimestre-nom">{t.nom}</span>
                    <span className={`trimestre-taux ${t.taux >= 90 ? 'success' : t.taux >= 80 ? 'warning' : 'danger'}`}>
                      {t.taux}%
                    </span>
                  </div>
                  <div className="trimestre-progress">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${t.taux}%`,
                        background: t.taux >= 90 ? '#059669' : t.taux >= 80 ? '#d97706' : '#dc2626'
                      }}
                    ></div>
                  </div>
                  <div className="trimestre-footer">
                    <span>{formatMontant(t.percu)} / {formatMontant(t.objectif)} MRU</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Classes en retard */}
      <div className="retard-section">
        <div className="section-header">
          <h3>
            <i className="bi bi-exclamation-triangle"></i>
            Classes avec le plus de retards
          </h3>
          <button className="btn-link">Voir tout</button>
        </div>
        <div className="retard-grid">
          {classesEnRetard.map((c, i) => (
            <div key={i} className="retard-card">
              <div className="retard-rank">#{i + 1}</div>
              <div className="retard-info">
                <span className="retard-classe">{c.classe}</span>
                <span className="retard-eleves">{c.eleves} élèves en retard ({c.pourcentage}%)</span>
              </div>
              <div className="retard-montant">
                <span className="montant-value">{formatMontant(c.retard)}</span>
                <span className="montant-unit">MRU</span>
              </div>
              <button className="btn-action">
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .rapports-financiers {
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

        .periode-select {
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
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

        /* KPI Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .kpi-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .kpi-card.warning {
          border-left: 4px solid #d97706;
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .kpi-label {
          font-size: 0.85rem;
          color: #6b7280;
          font-weight: 500;
        }

        .kpi-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .kpi-badge.success { background: #d1fae5; color: #059669; }
        .kpi-badge.warning { background: #fef3c7; color: #d97706; }

        .kpi-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 12px;
        }

        .kpi-value.large {
          font-size: 2.5rem;
        }

        .kpi-value span {
          font-size: 1rem;
          font-weight: 500;
          color: #6b7280;
        }

        .kpi-progress {
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .kpi-progress .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #2D3E6f, #4f5d8f);
        }

        .kpi-footer {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .kpi-trend {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .kpi-trend.up { color: #059669; }
        .kpi-trend.down { color: #dc2626; }

        .kpi-gauge {
          display: flex;
          justify-content: center;
        }

        .kpi-gauge svg {
          width: 100px;
          transform: rotate(0deg);
        }

        /* Charts Grid */
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .chart-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        .chart-card.span-2 {
          grid-column: span 2;
        }

        .chart-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chart-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chart-header h3 i {
          color: #2D3E6f;
        }

        .chart-tabs {
          display: flex;
          gap: 4px;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 8px;
        }

        .chart-tabs button {
          padding: 6px 12px;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-size: 0.8rem;
          color: #6b7280;
          cursor: pointer;
        }

        .chart-tabs button.active {
          background: white;
          color: #2D3E6f;
          font-weight: 600;
        }

        .chart-body {
          padding: 20px;
        }

        /* Pie Legend */
        .pie-legend-vertical {
          margin-top: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .legend-item:last-child {
          border-bottom: none;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        .legend-label {
          flex: 1;
          font-size: 0.85rem;
          color: #374151;
        }

        .legend-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1f2937;
        }

        .legend-percent {
          font-size: 0.8rem;
          color: #059669;
          font-weight: 600;
        }

        /* Mode Stats */
        .mode-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 16px;
        }

        .mode-stat-item {
          display: flex;
          flex-direction: column;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .mode-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
        }

        .mode-count {
          font-size: 0.75rem;
          color: #6b7280;
        }

        /* Trimestre List */
        .trimestre-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .trimestre-item {
          padding: 16px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .trimestre-item.inactive {
          opacity: 0.5;
        }

        .trimestre-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .trimestre-nom {
          font-weight: 600;
          color: #1f2937;
        }

        .trimestre-taux {
          font-weight: 700;
        }

        .trimestre-taux.success { color: #059669; }
        .trimestre-taux.warning { color: #d97706; }
        .trimestre-taux.danger { color: #dc2626; }

        .trimestre-progress {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .trimestre-footer {
          font-size: 0.8rem;
          color: #6b7280;
        }

        /* Retard Section */
        .retard-section {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-header h3 i {
          color: #dc2626;
        }

        .btn-link {
          background: none;
          border: none;
          color: #2D3E6f;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        .retard-grid {
          display: grid;
          gap: 12px;
        }

        .retard-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #fef2f2;
          border-radius: 12px;
          border-left: 4px solid #dc2626;
        }

        .retard-rank {
          width: 32px;
          height: 32px;
          background: #dc2626;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .retard-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .retard-classe {
          font-weight: 600;
          color: #1f2937;
        }

        .retard-eleves {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .retard-montant {
          text-align: right;
        }

        .montant-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #dc2626;
        }

        .montant-unit {
          font-size: 0.8rem;
          color: #6b7280;
          margin-left: 4px;
        }

        .btn-action {
          width: 36px;
          height: 36px;
          background: white;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-action:hover {
          background: #dc2626;
          color: white;
        }

        /* Responsive */
        @media (max-width: 1400px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .charts-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .chart-card.span-2 {
            grid-column: span 2;
          }
        }

        @media (max-width: 992px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }

          .chart-card.span-2 {
            grid-column: span 1;
          }
        }

        @media (max-width: 768px) {
          .rapports-financiers {
            padding: 12px;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .header-content {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  )
}
