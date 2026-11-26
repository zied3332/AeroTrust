import Graph from 'graphology'

import type {

  AviationDataset,

  AviationEntity,

  AviationRelationship,

  EntityType,

} from '../types/aviation'

// ========================================

// GRAPH TYPES

// ========================================

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

  primary: boolean

}

export type AviationGraph = Graph<

  AviationNodeAttributes,

  AviationEdgeAttributes

>

interface Position {

  x: number

  y: number

}

// ========================================

// VISUAL CONFIGURATION

// ========================================

const NODE_SIZES: Record<EntityType, number> = {

  aircraft: 4.5,

  engines: 3.2,

  components: 1.8,

  manufacturers: 7.5,

  airlines: 6.5,

  facilities: 5,

  inspections: 1.7,

  passports: 1.5,

  ledger: 1.3,

}

const NODE_COLORS: Record<EntityType, string> = {

  aircraft: '#67e8f9',

  engines: '#60a5fa',

  components: '#818cf8',

  manufacturers: '#a5f3fc',

  airlines: '#a5f3fc',

  facilities: '#67d5e8',

  inspections: '#4ade80',

  passports: '#94a3b8',

  ledger: '#38bdf8',

}

const COMPONENT_COLORS = [

  '#67e8f9',

  '#60a5fa',

  '#818cf8',

  '#5299ad',

  '#94a3b8',

]

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

// ========================================

