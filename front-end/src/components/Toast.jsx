import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'

// Context pour les toasts
const ToastContext = createContext(null)

// Hook pour utiliser les toasts
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Provider des toasts
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast])
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast])
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast])
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Container des toasts
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
      <style>{`
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 400px;
        }

        @media (max-width: 480px) {
          .toast-container {
            left: 10px;
            right: 10px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  )
}

// Item toast individuel
function ToastItem({ toast, onClose }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onClose, 300)
    }, toast.duration)

    return () => clearTimeout(timer)
  }, [toast.duration, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return 'bi-check-circle-fill'
      case 'error': return 'bi-x-circle-fill'
      case 'warning': return 'bi-exclamation-triangle-fill'
      case 'info': return 'bi-info-circle-fill'
      default: return 'bi-check-circle-fill'
    }
  }

  return (
    <div className={`toast-item toast-${toast.type} ${isExiting ? 'toast-exit' : 'toast-enter'}`}>
      <div className="toast-icon">
        <i className={`bi ${getIcon()}`}></i>
      </div>
      <div className="toast-content">
        <p className="toast-message">{toast.message}</p>
      </div>
      <button className="toast-close" onClick={handleClose}>
        <i className="bi bi-x"></i>
      </button>

      <style>{`
        .toast-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-left: 4px solid;
          min-width: 300px;
          animation: slideIn 0.3s ease;
        }

        .toast-enter {
          animation: slideIn 0.3s ease forwards;
        }

        .toast-exit {
          animation: slideOut 0.3s ease forwards;
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

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .toast-success {
          border-left-color: #10b981;
        }

        .toast-success .toast-icon {
          color: #10b981;
        }

        .toast-error {
          border-left-color: #ef4444;
        }

        .toast-error .toast-icon {
          color: #ef4444;
        }

        .toast-warning {
          border-left-color: #f59e0b;
        }

        .toast-warning .toast-icon {
          color: #f59e0b;
        }

        .toast-info {
          border-left-color: #3b82f6;
        }

        .toast-info .toast-icon {
          color: #3b82f6;
        }

        .toast-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .toast-content {
          flex: 1;
        }

        .toast-message {
          margin: 0;
          font-size: 0.9rem;
          color: #1f2937;
          line-height: 1.4;
        }

        .toast-close {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #9ca3af;
          font-size: 1.1rem;
          transition: color 0.2s;
          flex-shrink: 0;
        }

        .toast-close:hover {
          color: #4b5563;
        }
      `}</style>
    </div>
  )
}

export default ToastProvider
