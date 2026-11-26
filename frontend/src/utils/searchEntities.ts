
import {
  ENTITY_CATEGORIES,
  type AviationEntity,
  type EntityType,
} from '../types/aviation'

// ========================================
// SEARCH TYPES
// ========================================

export interface EntitySearchResult {
  entity: AviationEntity
  score: number
  matchedFields: string[]
}

export interface EntitySearchOptions {
  limit?: number
  categories?: EntityType[]
}

interface SearchField {
  name: string
  value: string
  weight: number
}

// ========================================
// TEXT NORMALIZATION
// ========================================

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function compact(value: string): string {
  return normalize(value).replace(/\s+/g, '')
}

// ========================================
// SEARCHABLE ENTITY FIELDS
// ========================================

function getSearchableFields(
  entity: AviationEntity,
): SearchField[] {
  const fields: SearchField[] = [
    {
      name: 'id',
      value: entity.id,
      weight: 120,
    },
    {
      name: 'label',
      value: entity.label,
      weight: 100,
    },
    {
      name: 'category',
      value: ENTITY_CATEGORIES[entity.type].label,
      weight: 35,
    },
    {
      name: 'type',
      value: entity.type,
      weight: 30,
    },
    {
      name: 'description',
      value: entity.description,
      weight: 15,
    },
  ]

  if (entity.status) {
    fields.push({
      name: 'status',
      value: entity.status,
      weight: 40,
    })
  }

  if (entity.verificationStatus) {
    fields.push({
      name: 'verificationStatus',
      value: entity.verificationStatus,
      weight: 40,
    })
  }

  // Search entity-specific metadata.

  for (const [key, value] of Object.entries(
    entity.metadata,
  )) {
    if (
      value === null ||
      typeof value === 'boolean'
    ) {
      continue
    }

    let weight = 25

    switch (key) {
      case 'serialNumber':
      case 'registration':
      case 'partNumber':
      case 'operatorCode':
      case 'transactionId':
      case 'topicId':
        weight = 110
        break

      case 'model':
      case 'componentName':
      case 'inspectionType':
      case 'city':
        weight = 85
        break

      case 'assetId':
      case 'parentAsset':
      case 'facilityId':
        weight = 55
        break

      case 'result':
      case 'network':
      case 'service':
      case 'issuer':
        weight = 40
        break
    }

    fields.push({
      name: key,
      value: String(value),
      weight,
    })
  }

  return fields
}

// ========================================
// FIELD MATCHING AND SCORING
// ========================================

function scoreField(
  field: SearchField,
  query: string,
): number {
  const value = normalize(field.value)

  if (!value) return 0

  // Exact match.

  if (value === query) {
    return field.weight * 3
  }

  // Exact match ignoring separators.
  // Example: ENG0001 matches ENG-0001.

  if (
    compact(value) === compact(query)
  ) {
    return field.weight * 2.8
  }

  // Starts with the query.

  if (value.startsWith(query)) {
    return field.weight * 2
  }

  // Contains the complete query.

  if (value.includes(query)) {
    return field.weight * 1.5
  }

  // Match without spaces or punctuation.

  if (
    compact(value).includes(compact(query))
  ) {
    return field.weight * 1.3
  }

  // Match individual words.

  const tokens = query.split(' ')

  const matchedTokens = tokens.filter(
    (token) => value.includes(token),
  )

  if (matchedTokens.length === tokens.length) {
    return field.weight
  }

  return 0
}

// ========================================
// ENTITY SEARCH ENGINE
// ========================================

export function searchEntities(
  entities: AviationEntity[],
  rawQuery: string,
  options: EntitySearchOptions = {},
): EntitySearchResult[] {
  const query = normalize(rawQuery)

  const {
    limit = 30,
    categories,
  } = options

  if (!query || limit <= 0) {
    return []
  }

  const results: EntitySearchResult[] = []

  const queryTokens = query.split(' ')

  const allowedCategories = categories
    ? new Set(categories)
    : null

  for (const entity of entities) {
    // Optional category restriction.

    if (
      allowedCategories &&
      !allowedCategories.has(entity.type)
    ) {
      continue
    }

    const fields = getSearchableFields(entity)

    const matchedFields = new Set<string>()

    let bestScore = 0
    let additionalScore = 0

    // Score each searchable field.

    for (const field of fields) {
      const score = scoreField(field, query)

      if (score > 0) {
        matchedFields.add(field.name)

        bestScore = Math.max(
          bestScore,
          score,
        )

        additionalScore += score
      }
    }

    // Support multi-word searches across
    // different metadata fields.
    //
    // Example: "CFM56 maintenance"
    // matches an engine model and status.

    if (queryTokens.length > 1) {
      let allTokensMatched = true
      let tokenScore = 0

      const tokenFields = new Set<string>()

      for (const token of queryTokens) {
        let bestTokenScore = 0
        let bestFieldName = ''

        for (const field of fields) {
          const score = scoreField(
            field,
            token,
          )

          if (score > bestTokenScore) {
            bestTokenScore = score
            bestFieldName = field.name
          }
        }

        if (bestTokenScore === 0) {
          allTokensMatched = false
          break
        }

        tokenScore += bestTokenScore
        tokenFields.add(bestFieldName)
      }

      if (allTokensMatched) {
        const averageTokenScore =
          tokenScore / queryTokens.length

        bestScore = Math.max(
          bestScore,
          averageTokenScore * 0.8,
        )

        for (const name of tokenFields) {
          matchedFields.add(name)
        }
      }
    }

    if (bestScore === 0) {
      continue
    }

    // Prioritize strong matches while giving
    // a small bonus for matching more fields.

    const finalScore =
      bestScore +
      Math.min(additionalScore * 0.05, 25)

    results.push({
      entity,
      score: finalScore,
      matchedFields: [...matchedFields],
    })
  }

  // Highest relevance first.

  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }

    return (
      a.entity.label.localeCompare(
        b.entity.label,
      ) ||
      a.entity.id.localeCompare(
        b.entity.id,
      )
    )
  })

  return results.slice(0, limit)
}

// ========================================
// SEARCH RESULT SUBTITLE
// ========================================

export function getSearchResultSubtitle(
  entity: AviationEntity,
): string {
  const category =
    ENTITY_CATEGORIES[entity.type].label

  const identifier =
    entity.metadata.registration ??
    entity.metadata.serialNumber ??
    entity.metadata.partNumber ??
    entity.id

  return `${category} · ${identifier}`
}

// ========================================
// SEARCH RESULT HIGHLIGHTING
// ========================================

export interface HighlightSegment {
  text: string
  highlighted: boolean
}

export function highlightSearchMatch(
  text: string,
  query: string,
): HighlightSegment[] {
  const search = query.trim()

  if (!search) {
    return [
      {
        text,
        highlighted: false,
      },
    ]
  }

  const lowerText = text.toLowerCase()
  const lowerQuery = search.toLowerCase()

  const segments: HighlightSegment[] = []

  let cursor = 0

  while (cursor < text.length) {
    const matchIndex = lowerText.indexOf(
      lowerQuery,
      cursor,
    )

    if (matchIndex === -1) {
      segments.push({
        text: text.slice(cursor),
        highlighted: false,
      })

      break
    }

    if (matchIndex > cursor) {
      segments.push({
        text: text.slice(
          cursor,
          matchIndex,
        ),
        highlighted: false,
      })
    }

    segments.push({
      text: text.slice(
        matchIndex,
        matchIndex + search.length,
      ),
      highlighted: true,
    })

    cursor = matchIndex + search.length
  }

  return segments
}
