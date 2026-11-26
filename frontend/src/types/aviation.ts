
export type EntityType =
  | 'aircraft'
  | 'engines'
  | 'components'
  | 'manufacturers'
  | 'airlines'
  | 'facilities'
  | 'inspections'
  | 'passports'
  | 'ledger'

export type AssetStatus =
  | 'operational'
  | 'maintenance'
  | 'inspection_required'
  | 'grounded'
  | 'retired'

export type VerificationStatus =
  | 'verified'
  | 'pending'
  | 'unverified'
  | 'failed'

export type RelationshipType =
  | 'OPERATED_BY'
  | 'MANUFACTURED_BY'
  | 'HAS_ENGINE'
  | 'HAS_COMPONENT'
  | 'INSTALLED_ON'
  | 'SERVICED_AT'
  | 'INSPECTED_BY'
  | 'HAS_INSPECTION'
  | 'HAS_PASSPORT'
  | 'ANCHORED_TO'
  | 'ISSUED_BY'
  | 'VERIFIED_BY'

export interface AviationEntity {
  id: string
  label: string
  type: EntityType
  description: string

  status?: AssetStatus
  verificationStatus?: VerificationStatus

  createdAt: string
  updatedAt: string

  metadata: Record<
    string,
    string | number | boolean | null
  >
}

export interface AviationRelationship {
  id: string
  source: string
  target: string
  type: RelationshipType
  label: string

  metadata?: Record<
    string,
    string | number | boolean | null
  >
}

export interface AviationDataset {
  entities: AviationEntity[]
  relationships: AviationRelationship[]
  generatedAt: string
  synthetic: boolean
}

export interface EntityCategory {
  id: EntityType
  label: string
  color: string
  size: number
}

export const ENTITY_CATEGORIES: Record<
  EntityType,
  EntityCategory
> = {
  aircraft: {
    id: 'aircraft',
    label: 'Aircraft',
    color: '#67e8f9',
    size: 12,
  },

  engines: {
    id: 'engines',
    label: 'Engines',
    color: '#60a5fa',
    size: 8,
  },

  components: {
    id: 'components',
    label: 'Components',
    color: '#818cf8',
    size: 3,
  },

  manufacturers: {
    id: 'manufacturers',
    label: 'Manufacturers',
    color: '#c084fc',
    size: 14,
  },

  airlines: {
    id: 'airlines',
    label: 'Airlines',
    color: '#2dd4bf',
    size: 14,
  },

  facilities: {
    id: 'facilities',
    label: 'Maintenance Facilities',
    color: '#fbbf24',
    size: 10,
  },

  inspections: {
    id: 'inspections',
    label: 'Inspection Records',
    color: '#4ade80',
    size: 2,
  },

  passports: {
    id: 'passports',
    label: 'Digital Passports',
    color: '#94a3b8',
    size: 2,
  },

  ledger: {
    id: 'ledger',
    label: 'Ledger Records',
    color: '#38bdf8',
    size: 2,
  },
}

export const STATUS_COLORS: Record<
  AssetStatus,
  string
> = {
  operational: '#4ade80',
  maintenance: '#fbbf24',
  inspection_required: '#fb923c',
  grounded: '#f87171',
  retired: '#71717a',
}

export const VERIFICATION_COLORS: Record<
  VerificationStatus,
  string
> = {
  verified: '#4ade80',
  pending: '#fbbf24',
  unverified: '#71717a',
  failed: '#f87171',
}
