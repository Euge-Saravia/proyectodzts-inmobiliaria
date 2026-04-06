"use client";

import { useState, Suspense } from "react";
import PropertiesFilters from "./PropertiesFilters";
import ActiveFilterBadges from "./ActiveFilterBadges";
import type { FilterOptions } from "@/types/filters";
import "./PropertiesLayout.css";

interface PropertiesLayoutProps {
  filterOptions: FilterOptions;
  totalCount: number;
  children: React.ReactNode;
}

export default function PropertiesLayout({
  filterOptions,
  totalCount,
  children,
}: PropertiesLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  return (
    <Suspense fallback={<div className="bg-light rounded-3 p-4 mb-4" />}>
      <div className="properties-layout-wrapper">
        {isFiltering && (
          <div className="properties-loading-overlay" role="status" aria-live="polite">
            <div className="properties-loading-card">
              <div className="spinner-border text-primary" aria-hidden="true" />
              <div className="fw-semibold">Actualizando resultados</div>
              <div className="text-muted small">Aplicando filtros seleccionados</div>
            </div>
          </div>
        )}
        <div
          className={`properties-layout ${isCollapsed ? "properties-layout--collapsed" : "properties-layout--expanded"}`}
        >
          <div style={{ gridArea: "filters" }}>
            <div className="filters-sticky-wrapper">
              <PropertiesFilters
                cities={filterOptions.cities}
                propertyTypes={filterOptions.propertyTypes}
                roomCounts={filterOptions.roomCounts}
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                onFilteringChange={setIsFiltering}
              />
            </div>
          </div>

          <div style={{ gridArea: "main", minWidth: 0 }}>
          <ActiveFilterBadges
            cities={filterOptions.cities}
            propertyTypes={filterOptions.propertyTypes}
            onFilteringChange={setIsFiltering}
          />

            <div className="mb-3" aria-live="polite">
              <p className="text-muted mb-0">
                {totalCount === 1
                  ? "1 propiedad encontrada"
                  : `${totalCount} propiedades encontradas`}
              </p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
