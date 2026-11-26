
import WorkspaceLayout from './layouts/WorkspaceLayout'
import TopBar from './components/TopBar'
import NavigationRail from './components/NavigationRail'
function App() {
  return (
    <WorkspaceLayout

      header={<TopBar />}

      navigation={<NavigationRail />}

      sidebar={
        <div className="p-3">
          <h2 className="text-[12px] font-medium text-[#e4e4e7]">
            Entity Explorer
          </h2>

          <p className="mt-2 text-[11px] text-[#71717a]">
            Aviation asset categories
          </p>
        </div>
      }

      workspace={
        <div className="relative flex h-full w-full flex-col">

          {/* Workspace toolbar */}
          <div className="flex h-10 shrink-0 items-center border-b border-[#242429] bg-[#111114] px-4">

            <span className="text-[12px] text-[#a1a1aa]">
              Global Asset Network
            </span>

          </div>

          {/* Future graph canvas */}
          <div
            className="relative flex flex-1 items-center justify-center"
            style={{
              backgroundImage:
                'radial-gradient(#242429 0.7px, transparent 0.7px)',
              backgroundSize: '24px 24px',
            }}
          >
            <div className="text-center">

              <h1 className="text-lg font-medium text-[#e4e4e7]">
                Aviation Knowledge Graph
              </h1>

              <p className="mt-2 text-[12px] text-[#71717a]">
                Graph engine not initialized
              </p>

            </div>
          </div>

        </div>
      }

      inspector={
        <div className="p-3">

          <h2 className="text-[12px] font-medium text-[#e4e4e7]">
            Entity Inspector
          </h2>

          <p className="mt-2 text-[11px] text-[#71717a]">
            No entity selected
          </p>

        </div>
      }

      statusBar={
        <div className="flex h-full items-center justify-between px-3 text-[10px] text-[#71717a]">

          <div className="flex items-center gap-2">

            <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />

            <span>Frontend online</span>

            <span className="text-[#323238]">|</span>

            <span>Synthetic data workspace</span>

          </div>

          <div className="flex items-center gap-4">
            <span>0 Entities</span>
            <span>0 Relationships</span>
            <span>AeroTrust v0.1.0</span>
          </div>

        </div>
      }

    />
  )
}

export default App
