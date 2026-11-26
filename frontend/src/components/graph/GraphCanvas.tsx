
import { useEffect, useRef, useState } from 'react'

import Sigma from 'sigma'

import {
  Plus,
  Minus,
  Crosshair,
  Maximize,
  Minimize,
} from 'lucide-react'

import { generateAviationData } from '../../data/generateAviationData'

import {
  createGraph,
  type AviationGraph,
  type AviationNodeAttributes,
  type AviationEdgeAttributes,
} from '../../graph/createGraph'

import type {
  AviationEntity,
  EntityType,
} from '../../types/aviation'

// ========================================
// TYPES
// ========================================

interface GraphCanvasProps {
  onEntitySelect?: (
    entity: AviationEntity | null
  ) => void
}

interface GraphControls {
  zoomIn: () => void
  zoomOut: () => void
  reset: () => void
}

interface GraphStatistics {
  nodes: number
  edges: number
}

// ========================================
// VISUAL CONFIGURATION
// ========================================

const HUB_TYPES = new Set<EntityType>([
  'manufacturers',
  'airlines',
  'facilities',
])

const DETAIL_TYPES = new Set<EntityType>([
  'inspections',
  'passports',
  'ledger',
])

const INITIAL_CAMERA_RATIO = 0.72

const TOOL_BUTTON_CLASS = `
  flex h-9 w-9 items-center justify-center
  text-[#a1a1aa]
  transition-colors
  hover:bg-[#20242b]
  hover:text-[#a5f3fc]
`

// ========================================
// GRAPH CANVAS
// ========================================

