
import { useState } from 'react'
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
} from 'lucide-react'

const categories = [
  {
    id: 'aircraft',
    label: 'Aircraft',
    icon: Plane,
    color: '#67e8f9',
  },
  {
    id: 'engines',
    label: 'Engines',
    icon: Cog,
    color: '#60a5fa',
  },
  {
    id: 'components',
    label: 'Components',
    icon: Boxes,
    color: '#818cf8',
  },
  {
    id: 'manufacturers',
    label: 'Manufacturers',
    icon: Factory,
    color: '#c084fc',
  },
  {
    id: 'airlines',
    label: 'Airlines',
    icon: Building2,
    color: '#2dd4bf',
  },
  {
    id: 'facilities',
    label: 'Maintenance Facilities',
    icon: Wrench,
    color: '#fbbf24',
  },
  {
    id: 'inspections',
    label: 'Inspection Records',
    icon: ClipboardCheck,
    color: '#4ade80',
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
]

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

export default function EntitySidebar() {
  const [search, setSearch] = useState('')
  const [categoriesOpen, setCategoriesOpen] = useState(true)
  const [savedViewsOpen, setSavedViewsOpen] = useState(true)

  const [hiddenCategories, setHiddenCategories] =
    useState<string[]>([])

  const filteredCategories = categories.filter((category) =>
    category.label
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  )

  function toggleVisibility(id: string) {
    setHiddenCategories((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">

      {/* Header */}
      <div className="border-b border-[#242429] px-3 py-3">

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[12px] font-semibold">
            Entity Explorer
          </h2>

          <SlidersHorizontal
            size={14}
            className="text-[#71717a]"
          />
        </div>

        {/* Category search */}
        <div className="
          flex h-8 items-center gap-2 rounded-sm
          border border-[#323238] bg-[#09090b] px-2
          focus-within:border-[#4a9eaf]
        ">
          <Search size={13} className="text-[#71717a]" />

          <input
            type="text"
            aria-label="Search entity categories"
            placeholder="Search entities..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="
              min-w-0 flex-1 bg-transparent
              text-[11px] text-[#e4e4e7]
              outline-none placeholder:text-[#71717a]
            "
          />
        </div>

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
              <div className="text-xl font-semibold text-[#8cdae8]">
                0
              </div>
              <div className="text-[10px] text-[#71717a]">
                Entities
              </div>
            </div>

            <div>
              <div className="text-xl font-semibold">
                0
              </div>
              <div className="text-[10px] text-[#71717a]">
                Relationships
              </div>
            </div>

          </div>

        </section>

        {/* Asset categories */}
        <section className="border-b border-[#242429] py-2">

          <button
            type="button"
            aria-expanded={categoriesOpen}
            onClick={() => setCategoriesOpen(!categoriesOpen)}
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
          </button>

          {categoriesOpen && (
            <div className="mt-1">

              {filteredCategories.map((category) => {
                const Icon = category.icon
                const isHidden = hiddenCategories.includes(category.id)

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
                      style={{ color: category.color }}
                      className="shrink-0"
                    />

                    <span className="
                      min-w-0 flex-1 truncate
                      text-[11px] text-[#a1a1aa]
                    ">
                      {category.label}
                    </span>

                    <span className="text-[10px] text-[#71717a]">
                      0
                    </span>

                    <button
                      type="button"
                      aria-label={`${isHidden ? 'Show' : 'Hide'} ${category.label}`}
                      title={isHidden ? 'Show category' : 'Hide category'}
                      onClick={() => toggleVisibility(category.id)}
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

              {filteredCategories.length === 0 && (
                <p className="px-4 py-3 text-[11px] text-[#71717a]">
                  No matching categories
                </p>
              )}

            </div>
          )}

        </section>

        {/* Saved views */}
        <section className="py-2">

          <button
            type="button"
            aria-expanded={savedViewsOpen}
            onClick={() => setSavedViewsOpen(!savedViewsOpen)}
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
                const isActive = view.id === 'global'

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
                          : 'text-[#a1a1aa]'
                      }
                    `}
                  >
                    <Icon
                      size={14}
                      strokeWidth={1.6}
                      style={{ color: view.color }}
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

      </div>

      {/* Data source footer */}
      <div className="
        flex items-center gap-2
        border-t border-[#242429] p-3
      ">
        <Database size={13} className="text-[#71717a]" />

        <div>
          <p className="text-[10px] text-[#a1a1aa]">
            Synthetic Aviation Dataset
          </p>
          <p className="text-[9px] text-[#71717a]">
            Awaiting initialization
          </p>
        </div>
      </div>

    </div>
  )
}