// SEEDED RANDOM GENERATOR

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

  const positions = new Map<string, Position>()

  const primaryEdges = new Set<string>()

  const entitiesById = new Map(

    dataset.entities.map((entity) => [

      entity.id,

      entity,

    ]),

  )

  const outgoing = new Map<

    string,

    AviationRelationship[]

  >()

  for (const relationship of dataset.relationships) {

    const existing =

      outgoing.get(relationship.source) ?? []

    existing.push(relationship)

    outgoing.set(

      relationship.source,

      existing,

    )

  }

  // ======================================

  // 1. DISTRIBUTE ORGANIZATIONAL HUBS

  // ======================================

  const hubs = dataset.entities.filter(

    (entity) => HUB_TYPES.has(entity.type),

  )

  const hubPositions: Position[] = []

  const minimumDistance = 260

  for (const hub of hubs) {

    let position: Position = {

      x: 0,

      y: 0,

    }

    let bestPosition = position

    let bestDistance = -1

    // Find a position with enough distance

    // from previously placed hubs.

    for (let attempt = 0; attempt < 250; attempt++) {

      const candidate = {

        x: (random() - 0.5) * 1900,

        y: (random() - 0.5) * 1250,

      }

      const nearestDistance =

        hubPositions.length === 0

          ? Infinity

          : Math.min(

              ...hubPositions.map((existing) =>

                Math.hypot(

                  candidate.x - existing.x,

                  candidate.y - existing.y,

                ),

              ),

            )

      if (nearestDistance > bestDistance) {

        bestDistance = nearestDistance

        bestPosition = candidate

      }

      if (nearestDistance >= minimumDistance) {

        break

      }

    }

    position = bestPosition

    positions.set(hub.id, position)

    hubPositions.push(position)

  }

  // ======================================

  // 2. ASSIGN ASSETS TO REAL HUBS

  // ======================================

  const satellites = new Map<

    string,

    AviationEntity[]

  >()

  const assets = dataset.entities.filter(

    (entity) =>

      entity.type === 'aircraft' ||

      entity.type === 'engines' ||

      entity.type === 'components',

  )

  for (const asset of assets) {

    const relationships =

      outgoing.get(asset.id) ?? []

    const preferredType =

      asset.type === 'aircraft'

        ? 'OPERATED_BY'

        : 'MANUFACTURED_BY'

    const primaryRelationship =

      relationships.find((relationship) => {

        const target = entitiesById.get(

          relationship.target,

        )

        return (

          relationship.type === preferredType &&

          target !== undefined &&

          HUB_TYPES.has(target.type)

        )

      })

    if (!primaryRelationship) {

      continue

    }

    const hubId = primaryRelationship.target

    const existing = satellites.get(hubId) ?? []

    existing.push(asset)

    satellites.set(hubId, existing)

    primaryEdges.add(primaryRelationship.id)

  }

  // ======================================

  // 3. ORGANIC SATELLITE DISTRIBUTION

  // ======================================

  const GOLDEN_ANGLE =

    Math.PI * (3 - Math.sqrt(5))

  for (const [hubId, members] of satellites) {

    const center = positions.get(hubId)

    if (!center) continue

    const rotation = random() * Math.PI * 2

    const clusterRadius = Math.min(

      310,

      75 + Math.sqrt(members.length) * 16,

    )

    members.forEach((entity, index) => {

      const angle =

        rotation +

        index * GOLDEN_ANGLE +

        (random() - 0.5) * 0.5

      const normalizedRadius = Math.sqrt(

        (index + 1) / members.length,

      )

      const radius =

        30 +

        normalizedRadius *

          clusterRadius *

          (0.75 + random() * 0.5)

      positions.set(entity.id, {

        x:

          center.x +

          Math.cos(angle) * radius,

        y:

          center.y +

          Math.sin(angle) * radius * 0.85,

      })

    })

  }

  // ======================================

  // 4. PLACE UNASSIGNED CORE ENTITIES

  // ======================================

  for (const entity of dataset.entities) {

    if (

      positions.has(entity.id) ||

      DETAIL_TYPES.has(entity.type)

    ) {

      continue

    }

    positions.set(entity.id, {

      x: (random() - 0.5) * 1900,

      y: (random() - 0.5) * 1250,

    })

  }

  // ======================================

  // 5. POSITION DETAIL RECORDS

  // ======================================

  function placeDetails(

    relationshipType: string,

    distance: number,

  ) {

    for (const relationship of dataset.relationships) {

      if (

        relationship.type !== relationshipType

      ) {

        continue

      }

      const parent = positions.get(

        relationship.source,

      )

      if (!parent) continue

      const angle = random() * Math.PI * 2

      const radius =

        distance * (0.7 + random() * 0.6)

      positions.set(relationship.target, {

        x: parent.x + Math.cos(angle) * radius,

        y: parent.y + Math.sin(angle) * radius,

      })

    }

  }

  placeDetails('HAS_INSPECTION', 38)

  placeDetails('HAS_PASSPORT', 28)

  placeDetails('ANCHORED_TO', 20)

  // ======================================

  // 6. CREATE ALL GRAPH NODES

  // ======================================

  for (const entity of dataset.entities) {

    const position =

      positions.get(entity.id) ?? {

        x: (random() - 0.5) * 1000,

        y: (random() - 0.5) * 1000,

      }

    const isHub = HUB_TYPES.has(entity.type)

    const isDetail = DETAIL_TYPES.has(

      entity.type,

    )

    const color =

      entity.type === 'components'

        ? COMPONENT_COLORS[

            Math.floor(

              random() * COMPONENT_COLORS.length,

            )

          ]!

        : NODE_COLORS[entity.type]

    const degree =

      satellites.get(entity.id)?.length ?? 0

    const size = isHub

      ? NODE_SIZES[entity.type] +

        Math.min(3, Math.sqrt(degree) * 0.2)

      : NODE_SIZES[entity.type] *

        (0.8 + random() * 0.4)

    graph.addNode(entity.id, {

      label: entity.label,

      x: position.x,

      y: position.y,

      size,

      color,

      entityType: entity.type,

      entity,

      hidden: isDetail,

      highlighted: false,

      forceLabel:

        isHub &&

        (

          degree >= 8 ||

          entity.type === 'airlines'

        ),

    })

  }

  // ======================================

  // 7. SELECT ADDITIONAL CORE CONNECTIONS

  // ======================================

  for (const relationship of dataset.relationships) {

    const source = entitiesById.get(

      relationship.source,

    )

    const target = entitiesById.get(

      relationship.target,

    )

    if (!source || !target) continue

    // Aircraft-to-manufacturer connections

    // provide bridges between communities.

    if (

      source.type === 'aircraft' &&

      relationship.type === 'MANUFACTURED_BY'

    ) {

      primaryEdges.add(relationship.id)

    }

    // Keep aircraft-to-engine connections.

    if (

      relationship.type === 'HAS_ENGINE'

    ) {

      primaryEdges.add(relationship.id)

    }

    // Connect aircraft to maintenance hubs.

    if (

      source.type === 'aircraft' &&

      relationship.type === 'SERVICED_AT'

    ) {

      primaryEdges.add(relationship.id)

    }

  }

  // ======================================

  // 8. CREATE ALL GRAPH RELATIONSHIPS

  // ======================================

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

    if (

      relationship.source === relationship.target

    ) {

      continue

    }

    const primary = primaryEdges.has(

      relationship.id,

    )

    const sourceHidden = graph.getNodeAttribute(

      relationship.source,

      'hidden',

    )

    const targetHidden = graph.getNodeAttribute(

      relationship.target,

      'hidden',

    )

    const isBridge =

      relationship.type === 'HAS_ENGINE' ||

      relationship.type === 'SERVICED_AT' ||

      (

        relationship.type === 'MANUFACTURED_BY' &&

        entitiesById.get(

          relationship.source,

        )?.type === 'aircraft'

      )

    graph.addEdgeWithKey(

      relationship.id,

      relationship.source,

      relationship.target,

      {

        label: relationship.label,

        size: isBridge ? 0.25 : 0.45,

        color: isBridge

          ? '#192d36'

          : '#315b68',

        weight: 1,

        relationship,

        primary,

        hidden:

          !primary ||

          sourceHidden ||

          targetHidden,

      },

    )

  }

  // ======================================

  // 9. DEVELOPMENT STATISTICS

  // ======================================

  let visibleNodes = 0

  let visibleEdges = 0

  graph.forEachNode((_node, attributes) => {

    if (!attributes.hidden) {

      visibleNodes++

    }

  })

  graph.forEachEdge((_edge, attributes) => {

    if (!attributes.hidden) {

      visibleEdges++

    }

  })

  console.info('AeroTrust graph initialized', {

    layout: 'Hub and satellite',

    totalEntities: graph.order,

    totalRelationships: graph.size,

    visibleNodes,

    visibleEdges,

    hiddenNodes: graph.order - visibleNodes,

    hiddenEdges: graph.size - visibleEdges,

    synthetic: true,

  })

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

  return graph.getNodeAttribute(

    nodeId,

    'entity',

  )

}

// ========================================

// RESET GRAPH VISIBILITY

// ========================================

export function resetGraphVisibility(

  graph: AviationGraph,

) {

  graph.forEachNode((node, attributes) => {

    graph.mergeNodeAttributes(node, {

      hidden: DETAIL_TYPES.has(

        attributes.entityType,

      ),

      highlighted: false,

    })

  })

  graph.forEachEdge(

    (edge, attributes, source, target) => {

      const sourceHidden =

        graph.getNodeAttribute(source, 'hidden')

      const targetHidden =

        graph.getNodeAttribute(target, 'hidden')

      graph.setEdgeAttribute(

        edge,

        'hidden',

        !attributes.primary ||

          sourceHidden ||

          targetHidden,

      )

    },

  )

}
