import type { ReactNode } from 'react'

// ========================================
// LAYOUT TYPES
// ========================================

export type WorkspaceMode =
  | 'graph'
  | 'dashboard'

interface WorkspaceLayoutProps {
  header: ReactNode
  navigation: ReactNode
  sidebar?: ReactNode
  workspace: ReactNode
  inspector?: ReactNode
  statusBar: ReactNode
  mode?: WorkspaceMode
}

// ========================================
// WORKSPACE LAYOUT
// ========================================

export default function WorkspaceLayout({
  header,
  navigation,
  sidebar,
  workspace,
  inspector,
  statusBar,
  mode = 'graph',
}: WorkspaceLayoutProps) {

  const isGraphMode = mode === 'graph'

  const gridColumns = isGraphMode
    ? 'grid-cols-[44px_240px_minmax(0,1fr)_290px]'
    : 'grid-cols-[44px_minmax(0,1fr)]'

  return (
    <div
      className="
        grid h-screen w-screen
        grid-rows-[44px_minmax(0,1fr)_26px]
        overflow-hidden
        bg-[#09090b]
        text-[#e4e4e7]
      "
    >

      {/* Top navigation */}

      <header
        className="
          min-w-0
          border-b border-[#242429]
          bg-[#111114]
        "
      >
        {header}
      </header>

      {/* Main application area */}

      <div
        className={`
          grid min-h-0 min-w-0
          overflow-hidden
          ${gridColumns}
        `}
      >

        {/* Navigation rail */}

        <nav
          aria-label="Main navigation"
          className="
            min-h-0 overflow-y-auto
            border-r border-[#242429]
            bg-[#111114]
          "
        >
          {navigation}
        </nav>

        {/* Left entity explorer */}

        {isGraphMode && (
          <aside
            className="
              min-h-0 min-w-0
              overflow-y-auto
              border-r border-[#242429]
              bg-[#111114]
            "
          >
            {sidebar}
          </aside>
        )}

        {/* Central workspace */}

        <main
          className="
            relative flex
            min-h-0 min-w-0
            flex-col overflow-hidden
            bg-[#09090b]
          "
        >
          {workspace}
        </main>

        {/* Right entity inspector */}

        {isGraphMode && (
          <aside
            className="
              min-h-0 min-w-0
              overflow-y-auto
              border-l border-[#242429]
              bg-[#111114]
            "
          >
            {inspector}
          </aside>
        )}

      </div>

      {/* Bottom status bar */}

      <footer
        className="
          min-w-0
          border-t border-[#242429]
          bg-[#111114]
        "
      >
        {statusBar}
      </footer>

    </div>
  )
}