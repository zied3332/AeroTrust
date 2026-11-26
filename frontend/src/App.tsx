import { useState } from 'react'

import { ShieldCheck } from 'lucide-react'

import WorkspaceLayout from './layouts/WorkspaceLayout'

import TopBar, {
  type AppPage,
} from './components/TopBar'

import NavigationRail from './components/NavigationRail'
import EntitySidebar from './components/EntitySidebar'
import GraphCanvas from './components/graph/GraphCanvas'

import AssetRegistry from './pages/AssetRegistry'
import PredictiveMaintenance from './pages/PredictiveMaintenance'

import {
  generateAviationData,
  getDatasetStatistics,
} from './data/generateAviationData'

import {
  ENTITY_CATEGORIES,
  type AviationEntity,
} from './types/aviation'

// ========================================
// DATASET
// ========================================

const dataset = generateAviationData(42)

const statistics = getDatasetStatistics(dataset)

// ========================================
// APPLICATION
// ========================================

function App() {

  const [activePage, setActivePage] =
    useState<AppPage>('graph')

  const [selectedEntity, setSelectedEntity] =
    useState<AviationEntity | null>(null)

  const isGraphPage = activePage === 'graph'

  // ======================================
  // PAGE NAVIGATION
  // ======================================

  function handlePageChange(page: AppPage) {

    if (page === activePage) {
      return
    }

    setSelectedEntity(null)

    setActivePage(page)
  }

  // ======================================
  // KNOWLEDGE GRAPH WORKSPACE
  // ======================================

  function renderGraphWorkspace() {

    return (
      <div className="
        relative flex h-full min-h-0
        w-full min-w-0 flex-col
      ">

        {/* Workspace toolbar */}

        <div className="
          flex h-10 shrink-0 items-center
          justify-between border-b
          border-[#242429] bg-[#111114] px-4
        ">

          <div className="flex items-center gap-2">

            <span className="
              h-1.5 w-1.5 rounded-full
              bg-[#67e8f9]
            " />

            <span className="
              text-[12px] text-[#a1a1aa]
            ">
              Global Asset Network
            </span>

          </div>

          <div className="
            flex items-center gap-4
            text-[10px] text-[#71717a]
          ">

            <span>
              {statistics.totalEntities.toLocaleString()} nodes
            </span>

            <span>
              {statistics.totalRelationships.toLocaleString()} edges
            </span>

          </div>

        </div>

        {/* Aviation knowledge graph */}

        <div
          className="
            relative min-h-0 min-w-0
            flex-1 overflow-hidden
          "
          style={{
            backgroundImage:
              'radial-gradient(#242429 0.7px, transparent 0.7px)',

            backgroundSize: '24px 24px',
          }}
        >

          <GraphCanvas
            onEntitySelect={setSelectedEntity}
          />

          {/* Graph interaction hint */}

          <div className="
            pointer-events-none absolute
            bottom-4 left-4 z-10
          ">

            <div className="
              rounded border border-[#242429]
              bg-[#111114]/90 px-3 py-2
              text-[10px] text-[#71717a]
            ">
              Scroll to zoom · Drag to pan · Click to inspect
            </div>

          </div>

        </div>

      </div>
    )
  }

  // ======================================
  // ENTITY INSPECTOR
  // ======================================

  function renderEntityInspector() {

    return (
      <div className="p-3">

        <h2 className="
          text-[12px] font-medium
          text-[#e4e4e7]
        ">
          Entity Inspector
        </h2>

        {selectedEntity ? (

          <div className="mt-5">

            {/* Entity category */}

            <div className="flex items-center gap-2">

              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    ENTITY_CATEGORIES[selectedEntity.type].color,
                }}
              />

              <span className="
                text-[10px] uppercase
                tracking-wider text-[#a1a1aa]
              ">
                {ENTITY_CATEGORIES[selectedEntity.type].label}
              </span>

            </div>

            {/* Entity name */}

            <h3 className="
              mt-3 break-words text-[15px]
              font-medium text-[#e4e4e7]
            ">
              {selectedEntity.label}
            </h3>

            {/* Entity identifier */}

            <p className="
              mt-1 font-mono
              text-[11px] text-[#71717a]
            ">
              {selectedEntity.id}
            </p>

            {/* Description */}

            <p className="
              mt-4 text-[12px]
              leading-relaxed text-[#a1a1aa]
            ">
              {selectedEntity.description}
            </p>

            {/* Asset status */}

            {selectedEntity.status && (

              <div className="
                mt-4 border-t
                border-[#242429] pt-4
              ">

                <span className="
                  text-[10px] uppercase
                  tracking-wider text-[#71717a]
                ">
                  Asset Status
                </span>

                <p className="
                  mt-2 text-[12px]
                  capitalize text-[#e4e4e7]
                ">
                  {selectedEntity.status.replaceAll('_', ' ')}
                </p>

              </div>

            )}

            {/* Verification status */}

            {selectedEntity.verificationStatus && (

              <div className="
                mt-4 border-t
                border-[#242429] pt-4
              ">

                <span className="
                  text-[10px] uppercase
                  tracking-wider text-[#71717a]
                ">
                  Verification Status
                </span>

                <p className="
                  mt-2 text-[12px]
                  capitalize text-[#e4e4e7]
                ">
                  {selectedEntity.verificationStatus}
                </p>

              </div>

            )}

            {/* Entity metadata */}

            <div className="
              mt-5 border-t
              border-[#242429] pt-4
            ">

              <h4 className="
                text-[10px] uppercase
                tracking-wider text-[#71717a]
              ">
                Properties
              </h4>

              <div className="mt-3 space-y-3">

                {Object.entries(selectedEntity.metadata).map(
                  ([key, value]) => (

                    <div key={key}>

                      <p className="
                        text-[10px] text-[#71717a]
                      ">

                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (character) =>
                            character.toUpperCase(),
                          )}

                      </p>

                      <p className="
                        mt-1 break-all font-mono
                        text-[11px] text-[#d4d4d8]
                      ">

                        {value === null
                          ? 'Not available'
                          : String(value)}

                      </p>

                    </div>

                  ),
                )}

              </div>

            </div>

          </div>

        ) : (

          <div className="mt-8 text-center">

            <div className="
              mx-auto flex h-12 w-12
              items-center justify-center
              rounded-full border border-[#27272a]
              text-lg text-[#52525b]
            ">
              i
            </div>

            <p className="
              mt-4 text-[12px] text-[#a1a1aa]
            ">
              No entity selected
            </p>

            <p className="
              mt-2 text-[11px]
              leading-relaxed text-[#71717a]
            ">
              Select a node in the knowledge graph
              to inspect its properties.
            </p>

          </div>

        )}

      </div>
    )
  }

  // ======================================
  // TEMPORARY VERIFICATION PAGE
  // ======================================

  function renderVerificationPlaceholder() {

    return (
      <div className="
        flex h-full w-full flex-col
        items-center justify-center p-8
      ">

        <div className="
          flex h-16 w-16 items-center
          justify-center rounded-xl
          border border-[#31505a]
          bg-[#182b32]
        ">

          <ShieldCheck
            size={28}
            strokeWidth={1.5}
            className="text-[#67e8f9]"
          />

        </div>

        <h1 className="
          mt-6 text-xl font-semibold
          tracking-tight text-[#e4e4e7]
        ">
          Hedera Verification
        </h1>

        <p className="
          mt-3 max-w-md text-center
          text-[12px] leading-relaxed
          text-[#71717a]
        ">
          Explore digital asset passports,
          decentralized verification and
          tamper-evident aviation records.
        </p>

        <span className="
          mt-5 rounded border
          border-[#665126] bg-[#211c12]
          px-3 py-1.5 text-[10px]
          uppercase tracking-wider
          text-[#fbbf24]
        ">
          Testnet integration pending
        </span>

        <button
          type="button"
          onClick={() => handlePageChange('assets')}
          className="
            mt-6 text-[11px]
            text-[#8cdae8] hover:underline
          "
        >
          Explore Asset Registry
        </button>

      </div>
    )
  }

  // ======================================
  // ACTIVE WORKSPACE
  // ======================================

  function renderWorkspace() {

    switch (activePage) {

      case 'graph':
        return renderGraphWorkspace()

      case 'assets':
        return <AssetRegistry />

      case 'maintenance':
        return <PredictiveMaintenance />

      case 'verification':
        return renderVerificationPlaceholder()

      default:
        return renderGraphWorkspace()
    }
  }

  // ======================================
  // APPLICATION STATUS BAR
  // ======================================

  function renderStatusBar() {

    return (
      <div className="
        flex h-full items-center
        justify-between px-3
        text-[10px] text-[#71717a]
      ">

        <div className="flex items-center gap-2">

          <span className="
            h-1.5 w-1.5 rounded-full
            bg-[#4ade80]
          " />

          <span>Frontend online</span>

          <span className="text-[#323238]">
            |
          </span>

          <span>Synthetic data workspace</span>

        </div>

        <div className="flex items-center gap-4">

          <span>
            {statistics.totalEntities.toLocaleString()} Entities
          </span>

          <span>
            {statistics.totalRelationships.toLocaleString()} Relationships
          </span>

          <span>AeroTrust v0.1.0</span>

        </div>

      </div>
    )
  }

  // ======================================
  // APPLICATION LAYOUT
  // ======================================

  return (
    <WorkspaceLayout

      mode={
        isGraphPage
          ? 'graph'
          : 'dashboard'
      }

      header={
        <TopBar
          activePage={activePage}
          onPageChange={handlePageChange}
        />
      }

      navigation={
        <NavigationRail />
      }

      sidebar={
        isGraphPage
          ? <EntitySidebar />
          : undefined
      }

      workspace={
        renderWorkspace()
      }

      inspector={
        isGraphPage
          ? renderEntityInspector()
          : undefined
      }

      statusBar={
        renderStatusBar()
      }

    />
  )
}

export default App