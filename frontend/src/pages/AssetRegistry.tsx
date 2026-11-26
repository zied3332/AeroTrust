
import { useMemo, useState } from 'react'

import {
  Plane,
  Cog,
  Boxes,
  Database,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Activity,
  ShieldCheck,
  Download,
  X,
  Filter,
} from 'lucide-react'

import {
  generateAviationData,
} from '../data/generateAviationData'

import {
  searchEntities,
} from '../utils/searchEntities'

import type {
  AviationEntity,
  AssetStatus,
} from '../types/aviation'

// ========================================
// DATASET
// ========================================

const dataset = generateAviationData(42)

const assets = dataset.entities.filter(
  (entity) =>
    entity.type === 'aircraft' ||
    entity.type === 'engines' ||
    entity.type === 'components',
)

const PAGE_SIZE = 12

type AssetTypeFilter =
  | 'all'
  | 'aircraft'
  | 'engines'
  | 'components'

type StatusFilter = 'all' | AssetStatus

// ========================================
// VISUAL CONFIGURATION
// ========================================

const assetTypes = {
  aircraft: {
    label: 'Aircraft',
    icon: Plane,
    color: '#67e8f9',
  },
  engines: {
    label: 'Engine',
    icon: Cog,
    color: '#60a5fa',
  },
  components: {
    label: 'Component',
    icon: Boxes,
    color: '#a5b4fc',
  },
} as const

const statusColors: Record<AssetStatus, string> = {
  operational: '#4ade80',
  maintenance: '#fbbf24',
  inspection_required: '#fb923c',
  grounded: '#f87171',
  retired: '#94a3b8',
}

const selectClass = `
  h-9 rounded-md border border-[#30343b]
  bg-[#111418] px-3 text-[11px]
  text-[#a1a1aa] outline-none
  focus:border-[#67e8f9]
`

function formatLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (character) =>
      character.toUpperCase(),
    )
}

function getAssetType(entity: AviationEntity) {
  if (entity.type === 'aircraft') {
    return assetTypes.aircraft
  }

  if (entity.type === 'engines') {
    return assetTypes.engines
  }

  return assetTypes.components
}

function getSerialNumber(entity: AviationEntity) {
  return String(
    entity.metadata.serialNumber ??
    entity.metadata.partNumber ??
    entity.id,
  )
}

function getOperatingHours(entity: AviationEntity) {
  const value =
    entity.metadata.flightHours ??
    entity.metadata.operatingHours

  return typeof value === 'number'
    ? value.toLocaleString()
    : '—'
}

// ========================================
// STATUS INDICATOR
// ========================================

