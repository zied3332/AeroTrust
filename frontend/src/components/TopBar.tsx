
import {
  Network,
  Search,
  Bell,
  Settings,
  ChevronDown,
} from 'lucide-react'

export default function TopBar() {
  return (
    <div className="flex h-full items-center justify-between px-3">

      {/* Brand and workspace */}
      <div className="flex min-w-0 items-center gap-3">

        <div className="flex items-center gap-2">
          <Network
            size={22}
            strokeWidth={1.7}
            className="text-[#8cdae8]"
          />

          <span className="text-[15px] font-semibold tracking-tight">
            AeroTrust
          </span>
        </div>

        <div className="h-5 w-px bg-[#323238]" />

        <div className="flex items-center gap-2 text-[12px] text-[#a1a1aa]">
          <span>Intelligence Workspace</span>
          <ChevronDown size={12} />
        </div>

      </div>

      {/* Center navigation */}
      <div className="hidden h-full items-center gap-5 lg:flex">

        <div className="flex h-full items-center border-b border-[#8cdae8] text-[12px] text-[#8cdae8]">
          Knowledge Graph
        </div>

        <span className="text-[12px] text-[#71717a]">
          Asset Registry
        </span>

        <span className="text-[12px] text-[#71717a]">
          Maintenance
        </span>

        <span className="text-[12px] text-[#71717a]">
          Verification
        </span>

      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">

        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8cdae8]" />

          <span className="text-[10px] tracking-wider text-[#a1a1aa]">
            DEMO MODE
          </span>
        </div>

        <div className="h-5 w-px bg-[#323238]" />

        <div className="flex items-center gap-3 text-[#71717a]">
          <Search size={16} />
          <Bell size={16} />
          <Settings size={16} />
        </div>

        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#31505a] bg-[#182b32] text-[10px] font-medium text-[#8cdae8]">
          AT
        </div>

      </div>
    </div>
  )
}
