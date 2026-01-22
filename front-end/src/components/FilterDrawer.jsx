// FilterDrawer - Panneau latéral de filtres glissant depuis la droite
// Style inspiré de Screenshot_6.png
import { useState, useCallback, useEffect, memo } from "react";
import { useFilterStore } from "../stores/useFilterStore.js";

function FilterDrawer({
  group_id,
  children,
  title = "Filtres",
  subtitle = "Affiner votre recherche",
  buttonLabel = "Filtres",
  buttonClassName = "btn-filter",
  showBadgeCount = true,
  position = "right", // "right" ou "left"
  width = "400px",
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Safe store access
  let active = [];
  let clear = () => {};
  try {
    const store = useFilterStore(group_id);
    const result = store?.() || {};
    active = result.active || [];
    clear = result.clear || (() => {});
  } catch (e) {
    console.warn("Store not ready:", group_id);
  }

  const openDrawer = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "";
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        closeDrawer();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeDrawer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      {/* Filter Button */}
      <button
        type="button"
        className={`btn ${buttonClassName}`}
        onClick={openDrawer}
      >
        <i className="bi bi-funnel"></i>
        <span>{buttonLabel}</span>
        {showBadgeCount && active.length > 0 && (
          <span className="filter-drawer-badge">{active.length}</span>
        )}
      </button>

      {/* Backdrop */}
      <div
        className={`filter-drawer-backdrop ${isOpen ? "open" : ""}`}
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <div
        className={`filter-drawer-panel ${isOpen ? "open" : ""} ${position}`}
        style={{ width }}
      >
        {/* Header - Style Screenshot_6 */}
        <div className="filter-drawer-header">
          <div className="filter-drawer-header-content">
            <div className="filter-drawer-icon-circle">
              <i className="bi bi-funnel-fill"></i>
            </div>
            <div className="filter-drawer-header-text">
              <h5 className="filter-drawer-title">{title}</h5>
              <span className="filter-drawer-subtitle">{subtitle}</span>
            </div>
          </div>
          <button
            type="button"
            className="filter-drawer-close"
            onClick={closeDrawer}
            aria-label="Fermer"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Body - Filter Content */}
        <div className="filter-drawer-body">
          {/* Title inside body */}
          <div className="filter-drawer-body-title">
            <i className="bi bi-sliders me-2"></i>
            {title}
          </div>

          <div className="filter-drawer-filters">
            {typeof children === "string" ? (
              <div dangerouslySetInnerHTML={{ __html: children }} />
            ) : (
              children
            )}
          </div>
        </div>
      </div>

      {/* Styles - Screenshot_6 */}
      <style>{`
        /* Filter Button */
        .btn-filter {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: white;
          color: #2D3E6f;
          border: 1px solid #2D3E6f;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-filter:hover {
          background: #2D3E6f;
          color: white;
        }

        .btn-filter i {
          font-size: 16px;
          font-weight: 700;
        }

        .btn-filter span {
          padding-inline-start: 5px;
          font-weight: 600;
        }

        .filter-drawer-badge {
          background: #2D3E6f;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 10px;
          margin-left: 4px;
        }

        .btn-filter:hover .filter-drawer-badge {
          background: white;
          color: #2D3E6f;
        }

        /* Backdrop */
        .filter-drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(45, 62, 111, 0.4);
          z-index: 1040;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
          backdrop-filter: blur(2px);
        }

        .filter-drawer-backdrop.open {
          opacity: 1;
          visibility: visible;
        }

        /* Drawer Panel */
        .filter-drawer-panel {
          position: fixed;
          top: 0;
          bottom: 0;
          background: #ffffff;
          z-index: 1050;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 30px rgba(45, 62, 111, 0.2);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .filter-drawer-panel.right {
          right: 0;
          transform: translateX(100%);
          border-radius: 16px 0 0 16px;
        }

        .filter-drawer-panel.left {
          left: 0;
          transform: translateX(-100%);
          border-radius: 0 16px 16px 0;
        }

        .filter-drawer-panel.open.right {
          transform: translateX(0);
        }

        .filter-drawer-panel.open.left {
          transform: translateX(0);
        }

        /* Header */
        .filter-drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #2D3E6f 0%, #3d5291 100%);
          flex-shrink: 0;
        }

        .filter-drawer-header-content {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .filter-drawer-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }

        .filter-drawer-header-text {
          display: flex;
          flex-direction: column;
        }

        .filter-drawer-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
        }

        .filter-drawer-subtitle {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .filter-drawer-close {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
        }

        .filter-drawer-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Body */
        .filter-drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: #f8f9fa;
        }

        .filter-drawer-body-title {
          display: none;
        }

        .filter-drawer-filters {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .filter-drawer-filters .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-drawer-filters .col-12 {
          padding: 0;
        }

        .filter-drawer-filters .form-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #2D3E6f;
          margin-bottom: 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filter-drawer-filters .form-label::before {
          content: '';
          width: 3px;
          height: 14px;
          background: #2D3E6f;
          border-radius: 2px;
        }

        /* Filter inputs style */
        .filter-drawer-filters .form-control,
        .filter-drawer-filters .form-select {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 0.875rem;
          color: #1f2937;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .filter-drawer-filters .form-control:focus,
        .filter-drawer-filters .form-select:focus {
          border-color: #2D3E6f;
          box-shadow: 0 0 0 3px rgba(45, 62, 111, 0.1);
          outline: none;
        }

        .filter-drawer-filters .form-control::placeholder {
          color: #9ca3af;
        }

        /* React Select styling */
        .filter-drawer-filters [class*="-control"] {
          background: #fff !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 10px !important;
          min-height: 46px !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
        }

        .filter-drawer-filters [class*="-control"]:hover {
          border-color: #d1d5db !important;
        }

        .filter-drawer-filters [class*="-control"]:focus-within {
          border-color: #2D3E6f !important;
          box-shadow: 0 0 0 3px rgba(45, 62, 111, 0.1) !important;
        }

        /* Footer actions for filter drawer */
        .filter-drawer-footer {
          padding: 16px 24px;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
        }

        .filter-drawer-footer .btn-reset {
          flex: 1;
          padding: 12px;
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-drawer-footer .btn-reset:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .filter-drawer-footer .btn-apply {
          flex: 1;
          padding: 12px;
          background: #2D3E6f;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-drawer-footer .btn-apply:hover {
          background: #1e2a4d;
        }

        /* Responsive */
        @media (max-width: 576px) {
          .filter-drawer-panel {
            width: 100% !important;
            border-radius: 0;
          }

          .filter-drawer-panel.right {
            border-radius: 0;
          }

          .filter-drawer-header {
            padding: 16px 20px;
          }

          .filter-drawer-body {
            padding: 20px;
          }
        }
      `}</style>
    </>
  );
}

export default memo(FilterDrawer);
