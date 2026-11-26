
import { useEffect, useRef } from 'react'
import Sigma from 'sigma'

import { generateAviationData } from '../../data/generateAviationData'

import {
  createGraph,
  type AviationGraph,
  type AviationNodeAttributes,
  type AviationEdgeAttributes,
} from '../../graph/createGraph'

import type { AviationEntity } from '../../types/aviation'

interface GraphCanvasProps {
  onEntitySelect?: (entity: AviationEntity | null) => void
}

export default function GraphCanvas({
  onEntitySelect,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const graphRef = useRef<AviationGraph | null>(null)

  const selectionCallbackRef = useRef(onEntitySelect)

  useEffect(() => {
    selectionCallbackRef.current = onEntitySelect
  }, [onEntitySelect])

  useEffect(() => {
    const container = containerRef.current

    if (!container) return

    // =====================================
    // 1. INITIALIZE AVIATION GRAPH
    // =====================================

    if (!graphRef.current) {
      const dataset = generateAviationData(42)

      graphRef.current = createGraph(dataset)
    }

    const graph = graphRef.current

    let selectedNode: string | null = null
    let hoveredNode: string | null = null

    let connectedNodes = new Set<string>()

    // =====================================
    // 2. INITIALIZE SIGMA RENDERER
    // =====================================

    const renderer = new Sigma(graph, container, {
      renderLabels: true,
      renderEdgeLabels: false,

      defaultNodeColor: '#67e8f9',
      defaultEdgeColor: '#25434c',

      labelFont: 'Inter, Arial, sans-serif',
      labelSize: 11,
      labelWeight: '400',

      labelColor: {
        color: '#a1a1aa',
      },

      labelDensity: 0.07,
      labelGridCellSize: 100,
      labelRenderedSizeThreshold: 6,

      minCameraRatio: 0.05,
      maxCameraRatio: 8,

      stagePadding: 35,

      zIndex: true,

      // ===================================
      // NODE APPEARANCE
      // ===================================

      nodeReducer: (
        node,
        data: AviationNodeAttributes,
      ) => {
        const result = { ...data }

        const focusedNode =
          selectedNode ?? hoveredNode

        if (!focusedNode) {
          return result
        }

        if (node === focusedNode) {
          result.color = '#cffafe'
          result.size = data.size * 1.5
          result.highlighted = true
          result.forceLabel = true
          result.zIndex = 10

          return result
        }

        if (connectedNodes.has(node)) {
          result.forceLabel = true
          result.zIndex = 5

          return result
        }

        result.color = '#20262d'
        result.label = ''
        result.forceLabel = false
        result.highlighted = false
        result.zIndex = 0

        return result
      },

      // ===================================
      // EDGE APPEARANCE
      // ===================================

      edgeReducer: (
        edge,
        data: AviationEdgeAttributes,
      ) => {
        const result = { ...data }

        const focusedNode =
          selectedNode ?? hoveredNode

        if (!focusedNode) {
          return result
        }

        const source = graph.source(edge)
        const target = graph.target(edge)

        if (
          source === focusedNode ||
          target === focusedNode
        ) {
          result.color = '#67e8f9'
          result.size = 1.5
          result.zIndex = 5

          return result
        }

        result.color = '#15191e'
        result.size = 0.3
        result.zIndex = 0

        return result
      },
    })

    // =====================================
    // 3. UPDATE FOCUSED NEIGHBORHOOD
    // =====================================

    function updateNeighborhood() {
      const focusedNode =
        selectedNode ?? hoveredNode

      connectedNodes = focusedNode
        ? new Set(graph.neighbors(focusedNode))
        : new Set<string>()

      renderer.refresh()
    }

    // =====================================
    // 4. NODE HOVER
    // =====================================

    renderer.on('enterNode', ({ node }) => {
      hoveredNode = node

      container.style.cursor = 'pointer'

      updateNeighborhood()
    })

    renderer.on('leaveNode', () => {
      hoveredNode = null

      container.style.cursor = 'default'

      updateNeighborhood()
    })

    // =====================================
    // 5. NODE SELECTION
    // =====================================

    renderer.on('clickNode', ({ node }) => {
      selectedNode = node

      const entity = graph.getNodeAttribute(
        node,
        'entity',
      )

      selectionCallbackRef.current?.(entity)

      updateNeighborhood()
    })

    // =====================================
    // 6. CLEAR SELECTION
    // =====================================

    renderer.on('clickStage', () => {
      selectedNode = null
      hoveredNode = null

      connectedNodes.clear()

      selectionCallbackRef.current?.(null)

      renderer.refresh()
    })

    // =====================================
    // 7. DOUBLE-CLICK TO FOCUS
    // =====================================

    renderer.on('doubleClickNode', ({ node, event }) => {
      event.preventSigmaDefault()

      const displayData =
        renderer.getNodeDisplayData(node)

      if (!displayData) return

      renderer.getCamera().animate(
        {
          x: displayData.x,
          y: displayData.y,
          ratio: 0.25,
        },
        {
          duration: 500,
        },
      )
    })

    // =====================================
    // 8. DEVELOPMENT STATISTICS
    // =====================================

    console.info('AeroTrust graph initialized', {
      entities: graph.order,
      relationships: graph.size,
      synthetic: true,
    })

    // =====================================
    // 9. CLEANUP
    // =====================================

    return () => {
      renderer.kill()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: 'transparent',
      }}
      aria-label="Aviation asset knowledge graph"
    />
  )
}
