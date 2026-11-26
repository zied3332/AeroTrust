
import type {
  AviationDataset,
  AviationEntity,
  AviationRelationship,
  EntityType,
  RelationshipType,
  AssetStatus,
} from '../types/aviation'

// Reproducible pseudo-random generator
function createRandom(seed: number) {
  return function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}

export function generateAviationData(
  seed = 42,
): AviationDataset {
  const random = createRandom(seed)

  const entities: AviationEntity[] = []
  const relationships: AviationRelationship[] = []

  const referenceDate = '2026-11-26T00:00:00.000Z'

  function randomInt(min: number, max: number) {
    return Math.floor(random() * (max - min + 1)) + min
  }

  function pick<T>(items: readonly T[]): T {
    return items[Math.floor(random() * items.length)]!
  }

  function pad(value: number, length = 4) {
    return String(value).padStart(length, '0')
  }

  function addEntity(
    entity: Omit<
      AviationEntity,
      'createdAt' | 'updatedAt'
    >,
  ): AviationEntity {
    const result: AviationEntity = {
      ...entity,
      createdAt: referenceDate,
      updatedAt: referenceDate,
    }

    entities.push(result)

    return result
  }

  function connect(
    source: string,
    target: string,
    type: RelationshipType,
  ) {
    relationships.push({
      id: `REL-${pad(relationships.length + 1, 6)}`,
      source,
      target,
      type,
      label: type.replaceAll('_', ' ').toLowerCase(),
    })
  }

  function getStatus(): AssetStatus {
    const value = random()

    if (value < 0.72) return 'operational'
    if (value < 0.86) return 'maintenance'
    if (value < 0.96) return 'inspection_required'

    return 'grounded'
  }

  // ========================================
  // 1. MANUFACTURERS
  // ========================================

  const manufacturerNames = [
    'Airbus',
    'Boeing',
    'CFM International',
    'International Aero Engines',
    'Safran',
    'Rolls-Royce',
    'Pratt & Whitney',
    'GE Aerospace',
    'Honeywell Aerospace',
    'Collins Aerospace',
    'Liebherr Aerospace',
    'Parker Aerospace',
  ]

  const manufacturers = manufacturerNames.map(
    (name, index) =>
      addEntity({
        id: `MFR-${pad(index + 1)}`,
        label: name,
        type: 'manufacturers',
        description: `Aerospace manufacturer: ${name}`,
        metadata: {
          organizationType: 'Manufacturer',
          synthetic: true,
        },
      }),
  )

  // ========================================
  // 2. AIRLINES
  // ========================================

  const airlineNames = [
    'Aero Meridian',
    'Pacific Horizon',
    'Atlas Skyways',
    'Nordic Aviation',
    'Eastern Orbit',
    'Blue Summit Airlines',
    'Continental Wings',
    'Southern Aero',
  ]

  const airlines = airlineNames.map((name, index) =>
    addEntity({
      id: `AL-${pad(index + 1)}`,
      label: name,
      type: 'airlines',
      description: `Synthetic airline operator: ${name}`,
      metadata: {
        operatorCode: `AT${pad(index + 1, 2)}`,
        fleetSize: 3,
        synthetic: true,
      },
    }),
  )

  // ========================================
  // 3. MAINTENANCE FACILITIES
  // ========================================

  const facilityCities = [
    'Singapore',
    'Bangkok',
    'Dubai',
    'Frankfurt',
    'Paris',
    'London',
    'Istanbul',
    'Tunis',
    'Tokyo',
    'Seoul',
    'Doha',
    'Amsterdam',
    'Madrid',
    'Toronto',
    'Sydney',
    'Hong Kong',
  ]

  const facilities = facilityCities.map(
    (city, index) =>
      addEntity({
        id: `MRO-${pad(index + 1)}`,
        label: `${city} MRO Center`,
        type: 'facilities',
        description:
          'Synthetic maintenance, repair and overhaul facility.',
        metadata: {
          city,
          facilityType: 'MRO',
          synthetic: true,
        },
      }),
  )

  // ========================================
  // 4. AIRCRAFT CONFIGURATIONS
  // ========================================

  const aircraftModels = [
    {
      model: 'Boeing 737-800',
      manufacturerIndex: 1,
      engineModel: 'CFM56-7B',
      engineManufacturerIndex: 2,
    },
    {
      model: 'Airbus A320-214',
      manufacturerIndex: 0,
      engineModel: 'CFM56-5B',
      engineManufacturerIndex: 2,
    },
    {
      model: 'Airbus A321-231',
      manufacturerIndex: 0,
      engineModel: 'V2533-A5',
      engineManufacturerIndex: 3,
    },
  ]

  const engineComponents = [
    'Fan Rotor',
    'Fan Blade Assembly',
    'Low Pressure Compressor',
    'High Pressure Compressor',
    'Combustion Chamber',
    'High Pressure Turbine',
  ]

  const airframeComponents = [
    'Nose Landing Gear',
    'Left Main Landing Gear',
    'Right Main Landing Gear',
    'Auxiliary Power Unit',
  ]

  const assets: AviationEntity[] = []

  let engineCounter = 0
  let componentCounter = 0

  // ========================================
  // 5. AIRCRAFT, ENGINES AND COMPONENTS
  // ========================================

  for (let i = 0; i < 24; i++) {
    const configuration =
      aircraftModels[i % aircraftModels.length]!

    const airline = airlines[Math.floor(i / 3)]!
    const facility = pick(facilities)

    const aircraft = addEntity({
      id: `AC-${pad(i + 1)}`,
      label: `${configuration.model} · AT-${pad(i + 1)}`,
      type: 'aircraft',
      description: 'Synthetic commercial aircraft asset.',
      status: getStatus(),
      metadata: {
        model: configuration.model,
        serialNumber: `MSN-DEMO-${pad(i + 1)}`,
        registration: `DEMO-${pad(i + 1)}`,
        flightHours: randomInt(8000, 45000),
        flightCycles: randomInt(3000, 22000),
        engineCount: 2,
        synthetic: true,
      },
    })

    assets.push(aircraft)

    connect(
      aircraft.id,
      airline.id,
      'OPERATED_BY',
    )

    connect(
      aircraft.id,
      manufacturers[configuration.manufacturerIndex]!.id,
      'MANUFACTURED_BY',
    )

    connect(
      aircraft.id,
      facility.id,
      'SERVICED_AT',
    )

    // Two engines per aircraft
    for (let position = 1; position <= 2; position++) {
      engineCounter++

      const engine = addEntity({
        id: `ENG-${pad(engineCounter)}`,
        label:
          `${configuration.engineModel} · ${pad(engineCounter)}`,
        type: 'engines',
        description: 'Synthetic turbofan engine asset.',
        status: getStatus(),
        metadata: {
          model: configuration.engineModel,
          serialNumber: `ESN-DEMO-${pad(engineCounter)}`,
          position: position === 1 ? 'Left' : 'Right',
          operatingHours: randomInt(3000, 25000),
          cycles: randomInt(1000, 12000),
          synthetic: true,
        },
      })

      assets.push(engine)

      connect(
        aircraft.id,
        engine.id,
        'HAS_ENGINE',
      )

      connect(
        engine.id,
        manufacturers[
          configuration.engineManufacturerIndex
        ]!.id,
        'MANUFACTURED_BY',
      )

      connect(
        engine.id,
        facility.id,
        'SERVICED_AT',
      )

      // Six component assemblies per engine
      for (const componentName of engineComponents) {
        componentCounter++

        const component = addEntity({
          id: `CMP-${pad(componentCounter)}`,
          label:
            `${componentName} · ${pad(componentCounter)}`,
          type: 'components',
          description:
            `Synthetic engine component: ${componentName}`,
          status: getStatus(),
          metadata: {
            componentName,
            partNumber: `PN-DEMO-${pad(componentCounter)}`,
            serialNumber: `SN-DEMO-${pad(componentCounter)}`,
            operatingHours: randomInt(500, 12000),
            parentAsset: engine.id,
            synthetic: true,
          },
        })

        assets.push(component)

        connect(
          engine.id,
          component.id,
          'HAS_COMPONENT',
        )

        connect(
          component.id,
          manufacturers[
            configuration.engineManufacturerIndex
          ]!.id,
          'MANUFACTURED_BY',
        )
      }
    }

    // Four additional airframe components
    for (const componentName of airframeComponents) {
      componentCounter++

      const component = addEntity({
        id: `CMP-${pad(componentCounter)}`,
        label:
          `${componentName} · ${pad(componentCounter)}`,
        type: 'components',
        description:
          `Synthetic airframe component: ${componentName}`,
        status: getStatus(),
        metadata: {
          componentName,
          partNumber: `PN-DEMO-${pad(componentCounter)}`,
          serialNumber: `SN-DEMO-${pad(componentCounter)}`,
          operatingHours: randomInt(500, 18000),
          parentAsset: aircraft.id,
          synthetic: true,
        },
      })

      assets.push(component)

      connect(
        aircraft.id,
        component.id,
        'HAS_COMPONENT',
      )

      connect(
        component.id,
        pick(manufacturers.slice(4)).id,
        'MANUFACTURED_BY',
      )
    }
  }

  // ========================================
  // 6. INSPECTION RECORDS
  // ========================================

  const inspectionTypes = [
    'Visual Inspection',
    'Routine Maintenance Check',
    'Borescope Inspection',
    'Component Condition Assessment',
    'Non-Destructive Inspection',
  ]

  for (let i = 0; i < 320; i++) {
    const asset = pick(assets)
    const facility = pick(facilities)

    const inspectionType =
      asset.type === 'engines'
        ? pick(inspectionTypes)
        : pick(
            inspectionTypes.filter(
              (name) => name !== 'Borescope Inspection',
            ),
          )

    const inspection = addEntity({
      id: `INS-${pad(i + 1)}`,
      label: `${inspectionType} · ${pad(i + 1)}`,
      type: 'inspections',
      description: 'Synthetic maintenance inspection record.',
      metadata: {
        inspectionType,
        assetId: asset.id,
        facilityId: facility.id,
        result: pick([
          'Passed',
          'Passed',
          'Passed',
          'Review Required',
          'Failed',
        ]),
        inspectionDate: new Date(
          Date.UTC(2026, randomInt(0, 10), randomInt(1, 25)),
        ).toISOString(),
        synthetic: true,
      },
    })

    connect(
      asset.id,
      inspection.id,
      'HAS_INSPECTION',
    )

    connect(
      inspection.id,
      facility.id,
      'INSPECTED_BY',
    )
  }

  // ========================================
  // 7. DIGITAL ASSET PASSPORTS
  // ========================================

  assets.forEach((asset, index) => {
    const passport = addEntity({
      id: `DAP-${pad(index + 1)}`,
      label: `Digital Passport · ${asset.id}`,
      type: 'passports',
      description:
        'Digital identity and provenance record for an asset.',
      verificationStatus: 'pending',
      metadata: {
        assetId: asset.id,
        assetType: asset.type,
        version: 1,
        issuer: 'AeroTrust Demo',
        synthetic: true,
      },
    })

    connect(
      asset.id,
      passport.id,
      'HAS_PASSPORT',
    )

    // ======================================
    // 8. PENDING HEDERA LEDGER RECORDS
    // ======================================

    const ledgerRecord = addEntity({
      id: `DLT-${pad(index + 1)}`,
      label: `Ledger Record · ${asset.id}`,
      type: 'ledger',
      description:
        'Pending record for future Hedera integration.',
      verificationStatus: 'pending',
      metadata: {
        network: 'Hedera Testnet',
        service: 'Hedera Consensus Service',
        transactionId: null,
        topicId: null,
        consensusTimestamp: null,
        payloadHash: null,
        anchored: false,
        synthetic: true,
      },
    })

    connect(
      passport.id,
      ledgerRecord.id,
      'ANCHORED_TO',
    )
  })

  return {
    entities,
    relationships,
    generatedAt: referenceDate,
    synthetic: true,
  }
}

// ========================================
// DATASET STATISTICS
// ========================================

export function getDatasetStatistics(
  dataset: AviationDataset,
) {
  const counts: Record<EntityType, number> = {
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

  for (const entity of dataset.entities) {
    counts[entity.type]++
  }

  return {
    totalEntities: dataset.entities.length,
    totalRelationships: dataset.relationships.length,
    categories: counts,
  }
}
