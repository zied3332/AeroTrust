
import Graph from 'graphology'
import forceAtlas2 from 'graphology-layout-forceatlas2'

import {
  ENTITY_CATEGORIES,
  type AviationDataset,
  type AviationEntity,
  type AviationRelationship,
  type EntityType,
} from '../types/aviation'

export interface AviationNodeAttributes {
  [key: string]: unknown

  label: string
  x: number
  y: number
  size: number
  color: string
  entityType: EntityType
  entity: AviationEntity
  hidden: boolean
  highlighted: boolean
  forceLabel: boolean
}

export interface AviationEdgeAttributes {
  [key: string]: unknown

  label: string
  size: number
  color: string
  weight: number
  relationship: AviationRelationship
  hidden: boolean
}

export type AviationGraph = Graph<
  AviationNodeAttributes,
  AviationEdgeAttributes
>

// ========================================
// GRAPH CONFIGURATION
// ========================================

const EDGE_COLOR = '#25434c'

const RELATIONSHIP_WEIGHTS: Record<string, number> = {
  OPERATED_BY: 3,
  MANUFACTURED_BY: 0.6,
  HAS_ENGINE: 4,
  HAS_COMPONENT: 3,
  INSTALLED_ON: 3,
  SERVICED_AT: 0.8,
  INSPECTED_BY: 0.8,
  HAS_INSPECTION: 2,
  HAS_PASSPORT: 2,
  ANCHORED_TO: 2,
  ISSUED_BY: 1,
  VERIFIED_BY: 1,
}

// ========================================
// REPRODUCIBLE RANDOM POSITIONS
// ========================================

function createRandom(seed: number) {
  return function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}

// ========================================
// CREATE AVIATION GRAPH
// ========================================

export function createGraph(
  dataset: AviationDataset,
): AviationGraph {
  const graph: AviationGraph = new Graph({
    type: 'directed',
    multi: true,
    allowSelfLoops: false,
  })

  const random = createRandom(42)

  // --------------------------------------
  // 1. CREATE NODES
  // --------------------------------------

  for (const entity of dataset.entities) {
    const category = ENTITY_CATEGORIES[entity.type]

    graph.addNode(entity.id, {
      label: entity.label,

      x: (random() - 0.5) * 100,
      y: (random() - 0.5) * 100,

      size: category.size,
      color: category.color,

      entityType: entity.type,
      entity,

      hidden: false,
      highlighted: false,

      forceLabel:
        entity.type === 'airlines' ||
        entity.type === 'manufacturers',
    })
  }

  // --------------------------------------
  // 2. CREATE RELATIONSHIPS
  // --------------------------------------

  for (const relationship of dataset.relationships) {
    if (
      !graph.hasNode(relationship.source) ||
      !graph.hasNode(relationship.target)
    ) {
      console.warn(
        'Invalid relationship:',
        relationship.id,
      )

      continue
    }

    if (relationship.source === relationship.target) {
      continue
    }

    graph.addEdgeWithKey(
      relationship.id,
      relationship.source,
      relationship.target,
      {
        label: relationship.label,

        size: 0.5,
        color: EDGE_COLOR,

        weight:
          RELATIONSHIP_WEIGHTS[relationship.type] ?? 1,

        relationship,
        hidden: false,
      },
    )
  }

  // --------------------------------------
  // 3. CALCULATE NODE POSITIONS
  // --------------------------------------

  if (graph.order > 1) {
    const settings = forceAtlas2.inferSettings(graph)

    forceAtlas2.assign(graph, {
      iterations: 250,

      getEdgeWeight: 'weight',

      settings: {
        ...settings,

        gravity: 0.8,
        scalingRatio: 12,
        slowDown: 5,

        strongGravityMode: false,
        linLogMode: true,

        outboundAttractionDistribution: false,
        adjustSizes: false,

        edgeWeightInfluence: 1,

        barnesHutOptimize: true,
        barnesHutTheta: 0.5,
      },
    })
  }

  return graph
}

// ========================================
// GRAPH STATISTICS
// ========================================

export function getGraphStatistics(
  graph: AviationGraph,
) {
  const categories: Record<EntityType, number> = {
    aircraft: 0,
    engines: 0,
    components: 0,
    manufacturers: 0,
    airlines: 0,
    facilities: 0,
    inspections: 0,
    passports: 0,
    ledger: 0,
  }

  graph.forEachNode((_node, attributes) => {
    categories[attributes.entityType]++
  })

  return {
    totalNodes: graph.order,
    totalEdges: graph.size,

    density:
      graph.order > 1
        ? graph.size /
          (graph.order * (graph.order - 1))
        : 0,

    categories,
  }
}

// ========================================
// GET ENTITY NEIGHBORHOOD
// ========================================

export function getEntityNeighborhood(
  graph: AviationGraph,
  nodeId: string,
): string[] {
  if (!graph.hasNode(nodeId)) {
    return []
  }

  return graph.neighbors(nodeId)
}

// ========================================
// GET ENTITY DETAILS
// ========================================

export function getGraphEntity(
  graph: AviationGraph,
  nodeId: string,
): AviationEntity | null {
  if (!graph.hasNode(nodeId)) {
    return null
  }

  return graph.getNodeAttribute(nodeId, 'entity')
}

// ========================================
// RESET GRAPH VISIBILITY
// ========================================

export function resetGraphVisibility(
  graph: AviationGraph,
) {
  graph.forEachNode((node) => {
    graph.mergeNodeAttributes(node, {
      hidden: false,
      highlighted: false,
    })
  })

  graph.forEachEdge((edge) => {
    graph.setEdgeAttribute(edge, 'hidden', false)
  })
}
