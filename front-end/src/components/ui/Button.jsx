// Composant Button réutilisable
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 500,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: disabled || loading ? 0.6 : 1,
  }

  const variants = {
    primary: { background: '#2D3E6f', color: 'white' },
    secondary: { background: '#e5e7eb', color: '#374151' },
    success: { background: '#10b981', color: 'white' },
    danger: { background: '#ef4444', color: 'white' },
    warning: { background: '#f59e0b', color: 'white' },
    ghost: { background: 'transparent', color: '#4b5563' },
  }

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '0.8rem' },
    md: { padding: '10px 16px', fontSize: '0.875rem' },
    lg: { padding: '12px 24px', fontSize: '1rem' },
  }

  const style = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
  }

  return (
    <button
      type={type}
      style={style}
      disabled={disabled || loading}
      onClick={onClick}
      className={className}
    >
      {loading ? (
        <i className="bi bi-arrow-repeat spinning"></i>
      ) : icon ? (
        <i className={`bi ${icon}`}></i>
      ) : null}
      {children}
    </button>
  )
}
