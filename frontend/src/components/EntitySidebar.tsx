
import { useMemo, useState } from 'react'

import {
  Search,
  Plane,
  Cog,
  Boxes,
  Factory,
  Building2,
  Wrench,
  ClipboardCheck,
  Fingerprint,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Network,
  TriangleAlert,
  Database,
  SlidersHorizontal,
  X,
  Crosshair,
  SearchX,
} from 'lucide-react'

import {
  generateAviationData,
  getDatasetStatistics,
} from '../data/generateAviationData'

import { useGraphStore } from '../store/useGraphStore'

import {
  searchEntities,
  getSearchResultSubtitle,
  highlightSearchMatch,
} from '../utils/searchEntities'

import type {
  AviationEntity,
} from '../types/aviation'

// ========================================
// DATASET
// ========================================

const dataset = generateAviationData(42)

const statistics = getDatasetStatistics(dataset)

const SEARCH_LIMIT = 30

// ========================================
// ENTITY CATEGORIES
// ========================================

const categories = [
  {
    id: 'aircraft',
    label: 'Aircraft',
    icon: Plane,
    color: '#a5f3fc',
  },
  {
    id: 'engines',
    label: 'Engines',
    icon: Cog,
    color: '#67e8f9',
  },
  {
    id: 'components',
    label: 'Components',
    icon: Boxes,
    color: '#4d9fb5',
  },
  {
    id: 'manufacturers',
    label: 'Manufacturers',
    icon: Factory,
    color: '#a5b4fc',
  },
  {
    id: 'airlines',
    label: 'Airlines',
    icon: Building2,
    color: '#5eead4',
  },
  {
    id: 'facilities',
    label: 'Maintenance Facilities',
    icon: Wrench,
    color: '#7dd3fc',
  },
  {
    id: 'inspections',
    label: 'Inspection Records',
    icon: ClipboardCheck,
    color: '#6ee7b7',
  },
  {
    id: 'passports',
    label: 'Digital Passports',
    icon: Fingerprint,
    color: '#94a3b8',
  },
  {
    id: 'ledger',
    label: 'Ledger Records',
    icon: ShieldCheck,
    color: '#38bdf8',
  },
] as const

// ========================================
// SAVED VIEWS
// ========================================

const savedViews = [
  {
    id: 'global',
    label: 'Global Asset Network',
    icon: Network,
    color: '#8cdae8',
  },
  {
    id: 'risk',
    label: 'Maintenance Risk Network',
    icon: TriangleAlert,
    color: '#fbbf24',
  },
  {
    id: 'verified',
    label: 'Verified Assets',
    icon: ShieldCheck,
    color: '#4ade80',
  },
]

// ========================================
// HIGHLIGHTED SEARCH TEXT
// ========================================

interface HighlightedTextProps {
  text: string
  query: string
}

function HighlightedText({
  text,
  query,
}: HighlightedTextProps) {
  const segments = highlightSearchMatch(
    text,
    query,
  )

  return (
    <>
      {segments.map((segment, index) => (
        <span
          key={index}
          className={
            segment.highlighted
              ? 'font-medium text-[#a5f3fc]'
              : undefined
          }
        >
          {segment.text}
        </span>
      ))}
    </>
  )
}

// ========================================
// MATCHED FIELD LABELS
// ========================================

function formatFieldName(field: string) {
  return field
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replaceAll('_', ' ')
    .toLowerCase()
}

// ========================================
// ENTITY SIDEBAR
// ========================================

