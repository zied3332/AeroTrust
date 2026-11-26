import {
  Network,
  Search,
  Bell,
  Settings,
  ChevronDown,
} from 'lucide-react'

// ========================================
// NAVIGATION TYPES
// ========================================

export type AppPage =
  | 'graph'
  | 'assets'
  | 'maintenance'
  | 'verification'

interface TopBarProps {
  activePage?: AppPage
  onPageChange?: (page: AppPage) => void
}

// ========================================
// NAVIGATION CONFIGURATION
// ========================================

const navigationItems: {
  id: AppPage
  label: string
}[] = [
  {
    id: 'graph',
    label: 'Knowledge Graph',
  },
  {
    id: 'assets',
    label: 'Asset Registry',
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
  },
  {
    id: 'verification',
    label: 'Verification',
  },
]

// ========================================
// TOP BAR
// ========================================

export default function TopBar({
  activePage = 'graph',
  onPageChange,
}: TopBarProps) {
  return (
    <div className="
      flex h-full items-center
      justify-between gap-4 px-3
    ">

      {/* Brand and workspace */}

      <div className="
        flex min-w-0 shrink-0
        items-center gap-3
      ">

        <button
          type="button"
          title="AeroTrust Knowledge Graph"
          onClick={() => onPageChange?.('graph')}
          className="flex items-center gap-2"
        >

          <Network
            size={22}
            strokeWidth={1.7}
            className="text-[#8cdae8]"
          />

          <span className="
            text-[15px] font-semibold
            tracking-tight
          ">
            AeroTrust
          </span>

        </button>

        <div className="
          hidden h-5 w-px
          bg-[#323238] xl:block
        " />

        <div className="
          hidden items-center gap-2
          text-[12px] text-[#a1a1aa]
          xl:flex
        ">

          <span>Intelligence Workspace</span>

          <ChevronDown size={12} />

        </div>

      </div>

      {/* Center navigation */}

      <nav
        aria-label="Workspace pages"
        className="
          flex h-full min-w-0
          items-center gap-4
          overflow-x-auto
          lg:gap-6
        "
      >

        {navigationItems.map((item) => {
          const isActive =
            activePage === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onPageChange?.(item.id)
              }
              aria-current={
                isActive ? 'page' : undefined
              }
              className={`
                relative flex h-full shrink-0
                items-center whitespace-nowrap
                border-b text-[12px]
                transition-colors duration-150
                ${
                  isActive
                    ? 'border-[#8cdae8] text-[#8cdae8]'
                    : 'border-transparent text-[#71717a] hover:text-[#d4d4d8]'
                }
              `}
            >

              {item.label}

            </button>
          )
        })}

      </nav>

      {/* Right controls */}

      <div className="
        flex shrink-0 items-center gap-4
      ">

        {/* Demo environment indicator */}

        <div className="
          flex items-center gap-2
        ">

        
         
        </div>

        <div className="
          hidden h-5 w-px
          bg-[#323238] md:block
        " />

        {/* Workspace utility icons */}

        <div className="
          hidden items-center gap-3
          text-[#71717a] md:flex
        ">

          <Search
            size={16}
            aria-hidden="true"
          />

          <Bell
            size={16}
            aria-hidden="true"
          />

          <Settings
            size={16}
            aria-hidden="true"
          />

        </div>

        {/* Workspace avatar */}

        <div className="
          flex h-7 w-7 items-center
          justify-center rounded-full
          border border-[#31505a]
          bg-[#182b32] text-[10px]
          font-medium text-[#8cdae8]
        ">
          AT
        </div>

      </div>

    </div>
  )
}