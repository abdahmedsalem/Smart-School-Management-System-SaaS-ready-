// Composant Input réutilisable
export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  icon,
  name,
}) {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <i className={`bi ${icon} input-icon`}></i>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`input-field ${error ? 'error' : ''} ${icon ? 'with-icon' : ''}`}
        />
      </div>
      {error && <span className="input-error">{error}</span>}

      <style>{`
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #374151;
        }

        .required {
          color: #ef4444;
          margin-left: 4px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .input-field {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: all 0.2s;
          outline: none;
        }

        .input-field.with-icon {
          padding-left: 38px;
        }

        .input-field:focus {
          border-color: #2D3E6f;
          box-shadow: 0 0 0 3px rgba(45, 62, 111, 0.1);
        }

        .input-field.error {
          border-color: #ef4444;
        }

        .input-field:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .input-error {
          font-size: 0.8rem;
          color: #ef4444;
        }
      `}</style>
    </div>
  )
}

// Composant Select réutilisable
export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Sélectionner...',
  required = false,
  disabled = false,
  name,
}) {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="input-field"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <style>{`
        select.input-field {
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 10px center;
          background-repeat: no-repeat;
          background-size: 20px;
          padding-right: 36px;
        }
      `}</style>
    </div>
  )
}