function StatusIndicator({
  status,
}: {
  status?: AssetStatus
}) {
  const color = status
    ? statusColors[status]
    : '#71717a'

  return (
    <span
      className="
        inline-flex items-center gap-1.5
        whitespace-nowrap rounded-sm
        border px-2 py-1 text-[10px]
      "
      style={{
        color,
        borderColor: `${color}30`,
        backgroundColor: `${color}0c`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />

      {status
        ? formatLabel(status)
        : 'Unknown'}
    </span>
  )
}

// ========================================
// ASSET REGISTRY PAGE
// ========================================

export default function AssetRegistry() {
  const [search, setSearch] = useState('')

  const [typeFilter, setTypeFilter] =
    useState<AssetTypeFilter>('all')

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all')

  const [page, setPage] = useState(1)

  const [selectedAsset, setSelectedAsset] =
    useState<AviationEntity | null>(null)

  // ======================================
  // REGISTRY STATISTICS
  // ======================================

  const aircraftCount = assets.filter(
    (asset) => asset.type === 'aircraft',
  ).length

  const engineCount = assets.filter(
    (asset) => asset.type === 'engines',
  ).length

  const componentCount = assets.filter(
    (asset) => asset.type === 'components',
  ).length

  const operationalCount = assets.filter(
    (asset) => asset.status === 'operational',
  ).length

  const operationalPercentage =
    assets.length > 0
      ? Math.round(
          operationalCount / assets.length * 100,
        )
      : 0

  const metrics = [
    {
      label: 'Total registered assets',
      value: assets.length,
      icon: Database,
      color: '#67e8f9',
      description: 'Synthetic asset inventory',
    },
    {
      label: 'Aircraft',
      value: aircraftCount,
      icon: Plane,
      color: '#67e8f9',
      description: 'Registered airframes',
    },
    {
      label: 'Engines',
      value: engineCount,
      icon: Cog,
      color: '#60a5fa',
      description: 'Installed powerplants',
    },
    {
      label: 'Components',
      value: componentCount,
      icon: Boxes,
      color: '#a5b4fc',
      description: 'Tracked aircraft parts',
    },
  ]

  // ======================================
  // SEARCH AND FILTERING
  // ======================================

  const filteredAssets = useMemo(() => {
    let results = assets.filter((asset) => {
      const matchesType =
        typeFilter === 'all' ||
        asset.type === typeFilter

      const matchesStatus =
        statusFilter === 'all' ||
        asset.status === statusFilter

      return matchesType && matchesStatus
    })

    if (search.trim()) {
      results = searchEntities(
        results,
        search,
        { limit: results.length },
      ).map((result) => result.entity)
    }

    return results
  }, [search, typeFilter, statusFilter])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAssets.length / PAGE_SIZE),
  )

  const currentPage = Math.min(page, totalPages)

  const startIndex =
    (currentPage - 1) * PAGE_SIZE

  const visibleAssets = filteredAssets.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  )

  function resetFilters() {
    setSearch('')
    setTypeFilter('all')
    setStatusFilter('all')
    setPage(1)
  }

  // ======================================
  // CSV EXPORT
  // ======================================

  function exportAssets() {
    const escapeCsv = (value: unknown) =>
      `"${String(value ?? '').replaceAll('"', '""')}"`

    const rows = [
      [
        'Asset ID',
        'Name',
        'Type',
        'Serial Number',
        'Status',
        'Operating Hours',
        'Synthetic',
      ],
      ...filteredAssets.map((asset) => [
        asset.id,
        asset.label,
        asset.type,
        getSerialNumber(asset),
        asset.status ?? '',
        asset.metadata.flightHours ??
          asset.metadata.operatingHours ??
          '',
        'true',
      ]),
    ]

    const csv = rows
      .map((row) =>
        row.map(escapeCsv).join(','),
      )
      .join('\n')

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')

    link.href = url
    link.download = 'aerotrust-demo-assets.csv'

    document.body.appendChild(link)

    link.click()
    link.remove()

    window.setTimeout(
      () => URL.revokeObjectURL(url),
      1000,
    )
  }

  // ======================================
  // PAGE RENDER
  // ======================================

  return (
    <div className="
      relative h-full min-h-0 w-full
      overflow-y-auto bg-[#09090b]
    ">

      <div className="
        mx-auto max-w-[1800px]
        space-y-6 p-6 xl:p-8
      ">

        {/* Page header */}

        <div className="
          flex flex-wrap items-start
          justify-between gap-4
        ">

          <div>

            <div className="
              mb-3 flex items-center gap-2
              text-[10px] uppercase
              tracking-[0.18em] text-[#71717a]
            ">
              <Database size={13} />

              Aviation Intelligence

              <ChevronRight size={11} />

              <span className="text-[#8cdae8]">
                Asset Registry
              </span>
            </div>

            <h1 className="
              text-2xl font-semibold
              tracking-tight text-[#f4f4f5]
            ">
              Aviation Asset Registry
            </h1>

            <p className="
              mt-2 text-[12px] text-[#71717a]
            ">
              Explore and monitor aircraft,
              engines and registered components.
            </p>

          </div>

          <button
            type="button"
            onClick={exportAssets}
            className="
              flex h-9 items-center gap-2
              rounded-md border border-[#31505a]
              bg-[#14252b] px-4
              text-[11px] font-medium
              text-[#8cdae8]
              hover:bg-[#203740]
            "
          >
            <Download size={14} />

            Export registry
          </button>

        </div>

        {/* Overview metrics */}

        <div className="
          grid grid-cols-2 gap-3
          xl:grid-cols-4
        ">

          {metrics.map((metric) => {
            const Icon = metric.icon

            return (
              <div
                key={metric.label}
                className="
                  rounded-md border
                  border-[#27272d]
                  bg-[#111114] p-4
                "
              >

                <div className="
                  flex items-center
                  justify-between gap-2
                ">

                  <span className="
                    text-[11px] text-[#a1a1aa]
                  ">
                    {metric.label}
                  </span>

                  <div
                    className="
                      flex h-8 w-8 items-center
                      justify-center rounded-md
                      border
                    "
                    style={{
                      color: metric.color,
                      borderColor: `${metric.color}25`,
                      backgroundColor: `${metric.color}0c`,
                    }}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.5}
                    />
                  </div>

                </div>

                <div className="
                  mt-3 text-3xl font-semibold
                  tracking-tight tabular-nums
                  text-[#e4e4e7]
                ">
                  {metric.value.toLocaleString()}
                </div>

                <p className="
                  mt-2 text-[10px] text-[#71717a]
                ">
                  {metric.description}
                </p>

              </div>
            )
          })}

        </div>

        {/* Fleet health overview */}

        <div className="
          grid gap-3 lg:grid-cols-[1.5fr_1fr]
        ">

          <section className="
            rounded-md border border-[#27272d]
            bg-[#111114] p-4
          ">

            <div className="
              flex items-center justify-between
            ">

              <div className="
                flex items-center gap-2
                text-[12px] text-[#d4d4d8]
              ">
                <Activity
                  size={15}
                  className="text-[#4ade80]"
                />

                Asset operational status
              </div>

              <span className="
                font-mono text-[12px]
                text-[#4ade80]
              ">
                {operationalPercentage}%
              </span>

            </div>

            {/* Status distribution bar */}

            <div className="
              mt-5 flex h-2.5
              overflow-hidden rounded-sm
              bg-[#242429]
            ">

              {Object.entries(statusColors).map(
                ([status, color]) => {
                  const count = assets.filter(
                    (asset) =>
                      asset.status === status,
                  ).length

                  return (
                    <div
                      key={status}
                      title={`${formatLabel(status)}: ${count}`}
                      style={{
                        width: `${count / assets.length * 100}%`,
                        backgroundColor: color,
                      }}
                    />
                  )
                },
              )}

            </div>

            <div className="
              mt-4 flex flex-wrap gap-x-5 gap-y-2
            ">

              {Object.entries(statusColors).map(
                ([status, color]) => (
                  <div
                    key={status}
                    className="
                      flex items-center gap-1.5
                      text-[10px] text-[#a1a1aa]
                    "
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: color,
                      }}
                    />

                    {formatLabel(status)}

                    <span className="
                      tabular-nums text-[#71717a]
                    ">
                      {assets.filter(
                        (asset) =>
                          asset.status === status,
                      ).length}
                    </span>
                  </div>
                ),
              )}

            </div>

          </section>

          {/* Verification overview */}

          <section className="
            rounded-md border border-[#27272d]
            bg-[#111114] p-4
          ">

            <div className="
              flex items-center gap-2
              text-[12px] text-[#d4d4d8]
            ">
              <ShieldCheck
                size={15}
                className="text-[#67e8f9]"
              />

              Digital asset identity
            </div>

            <div className="
              mt-4 flex items-end justify-between
            ">

              <div>

                <div className="
                  text-2xl font-semibold
                  tabular-nums text-[#8cdae8]
                ">
                  {dataset.entities.filter(
                    (entity) =>
                      entity.type === 'passports',
                  ).length}
                </div>

                <p className="
                  mt-1 text-[10px] text-[#71717a]
                ">
                  Digital asset passports
                </p>

              </div>

              <span className="
                rounded-sm border
                border-[#665126] bg-[#211c12]
                px-2 py-1 text-[10px]
                text-[#fbbf24]
              ">
                Verification pending
              </span>

            </div>

          </section>

        </div>

        {/* Registry table */}

        <section className="
          overflow-hidden rounded-md
          border border-[#27272d]
          bg-[#111114]
        ">

          {/* Table heading */}

          <div className="
            flex flex-wrap items-center
            justify-between gap-3
            border-b border-[#27272d] p-4
          ">

            <div>

              <h2 className="
                text-[13px] font-medium
                text-[#e4e4e7]
              ">
                Registered assets
              </h2>

              <p className="
                mt-1 text-[10px] text-[#71717a]
              ">
                {filteredAssets.length} matching records
              </p>

            </div>

            <div className="
              flex flex-wrap items-center gap-2
            ">

              <div className="
                flex h-9 items-center gap-2
                rounded-md border border-[#30343b]
                bg-[#09090b] px-3
                focus-within:border-[#67e8f9]
              ">

                <Search
                  size={14}
                  className="text-[#71717a]"
                />

                <input
                  aria-label="Search assets"
                  placeholder="Search ID, model, serial..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                  className="
                    w-40 bg-transparent
                    text-[11px] outline-none
                    placeholder:text-[#52525b]
                    xl:w-56
                  "
                />

                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setSearch('')
                      setPage(1)
                    }}
                    className="text-[#71717a]"
                  >
                    <X size={12} />
                  </button>
                )}

              </div>

              <select
                aria-label="Filter by asset type"
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(
                    event.target.value as AssetTypeFilter,
                  )
                  setPage(1)
                }}
                className={selectClass}
              >
                <option value="all">All types</option>
                <option value="aircraft">Aircraft</option>
                <option value="engines">Engines</option>
                <option value="components">Components</option>
              </select>

              <select
                aria-label="Filter by asset status"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.target.value as StatusFilter,
                  )
                  setPage(1)
                }}
                className={selectClass}
              >
                <option value="all">All statuses</option>

                {Object.keys(statusColors).map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {formatLabel(status)}
                    </option>
                  ),
                )}

              </select>

              <button
                type="button"
                onClick={resetFilters}
                title="Reset filters"
                aria-label="Reset filters"
                className="
                  flex h-9 w-9 items-center
                  justify-center rounded-md
                  border border-[#30343b]
                  text-[#71717a]
                  hover:text-[#8cdae8]
                "
              >
                <Filter size={14} />
              </button>

            </div>

          </div>

          {/* Asset records */}

          <div className="overflow-x-auto">

            <table className="
              w-full min-w-[800px]
              border-collapse text-left
            ">

              <thead className="
                border-b border-[#27272d]
                bg-[#151519]
              ">

                <tr>

                  {[
                    'Asset identifier',
                    'Asset name',
                    'Category',
                    'Serial number',
                    'Operating hours',
                    'Status',
                    '',
                  ].map((heading, index) => (
                    <th
                      key={index}
                      className="
                        whitespace-nowrap px-4 py-3
                        text-[10px] font-medium
                        text-[#71717a]
                      "
                    >
                      {heading}
                    </th>
                  ))}

                </tr>

              </thead>

              <tbody>

                {visibleAssets.map((asset) => {
                  const category =
                    getAssetType(asset)

                  const Icon = category.icon

                  return (
                    <tr
                      key={asset.id}
                      className="
                        border-b border-[#222227]
                        transition-colors
                        hover:bg-[#171b20]
                      "
                    >

                      <td className="
                        whitespace-nowrap px-4 py-3
                        font-mono text-[11px]
                        text-[#8cdae8]
                      ">
                        {asset.id}
                      </td>

                      <td className="px-4 py-3">

                        <div className="
                          flex items-center gap-3
                        ">

                          <div
                            className="
                              flex h-8 w-8 shrink-0
                              items-center justify-center
                              rounded-md border
                            "
                            style={{
                              color: category.color,
                              borderColor:
                                `${category.color}25`,
                              backgroundColor:
                                `${category.color}0c`,
                            }}
                          >
                            <Icon
                              size={15}
                              strokeWidth={1.5}
                            />
                          </div>

                          <div>

                            <p className="
                              whitespace-nowrap
                              text-[11px] font-medium
                              text-[#e4e4e7]
                            ">
                              {asset.label}
                            </p>

                            <p className="
                              mt-1 text-[9px]
                              text-[#71717a]
                            ">
                              {String(
                                asset.metadata.registration ??
                                asset.metadata.position ??
                                'Registered asset',
                              )}
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="
                        px-4 py-3 text-[11px]
                        text-[#a1a1aa]
                      ">
                        {category.label}
                      </td>

                      <td className="
                        whitespace-nowrap px-4 py-3
                        font-mono text-[10px]
                        text-[#a1a1aa]
                      ">
                        {getSerialNumber(asset)}
                      </td>

                      <td className="
                        whitespace-nowrap px-4 py-3
                        text-[11px] tabular-nums
                        text-[#d4d4d8]
                      ">
                        {getOperatingHours(asset)}
                      </td>

                      <td className="px-4 py-3">
                        <StatusIndicator
                          status={asset.status}
                        />
                      </td>

                      <td className="px-4 py-3">

                        <button
                          type="button"
                          aria-label={`Inspect ${asset.id}`}
                          title="Inspect asset"
                          onClick={() =>
                            setSelectedAsset(asset)
                          }
                          className="
                            rounded-sm p-1.5
                            text-[#71717a]
                            hover:bg-[#203039]
                            hover:text-[#67e8f9]
                          "
                        >
                          <ArrowUpRight size={15} />
                        </button>

                      </td>

                    </tr>
                  )
                })}

              </tbody>

            </table>

            {visibleAssets.length === 0 && (
              <div className="
                flex flex-col items-center
                py-16 text-center
              ">

                <Search
                  size={28}
                  className="text-[#52525b]"
                />

                <p className="
                  mt-4 text-[12px]
                  text-[#a1a1aa]
                ">
                  No matching assets
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="
                    mt-3 text-[11px]
                    text-[#8cdae8]
                  "
                >
                  Reset filters
                </button>

              </div>
            )}

          </div>

          {/* Pagination */}

          <div className="
            flex items-center justify-between
            gap-3 px-4 py-3
          ">

            <span className="
              text-[10px] text-[#71717a]
            ">
              Showing {
                filteredAssets.length === 0
                  ? 0
                  : startIndex + 1
              }–{
                Math.min(
                  startIndex + PAGE_SIZE,
                  filteredAssets.length,
                )
              } of {filteredAssets.length} assets
            </span>

            <div className="
              flex items-center gap-3
            ">

              <button
                type="button"
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() =>
                  setPage(currentPage - 1)
                }
                className="
                  rounded border border-[#30343b]
                  p-1.5 text-[#a1a1aa]
                  hover:text-[#67e8f9]
                  disabled:opacity-30
                "
              >
                <ChevronLeft size={14} />
              </button>

              <span className="
                text-[11px] tabular-nums
                text-[#a1a1aa]
              ">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                aria-label="Next page"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setPage(currentPage + 1)
                }
                className="
                  rounded border border-[#30343b]
                  p-1.5 text-[#a1a1aa]
                  hover:text-[#67e8f9]
                  disabled:opacity-30
                "
              >
                <ChevronRight size={14} />
              </button>

            </div>

          </div>

        </section>

        {/* Demo disclosure */}

        <div className="
          flex items-center gap-2
          text-[10px] text-[#52525b]
        ">

          <Database size={12} />

          Synthetic aviation dataset ·
          Demonstration purposes only ·
          AeroTrust v0.1.0

        </div>

      </div>

      {/* ================================= */}
      {/* ASSET DETAILS DRAWER              */}
      {/* ================================= */}

      {selectedAsset && (

        <div className="
          fixed inset-0 z-50
          flex justify-end
        ">

          <button
            type="button"
            aria-label="Close asset details"
            onClick={() =>
              setSelectedAsset(null)
            }
            className="
              absolute inset-0
              bg-black/60 backdrop-blur-[2px]
            "
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Asset details"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setSelectedAsset(null)
              }
            }}
            className="
              relative h-full w-full max-w-[420px]
              overflow-y-auto border-l
              border-[#30343b]
              bg-[#111114] shadow-2xl
            "
          >

            <div className="
              flex items-center justify-between
              border-b border-[#27272d] p-5
            ">

              <span className="
                text-[12px] font-medium
                text-[#a1a1aa]
              ">
                Asset details
              </span>

              <button
                type="button"
                autoFocus
                aria-label="Close details"
                onClick={() =>
                  setSelectedAsset(null)
                }
                className="
                  text-[#71717a]
                  hover:text-white
                "
              >
                <X size={18} />
              </button>

            </div>

            <div className="space-y-6 p-5">

              <div>

                <p className="
                  font-mono text-[11px]
                  text-[#67e8f9]
                ">
                  {selectedAsset.id}
                </p>

                <h2 className="
                  mt-2 text-xl font-semibold
                  text-[#e4e4e7]
                ">
                  {selectedAsset.label}
                </h2>

                <div className="mt-3">
                  <StatusIndicator
                    status={selectedAsset.status}
                  />
                </div>

                <p className="
                  mt-4 text-[12px]
                  leading-relaxed text-[#a1a1aa]
                ">
                  {selectedAsset.description}
                </p>

              </div>

              <section className="
                rounded-md border border-[#30343b]
                bg-[#151519] p-4
              ">

                <h3 className="
                  mb-4 text-[11px] font-medium
                  text-[#d4d4d8]
                ">
                  Asset specifications
                </h3>

                <div className="space-y-4">

                  {Object.entries(
                    selectedAsset.metadata,
                  ).map(([key, value]) => (

                    <div
                      key={key}
                      className="
                        flex items-start
                        justify-between gap-4
                      "
                    >

                      <span className="
                        text-[11px] text-[#71717a]
                      ">
                        {formatLabel(key)}
                      </span>

                      <span className="
                        break-all text-right
                        font-mono text-[11px]
                        text-[#d4d4d8]
                      ">
                        {value === null
                          ? 'Not available'
                          : String(value)}
                      </span>

                    </div>

                  ))}

                </div>

              </section>

              <section className="
                rounded-md border border-[#30343b]
                bg-[#151519] p-4
              ">

                <div className="
                  flex items-center gap-2
                  text-[12px] text-[#d4d4d8]
                ">

                  <ShieldCheck
                    size={15}
                    className="text-[#67e8f9]"
                  />

                  Digital identity

                </div>

                <p className="
                  mt-3 text-[11px]
                  leading-relaxed text-[#71717a]
                ">
                  This synthetic asset is part of the
                  AeroTrust demonstration dataset.
                  Ledger verification is not yet connected.
                </p>

              </section>

            </div>

          </aside>

        </div>

      )}

    </div>
  )
}