export default function GraphCanvas({
  onEntitySelect,
}: GraphCanvasProps) {
  const workspaceRef =
    useRef<HTMLDivElement>(null)

  const containerRef =
    useRef<HTMLDivElement>(null)

  const glowCanvasRef =
    useRef<HTMLCanvasElement>(null)

  const graphRef =
    useRef<AviationGraph | null>(null)

  const controlsRef =
    useRef<GraphControls | null>(null)

  const selectionCallbackRef =
    useRef(onEntitySelect)

  const [fullscreen, setFullscreen] =
    useState(false)

  const [statistics, setStatistics] =
    useState<GraphStatistics>({
      nodes: 0,
      edges: 0,
    })

  useEffect(() => {
    selectionCallbackRef.current =
      onEntitySelect
  }, [onEntitySelect])

  // ======================================
  // FULLSCREEN STATE
  // ======================================

  useEffect(() => {
    function handleFullscreenChange() {
      setFullscreen(
        document.fullscreenElement ===
          workspaceRef.current,
      )
    }

    document.addEventListener(
      'fullscreenchange',
      handleFullscreenChange,
    )

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange,
      )
    }
  }, [])

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await workspaceRef.current
          ?.requestFullscreen()
      }
    } catch (error) {
      console.warn(
        'Fullscreen unavailable:',
        error,
      )
    }
  }

  // ======================================
  // INITIALIZE GRAPH
  // ======================================

  useEffect(() => {
    const container = containerRef.current
    const glowCanvas = glowCanvasRef.current

    if (!container || !glowCanvas) return

    if (!graphRef.current) {
      const dataset = generateAviationData(42)

      graphRef.current = createGraph(dataset)
    }

    const graph = graphRef.current

    let selectedNode: string | null = null

    let connectedNodes = new Set<string>()

    let cameraRatio = INITIAL_CAMERA_RATIO

    let detailLevel = 0

    let hoveredNode: string | null = null

    // ====================================
    // VISIBILITY RULES
    // ====================================

    function isNodeVisible(node: string) {
      const attributes =
        graph.getNodeAttributes(node)

      if (
        selectedNode === node ||
        connectedNodes.has(node)
      ) {
        return true
      }

      if (
        DETAIL_TYPES.has(
          attributes.entityType,
        )
      ) {
        if (
          attributes.entityType ===
          'inspections'
        ) {
          return detailLevel >= 1
        }

        return detailLevel >= 2
      }

      return !attributes.hidden
    }

    function isEdgeVisible(edge: string) {
      const source = graph.source(edge)
      const target = graph.target(edge)

      if (
        !isNodeVisible(source) ||
        !isNodeVisible(target)
      ) {
        return false
      }

      if (
        selectedNode &&
        (
          source === selectedNode ||
          target === selectedNode
        )
      ) {
        return true
      }

      const attributes =
        graph.getEdgeAttributes(edge)

      if (detailLevel >= 2) {
        return true
      }

      if (detailLevel >= 1) {
        return (
          attributes.primary ||
          attributes.relationship.type ===
            'HAS_INSPECTION' ||
          attributes.relationship.type ===
            'HAS_COMPONENT'
        )
      }

      return attributes.primary
    }

    // ====================================
    // SIGMA RENDERER
    // ====================================

    const renderer = new Sigma(
      graph,
      container,
      {
        renderLabels: true,

        renderEdgeLabels: false,

        defaultNodeColor: '#67e8f9',

        defaultEdgeColor: '#294752',

        labelFont:
          'Inter, Arial, sans-serif',

        labelSize: 10,

        labelWeight: '400',

        labelColor: {
          color: '#b3c8d1',
        },

        labelDensity: 0.12,

        labelGridCellSize: 90,

        labelRenderedSizeThreshold: 5,

        minCameraRatio: 0.035,

        maxCameraRatio: 4,

        stagePadding: 40,

        zIndex: true,

        hideEdgesOnMove: false,

        hideLabelsOnMove: true,

        // ================================
        // CUSTOM HOVER LABEL
        // ================================

        defaultDrawNodeHover: (
          context,
          data,
        ) => {
          if (!data.label) return

          const fontSize = 11

          context.font =
            `${fontSize}px Inter, Arial, sans-serif`

          const textWidth =
            context.measureText(
              data.label,
            ).width

          const x =
            data.x + data.size + 8

          const y = data.y - 13

          const width = textWidth + 16

          const height = 26

          context.save()

          // Node outline

          context.beginPath()

          context.arc(
            data.x,
            data.y,
            data.size + 3,
            0,
            Math.PI * 2,
          )

          context.strokeStyle = '#a5f3fc'

          context.lineWidth = 1

          context.stroke()

          // Dark tooltip

          context.beginPath()

          context.roundRect(
            x,
            y,
            width,
            height,
            4,
          )

          context.fillStyle = '#111820'

          context.fill()

          context.strokeStyle = '#294752'

          context.stroke()

          // Tooltip text

          context.fillStyle = '#d9f4fa'

          context.textBaseline = 'middle'

          context.fillText(
            data.label,
            x + 8,
            y + height / 2,
          )

          context.restore()
        },

        // ================================
        // NODE APPEARANCE
        // ================================

        nodeReducer: (
          node,
          data: AviationNodeAttributes,
        ) => {
          const result = {
            ...data,

            hidden: !isNodeVisible(node),

            highlighted: false,

            zIndex: 0,
          }

          const isHub = HUB_TYPES.has(
            data.entityType,
          )

          if (result.hidden) {
            return result
          }

          if (!selectedNode) {
            result.forceLabel =
              data.forceLabel ||
              (
                detailLevel >= 1 &&
                isHub
              )

            if (
              detailLevel === 0 &&
              !isHub
            ) {
              result.label = ''
            }

            if (node === hoveredNode) {
              result.label = data.label

              result.color = '#cffafe'

              result.zIndex = 5
            }

            return result
          }

          // Selected entity

          if (node === selectedNode) {
            result.color = '#cffafe'

            result.size =
              Math.max(data.size * 1.4, 5)

            result.forceLabel = true

            result.zIndex = 10

            return result
          }

          // Direct neighbors

          if (connectedNodes.has(node)) {
            result.forceLabel = true

            result.zIndex = 5

            result.size =
              Math.max(data.size, 2.5)

            return result
          }

          // Background entities

          result.color = '#202b33'

          result.label = ''

          result.forceLabel = false

          return result
        },

        // ================================
        // EDGE APPEARANCE
        // ================================

        edgeReducer: (
          edge,
          data: AviationEdgeAttributes,
        ) => {
          const source = graph.source(edge)

          const target = graph.target(edge)

          const result = {
            ...data,

            hidden: !isEdgeVisible(edge),

            zIndex: 0,
          }

          if (result.hidden) {
            return result
          }

          const isBridge =
            data.relationship.type ===
              'HAS_ENGINE' ||
            data.relationship.type ===
              'SERVICED_AT' ||
            (
              data.relationship.type ===
                'MANUFACTURED_BY' &&
              graph.getNodeAttribute(
                source,
                'entityType',
              ) === 'aircraft'
            )

          if (!selectedNode) {
            result.color = isBridge
              ? '#162832'
              : '#315866'

            result.size = isBridge
              ? 0.25
              : 0.45

            return result
          }

          // Highlight selected relationships

          if (
            source === selectedNode ||
            target === selectedNode
          ) {
            result.hidden = false

            result.color = '#67e8f9'

            result.size = 1.2

            result.zIndex = 5

            return result
          }

          // Fade unrelated relationships

          result.color = '#121a20'

          result.size = 0.2

          return result
        },
      },
    )

    const camera = renderer.getCamera()

    // ====================================
    // GLOW CANVAS
    // ====================================

    function drawGlow() {
      const context =
        glowCanvas!.getContext('2d')

      if (!context) return

      const width = container!.clientWidth

      const height = container!.clientHeight

      if (!width || !height) return

      const pixelRatio =
        window.devicePixelRatio || 1

      const canvasWidth =
        Math.round(width * pixelRatio)

      const canvasHeight =
        Math.round(height * pixelRatio)

      if (
        glowCanvas!.width !== canvasWidth ||
        glowCanvas!.height !== canvasHeight
      ) {
        glowCanvas!.width = canvasWidth

        glowCanvas!.height = canvasHeight
      }

      context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0,
      )

      context.clearRect(
        0,
        0,
        width,
        height,
      )

      graph.forEachNode(
        (node, attributes) => {
          if (!isNodeVisible(node)) {
            return
          }

          const isHub = HUB_TYPES.has(
            attributes.entityType,
          )

          const isSelected =
            node === selectedNode

          if (!isHub && !isSelected) {
            return
          }

          if (
            selectedNode &&
            !isSelected &&
            !connectedNodes.has(node)
          ) {
            return
          }

          const displayData =
            renderer.getNodeDisplayData(
              node,
            )

          if (!displayData) return

          const position =
            renderer.framedGraphToViewport({
              x: displayData.x,
              y: displayData.y,
            })

          const radius = Math.min(
            34,
            Math.max(
              12,
              renderer.scaleSize(
                displayData.size,
              ) * 3.5,
            ),
          )

          const gradient =
            context.createRadialGradient(
              position.x,
              position.y,
              0,
              position.x,
              position.y,
              radius,
            )

          gradient.addColorStop(
            0,
            'rgba(103,232,249,0.22)',
          )

          gradient.addColorStop(
            0.35,
            'rgba(103,232,249,0.09)',
          )

          gradient.addColorStop(
            1,
            'rgba(103,232,249,0)',
          )

          context.fillStyle = gradient

          context.beginPath()

          context.arc(
            position.x,
            position.y,
            radius,
            0,
            Math.PI * 2,
          )

          context.fill()
        },
      )
    }

    // ====================================
    // UPDATE VISIBLE STATISTICS
    // ====================================

    function updateStatistics() {
      let nodes = 0

      let edges = 0

      graph.forEachNode((node) => {
        if (isNodeVisible(node)) {
          nodes++
        }
      })

      graph.forEachEdge((edge) => {
        if (isEdgeVisible(edge)) {
          edges++
        }
      })

      setStatistics({
        nodes,
        edges,
      })
    }

    // ====================================
    // CAMERA AND ZOOM LEVELS
    // ====================================

    function updateDetailLevel() {
      cameraRatio =
        camera.getState().ratio

      const nextLevel =
        cameraRatio < 0.20
          ? 2
          : cameraRatio < 0.40
            ? 1
            : 0

      if (nextLevel !== detailLevel) {
        detailLevel = nextLevel

        renderer.refresh()

        updateStatistics()
      }
    }

    camera.on(
      'updated',
      updateDetailLevel,
    )

    renderer.on(
      'afterRender',
      drawGlow,
    )

    // ====================================
    // INITIAL CAMERA POSITION
    // ====================================

    camera.setState({
      x: 0.5,
      y: 0.5,
      ratio: INITIAL_CAMERA_RATIO,
      angle: 0,
    })

    // ====================================
    // FLOATING CAMERA CONTROLS
    // ====================================

    controlsRef.current = {
      zoomIn: () => {
        camera.animatedZoom({
          factor: 1.5,
          duration: 250,
        })
      },

      zoomOut: () => {
        camera.animatedUnzoom({
          factor: 1.5,
          duration: 250,
        })
      },

      reset: () => {
        selectedNode = null

        hoveredNode = null

        connectedNodes.clear()

        selectionCallbackRef.current?.(
          null,
        )

        camera.animate(
          {
            x: 0.5,
            y: 0.5,
            ratio: INITIAL_CAMERA_RATIO,
            angle: 0,
          },
          {
            duration: 400,
          },
        )

        renderer.refresh()

        updateStatistics()
      },
    }

    // ====================================
    // NODE HOVER
    // ====================================

    renderer.on(
      'enterNode',
      ({ node }) => {
        hoveredNode = node

        container.style.cursor = 'pointer'

        renderer.refresh()
      },
    )

    renderer.on('leaveNode', () => {
      hoveredNode = null

      container.style.cursor = 'default'

      renderer.refresh()
    })

    // ====================================
    // NODE SELECTION
    // ====================================

    renderer.on(
      'clickNode',
      ({ node }) => {
        selectedNode = node

        connectedNodes = new Set(
          graph.neighbors(node),
        )

        const entity =
          graph.getNodeAttribute(
            node,
            'entity',
          )

        selectionCallbackRef.current?.(
          entity,
        )

        renderer.refresh()

        updateStatistics()
      },
    )

    // ====================================
    // CLEAR SELECTION
    // ====================================

    renderer.on('clickStage', () => {
      selectedNode = null

      hoveredNode = null

      connectedNodes.clear()

      selectionCallbackRef.current?.(
        null,
      )

      renderer.refresh()

      updateStatistics()
    })

    // ====================================
    // DOUBLE CLICK TO FOCUS
    // ====================================

    renderer.on(
      'doubleClickNode',
      ({ node, event }) => {
        event.preventSigmaDefault()

        const displayData =
          renderer.getNodeDisplayData(
            node,
          )

        if (!displayData) return

        camera.animate(
          {
            x: displayData.x,
            y: displayData.y,
            ratio: 0.25,
          },
          {
            duration: 450,
          },
        )
      },
    )

    // ====================================
    // INITIAL RENDER
    // ====================================

    updateStatistics()

    renderer.refresh()

    console.info(
      'AeroTrust renderer initialized',
      {
        entities: graph.order,

        relationships: graph.size,

        synthetic: true,

        renderer: 'Sigma.js',
      },
    )

    // ====================================
    // CLEANUP
    // ====================================

    return () => {
      controlsRef.current = null

      camera.removeListener(
        'updated',
        updateDetailLevel,
      )

      renderer.removeListener(
        'afterRender',
        drawGlow,
      )

      renderer.kill()
    }
  }, [])

  // ======================================
  // RENDER WORKSPACE
  // ======================================

  return (
    <div
      ref={workspaceRef}
      className="
        absolute inset-0
        overflow-hidden
        bg-[#09090b]
      "
      style={{
        backgroundImage:
          'radial-gradient(#242c33 0.7px, transparent 0.7px)',

        backgroundSize: '24px 24px',
      }}
    >
      {/* Soft hub glow layer */}

      <canvas
        ref={glowCanvasRef}
        className="
          pointer-events-none
          absolute inset-0
          h-full w-full
        "
        aria-hidden="true"
      />

      {/* Sigma graph */}

      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
        }}
        aria-label="Aviation asset knowledge graph"
      />

      {/* Floating navigation toolbar */}

      <div
        className="
          absolute bottom-8 right-5 z-20
          flex flex-col
          overflow-hidden rounded-md
          border border-[#30343b]
          bg-[#111418]/95
          shadow-lg
        "
      >
        <button
          type="button"
          title="Zoom in"
          aria-label="Zoom in"
          className={TOOL_BUTTON_CLASS}
          onClick={() =>
            controlsRef.current?.zoomIn()
          }
        >
          <Plus size={16} />
        </button>

        <button
          type="button"
          title="Zoom out"
          aria-label="Zoom out"
          className={TOOL_BUTTON_CLASS}
          onClick={() =>
            controlsRef.current?.zoomOut()
          }
        >
          <Minus size={16} />
        </button>

        <div className="h-px bg-[#292d34]" />

        <button
          type="button"
          title="Reset camera"
          aria-label="Reset camera"
          className={TOOL_BUTTON_CLASS}
          onClick={() =>
            controlsRef.current?.reset()
          }
        >
          <Crosshair size={16} />
        </button>

        <button
          type="button"
          title={
            fullscreen
              ? 'Exit fullscreen'
              : 'Fullscreen'
          }
          aria-label={
            fullscreen
              ? 'Exit fullscreen'
              : 'Fullscreen'
          }
          className={TOOL_BUTTON_CLASS}
          onClick={toggleFullscreen}
        >
          {fullscreen
            ? <Minimize size={16} />
            : <Maximize size={16} />
          }
        </button>
      </div>

      {/* Graph information */}

      <div
        className="
          pointer-events-none
          absolute bottom-4 left-4
          z-10 select-none
        "
      >
        <div
          className="
            mb-1 flex items-center gap-2
            text-[9px] tracking-wider
            text-[#82949e]
          "
        >
          <span
            className="
              h-1.5 w-1.5 rounded-full
              bg-[#67e8f9]
            "
          />

          AVIATION INTELLIGENCE NETWORK
        </div>

        <div
          className="
            text-[10px]
            text-[#525f69]
          "
        >
          {statistics.nodes.toLocaleString()}
          {' visible entities · '}
          {statistics.edges.toLocaleString()}
          {' relationships · Demo data'}
        </div>
      </div>
    </div>
  )
}
