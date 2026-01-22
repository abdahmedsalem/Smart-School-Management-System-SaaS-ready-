// Composant Badge réutilisable
export default function Badge({ children, variant = 'default', size = 'md' }) {
  const variants = {
    default: { background: '#e5e7eb', color: '#374151' },
    primary: { background: '#dbeafe', color: '#1e40af' },
    success: { background: '#d1fae5', color: '#065f46' },
    danger: { background: '#fee2e2', color: '#991b1b' },
    warning: { background: '#fef3c7', color: '#92400e' },
    info: { background: '#e0e7ff', color: '#3730a3' },
  }

  const sizes = {
    sm: { padding: '2px 8px', fontSize: '0.7rem' },
    md: { padding: '4px 10px', fontSize: '0.75rem' },
    lg: { padding: '6px 12px', fontSize: '0.85rem' },
  }

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '20px',
    fontWeight: 500,
    ...variants[variant],
    ...sizes[size],
  }

  return <span style={style}>{children}</span>
}

// Helper pour générer des badges de statut
export function StatusBadge({ status }) {
  const statusConfig = {
    actif: { variant: 'success', label: 'Actif' },
    inactif: { variant: 'danger', label: 'Inactif' },
    present: { variant: 'success', label: 'Présent' },
    absent: { variant: 'danger', label: 'Absent' },
    retard: { variant: 'warning', label: 'Retard' },
    planifie: { variant: 'info', label: 'Planifié' },
    termine: { variant: 'success', label: 'Terminé' },
    annule: { variant: 'danger', label: 'Annulé' },
    paye: { variant: 'success', label: 'Payé' },
    impaye: { variant: 'danger', label: 'Impayé' },
    partiel: { variant: 'warning', label: 'Partiel' },
  }

  const config = statusConfig[status] || { variant: 'default', label: status }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
