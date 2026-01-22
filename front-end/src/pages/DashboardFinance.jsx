import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, Area, AreaChart
} from 'recharts'

// Données mock pour le dashboard
const paiementsParClasse = [
  { classe: '6ème P', total: 25000, paye: 22000, restant: 3000 },
  { classe: '5ème P', total: 24000, paye: 20000, restant: 4000 },
  { classe: '4ème C', total: 30000, paye: 25000, restant: 5000 },
  { classe: '3ème C', total: 28000, paye: 24000, restant: 4000 },
  { classe: '2ème C', total: 32000, paye: 28000, restant: 4000 },
  { classe: '1ère C', total: 30000, paye: 27000, restant: 3000 },
  { classe: '3ème L-C', total: 56000, paye: 48000, restant: 8000 },
  { classe: '3ème L-D', total: 52000, paye: 45000, restant: 7000 },
  { classe: '2ème L-A', total: 48000, paye: 42000, restant: 6000 },
  { classe: '1ère L-O', total: 44000, paye: 40000, restant: 4000 },
]

const evolutionMensuelle = [
  { mois: 'Sep', montant: 180000, objectif: 200000 },
  { mois: 'Oct', montant: 195000, objectif: 200000 },
  { mois: 'Nov', montant: 185000, objectif: 200000 },
  { mois: 'Dec', montant: 160000, objectif: 200000 },
  { mois: 'Jan', montant: 190000, objectif: 200000 },
  { mois: 'Fev', montant: 175000, objectif: 200000 },
]

const repartitionStatuts = [
  { name: 'Payé', value: 156, color: '#059669' },
  { name: 'Partiel', value: 42, color: '#d97706' },
  { name: 'En retard', value: 28, color: '#dc2626' },
]

const statsParCycle = [
  { cycle: 'Fondamental', eleves: 75, payes: 58, partiels: 12, retard: 5, total: 75000, paye: 62000 },
  { cycle: 'Collège', eleves: 85, payes: 62, partiels: 15, retard: 8, total: 127500, paye: 105000 },
  { cycle: 'Lycée', eleves: 66, payes: 36, partiels: 15, retard: 15, total: 132000, paye: 98000 },
]

const derniersPayements = [
  { id: 1, eleve: 'Mohamed Ould Ahmed', classe: '3ème Lycée - C', montant: 2000, date: '06/01/2026', mode: 'Espèces' },
  { id: 2, eleve: 'Fatima Mint Sidi', classe: '2ème Lycée - A', montant: 1500, date: '05/01/2026', mode: 'Virement' },
  { id: 3, eleve: 'Ahmed Ould Cheikh', classe: '4ème Collège', montant: 1500, date: '05/01/2026', mode: 'Espèces' },
  { id: 4, eleve: 'Aissata Mint Mohamed', classe: '6ème Primaire', montant: 1000, date: '04/01/2026', mode: 'Mobile' },
  { id: 5, eleve: 'Sidi Ould Abdallah', classe: '3ème Collège', montant: 800, date: '04/01/2026', mode: 'Espèces' },
]

const alertesRetard = [
  { id: 1, eleve: 'Mariem Mint Salem', classe: '3ème Lycée - C', retard: 3, montant: 6000 },
  { id: 2, eleve: 'Cheikh Ould Amar', classe: '2ème Collège', retard: 2, montant: 3000 },
  { id: 3, eleve: 'Khadija Mint Ali', classe: '1ère Lycée - D', retard: 2, montant: 4000 },
]

