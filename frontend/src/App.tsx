
import { useState } from 'react'

import WorkspaceLayout from './layouts/WorkspaceLayout'
import TopBar from './components/TopBar'
import NavigationRail from './components/NavigationRail'
import EntitySidebar from './components/EntitySidebar'
import GraphCanvas from './components/graph/GraphCanvas'

import {
  generateAviationData,
  getDatasetStatistics,
} from './data/generateAviationData'

import {
  ENTITY_CATEGORIES,
  type AviationEntity,
} from './types/aviation'

const dataset = generateAviationData(42)
const statistics = getDatasetStatistics(dataset)

function App() {
  const [selectedEntity, setSelectedEntity] =
    useState<AviationEntity | null>(null)

  return (
    <WorkspaceLayout
      header={<TopBar />}

      navigation={<NavigationRail />}

      sidebar={<EntitySidebar />}

      workspace={
        <div className="relative flex h-full min-h-0 w-full min-w-0 flex-col">

          {/* Workspace toolbar */}
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#242429] bg-[#111114] px-4">

            <div className="flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-[#67e8f9]" />

              <span className="text-[12px] text-[#a1a1aa]">
                Global Asset Network
              </span>

            </div>

            <div className="flex items-center gap-4 text-[10px] text-[#71717a]">

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
            className="relative min-h-0 min-w-0 flex-1 overflow-hidden"
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
            <div className="pointer-events-none absolute bottom-4 left-4 z-10">

              <div className="rounded border border-[#242429] bg-[#111114]/90 px-3 py-2 text-[10px] text-[#71717a]">

                Scroll to zoom · Drag to pan · Click to inspect

              </div>

            </div>

          </div>

        </div>
      }

      inspector={
        <div className="p-3">

          <h2 className="text-[12px] font-medium text-[#e4e4e7]">
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

                <span className="text-[10px] uppercase tracking-wider text-[#a1a1aa]">

                  {ENTITY_CATEGORIES[selectedEntity.type].label}

                </span>

              </div>

              {/* Entity name */}
              <h3 className="mt-3 break-words text-[15px] font-medium text-[#e4e4e7]">

                {selectedEntity.label}

              </h3>

              {/* Entity identifier */}
              <p className="mt-1 font-mono text-[11px] text-[#71717a]">

                {selectedEntity.id}

              </p>

              {/* Description */}
              <p className="mt-4 text-[12px] leading-relaxed text-[#a1a1aa]">

                {selectedEntity.description}

              </p>

              {/* Asset status */}
              {selectedEntity.status && (

                <div className="mt-4 border-t border-[#242429] pt-4">

                  <span className="text-[10px] uppercase tracking-wider text-[#71717a]">
                    Asset Status
                  </span>

                  <p className="mt-2 text-[12px] capitalize text-[#e4e4e7]">

                    {selectedEntity.status.replaceAll('_', ' ')}

                  </p>

                </div>

              )}

              {/* Verification status */}
              {selectedEntity.verificationStatus && (

                <div className="mt-4 border-t border-[#242429] pt-4">

                  <span className="text-[10px] uppercase tracking-wider text-[#71717a]">
                    Verification Status
                  </span>

                  <p className="mt-2 text-[12px] capitalize text-[#e4e4e7]">

                    {selectedEntity.verificationStatus}

                  </p>

                </div>

              )}

              {/* Entity metadata */}
              <div className="mt-5 border-t border-[#242429] pt-4">

                <h4 className="text-[10px] uppercase tracking-wider text-[#71717a]">
                  Properties
                </h4>

                <div className="mt-3 space-y-3">

                  {Object.entries(selectedEntity.metadata).map(
                    ([key, value]) => (

                      <div key={key}>

                        <p className="text-[10px] text-[#71717a]">

                          {key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (character) =>
                              character.toUpperCase(),
                            )}

                        </p>

                        <p className="mt-1 break-all font-mono text-[11px] text-[#d4d4d8]">

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

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#27272a] text-lg text-[#52525b]">

                i

              </div>

              <p className="mt-4 text-[12px] text-[#a1a1aa]">

                No entity selected

              </p>

              <p className="mt-2 text-[11px] leading-relaxed text-[#71717a]">

                Select a node in the knowledge graph to inspect its properties.

              </p>

            </div>

          )}

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

            <span>
              {statistics.totalEntities.toLocaleString()} Entities
            </span>

            <span>
              {statistics.totalRelationships.toLocaleString()} Relationships
            </span>

            <span>AeroTrust v0.1.0</span>

          </div>

        </div>
      }
    />
  )
}

export default App