export default function EntitySidebar() {
  const [search, setSearch] = useState('')

  const [categoriesOpen, setCategoriesOpen] =
    useState(true)

  const [savedViewsOpen, setSavedViewsOpen] =
    useState(true)

  const [lastRequestedEntityId, setLastRequestedEntityId] =
    useState<string | null>(null)

  // ======================================
  // ZUSTAND STORE
  // ======================================

  const hiddenCategories = useGraphStore(
    (state) => state.hiddenCategories,
  )

  const toggleVisibility = useGraphStore(
    (state) => state.toggleCategory,
  )

  const showAllCategories = useGraphStore(
    (state) => state.showAllCategories,
  )

  const hideAllCategories = useGraphStore(
    (state) => state.hideAllCategories,
  )

  const resetFilters = useGraphStore(
    (state) => state.resetFilters,
  )

  const navigateToEntity = useGraphStore(
    (state) => state.navigateToEntity,
  )

  // ======================================
  // SEARCH STATE
  // ======================================

  const normalizedQuery = search.trim()

  const isSearching =
    normalizedQuery.length > 0

  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return []
    }

    return searchEntities(
      dataset.entities,
      normalizedQuery,
      {
        limit: SEARCH_LIMIT + 1,
      },
    )
  }, [normalizedQuery])

  const visibleResults =
    searchResults.slice(0, SEARCH_LIMIT)

  const hasMoreResults =
    searchResults.length > SEARCH_LIMIT

  // ======================================
  // SEARCH ACTIONS
  // ======================================

  function handleSearchChange(value: string) {
    setSearch(value)

    setLastRequestedEntityId(null)
  }

  function clearSearch() {
    setSearch('')

    setLastRequestedEntityId(null)
  }

  function handleEntitySelection(
    entity: AviationEntity,
  ) {
    setLastRequestedEntityId(entity.id)

    navigateToEntity(
      entity.id,
      entity.type,
    )
  }

  // ======================================
  // RENDER SIDEBAR
  // ======================================

  return (
    <div className="flex h-full min-h-0 flex-col">

      {/* Header */}

      <div className="shrink-0 border-b border-[#242429] px-3 py-3">

        <div className="mb-3 flex items-center justify-between">

          <h2 className="text-[12px] font-semibold">
            Entity Explorer
          </h2>

          <SlidersHorizontal
            size={14}
            className="text-[#71717a]"
          />

        </div>

        {/* Entity search */}

        <div className="
          flex h-8 items-center gap-2 rounded-sm
          border border-[#323238] bg-[#09090b] px-2
          focus-within:border-[#4a9eaf]
        ">

          <Search
            size={13}
            className="shrink-0 text-[#71717a]"
          />

          <input
            type="text"
            aria-label="Search aviation entities"
            placeholder="Search entities..."
            autoComplete="off"
            spellCheck={false}
            value={search}
            onChange={(event) =>
              handleSearchChange(
                event.target.value,
              )
            }
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                clearSearch()
              }

              if (
                event.key === 'Enter' &&
                visibleResults.length > 0
              ) {
                event.preventDefault()

                handleEntitySelection(
                  visibleResults[0]!.entity,
                )
              }
            }}
            className="
              min-w-0 flex-1 bg-transparent
              text-[11px] text-[#e4e4e7]
              outline-none placeholder:text-[#71717a]
            "
          />

          {search.length > 0 && (
            <button
              type="button"
              title="Clear search"
              aria-label="Clear search"
              onClick={clearSearch}
              className="
                shrink-0 text-[#71717a]
                hover:text-[#e4e4e7]
              "
            >
              <X size={12} />
            </button>
          )}

        </div>

        {isSearching && (
          <div className="
            mt-2 flex items-center justify-between
            text-[9px] text-[#71717a]
          ">
            <span>Enter to locate first result</span>

            <span>Esc to clear</span>
          </div>
        )}

      </div>

      {/* Scrollable content */}

      <div className="min-h-0 flex-1 overflow-y-auto">

        {/* Network statistics */}

        <section className="border-b border-[#242429] p-3">

          <h3 className="
            mb-3 text-[10px] font-medium
            tracking-wider text-[#71717a]
          ">
            NETWORK OVERVIEW
          </h3>

          <div className="grid grid-cols-2 gap-3">

            <div>

              <div className="text-xl font-semibold tabular-nums text-[#8cdae8]">
                {statistics.totalEntities.toLocaleString()}
              </div>

              <div className="text-[10px] text-[#71717a]">
                Entities
              </div>

            </div>

            <div>

              <div className="text-xl font-semibold tabular-nums">
                {statistics.totalRelationships.toLocaleString()}
              </div>

              <div className="text-[10px] text-[#71717a]">
                Relationships
              </div>

            </div>

          </div>

        </section>

        {/* ================================= */}
        {/* SEARCH RESULTS                    */}
        {/* ================================= */}

        {isSearching ? (

          <section className="py-2">

            <div className="
              flex items-center justify-between
              px-3 py-2
            ">

              <h3 className="
                text-[10px] font-medium
                tracking-wider text-[#a1a1aa]
              ">
                SEARCH RESULTS
              </h3>

              <span
                aria-live="polite"
                className="
                  text-[10px] tabular-nums
                  text-[#8cdae8]
                "
              >
                {visibleResults.length}
                {hasMoreResults ? '+' : ''}
              </span>

            </div>

            {/* Empty search results */}

            {visibleResults.length === 0 && (

              <div className="
                flex flex-col items-center
                px-4 py-10 text-center
              ">

                <SearchX
                  size={25}
                  strokeWidth={1.3}
                  className="mb-3 text-[#52525b]"
                />

                <p className="text-[11px] text-[#a1a1aa]">
                  No matching entities
                </p>

                <p className="
                  mt-2 text-[10px]
                  leading-relaxed text-[#71717a]
                ">
                  Try an aircraft model, engine
                  serial number, manufacturer
                  or entity ID.
                </p>

                <button
                  type="button"
                  onClick={clearSearch}
                  className="
                    mt-4 rounded-sm
                    border border-[#323238]
                    px-3 py-1.5 text-[10px]
                    text-[#8cdae8]
                    hover:bg-[#18181b]
                  "
                >
                  Clear search
                </button>

              </div>

            )}

            {/* Ranked search results */}

            {visibleResults.map((result) => {
              const entity = result.entity

              const category = categories.find(
                (item) =>
                  item.id === entity.type,
              )

              const Icon =
                category?.icon ?? Network

              const color =
                category?.color ?? '#8cdae8'

              const isLastRequested =
                lastRequestedEntityId === entity.id

              const isHidden =
                hiddenCategories.includes(
                  entity.type,
                )

              const subtitle =
                getSearchResultSubtitle(entity)

              const matchedFields =
                result.matchedFields
                  .slice(0, 3)
                  .map(formatFieldName)
                  .join(', ')

              return (

                <button
                  key={entity.id}
                  type="button"
                  onClick={() =>
                    handleEntitySelection(entity)
                  }
                  title={`Locate ${entity.label} in graph`}
                  className={`
                    group flex w-full items-start
                    gap-2.5 border-b border-[#1d1d21]
                    border-l-2 px-3 py-3 text-left
                    transition-colors
                    ${
                      isLastRequested
                        ? 'border-l-[#67e8f9] bg-[#18272e]'
                        : 'border-l-transparent hover:bg-[#18181b]'
                    }
                  `}
                >

                  {/* Category icon */}

                  <div className="
                    mt-0.5 flex h-7 w-7 shrink-0
                    items-center justify-center
                    rounded-sm border border-[#30343b]
                    bg-[#111418]
                  ">

                    <Icon
                      size={15}
                      strokeWidth={1.6}
                      style={{ color }}
                    />

                  </div>

                  {/* Result details */}

                  <div className="min-w-0 flex-1">

                    <div className="
                      truncate text-[11px]
                      font-medium text-[#d4d4d8]
                    ">
                      <HighlightedText
                        text={entity.label}
                        query={normalizedQuery}
                      />
                    </div>

                    <div className="
                      mt-1 truncate
                      text-[9px] text-[#71717a]
                    ">
                      <HighlightedText
                        text={subtitle}
                        query={normalizedQuery}
                      />
                    </div>

                    <div className="
                      mt-1 text-[9px]
                      text-[#82949e]
                    ">
                      <HighlightedText
                        text={entity.id}
                        query={normalizedQuery}
                      />
                    </div>

                    {matchedFields && (

                      <div className="
                        mt-1.5 truncate
                        text-[9px] text-[#525f69]
                      ">
                        Match: {matchedFields}
                      </div>

                    )}

                    {isHidden && (

                      <div className="
                        mt-1.5 flex items-center
                        gap-1 text-[9px]
                        text-[#d6a85c]
                      ">

                        <EyeOff size={10} />

                        Hidden category

                      </div>

                    )}

                  </div>

                  {/* Navigate icon */}

                  <Crosshair
                    size={13}
                    className={`
                      mt-1 shrink-0
                      ${
                        isLastRequested
                          ? 'text-[#67e8f9]'
                          : 'text-[#52525b] group-hover:text-[#8cdae8]'
                      }
                    `}
                  />

                </button>

              )
            })}

            {hasMoreResults && (

              <div className="
                px-3 py-4 text-center
                text-[10px] leading-relaxed
                text-[#71717a]
              ">
                Showing the top {SEARCH_LIMIT} results.
                Refine your search to find a
                specific entity.
              </div>

            )}

          </section>

        ) : (

          <>

            {/* ================================= */}
            {/* ASSET CATEGORIES                  */}
            {/* ================================= */}

            <section className="border-b border-[#242429] py-2">

              <button
                type="button"
                aria-expanded={categoriesOpen}
                onClick={() =>
                  setCategoriesOpen(!categoriesOpen)
                }
                className="
                  flex w-full items-center gap-2 px-3 py-2
                  text-[11px] font-medium text-[#a1a1aa]
                  hover:bg-[#18181b]
                "
              >

                {categoriesOpen
                  ? <ChevronDown size={13} />
                  : <ChevronRight size={13} />
                }

                Asset Categories

                <span className="ml-auto text-[10px] text-[#52525b]">
                  {categories.length - hiddenCategories.length}
                  /
                  {categories.length}
                </span>

              </button>

              {categoriesOpen && (

                <div className="mt-1">

                  {/* Visibility controls */}

                  <div className="
                    flex items-center justify-between
                    gap-1 px-3 pb-2 text-[10px]
                  ">

                    <button
                      type="button"
                      onClick={showAllCategories}
                      className="text-[#8cdae8] hover:text-white"
                    >
                      Show all
                    </button>

                    <button
                      type="button"
                      onClick={hideAllCategories}
                      className="text-[#a1a1aa] hover:text-white"
                    >
                      Hide all
                    </button>

                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[#a1a1aa] hover:text-white"
                    >
                      Reset
                    </button>

                  </div>

                  {/* Category list */}

                  {categories.map((category) => {

                    const Icon = category.icon

                    const isHidden =
                      hiddenCategories.includes(
                        category.id,
                      )

                    const count =
                      statistics.categories[
                        category.id
                      ]

                    return (

                      <div
                        key={category.id}
                        className={`
                          group flex h-8 items-center gap-2
                          px-3 hover:bg-[#18181b]
                          ${isHidden ? 'opacity-40' : ''}
                        `}
                      >

                        <ChevronRight
                          size={11}
                          className="shrink-0 text-[#52525b]"
                        />

                        <Icon
                          size={14}
                          strokeWidth={1.6}
                          style={{
                            color: category.color,
                          }}
                          className="shrink-0"
                        />

                        <span className="
                          min-w-0 flex-1 truncate
                          text-[11px] text-[#a1a1aa]
                        ">
                          {category.label}
                        </span>

                        <span className="
                          min-w-6 text-right
                          text-[10px] tabular-nums
                          text-[#a1a1aa]
                        ">
                          {count.toLocaleString()}
                        </span>

                        <button
                          type="button"
                          aria-pressed={!isHidden}
                          aria-label={
                            `${isHidden ? 'Show' : 'Hide'} ${category.label}`
                          }
                          title={
                            isHidden
                              ? 'Show category'
                              : 'Hide category'
                          }
                          onClick={() =>
                            toggleVisibility(
                              category.id,
                            )
                          }
                          className="
                            shrink-0 text-[#71717a]
                            hover:text-[#8cdae8]
                          "
                        >

                          {isHidden
                            ? <EyeOff size={13} />
                            : <Eye size={13} />
                          }

                        </button>

                      </div>

                    )
                  })}

                </div>

              )}

            </section>

            {/* ================================= */}
            {/* SAVED VIEWS                       */}
            {/* ================================= */}

            <section className="py-2">

              <button
                type="button"
                aria-expanded={savedViewsOpen}
                onClick={() =>
                  setSavedViewsOpen(!savedViewsOpen)
                }
                className="
                  flex w-full items-center gap-2 px-3 py-2
                  text-[11px] font-medium text-[#a1a1aa]
                  hover:bg-[#18181b]
                "
              >

                {savedViewsOpen
                  ? <ChevronDown size={13} />
                  : <ChevronRight size={13} />
                }

                Saved Views

              </button>

              {savedViewsOpen && (

                <div className="mt-1">

                  {savedViews.map((view) => {

                    const Icon = view.icon

                    const isActive =
                      view.id === 'global'

                    return (

                      <button
                        key={view.id}
                        type="button"
                        disabled={!isActive}
                        className={`
                          flex h-8 w-full items-center
                          gap-2 px-4 text-left text-[11px]
                          ${
                            isActive
                              ? 'bg-[#18272e] text-[#8cdae8]'
                              : 'text-[#a1a1aa] opacity-50'
                          }
                        `}
                      >

                        <Icon
                          size={14}
                          strokeWidth={1.6}
                          style={{
                            color: view.color,
                          }}
                        />

                        <span className="truncate">
                          {view.label}
                        </span>

                      </button>

                    )
                  })}

                </div>

              )}

            </section>

          </>

        )}

      </div>

      {/* ================================= */}
      {/* DATA SOURCE FOOTER                */}
      {/* ================================= */}

      <div className="
        flex shrink-0 items-center gap-2
        border-t border-[#242429] p-3
      ">

        <Database
          size={13}
          className="text-[#71717a]"
        />

        <div className="min-w-0 flex-1">

          <p className="text-[10px] text-[#a1a1aa]">
            Synthetic Aviation Dataset
          </p>

          <div className="mt-1 flex items-center gap-1.5">

            <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />

            <p className="text-[9px] text-[#71717a]">
              Dataset initialized
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}