export default function DashboardFinance() {
  const [periode, setPeriode] = useState('mois')

  // Calcul des statistiques globales
  const statsGlobales = useMemo(() => {
    const totalEleves = repartitionStatuts.reduce((acc, s) => acc + s.value, 0)
    const totalPercu = evolutionMensuelle.reduce((acc, m) => acc + m.montant, 0)
    const totalAttendu = evolutionMensuelle.reduce((acc, m) => acc + m.objectif, 0)
    const totalMoisCourant = evolutionMensuelle[evolutionMensuelle.length - 1].montant
    const totalRestant = totalAttendu - totalPercu

    return {
      totalEleves,
      elevesPaies: repartitionStatuts[0].value,
      elevesPartiels: repartitionStatuts[1].value,
      elevesRetard: repartitionStatuts[2].value,
      totalPercu,
      totalMoisCourant,
      totalRestant,
      tauxRecouvrement: Math.round((totalPercu / totalAttendu) * 100)
    }
  }, [])

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR').format(montant)
  }

  return (
    <div className="dashboard-finance">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">
              <i className="bi bi-graph-up-arrow"></i>
              Dashboard Financier
            </h1>
            <p className="page-subtitle">Vue globale des paiements et statistiques financières</p>
          </div>
          <div className="header-actions">
            <select
              className="periode-select"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
            >
              <option value="mois">Ce mois</option>
              <option value="trimestre">Ce trimestre</option>
              <option value="annee">Cette année</option>
            </select>
            <button className="btn-export">
              <i className="bi bi-download"></i>
              <span>Exporter rapport</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-primary">
          <div className="kpi-icon">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{statsGlobales.totalEleves}</span>
            <span className="kpi-label">Total élèves</span>
          </div>
          <div className="kpi-trend up">
            <i className="bi bi-arrow-up"></i>
            <span>+5%</span>
          </div>
        </div>

        <div className="kpi-card kpi-success">
          <div className="kpi-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{statsGlobales.elevesPaies}</span>
            <span className="kpi-label">Élèves payés</span>
          </div>
          <div className="kpi-badge success">{Math.round((statsGlobales.elevesPaies / statsGlobales.totalEleves) * 100)}%</div>
        </div>

        <div className="kpi-card kpi-warning">
          <div className="kpi-icon">
            <i className="bi bi-pie-chart-fill"></i>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{statsGlobales.elevesPartiels}</span>
            <span className="kpi-label">Paiements partiels</span>
          </div>
          <div className="kpi-badge warning">{Math.round((statsGlobales.elevesPartiels / statsGlobales.totalEleves) * 100)}%</div>
        </div>

        <div className="kpi-card kpi-danger">
          <div className="kpi-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{statsGlobales.elevesRetard}</span>
            <span className="kpi-label">En retard</span>
          </div>
          <div className="kpi-badge danger">{Math.round((statsGlobales.elevesRetard / statsGlobales.totalEleves) * 100)}%</div>
        </div>

        <div className="kpi-card kpi-money">
          <div className="kpi-icon">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{formatMontant(statsGlobales.totalMoisCourant)}</span>
            <span className="kpi-label">Perçu ce mois (MRU)</span>
          </div>
          <div className="kpi-trend up">
            <i className="bi bi-arrow-up"></i>
            <span>+12%</span>
          </div>
        </div>

        <div className="kpi-card kpi-total">
          <div className="kpi-icon">
            <i className="bi bi-bank2"></i>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{formatMontant(statsGlobales.totalPercu)}</span>
            <span className="kpi-label">Total perçu (MRU)</span>
          </div>
          <div className="kpi-progress">
            <div className="progress-bar" style={{ width: `${statsGlobales.tauxRecouvrement}%` }}></div>
            <span>{statsGlobales.tauxRecouvrement}%</span>
          </div>
        </div>

        <div className="kpi-card kpi-restant">
          <div className="kpi-icon">
            <i className="bi bi-wallet2"></i>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{formatMontant(statsGlobales.totalRestant)}</span>
            <span className="kpi-label">Montant restant (MRU)</span>
          </div>
        </div>

        <div className="kpi-card kpi-taux">
          <div className="kpi-icon">
            <i className="bi bi-percent"></i>
          </div>
          <div className="kpi-content">
            <span className="kpi-value">{statsGlobales.tauxRecouvrement}%</span>
            <span className="kpi-label">Taux de recouvrement</span>
          </div>
          <div className="kpi-circular">
            <svg viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                strokeDasharray={`${statsGlobales.tauxRecouvrement}, 100`}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Paiements par classe */}
        <div className="chart-card chart-large">
          <div className="chart-header">
            <h3 className="chart-title">
              <i className="bi bi-bar-chart-fill"></i>
              Paiements par classe
            </h3>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-color" style={{background: '#2D3E6f'}}></span>Payé</span>
              <span className="legend-item"><span className="legend-color" style={{background: '#d97706'}}></span>Restant</span>
            </div>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paiementsParClasse} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="classe" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip
                  formatter={(value) => [`${formatMontant(value)} MRU`, '']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                />
                <Bar dataKey="paye" name="Payé" fill="#2D3E6f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="restant" name="Restant" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition des statuts */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <i className="bi bi-pie-chart-fill"></i>
              Répartition des paiements
            </h3>
          </div>
          <div className="chart-body chart-body-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={repartitionStatuts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {repartitionStatuts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} élèves`, name]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {repartitionStatuts.map((item, index) => (
                <div key={index} className="pie-legend-item">
                  <span className="pie-color" style={{ background: item.color }}></span>
                  <span className="pie-label">{item.name}</span>
                  <span className="pie-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Évolution mensuelle */}
        <div className="chart-card chart-large">
          <div className="chart-header">
            <h3 className="chart-title">
              <i className="bi bi-graph-up"></i>
              Évolution mensuelle des paiements
            </h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={evolutionMensuelle} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D3E6f" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2D3E6f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip
                  formatter={(value) => [`${formatMontant(value)} MRU`, '']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                />
                <Line type="monotone" dataKey="objectif" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Objectif" />
                <Area type="monotone" dataKey="montant" stroke="#2D3E6f" strokeWidth={3} fillOpacity={1} fill="url(#colorMontant)" name="Perçu" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistiques par cycle */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">
              <i className="bi bi-layers-fill"></i>
              Statistiques par cycle
            </h3>
          </div>
          <div className="chart-body">
            <div className="cycle-stats">
              {statsParCycle.map((cycle, index) => (
                <div key={index} className="cycle-stat-item">
                  <div className="cycle-header">
                    <span className="cycle-name">{cycle.cycle}</span>
                    <span className="cycle-eleves">{cycle.eleves} élèves</span>
                  </div>
                  <div className="cycle-progress">
                    <div className="progress-segments">
                      <div
                        className="segment segment-paye"
                        style={{ width: `${(cycle.payes / cycle.eleves) * 100}%` }}
                        title={`Payés: ${cycle.payes}`}
                      ></div>
                      <div
                        className="segment segment-partiel"
                        style={{ width: `${(cycle.partiels / cycle.eleves) * 100}%` }}
                        title={`Partiels: ${cycle.partiels}`}
                      ></div>
                      <div
                        className="segment segment-retard"
                        style={{ width: `${(cycle.retard / cycle.eleves) * 100}%` }}
                        title={`En retard: ${cycle.retard}`}
                      ></div>
                    </div>
                  </div>
                  <div className="cycle-footer">
                    <span className="cycle-montant">{formatMontant(cycle.paye)} / {formatMontant(cycle.total)} MRU</span>
                    <span className="cycle-percent">{Math.round((cycle.paye / cycle.total) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-grid">
        {/* Derniers paiements */}
        <div className="info-card">
          <div className="info-card-header">
            <h3>
              <i className="bi bi-clock-history"></i>
              Derniers paiements
            </h3>
            <button className="btn-link">Voir tout</button>
          </div>
          <div className="info-card-body">
            <div className="recent-list">
              {derniersPayements.map((p) => (
                <div key={p.id} className="recent-item">
                  <div className="recent-avatar">
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <div className="recent-info">
                    <span className="recent-name">{p.eleve}</span>
                    <span className="recent-class">{p.classe}</span>
                  </div>
                  <div className="recent-details">
                    <span className="recent-amount">+{formatMontant(p.montant)} MRU</span>
                    <span className="recent-date">{p.date}</span>
                  </div>
                  <span className={`recent-mode mode-${p.mode.toLowerCase()}`}>{p.mode}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alertes retard */}
        <div className="info-card alert-card">
          <div className="info-card-header">
            <h3>
              <i className="bi bi-exclamation-circle"></i>
              Alertes - Retards de paiement
            </h3>
            <span className="alert-count">{alertesRetard.length}</span>
          </div>
          <div className="info-card-body">
            <div className="alert-list">
              {alertesRetard.map((a) => (
                <div key={a.id} className="alert-item">
                  <div className="alert-icon">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                  </div>
                  <div className="alert-info">
                    <span className="alert-name">{a.eleve}</span>
                    <span className="alert-class">{a.classe}</span>
                  </div>
                  <div className="alert-details">
                    <span className="alert-months">{a.retard} mois</span>
                    <span className="alert-amount">{formatMontant(a.montant)} MRU</span>
                  </div>
                  <button className="btn-remind" title="Envoyer rappel">
                    <i className="bi bi-bell"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-finance {
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
          gap: 12px;
        }

        .periode-select {
          padding: 10px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
        }

        .btn-export {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: #2D3E6f;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-export:hover {
          background: #243256;
        }

        /* KPI Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .kpi-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          position: relative;
          overflow: hidden;
        }

        .kpi-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .kpi-primary .kpi-icon { background: #e0e7ff; color: #4f46e5; }
        .kpi-success .kpi-icon { background: #d1fae5; color: #059669; }
        .kpi-warning .kpi-icon { background: #fef3c7; color: #d97706; }
        .kpi-danger .kpi-icon { background: #fee2e2; color: #dc2626; }
        .kpi-money .kpi-icon { background: #d1fae5; color: #059669; }
        .kpi-total .kpi-icon { background: #dbeafe; color: #2563eb; }
        .kpi-restant .kpi-icon { background: #fef3c7; color: #d97706; }
        .kpi-taux .kpi-icon { background: #f3e8ff; color: #7c3aed; }

        .kpi-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .kpi-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1f2937;
          line-height: 1;
        }

        .kpi-label {
          font-size: 0.8rem;
          color: #6b7280;
          margin-top: 4px;
        }

        .kpi-trend {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 20px;
        }

        .kpi-trend.up {
          background: #d1fae5;
          color: #059669;
        }

        .kpi-trend.down {
          background: #fee2e2;
          color: #dc2626;
        }

        .kpi-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .kpi-badge.success { background: #d1fae5; color: #059669; }
        .kpi-badge.warning { background: #fef3c7; color: #d97706; }
        .kpi-badge.danger { background: #fee2e2; color: #dc2626; }

        .kpi-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: #e5e7eb;
        }

        .kpi-progress .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #3b82f6);
          transition: width 0.5s ease;
        }

        .kpi-progress span {
          position: absolute;
          right: 12px;
          top: -20px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #6b7280;
        }

        .kpi-circular {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 40px;
          height: 40px;
        }

        .kpi-circular svg {
          transform: rotate(-90deg);
        }

        /* Charts Grid */
        .charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .chart-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        .chart-large {
          grid-column: span 1;
        }

        .chart-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chart-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chart-title i {
          color: #2D3E6f;
        }

        .chart-legend {
          display: flex;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #6b7280;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        .chart-body {
          padding: 20px;
        }

        .chart-body-center {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Pie Legend */
        .pie-legend {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 10px;
        }

        .pie-legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pie-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .pie-label {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .pie-value {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1f2937;
        }

        /* Cycle Stats */
        .cycle-stats {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cycle-stat-item {
          padding: 16px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .cycle-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .cycle-name {
          font-weight: 600;
          color: #1f2937;
        }

        .cycle-eleves {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .cycle-progress {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-segments {
          display: flex;
          height: 100%;
        }

        .segment {
          height: 100%;
          transition: width 0.3s ease;
        }

        .segment-paye { background: #059669; }
        .segment-partiel { background: #d97706; }
        .segment-retard { background: #dc2626; }

        .cycle-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }

        .cycle-montant {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .cycle-percent {
          font-size: 0.85rem;
          font-weight: 700;
          color: #059669;
        }

        /* Bottom Grid */
        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .info-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        .info-card-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-card-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .info-card-header h3 i {
          color: #2D3E6f;
        }

        .btn-link {
          background: none;
          border: none;
          color: #2D3E6f;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-link:hover {
          text-decoration: underline;
        }

        .info-card-body {
          padding: 16px 20px;
        }

        /* Recent List */
        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .recent-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .recent-avatar {
          width: 40px;
          height: 40px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .recent-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .recent-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: #1f2937;
        }

        .recent-class {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .recent-details {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .recent-amount {
          font-weight: 700;
          color: #059669;
          font-size: 0.9rem;
        }

        .recent-date {
          font-size: 0.7rem;
          color: #9ca3af;
        }

        .recent-mode {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .mode-espèces { background: #d1fae5; color: #059669; }
        .mode-virement { background: #dbeafe; color: #2563eb; }
        .mode-mobile { background: #f3e8ff; color: #7c3aed; }

        /* Alert Card */
        .alert-card .info-card-header h3 i {
          color: #dc2626;
        }

        .alert-count {
          background: #fee2e2;
          color: #dc2626;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .alert-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #fef2f2;
          border-radius: 10px;
          border-left: 4px solid #dc2626;
        }

        .alert-icon {
          color: #dc2626;
          font-size: 1.25rem;
        }

        .alert-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .alert-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: #1f2937;
        }

        .alert-class {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .alert-details {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .alert-months {
          font-weight: 700;
          color: #dc2626;
          font-size: 0.85rem;
        }

        .alert-amount {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .btn-remind {
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
          transition: all 0.2s;
        }

        .btn-remind:hover {
          background: #dc2626;
          color: white;
        }

        /* Responsive */
        @media (max-width: 1400px) {
          .kpi-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 1200px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .chart-large {
            grid-column: span 1;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-finance {
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
            flex-direction: column;
          }

          .header-actions button,
          .header-actions select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
