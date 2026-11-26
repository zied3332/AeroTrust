import { useId, useState } from 'react'

import {
  Workflow,
  Cog,
  Activity,
  ShieldCheck,
  Maximize,
  Minimize,
  X,
  Info,
  Fan,
  Wind,
  Flame,
  Gauge,
  Layers,
  Cpu,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react'

import type { LucideIcon } from 'lucide-react'

import {
  RISK_COLORS,
  getHealthColor,
  type EngineTelemetry,
  type ComponentHealth,
  type RiskLevel,
} from '../../data/generateSensorData'

// ========================================
// TYPES
// ========================================

interface MaintenanceFlowProps {
  engine: EngineTelemetry
  onComponentSelect?: (component: ComponentHealth) => void
}

interface NetworkNode {
  id: string
  x: number
  y: number
  width: number
  height: number
  title: string
  subtitle?: string
  value?: string
  color?: string
  icon?: LucideIcon
  kind: 'engine' | 'subsystem' | 'component' | 'metric' | 'assessment'
  componentId?: string
  componentIds?: string[]
  health?: number
}

interface NetworkEdge {
  id: string
  source: string
  target: string
  color: string
  label: string
  componentIds: string[]
}

interface SubsystemDefinition {
  id: string
  title: string
  icon: LucideIcon
  keywords: string[]
}

// ========================================
// CONFIGURATION
// ========================================

const GRAPH_WIDTH = 1500

const COLORS = {
  background: '#0b0e14',
  card: '#141922',
  selectedCard: '#17232d',
  border: '#303b47',
  text: '#e4e4e7',
  secondary: '#94a3b8',
  muted: '#64748b',
  cyan: '#8cdae8',
  edge: '#526374',
}

const SUBSYSTEMS: SubsystemDefinition[] = [
  {
    id: 'fan',
    title: 'Fan Assembly',
    icon: Fan,
    keywords: ['fan'],
  },
  {
    id: 'compression',
    title: 'Compression System',
    icon: Wind,
    keywords: ['compressor'],
  },
  {
    id: 'combustion',
    title: 'Combustion System',
    icon: Flame,
    keywords: ['combustion'],
  },
  {
    id: 'turbine',
    title: 'Turbine Assembly',
    icon: Cog,
    keywords: ['turbine'],
  },
  {
    id: 'auxiliary',
    title: 'Auxiliary Systems',
    icon: Layers,
    keywords: [],
  },
]

const ASSESSMENTS: {
  level: RiskLevel
  title: string
  description: string
}[] = [
  {
    level: 'low',
    title: 'Routine monitoring',
    description: 'Low simulated risk',
  },
  {
    level: 'medium',
    title: 'Increased monitoring',
    description: 'Moderate simulated risk',
  },
  {
    level: 'high',
    title: 'Condition assessment',
    description: 'Elevated simulated risk',
  },
  {
    level: 'critical',
    title: 'Priority inspection review',
    description: 'Critical simulated risk',
  },
]

// ========================================
// HELPERS
// ========================================

function formatRisk(risk: RiskLevel) {
  return risk.charAt(0).toUpperCase() + risk.slice(1)
}

function shortenText(value: string, maximumLength: number) {
  return value.length > maximumLength
    ? `${value.slice(0, maximumLength - 1)}…`
    : value
}

function formatNumber(value: number) {
  return value.toLocaleString('en-US')
}

function getSubsystem(component: ComponentHealth) {
  const name = component.name.toLowerCase()

  return (
    SUBSYSTEMS.find((subsystem) =>
      subsystem.keywords.some((keyword) =>
        name.includes(keyword),
      ),
    ) ?? SUBSYSTEMS[SUBSYSTEMS.length - 1]
  )
}

function getComponentIcon(component: ComponentHealth): LucideIcon {
  return getSubsystem(component).icon
}

function createConnection(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  const distance = (endX - startX) * 0.5

  return `
    M ${startX} ${startY}
    C ${startX + distance} ${startY},
      ${endX - distance} ${endY},
      ${endX} ${endY}
  `
}

// ========================================
// NETWORK GENERATOR
// ========================================

function createMaintenanceNetwork(engine: EngineTelemetry) {
  const nodes: NetworkNode[] = []
  const edges: NetworkEdge[] = []

  const components = engine.components

  const rowHeight = 116

  const graphHeight = Math.max(
    540,
    components.length * rowHeight + 100,
  )

  const centerY = graphHeight / 2

  const componentStartY =
    centerY - (components.length * rowHeight) / 2

  const componentPositions = new Map<string, number>()

  components.forEach((component, index) => {
    componentPositions.set(
      component.componentId,
      componentStartY + index * rowHeight,
    )
  })

  function addEdge(
    source: string,
    target: string,
    label: string,
    componentIds: string[],
    color = COLORS.edge,
  ) {
    edges.push({
      id: `${source}-${target}`,
      source,
      target,
      label,
      color,
      componentIds,
    })
  }

  // ======================================
  // LEVEL 1 — POWERPLANT
  // ======================================

  nodes.push({
    id: engine.engineId,
    x: 24,
    y: centerY - 70,
    width: 210,
    height: 140,
    title: engine.model,
    subtitle: engine.engineId,
    value: `${engine.healthScore.toFixed(1)}%`,
    health: engine.healthScore,
    color: getHealthColor(engine.healthScore),
    icon: Cog,
    kind: 'engine',
    componentIds: components.map(
      (component) => component.componentId,
    ),
  })

  // ======================================
  // LEVEL 2 — ENGINE SUBSYSTEMS
  // ======================================

  SUBSYSTEMS.forEach((subsystem) => {
    const members = components.filter(
      (component) =>
        getSubsystem(component).id === subsystem.id,
    )

    if (members.length === 0) {
      return
    }

    const memberIds = members.map(
      (component) => component.componentId,
    )

    const averageHealth =
      members.reduce(
        (total, component) => total + component.healthScore,
        0,
      ) / members.length

    const averageY =
      members.reduce(
        (total, component) =>
          total +
          (componentPositions.get(component.componentId) ?? 0),
        0,
      ) / members.length

    const subsystemId = `subsystem-${subsystem.id}`

    nodes.push({
      id: subsystemId,
      x: 300,
      y: averageY + 10,
      width: 200,
      height: 76,
      title: subsystem.title,
      subtitle: `${members.length} linked ${
        members.length === 1 ? 'component' : 'components'
      }`,
      value: `${averageHealth.toFixed(1)}%`,
      color: getHealthColor(averageHealth),
      icon: subsystem.icon,
      kind: 'subsystem',
      componentIds: memberIds,
    })

    addEdge(
      engine.engineId,
      subsystemId,
      'CONTAINS',
      memberIds,
    )

    members.forEach((component) => {
      addEdge(
        subsystemId,
        component.componentId,
        'HAS_COMPONENT',
        [component.componentId],
      )
    })
  })

  // ======================================
  // LEVEL 3 — INDIVIDUAL COMPONENTS
  // ======================================

  components.forEach((component) => {
    const y =
      componentPositions.get(component.componentId) ?? 0

    const healthColor = getHealthColor(component.healthScore)

    nodes.push({
      id: component.componentId,
      x: 565,
      y: y + 8,
      width: 245,
      height: 80,
      title: component.name,
      subtitle: component.componentId,
      value: `${component.healthScore.toFixed(1)}%`,
      health: component.healthScore,
      color: healthColor,
      icon: getComponentIcon(component),
      kind: 'component',
      componentId: component.componentId,
      componentIds: [component.componentId],
    })

    // ====================================
    // LEVEL 4 — CONDITION INTELLIGENCE
    // ====================================

    const metrics: {
      id: string
      title: string
      value: string
      color: string
      icon: LucideIcon
    }[] = [
      {
        id: 'health',
        title: 'Health index',
        value: `${component.healthScore.toFixed(1)}%`,
        color: healthColor,
        icon: Activity,
      },
      {
        id: 'risk',
        title: 'Risk score',
        value: component.riskScore.toFixed(1),
        color: RISK_COLORS[component.riskLevel],
        icon: Gauge,
      },
      {
        id: 'remaining',
        title: 'Demo remaining life',
        value: `${formatNumber(
          component.estimatedRemainingHours,
        )} h`,
        color: COLORS.cyan,
        icon: Clock,
      },
    ]

    metrics.forEach((metric, index) => {
      const metricId =
        `${component.componentId}-${metric.id}`

      nodes.push({
        id: metricId,
        x: 885,
        y: y + index * 34,
        width: 235,
        height: 28,
        title: metric.title,
        value: metric.value,
        color: metric.color,
        icon: metric.icon,
        kind: 'metric',
        componentId: component.componentId,
        componentIds: [component.componentId],
      })

      addEdge(
        component.componentId,
        metricId,
        'HAS_CONDITION',
        [component.componentId],
        metric.color,
      )
    })

    addEdge(
      `${component.componentId}-risk`,
      `assessment-${component.riskLevel}`,
      'ASSESSED_AS',
      [component.componentId],
      RISK_COLORS[component.riskLevel],
    )
  })

  // ======================================
  // LEVEL 5 — MAINTENANCE ASSESSMENTS
  // ======================================

  const visibleAssessments = ASSESSMENTS.filter(
    (assessment) =>
      components.some(
        (component) =>
          component.riskLevel === assessment.level,
      ),
  )

  const assessmentSpacing = 130

  const assessmentStartY =
    centerY -
    (visibleAssessments.length * assessmentSpacing) / 2

  visibleAssessments.forEach((assessment, index) => {
    const members = components.filter(
      (component) =>
        component.riskLevel === assessment.level,
    )

    nodes.push({
      id: `assessment-${assessment.level}`,
      x: 1205,
      y: assessmentStartY + index * assessmentSpacing,
      width: 270,
      height: 84,
      title: assessment.title,
      subtitle: assessment.description,
      value: `${members.length} linked ${
        members.length === 1 ? 'component' : 'components'
      }`,
      color: RISK_COLORS[assessment.level],
      icon: ShieldCheck,
      kind: 'assessment',
      componentIds: members.map(
        (component) => component.componentId,
      ),
    })
  })

  return {
    nodes,
    edges,
    graphHeight,
  }
}

// ========================================
// SVG NODE ICON
// ========================================

function NodeIcon({
  icon: Icon,
  x,
  y,
  size = 18,
  color = COLORS.cyan,
}: {
  icon: LucideIcon
  x: number
  y: number
  size?: number
  color?: string
}) {
  return (
    <foreignObject
      x={x}
      y={y}
      width={size}
      height={size}
      pointerEvents="none"
    >
      <Icon
        size={size}
        color={color}
        strokeWidth={1.5}
      />
    </foreignObject>
  )
}

// ========================================
// NETWORK CARD
// ========================================

interface NetworkCardProps {
  node: NetworkNode
  active: boolean
  dimmed: boolean
  selected: boolean
  onSelect?: () => void
  onHover?: () => void
  onLeave?: () => void
}

function NetworkCard({
  node,
  active,
  dimmed,
  selected,
  onSelect,
  onHover,
  onLeave,
}: NetworkCardProps) {
  const {
    x,
    y,
    width,
    height,
    color = COLORS.cyan,
  } = node

  const isMetric = node.kind === 'metric'
  const isEngine = node.kind === 'engine'
  const isAssessment = node.kind === 'assessment'
  const isComponent = node.kind === 'component'

  const Icon = node.icon ?? Cpu

  const borderColor = active
    ? COLORS.cyan
    : isEngine
      ? '#48616e'
      : COLORS.border

  const backgroundColor = active
    ? COLORS.selectedCard
    : COLORS.card

  return (
    <g
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={`${node.title} ${node.value ?? ''}`}
      aria-pressed={onSelect ? selected : undefined}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onKeyDown={(event) => {
        if (
          onSelect &&
          (event.key === 'Enter' || event.key === ' ')
        ) {
          event.preventDefault()
          onSelect()
        }
      }}
      className={
        onSelect
          ? 'maintenance-network-node cursor-pointer'
          : undefined
      }
      opacity={dimmed ? 0.76 : 1}
      style={{
        transition: 'opacity 150ms ease',
      }}
    >
      <title>
        {node.title}
        {node.subtitle ? ` — ${node.subtitle}` : ''}
        {node.value ? ` — ${node.value}` : ''}
      </title>

      {/* Main card: no colored vertical bar */}

      <rect
        className="network-card-background"
        x={x}
        y={y}
        width={width}
        height={height}
        rx={5}
        fill={backgroundColor}
        stroke={borderColor}
        strokeWidth={active ? 1.5 : 1}
      />

      {/* Compact metric node */}

      {isMetric ? (
        <>
          <NodeIcon
            icon={Icon}
            x={x + 9}
            y={y + 7}
            size={14}
            color={COLORS.muted}
          />

          <text
            x={x + 30}
            y={y + 18}
            fontSize="10"
            fill={COLORS.secondary}
          >
            {node.title}
          </text>

          <text
            x={x + width - 10}
            y={y + 18}
            fontSize="11"
            fontWeight="500"
            fontFamily="monospace"
            textAnchor="end"
            fill={color}
          >
            {node.value}
          </text>
        </>
      ) : (
        <>
          {/* Monochrome icon container */}

          <rect
            x={x + 12}
            y={y + 12}
            width={32}
            height={32}
            rx={5}
            fill="#202a35"
            stroke="#354350"
          />

          <NodeIcon
            icon={Icon}
            x={x + 19}
            y={y + 19}
            size={18}
            color={isEngine ? COLORS.cyan : '#a5b4c3'}
          />

          {/* Main title */}

          <text
            x={x + 54}
            y={y + 25}
            fontSize={isEngine ? 15 : 11.5}
            fontWeight="600"
            fill={COLORS.text}
          >
            {shortenText(
              node.title,
              isAssessment ? 30 : isComponent ? 27 : 22,
            )}
          </text>

          {/* Secondary information */}

          <text
            x={x + 54}
            y={y + 41}
            fontSize="9.5"
            fontFamily={
              isComponent || isEngine
                ? 'monospace'
                : undefined
            }
            fill={COLORS.muted}
          >
            {node.subtitle}
          </text>

          {/* Engine details */}

          {isEngine && (
            <>
              <line
                x1={x + 12}
                y1={y + 57}
                x2={x + width - 12}
                y2={y + 57}
                stroke={COLORS.border}
              />

              <text
                x={x + 12}
                y={y + 78}
                fontSize="10"
                fill={COLORS.secondary}
              >
                Powerplant health
              </text>

              <text
                x={x + width - 12}
                y={y + 79}
                fontSize="15"
                fontWeight="600"
                textAnchor="end"
                fill={color}
              >
                {node.value}
              </text>

              <rect
                x={x + 12}
                y={y + 91}
                width={width - 24}
                height={4}
                rx={2}
                fill="#29323d"
              />

              <rect
                x={x + 12}
                y={y + 91}
                width={
                  (width - 24) *
                  Math.max(
                    0,
                    Math.min(100, node.health ?? 0),
                  ) /
                  100
                }
                height={4}
                rx={2}
                fill={color}
              />

              <rect
                x={x + 12}
                y={y + 110}
                width={width - 24}
                height={19}
                rx={3}
                fill="#10161e"
                stroke="#29323d"
              />

              <circle
                cx={x + 23}
                cy={y + 119.5}
                r={2.5}
                fill={COLORS.cyan}
              />

              <text
                x={x + 33}
                y={y + 123}
                fontSize="8"
                letterSpacing="1"
                fill={COLORS.secondary}
              >
                SIMULATED POWERPLANT
              </text>
            </>
          )}

          {/* Component and subsystem details */}

          {!isEngine && !isAssessment && (
            <>
              <line
                x1={x + 12}
                y1={y + 53}
                x2={x + width - 12}
                y2={y + 53}
                stroke="#29323d"
              />

              <text
                x={x + 12}
                y={y + 69}
                fontSize="9"
                fill={COLORS.muted}
              >
                {isComponent
                  ? 'Health index'
                  : 'Mean component health'}
              </text>

              <circle
                cx={x + width - 57}
                cy={y + 65.5}
                r={3}
                fill={color}
              />

              <text
                x={x + width - 12}
                y={y + 69}
                fontSize="11"
                fontWeight="500"
                textAnchor="end"
                fill={color}
              >
                {node.value}
              </text>
            </>
          )}

          {/* Assessment details */}

          {isAssessment && (
            <>
              <line
                x1={x + 12}
                y1={y + 53}
                x2={x + width - 12}
                y2={y + 53}
                stroke="#29323d"
              />

              <circle
                cx={x + 16}
                cy={y + 68}
                r={3}
                fill={color}
              />

              <text
                x={x + 26}
                y={y + 71}
                fontSize="9"
                fill={color}
              >
                {node.value}
              </text>

              <text
                x={x + width - 12}
                y={y + 71}
                fontSize="8"
                textAnchor="end"
                fill={COLORS.muted}
              >
                SIMULATED
              </text>
            </>
          )}
        </>
      )}

      {/* Input connection port */}

      {!isEngine && (
        <circle
          cx={x}
          cy={y + height / 2}
          r={2.7}
          fill={active ? COLORS.cyan : '#64748b'}
          stroke={COLORS.background}
          strokeWidth={1}
        />
      )}

      {/* Output connection port */}

      {!isAssessment && (
        <circle
          cx={x + width}
          cy={y + height / 2}
          r={2.7}
          fill={active ? COLORS.cyan : '#64748b'}
          stroke={COLORS.background}
          strokeWidth={1}
        />
      )}
    </g>
  )
}

// ========================================
// MAIN COMPONENT
// ========================================

export default function MaintenanceFlow({
  engine,
  onComponentSelect,
}: MaintenanceFlowProps) {
  const instanceId = useId().replace(/:/g, '')

  const arrowId = `${instanceId}-arrow`
  const activeArrowId = `${instanceId}-active-arrow`
  const gridId = `${instanceId}-grid`
  const smallGridId = `${instanceId}-small-grid`

  const [selectedComponentId, setSelectedComponentId] =
    useState<string | null>(null)

  const [hoveredComponentId, setHoveredComponentId] =
    useState<string | null>(null)

  const [isExpanded, setIsExpanded] = useState(false)

  const [zoom, setZoom] = useState(1)

  const [showLabels, setShowLabels] = useState(true)

  const components = engine.components

  const selectedComponent =
    components.find(
      (component) =>
        component.componentId === selectedComponentId,
    ) ?? null

  const hoveredComponent =
    components.find(
      (component) =>
        component.componentId === hoveredComponentId,
    ) ?? null

  const activeComponent =
    hoveredComponent ?? selectedComponent

  const activeComponentId =
    activeComponent?.componentId ?? null

  const { nodes, edges, graphHeight } =
    createMaintenanceNetwork(engine)

  const nodeMap = new Map(
    nodes.map((node) => [node.id, node]),
  )

  const subsystemCount = nodes.filter(
    (node) => node.kind === 'subsystem',
  ).length

  const metricCount = nodes.filter(
    (node) => node.kind === 'metric',
  ).length

  // ======================================
  // INTERACTIONS
  // ======================================

  function handleComponentSelect(
    component: ComponentHealth,
  ) {
    setSelectedComponentId(component.componentId)

    onComponentSelect?.(component)
  }

  function clearSelection() {
    setSelectedComponentId(null)
    setHoveredComponentId(null)
  }

  function increaseZoom() {
    setZoom((previous) =>
      Math.min(1.8, Number((previous + 0.15).toFixed(2))),
    )
  }

  function decreaseZoom() {
    setZoom((previous) =>
      Math.max(0.65, Number((previous - 0.15).toFixed(2))),
    )
  }

  function resetView() {
    setZoom(1)
    clearSelection()
  }

  // ======================================
  // RENDER
  // ======================================

  return (
    <section
      className={
        isExpanded
          ? `
            fixed inset-4 z-50 flex min-h-0
            min-w-0 flex-col overflow-hidden
            rounded-lg border border-[#303b47]
            bg-[#0b0e14] shadow-2xl
          `
          : `
            relative flex min-h-0 min-w-0
            flex-col overflow-hidden rounded-md
            border border-[#27272d] bg-[#111114]
          `
      }
    >
      {/* Keyboard focus styling */}

      <style>
        {`
          .maintenance-network-node:focus {
            outline: none;
          }

          .maintenance-network-node:focus-visible
          > .network-card-background {
            stroke: #8cdae8;
            stroke-width: 2;
            stroke-dasharray: 4 2;
          }
        `}
      </style>

      {/* ================================= */}
      {/* HEADER                            */}
      {/* ================================= */}

      <div className="
        flex shrink-0 flex-wrap items-center
        justify-between gap-3 border-b
        border-[#27272d] bg-[#111114] px-4 py-3
      ">
        <div className="flex items-center gap-3">
          <div className="
            flex h-9 w-9 items-center
            justify-center rounded-md
            border border-[#303b47] bg-[#19232d]
          ">
            <Workflow
              size={17}
              strokeWidth={1.5}
              className="text-[#8cdae8]"
            />
          </div>

          <div>
            <h2 className="
              text-[12px] font-medium text-[#e4e4e7]
            ">
              Powerplant Intelligence Network
            </h2>

            <p className="
              mt-1 text-[10px] text-[#71717a]
            ">
              Architecture, dependencies and condition intelligence
            </p>
          </div>
        </div>

        <div className="
          flex flex-wrap items-center gap-3
        ">
          <span className="
            font-mono text-[10px] text-[#8cdae8]
          ">
            {engine.engineId}
          </span>

          <span className="
            hidden text-[10px] text-[#71717a] md:inline
          ">
            {nodes.length} nodes
          </span>

          <span className="
            hidden text-[10px] text-[#71717a] md:inline
          ">
            {edges.length} relationships
          </span>

          <div className="h-5 w-px bg-[#30343b]" />

          <button
            type="button"
            onClick={() => setIsExpanded((previous) => !previous)}
            title={isExpanded ? 'Minimize network' : 'Expand network'}
            aria-label={
              isExpanded
                ? 'Minimize dependency network'
                : 'Expand dependency network'
            }
            className="
              rounded border border-[#30343b] p-1.5
              text-[#a1a1aa] transition-colors
              hover:border-[#487580] hover:text-[#8cdae8]
            "
          >
            {isExpanded
              ? <Minimize size={14} />
              : <Maximize size={14} />}
          </button>
        </div>
      </div>

      {/* ================================= */}
      {/* NETWORK TOOLBAR                   */}
      {/* ================================= */}

      <div className="
        flex shrink-0 flex-wrap items-center
        justify-between gap-3 border-b
        border-[#252c35] bg-[#10141b] px-4 py-2
      ">
        <div className="
          flex flex-wrap items-center gap-4
          text-[10px] text-[#64748b]
        ">
          <span className="flex items-center gap-1.5">
            <Layers size={12} />
            {subsystemCount} subsystems
          </span>

          <span className="flex items-center gap-1.5">
            <Cpu size={12} />
            {components.length} components
          </span>

          <span className="flex items-center gap-1.5">
            <Activity size={12} />
            {metricCount} condition metrics
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={showLabels}
            onClick={() => setShowLabels((previous) => !previous)}
            className={`
              rounded border px-2 py-1 text-[10px]
              transition-colors
              ${
                showLabels
                  ? 'border-[#405963] bg-[#1b2b34] text-[#8cdae8]'
                  : 'border-[#303b47] text-[#71717a]'
              }
            `}
          >
            Relationship labels
          </button>

          <div className="mx-1 h-4 w-px bg-[#30343b]" />

          <button
            type="button"
            title="Zoom out"
            aria-label="Zoom out"
            onClick={decreaseZoom}
            disabled={zoom <= 0.65}
            className="
              rounded p-1 text-[#94a3b8]
              hover:bg-[#202a35] hover:text-[#e4e4e7]
              disabled:opacity-30
            "
          >
            <ZoomOut size={14} />
          </button>

          <span className="
            min-w-[38px] text-center font-mono
            text-[10px] text-[#94a3b8]
          ">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            title="Zoom in"
            aria-label="Zoom in"
            onClick={increaseZoom}
            disabled={zoom >= 1.8}
            className="
              rounded p-1 text-[#94a3b8]
              hover:bg-[#202a35] hover:text-[#e4e4e7]
              disabled:opacity-30
            "
          >
            <ZoomIn size={14} />
          </button>

          <button
            type="button"
            title="Reset view"
            aria-label="Reset network view"
            onClick={resetView}
            className="
              rounded p-1 text-[#94a3b8]
              hover:bg-[#202a35] hover:text-[#e4e4e7]
            "
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* ================================= */}
      {/* NETWORK CANVAS                    */}
      {/* ================================= */}

      <div
        className={`
          relative min-h-0 min-w-0
          overflow-auto bg-[#0b0e14]
          ${isExpanded ? 'flex-1' : ''}
        `}
      >
        {components.length === 0 ? (
          <div className="
            flex min-h-[300px] flex-col
            items-center justify-center
          ">
            <Workflow
              size={30}
              className="text-[#52525b]"
            />

            <p className="
              mt-4 text-[12px] text-[#a1a1aa]
            ">
              No component relationships available
            </p>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${GRAPH_WIDTH} ${graphHeight}`}
            role="group"
            aria-label={
              `Powerplant intelligence network for ${engine.engineId}`
            }
            className="block select-none"
            style={{
              width: `${zoom * 100}%`,
              minWidth: `${1100 * zoom}px`,
              height: 'auto',
            }}
          >
            {/* ================================= */}
            {/* SVG DEFINITIONS                   */}
            {/* ================================= */}

            <defs>
              <pattern
                id={smallGridId}
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#1b2430"
                  strokeWidth=".5"
                  opacity=".55"
                />
              </pattern>

              <pattern
                id={gridId}
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  width="100"
                  height="100"
                  fill={`url(#${smallGridId})`}
                />

                <path
                  d="M 100 0 L 0 0 0 100"
                  fill="none"
                  stroke="#293543"
                  strokeWidth=".7"
                  opacity=".65"
                />
              </pattern>

              <marker
                id={arrowId}
                markerWidth="7"
                markerHeight="7"
                refX="6"
                refY="3.5"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path
                  d="M 0 0 L 7 3.5 L 0 7"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth=".9"
                />
              </marker>

              <marker
                id={activeArrowId}
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path
                  d="M 0 0 L 8 4 L 0 8"
                  fill="none"
                  stroke="#8cdae8"
                  strokeWidth="1.2"
                />
              </marker>
            </defs>

            {/* Background grid */}

            <rect
              width={GRAPH_WIDTH}
              height={graphHeight}
              fill={`url(#${gridId})`}
              onClick={clearSelection}
            />

            {/* ================================= */}
            {/* LAYER HEADINGS                    */}
            {/* ================================= */}

            {[
              {
                x: 24,
                number: '01',
                title: 'POWERPLANT',
              },
              {
                x: 300,
                number: '02',
                title: 'SUBSYSTEMS',
              },
              {
                x: 565,
                number: '03',
                title: 'COMPONENTS',
              },
              {
                x: 885,
                number: '04',
                title: 'CONDITION INTELLIGENCE',
              },
              {
                x: 1205,
                number: '05',
                title: 'ASSESSMENT',
              },
            ].map((column) => (
              <g key={column.number}>
                <rect
                  x={column.x}
                  y={17}
                  width={23}
                  height={19}
                  rx={3}
                  fill="#17212b"
                  stroke="#303b47"
                />

                <text
                  x={column.x + 11.5}
                  y={30}
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="monospace"
                  fill="#8cdae8"
                >
                  {column.number}
                </text>

                <text
                  x={column.x + 32}
                  y={30}
                  fontSize="9"
                  letterSpacing="1.3"
                  fill="#8492a3"
                >
                  {column.title}
                </text>
              </g>
            ))}

            {/* Subtle vertical layer separators */}

            {[265, 532, 850, 1160].map((x) => (
              <line
                key={x}
                x1={x}
                y1={50}
                x2={x}
                y2={graphHeight - 20}
                stroke="#344151"
                strokeWidth=".6"
                strokeDasharray="3 7"
                opacity=".4"
                pointerEvents="none"
              />
            ))}

            {/* ================================= */}
            {/* RELATIONSHIP CONNECTIONS          */}
            {/* ================================= */}

            {edges.map((edge) => {
              const source = nodeMap.get(edge.source)
              const target = nodeMap.get(edge.target)

              if (!source || !target) {
                return null
              }

              const active =
                activeComponentId !== null &&
                edge.componentIds.includes(activeComponentId)

              const dimmed =
                activeComponentId !== null && !active

              const startX = source.x + source.width
              const startY = source.y + source.height / 2

              const endX = target.x - 4
              const endY = target.y + target.height / 2

              const color = active
                ? edge.label === 'ASSESSED_AS'
                  ? edge.color
                  : COLORS.cyan
                : edge.color

              return (
                <g
                  key={edge.id}
                  pointerEvents="none"
                >
                  {/* Subtle selected-edge glow */}

                  {active && (
                    <path
                      d={createConnection(
                        startX,
                        startY,
                        endX,
                        endY,
                      )}
                      fill="none"
                      stroke={color}
                      strokeWidth="5"
                      opacity=".07"
                    />
                  )}

                  <path
                    d={createConnection(
                      startX,
                      startY,
                      endX,
                      endY,
                    )}
                    fill="none"
                    stroke={color}
                    strokeWidth={active ? 1.7 : 0.9}
                    opacity={
                      active
                        ? 1
                        : dimmed
                          ? 0.23
                          : 0.58
                    }
                    markerEnd={
                      active
                        ? `url(#${activeArrowId})`
                        : `url(#${arrowId})`
                    }
                    style={{
                      transition: 'opacity 150ms ease',
                    }}
                  />

                  {/* Relationship label on active paths */}

                  {showLabels &&
                    active &&
                    edge.label !== 'HAS_CONDITION' && (
                      <g>
                        <rect
                          x={(startX + endX) / 2 - 44}
                          y={(startY + endY) / 2 - 14}
                          width={88}
                          height={13}
                          rx={3}
                          fill="#0b0e14"
                          opacity=".95"
                        />

                        <text
                          x={(startX + endX) / 2}
                          y={(startY + endY) / 2 - 5}
                          fontSize="7.5"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fill={COLORS.secondary}
                        >
                          {edge.label}
                        </text>
                      </g>
                    )}
                </g>
              )
            })}

            {/* Default relationship labels */}

            {showLabels && !activeComponentId && (
              <g
                fontSize="8"
                fontFamily="monospace"
                fill="#64748b"
                textAnchor="middle"
                pointerEvents="none"
              >
                <text x="267" y="56">
                  CONTAINS
                </text>

                <text x="532" y="56">
                  HAS_COMPONENT
                </text>

                <text x="847" y="56">
                  HAS_CONDITION
                </text>

                <text x="1160" y="56">
                  ASSESSED_AS
                </text>
              </g>
            )}

            {/* ================================= */}
            {/* NETWORK NODES                     */}
            {/* ================================= */}

            {nodes.map((node) => {
              const active =
                activeComponentId !== null &&
                (
                  node.componentIds?.includes(
                    activeComponentId,
                  ) ?? false
                )

              const dimmed =
                activeComponentId !== null && !active

              const component = node.componentId
                ? components.find(
                    (item) =>
                      item.componentId === node.componentId,
                  )
                : undefined

              return (
                <NetworkCard
                  key={node.id}
                  node={node}
                  active={active}
                  dimmed={dimmed}
                  selected={
                    node.componentId !== undefined &&
                    node.componentId === selectedComponentId
                  }
                  onSelect={
                    component
                      ? () => handleComponentSelect(component)
                      : undefined
                  }
                  onHover={
                    component
                      ? () =>
                          setHoveredComponentId(
                            component.componentId,
                          )
                      : undefined
                  }
                  onLeave={
                    component
                      ? () => setHoveredComponentId(null)
                      : undefined
                  }
                />
              )
            })}
          </svg>
        )}
      </div>

      {/* ================================= */}
      {/* SELECTED COMPONENT INSPECTOR      */}
      {/* ================================= */}

      {selectedComponent && (
        <div className="
          shrink-0 border-t border-[#303b47]
          bg-[#11161e] p-4
        ">
          <div className="
            flex items-start justify-between gap-3
          ">
            <div className="flex items-center gap-3">
              <div className="
                flex h-10 w-10 items-center
                justify-center rounded-md
                border border-[#303b47] bg-[#202a35]
              ">
                <Cpu
                  size={20}
                  strokeWidth={1.5}
                  className="text-[#8cdae8]"
                />
              </div>

              <div>
                <p className="
                  text-[9px] uppercase
                  tracking-wider text-[#64748b]
                ">
                  Component intelligence
                </p>

                <h3 className="
                  mt-1 text-[13px] font-medium
                  text-[#e4e4e7]
                ">
                  {selectedComponent.name}
                </h3>

                <p className="
                  mt-1 font-mono text-[10px]
                  text-[#8cdae8]
                ">
                  {selectedComponent.componentId}
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Clear component selection"
              onClick={clearSelection}
              className="
                rounded border border-[#303b47]
                p-1.5 text-[#71717a]
                hover:text-[#e4e4e7]
              "
            >
              <X size={14} />
            </button>
          </div>

          <div className="
            mt-4 grid grid-cols-2 gap-3
            lg:grid-cols-5
          ">
            {[
              {
                label: 'Health index',
                value: `${selectedComponent.healthScore}%`,
                color: getHealthColor(
                  selectedComponent.healthScore,
                ),
                icon: Activity,
              },
              {
                label: 'Simulated risk',
                value: formatRisk(
                  selectedComponent.riskLevel,
                ),
                color:
                  RISK_COLORS[selectedComponent.riskLevel],
                icon: ShieldCheck,
              },
              {
                label: 'Risk score',
                value:
                  selectedComponent.riskScore.toFixed(1),
                color:
                  RISK_COLORS[selectedComponent.riskLevel],
                icon: Gauge,
              },
              {
                label: 'Operating hours',
                value: `${formatNumber(
                  selectedComponent.operatingHours,
                )} h`,
                color: '#e4e4e7',
                icon: Clock,
              },
              {
                label: 'Demo remaining life',
                value: `${formatNumber(
                  selectedComponent.estimatedRemainingHours,
                )} h`,
                color: '#8cdae8',
                icon: Clock,
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="
                  rounded-md border border-[#303b47]
                  bg-[#141922] p-3
                "
              >
                <div className="
                  flex items-center justify-between
                  gap-2
                ">
                  <p className="
                    text-[10px] text-[#94a3b8]
                  ">
                    {metric.label}
                  </p>

                  <metric.icon
                    size={13}
                    strokeWidth={1.5}
                    className="text-[#64748b]"
                  />
                </div>

                <p
                  className="
                    mt-2 text-xl font-semibold
                    tabular-nums
                  "
                  style={{
                    color: metric.color,
                  }}
                >
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          {/* Maintenance recommendation */}

          <div className="
            mt-3 flex flex-wrap items-center
            gap-2 rounded-md border border-[#303b47]
            bg-[#141922] p-3
          ">
            <ShieldCheck
              size={15}
              style={{
                color:
                  RISK_COLORS[selectedComponent.riskLevel],
              }}
            />

            <span className="
              text-[11px] text-[#94a3b8]
            ">
              Demo recommendation:
            </span>

            <span className="
              text-[11px] font-medium text-[#e4e4e7]
            ">
              {selectedComponent.recommendedAction}
            </span>
          </div>
        </div>
      )}

      {/* ================================= */}
      {/* NETWORK FOOTER                    */}
      {/* ================================= */}

      <div className="
        flex shrink-0 flex-wrap items-center
        justify-between gap-3 border-t
        border-[#27272d] bg-[#111114] px-4 py-3
      ">
        <div className="
          flex flex-wrap items-center gap-4
        ">
          <span className="
            text-[9px] uppercase tracking-wider
            text-[#64748b]
          ">
            Risk classification
          </span>

          {Object.entries(RISK_COLORS).map(
            ([level, color]) => (
              <div
                key={level}
                className="
                  flex items-center gap-1.5
                  text-[10px] text-[#a1a1aa]
                "
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: color,
                  }}
                />

                {formatRisk(level as RiskLevel)}
              </div>
            ),
          )}
        </div>

        <div className="
          flex items-center gap-3
          text-[10px] text-[#71717a]
        ">
          <span className="flex items-center gap-1.5">
            <Layers
              size={12}
              className="text-[#8cdae8]"
            />
            {nodes.length} nodes
          </span>

          <span className="flex items-center gap-1.5">
            <Workflow
              size={12}
              className="text-[#8cdae8]"
            />
            {edges.length} relationships
          </span>
        </div>
      </div>

      {/* ================================= */}
      {/* SIMULATION DISCLOSURE             */}
      {/* ================================= */}

      <div className="
        flex shrink-0 flex-wrap items-center
        gap-2 border-t border-[#242429]
        bg-[#101216] px-4 py-2
        text-[9px] text-[#71717a]
      ">
        <Info size={12} />

        Illustrative subsystem architecture and simulated
        condition assessments. Not for operational aviation
        decisions.
      </div>
    </section>
  )
}