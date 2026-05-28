"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useReducer,
  useState,
  type ReactNode,
  type TransitionStartFunction,
} from "react";
import type { FilterOption } from "@/types/filters";
import { parseMultiple } from "@/lib/filters";
import ReferenceSearch from "./ReferenceSearch";
import "./PropertiesFilters.css";

interface PropertiesFiltersProps {
  cities: FilterOption[];
  propertyTypes: FilterOption[];
  roomCounts: number[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isPending: boolean;
  startTransition: TransitionStartFunction;
}

type SearchParams = ReturnType<typeof useSearchParams>;

interface PropertiesFiltersInnerProps extends PropertiesFiltersProps {
  searchParams: SearchParams;
}

type FilterState = {
  operacion: string;
  propiedad: string[];
  localidad: string[];
  dormitorios: string[];
  soloDisponibles: boolean;
  supMin: string;
  supMax: string;
};

type FilterAction =
  | { type: "SET_OPERACION"; value: string }
  | { type: "TOGGLE_PROPIEDAD"; slug: string }
  | { type: "TOGGLE_LOCALIDAD"; slug: string }
  | { type: "TOGGLE_DORMITORIOS"; value: string }
  | { type: "TOGGLE_SOLO_DISPONIBLES" }
  | { type: "SET_SUP_MIN"; value: string }
  | { type: "SET_SUP_MAX"; value: string }
  | { type: "RESET" };

const EMPTY_FILTERS: FilterState = {
  operacion: "",
  propiedad: [],
  localidad: [],
  dormitorios: [],
  soloDisponibles: false,
  supMin: "",
  supMax: "",
};

function toggleInArray(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_OPERACION":
      return { ...state, operacion: action.value };
    case "TOGGLE_PROPIEDAD":
      return { ...state, propiedad: toggleInArray(state.propiedad, action.slug) };
    case "TOGGLE_LOCALIDAD":
      return { ...state, localidad: toggleInArray(state.localidad, action.slug) };
    case "TOGGLE_DORMITORIOS":
      return {
        ...state,
        dormitorios: toggleInArray(state.dormitorios, action.value),
      };
    case "TOGGLE_SOLO_DISPONIBLES":
      return { ...state, soloDisponibles: !state.soloDisponibles };
    case "SET_SUP_MIN":
      return { ...state, supMin: action.value };
    case "SET_SUP_MAX":
      return { ...state, supMax: action.value };
    case "RESET":
      return EMPTY_FILTERS;
  }
}

interface FilterAccordionSectionProps {
  id: string;
  label: string;
  expanded: boolean;
  onToggle: () => void;
  bodyStyle?: React.CSSProperties;
  children: ReactNode;
}

function FilterAccordionSection({
  id,
  label,
  expanded,
  onToggle,
  bodyStyle,
  children,
}: FilterAccordionSectionProps) {
  return (
    <div className="mb-4">
      <button
        type="button"
        className="btn btn-link p-0 d-flex align-items-center justify-content-between w-100 text-decoration-none"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={id}
      >
        <span className="fw-semibold small text-uppercase text-muted">
          {label}
        </span>
        <i className={`bi bi-chevron-${expanded ? "up" : "down"}`}></i>
      </button>
      <div
        id={id}
        className={`filters-section collapse${expanded ? " show mt-2" : ""}`}
        style={bodyStyle}
      >
        {children}
      </div>
    </div>
  );
}

interface RadioOption {
  value: string;
  label: string;
}

interface FilterRadioGroupProps {
  name: string;
  idPrefix: string;
  value: string;
  options: RadioOption[];
  onChange: (value: string) => void;
}

function FilterRadioGroup({
  name,
  idPrefix,
  value,
  options,
  onChange,
}: FilterRadioGroupProps) {
  return (
    <>
      {options.map((opt) => {
        const inputId = `${idPrefix}-${opt.value || "todos"}`;
        return (
          <div key={inputId} className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name={name}
              id={inputId}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            <label className="form-check-label" htmlFor={inputId}>
              {opt.label}
            </label>
          </div>
        );
      })}
    </>
  );
}

interface CheckboxItem {
  value: string;
  label: string;
}

interface FilterCheckboxGroupProps {
  idPrefix: string;
  items: CheckboxItem[];
  selected: string[];
  onToggle: (value: string) => void;
  emptyMessage?: string;
}

function FilterCheckboxGroup({
  idPrefix,
  items,
  selected,
  onToggle,
  emptyMessage = "Sin opciones",
}: FilterCheckboxGroupProps) {
  if (items.length === 0) {
    return <span className="text-muted small">{emptyMessage}</span>;
  }

  return (
    <>
      {items.map((item) => {
        const inputId = `${idPrefix}-${item.value}`;
        return (
          <div key={inputId} className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id={inputId}
              checked={selected.includes(item.value)}
              onChange={() => onToggle(item.value)}
            />
            <label className="form-check-label" htmlFor={inputId}>
              {item.label}
            </label>
          </div>
        );
      })}
    </>
  );
}

