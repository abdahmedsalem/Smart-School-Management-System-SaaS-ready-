// Composant FilterBar - Barre de filtres et recherche
import { Button } from '../ui'

export default function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  filters = [],
  actions = [],
}) {
  return (
    <div className="filter-bar">
      <div className="filter-left">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>

        {filters.map((filter, index) => (
          <select
            key={index}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="filter-select"
          >
            <option value="">{filter.placeholder}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className="filter-right">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'primary'}
            icon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </div>

      <style>{`
        .filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .filter-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-right {
          display: flex;
          gap: 12px;
        }

        .search-box {
          position: relative;
          min-width: 250px;
        }

        .search-box i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-box input {
          width: 100%;
          padding: 10px 14px 10px 38px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s;
        }

        .search-box input:focus {
          border-color: #2D3E6f;
          box-shadow: 0 0 0 3px rgba(45, 62, 111, 0.1);
        }

        .filter-select {
          padding: 10px 32px 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 8px center;
          background-repeat: no-repeat;
          background-size: 20px;
        }

        .filter-select:focus {
          border-color: #2D3E6f;
        }
      `}</style>
    </div>
  )
}
