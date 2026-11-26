
import {
  LayoutDashboard,
  Network,
  Plane,
  Boxes,
  Wrench,
  Fingerprint,
  ShieldCheck,
  Settings,
  CircleHelp,
} from 'lucide-react'

const navigationItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    id: 'graph',
    label: 'Knowledge Graph',
    icon: Network,
  },
  {
    id: 'aircraft',
    label: 'Aircraft Registry',
    icon: Plane,
  },
  {
    id: 'components',
    label: 'Component Registry',
    icon: Boxes,
  },
  {
    id: 'maintenance',
    label: 'Maintenance Intelligence',
    icon: Wrench,
  },
  {
    id: 'passports',
    label: 'Digital Asset Passports',
    icon: Fingerprint,
  },
  {
    id: 'verification',
    label: 'Hedera Verification',
    icon: ShieldCheck,
  },
]

export default function NavigationRail() {
  const activeItem = 'graph'

  return (
    <div className="flex h-full flex-col justify-between">

      {/* Main navigation */}
      <div className="flex flex-col items-center gap-1 py-2">

        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id

          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              disabled={!isActive}
              className={`
                relative flex h-9 w-9
                items-center justify-center
                rounded-sm transition-colors
                ${
                  isActive
                    ? 'bg-[#20343c] text-[#8cdae8]'
                    : 'text-[#71717a]'
                }
              `}
            >
              {isActive && (
                <span className="
                  absolute -left-1 h-5 w-[2px]
                  rounded-r bg-[#8cdae8]
                " />
              )}

              <Icon size={18} strokeWidth={1.6} />

            </button>
          )
        })}

      </div>

      {/* Bottom navigation */}
      <div className="
        flex flex-col items-center gap-1
        border-t border-[#242429] py-2
      ">

        <button
          type="button"
          title="Settings"
          aria-label="Settings"
          disabled
          className="
            flex h-9 w-9 items-center justify-center
            rounded-sm text-[#71717a]
          "
        >
          <Settings size={18} strokeWidth={1.6} />
        </button>

        <button
          type="button"
          title="Help and documentation"
          aria-label="Help and documentation"
          disabled
          className="
            flex h-9 w-9 items-center justify-center
            rounded-sm text-[#71717a]
          "
        >
          <CircleHelp size={18} strokeWidth={1.6} />
        </button>

      </div>

    </div>
  )
}