interface FilterRangeInputsProps {
  minId: string;
  maxId: string;
  minLabel: string;
  maxLabel: string;
  minValue: string;
  maxValue: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  placeholder?: string;
}

function FilterRangeInputs({
  minId,
  maxId,
  minLabel,
  maxLabel,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  placeholder = "m²",
}: FilterRangeInputsProps) {
  return (
    <div className="row g-2">
      <div className="col-6">
        <label htmlFor={minId} className="form-label small mb-1">
          {minLabel}
        </label>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          className="form-control form-control-sm"
          id={minId}
          placeholder={placeholder}
          value={minValue}
          onChange={(e) => onMinChange(e.target.value)}
        />
      </div>
      <div className="col-6">
        <label htmlFor={maxId} className="form-label small mb-1">
          {maxLabel}
        </label>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          className="form-control form-control-sm"
          id={maxId}
          placeholder={placeholder}
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value)}
        />
      </div>
    </div>
  );
}

const OPERACION_OPTIONS: RadioOption[] = [
  { value: "", label: "Todas" },
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
];

function PropertiesFiltersInner({
  cities,
  propertyTypes,
  roomCounts,
  isCollapsed,
  onToggleCollapse,
  searchParams,
  isPending,
  startTransition,
}: PropertiesFiltersInnerProps) {
  const router = useRouter();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const initialDormitorios = parseMultiple(searchParams.get("dormitorios"));
  const initialSupMin = searchParams.get("supmin") || "";
  const initialSupMax = searchParams.get("supmax") || "";

  const [filters, dispatch] = useReducer(filterReducer, undefined, () => ({
    operacion: searchParams.get("operacion") || "",
    propiedad: parseMultiple(searchParams.get("propiedad")),
    localidad: parseMultiple(searchParams.get("localidad")),
    dormitorios: initialDormitorios,
    soloDisponibles: searchParams.get("disponibles") === "1",
    supMin: initialSupMin,
    supMax: initialSupMax,
  }));

  const [expandedSections, setExpandedSections] = useState({
    operacion: true,
    propiedad: true,
    localidad: true,
    dormitorios: initialDormitorios.length > 0,
    superficie: initialSupMin !== "" || initialSupMax !== "",
  });

  const activeFilterCount =
    (filters.operacion ? 1 : 0) +
    filters.propiedad.length +
    filters.localidad.length +
    filters.dormitorios.length +
    (filters.soloDisponibles ? 1 : 0) +
    (filters.supMin || filters.supMax ? 1 : 0);

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (filters.operacion) params.set("operacion", filters.operacion);
    if (filters.propiedad.length > 0)
      params.set("propiedad", filters.propiedad.join(","));
    if (filters.localidad.length > 0)
      params.set("localidad", filters.localidad.join(","));
    if (filters.dormitorios.length > 0)
      params.set("dormitorios", filters.dormitorios.join(","));
    if (filters.soloDisponibles) params.set("disponibles", "1");
    if (filters.supMin) params.set("supmin", filters.supMin);
    if (filters.supMax) params.set("supmax", filters.supMax);

    const orden = searchParams.get("orden");
    if (orden) params.set("orden", orden);

    const queryString = params.toString();
    startTransition(() => {
      router.push(queryString ? `/propiedades?${queryString}` : "/propiedades");
    });
    setIsOpenMobile(false);
  };

  const clearFilters = () => {
    dispatch({ type: "RESET" });
    const orden = searchParams.get("orden");
    startTransition(() => {
      router.push(orden ? `/propiedades?orden=${orden}` : "/propiedades");
    });
    setIsOpenMobile(false);
  };

  const filterForm = (
    <>
      <ReferenceSearch />

      <div className="mb-4">
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="solo-disponibles"
            checked={filters.soloDisponibles}
            onChange={() => dispatch({ type: "TOGGLE_SOLO_DISPONIBLES" })}
          />
          <label className="form-check-label" htmlFor="solo-disponibles">
            Solo disponibles
          </label>
        </div>
      </div>

      <FilterAccordionSection
        id="filters-operacion"
        label="Operación"
        expanded={expandedSections.operacion}
        onToggle={() => toggleSection("operacion")}
      >
        <FilterRadioGroup
          name="operacion"
          idPrefix="operacion"
          value={filters.operacion}
          options={OPERACION_OPTIONS}
          onChange={(value) => dispatch({ type: "SET_OPERACION", value })}
        />
      </FilterAccordionSection>

      <FilterAccordionSection
        id="filters-propiedad"
        label="Tipo de propiedad"
        expanded={expandedSections.propiedad}
        onToggle={() => toggleSection("propiedad")}
      >
        <FilterCheckboxGroup
          idPrefix="propiedad"
          items={propertyTypes.map((t) => ({ value: t.slug, label: t.name }))}
          selected={filters.propiedad}
          onToggle={(slug) => dispatch({ type: "TOGGLE_PROPIEDAD", slug })}
        />
      </FilterAccordionSection>

      <FilterAccordionSection
        id="filters-localidad"
        label="Localidad"
        expanded={expandedSections.localidad}
        onToggle={() => toggleSection("localidad")}
        bodyStyle={{ maxHeight: 200, overflowY: "auto" }}
      >
        <FilterCheckboxGroup
          idPrefix="localidad"
          items={cities.map((c) => ({ value: c.slug, label: c.name }))}
          selected={filters.localidad}
          onToggle={(slug) => dispatch({ type: "TOGGLE_LOCALIDAD", slug })}
        />
      </FilterAccordionSection>

      <FilterAccordionSection
        id="filters-dormitorios"
        label="Dormitorios"
        expanded={expandedSections.dormitorios}
        onToggle={() => toggleSection("dormitorios")}
      >
        <FilterCheckboxGroup
          idPrefix="dormitorios"
          items={roomCounts.map((count) => ({
            value: count.toString(),
            label: `${count} ${count === 1 ? "dormitorio" : "dormitorios"}`,
          }))}
          selected={filters.dormitorios}
          onToggle={(value) => dispatch({ type: "TOGGLE_DORMITORIOS", value })}
        />
      </FilterAccordionSection>

      <FilterAccordionSection
        id="filters-superficie"
        label="Superficie (m²)"
        expanded={expandedSections.superficie}
        onToggle={() => toggleSection("superficie")}
      >
        <FilterRangeInputs
          minId="superficie-min"
          maxId="superficie-max"
          minLabel="Desde"
          maxLabel="Hasta"
          minValue={filters.supMin}
          maxValue={filters.supMax}
          onMinChange={(value) => dispatch({ type: "SET_SUP_MIN", value })}
          onMaxChange={(value) => dispatch({ type: "SET_SUP_MAX", value })}
        />
      </FilterAccordionSection>

      <div className="d-flex flex-column gap-2 pt-2 border-top">
        <button
          type="button"
          className="btn btn-primary"
          onClick={applyFilters}
          disabled={isPending}
          aria-busy={isPending}
        >
          Aplicar filtros
        </button>
        {activeFilterCount > 0 && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={clearFilters}
            disabled={isPending}
            aria-busy={isPending}
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      <button
        className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-between d-lg-none mb-4"
        type="button"
        onClick={() => setIsOpenMobile(!isOpenMobile)}
        aria-expanded={isOpenMobile}
        aria-controls="filters-form"
      >
        <span className="d-flex align-items-center gap-2">
          <i className="bi bi-funnel"></i>
          Filtros
          {activeFilterCount > 0 && (
            <span className="badge bg-primary rounded-pill">
              {activeFilterCount}
            </span>
          )}
        </span>
        <i className={`bi bi-chevron-${isOpenMobile ? "up" : "down"}`}></i>
      </button>

      {isCollapsed && (
        <div className="bg-light rounded-3 p-3 d-none d-lg-block">
          <button
            type="button"
            className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2 w-100"
            onClick={onToggleCollapse}
            title="Expandir filtros"
          >
            <i className="bi bi-funnel"></i>
            <span className="fw-semibold">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="badge bg-primary rounded-pill">
                {activeFilterCount}
              </span>
            )}
            <i className="bi bi-chevron-right ms-auto"></i>
          </button>
        </div>
      )}

      {(!isCollapsed || isOpenMobile) && (
        <div
          id="filters-form"
          className={`
            ${isOpenMobile ? "d-block" : "d-none"}
            d-lg-block
            ${isCollapsed ? "d-lg-none" : ""}
          `}
        >
          <div className="d-none d-lg-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0 fw-bold">Filtros</h5>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={onToggleCollapse}
              aria-label="Colapsar filtros"
              title="Colapsar filtros"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </div>

          <div className="bg-light rounded-3 p-3">{filterForm}</div>
        </div>
      )}
    </>
  );
}

export default function PropertiesFilters(props: PropertiesFiltersProps) {
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  return (
    <PropertiesFiltersInner
      key={searchKey}
      searchParams={searchParams}
      {...props}
    />
  );
}
