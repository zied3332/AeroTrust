import {
  generateAviationData,
} from './generateAviationData'

import type {
  AviationEntity,
} from '../types/aviation'

// ========================================
// TYPES
// ========================================

export type RiskLevel =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

export interface SensorReading {
  timestamp: string
  time: string
  exhaustGasTemperature: number
  vibration: number
  oilTemperature: number
  oilPressure: number
  fuelFlow: number
  n1: number
  n2: number
}

export interface ComponentHealth {
  componentId: string
  name: string
  healthScore: number
  riskScore: number
  riskLevel: RiskLevel
  operatingHours: number
  estimatedRemainingHours: number
  recommendedAction: string
}

export interface EngineTelemetry {
  engineId: string
  engineName: string
  model: string
  serialNumber: string
  operatingHours: number
  cycles: number
  healthScore: number
  riskScore: number
  riskLevel: RiskLevel
  readings: SensorReading[]
  latestReading: SensorReading
  components: ComponentHealth[]
  simulated: boolean
}

export interface MaintenanceAlert {
  id: string
  engineId: string
  engineName: string
  componentId: string
  componentName: string
  riskLevel: RiskLevel
  riskScore: number
  message: string
  recommendedAction: string
  estimatedRemainingHours: number
  simulated: boolean
}

export interface MaintenanceStatistics {
  totalEngines: number
  monitoredComponents: number
  averageHealth: number
  healthyEngines: number
  mediumRiskEngines: number
  highRiskEngines: number
  criticalEngines: number
  activeAlerts: number
}

// ========================================
// CONFIGURATION
// ========================================

const dataset = generateAviationData(42)

const engines = dataset.entities.filter(
  (entity) => entity.type === 'engines',
)

const components = dataset.entities.filter(
  (entity) => entity.type === 'components',
)

const REFERENCE_DATE = new Date(
  '2026-11-26T12:00:00Z',
)

const READING_COUNT = 96

const INTERVAL_MINUTES = 15

// ========================================
// DETERMINISTIC RANDOM GENERATOR
// ========================================

function createRandom(seed: number) {
  let state = seed >>> 0

  return function random() {
    state = (
      Math.imul(1664525, state) +
      1013904223
    ) >>> 0

    return state / 4294967296
  }
}

function hashString(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)

    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  )
}

function round(
  value: number,
  decimals = 1,
) {
  const factor = Math.pow(10, decimals)

  return Math.round(value * factor) / factor
}

function randomBetween(
  random: () => number,
  minimum: number,
  maximum: number,
) {
  return minimum +
    random() * (maximum - minimum)
}

function getNumber(
  value: unknown,
  fallback = 0,
) {
  return typeof value === 'number'
    ? value
    : fallback
}

// ========================================
// RISK CLASSIFICATION
// ========================================

export function getRiskLevel(
  riskScore: number,
): RiskLevel {

  if (riskScore >= 75) {
    return 'critical'
  }

  if (riskScore >= 50) {
    return 'high'
  }

  if (riskScore >= 25) {
    return 'medium'
  }

  return 'low'
}

export const RISK_COLORS: Record<
  RiskLevel,
  string
> = {
  low: '#4ade80',
  medium: '#fbbf24',
  high: '#fb923c',
  critical: '#f87171',
}

export function getHealthColor(
  healthScore: number,
) {
  if (healthScore >= 85) {
    return '#4ade80'
  }

  if (healthScore >= 65) {
    return '#fbbf24'
  }

  if (healthScore >= 40) {
    return '#fb923c'
  }

  return '#f87171'
}

// ========================================
// COMPONENT HEALTH SIMULATION
// ========================================

function generateComponentHealth(
  component: AviationEntity,
): ComponentHealth {

  const random = createRandom(
    hashString(component.id),
  )

  let healthScore: number

  switch (component.status) {

    case 'operational':
      healthScore = randomBetween(
        random, 82, 99,
      )
      break

    case 'maintenance':
      healthScore = randomBetween(
        random, 45, 72,
      )
      break

    case 'inspection_required':
      healthScore = randomBetween(
        random, 50, 80,
      )
      break

    case 'grounded':
      healthScore = randomBetween(
        random, 15, 35,
      )
      break

    case 'retired':
      healthScore = randomBetween(
        random, 5, 20,
      )
      break

    default:
      healthScore = randomBetween(
        random, 65, 95,
      )
  }

  healthScore = round(
    clamp(healthScore, 0, 100),
  )

  const riskScore = round(
    100 - healthScore,
  )

  const riskLevel = getRiskLevel(
    riskScore,
  )

  // Illustrative remaining-life estimate.
  // Not based on a validated engineering model.

  const estimatedRemainingHours =
    Math.round(
      Math.pow(healthScore / 100, 2) *
      randomBetween(random, 1800, 3200),
    )

  let recommendedAction: string

  switch (riskLevel) {

    case 'critical':
      recommendedAction =
        'Priority inspection review'
      break

    case 'high':
      recommendedAction =
        'Schedule condition assessment'
      break

    case 'medium':
      recommendedAction =
        'Increase monitoring frequency'
      break

    default:
      recommendedAction =
        'Continue routine monitoring'
  }

  return {
    componentId: component.id,

    name: String(
      component.metadata.componentName ??
      component.label,
    ),

    healthScore,

    riskScore,

    riskLevel,

    operatingHours: getNumber(
      component.metadata.operatingHours,
    ),

    estimatedRemainingHours,

    recommendedAction,
  }
}

// ========================================
// ENGINE COMPONENT RELATIONSHIPS
// ========================================

function getEngineComponents(
  engineId: string,
) {
  const componentIds = new Set(
    dataset.relationships
      .filter(
        (relationship) =>
          relationship.source === engineId &&
          relationship.type === 'HAS_COMPONENT',
      )
      .map(
        (relationship) =>
          relationship.target,
      ),
  )

  return components.filter(
    (component) =>
      componentIds.has(component.id) ||
      component.metadata.parentAsset === engineId,
  )
}

// ========================================
// SENSOR TELEMETRY SIMULATION
// ========================================

function generateSensorReadings(
  engine: AviationEntity,
  healthScore: number,
): SensorReading[] {

  const random = createRandom(
    hashString(`${engine.id}-telemetry`),
  )

  const degradation =
    (100 - healthScore) / 100

  const engineVariation =
    randomBetween(random, -25, 25)

  const readings: SensorReading[] = []

  for (
    let index = 0;
    index < READING_COUNT;
    index++
  ) {

    const timestamp = new Date(
      REFERENCE_DATE.getTime() -
      (
        READING_COUNT - 1 - index
      ) *
      INTERVAL_MINUTES *
      60 *
      1000,
    )

    // Simulated operating-load variation.

    const load = clamp(
      0.65 +
      Math.sin(index / 8) * 0.16 +
      Math.sin(index / 3.5) * 0.08 +
      randomBetween(random, -0.08, 0.08),
      0.25,
      1,
    )

    // Occasional synthetic sensor spikes.

    const anomaly =
      random() < 0.045 + degradation * 0.08

    const anomalyMagnitude = anomaly
      ? randomBetween(random, 0.5, 1.5)
      : 0

    // Exhaust gas temperature — Celsius

    const exhaustGasTemperature = round(
      clamp(
        430 +
        load * 280 +
        degradation * 95 +
        engineVariation +
        randomBetween(random, -12, 12) +
        anomalyMagnitude * 35,
        350,
        950,
      ),
    )

    // Vibration — mm/s

    const vibration = round(
      clamp(
        0.8 +
        load * 1.5 +
        degradation * 3.8 +
        randomBetween(random, -0.3, 0.3) +
        anomalyMagnitude * 1.2,
        0.2,
        10,
      ),
      2,
    )

    // Oil temperature — Celsius

    const oilTemperature = round(
      clamp(
        70 +
        load * 35 +
        degradation * 18 +
        randomBetween(random, -3, 3),
        50,
        150,
      ),
    )

    // Oil pressure — PSI

    const oilPressure = round(
      clamp(
        58 -
        degradation * 18 +
        load * 7 +
        randomBetween(random, -2, 2),
        20,
        80,
      ),
    )

    // Fuel flow — kg/h

    const fuelFlow = round(
      clamp(
        350 +
        load * 2200 +
        degradation * 150 +
        randomBetween(random, -80, 80),
        200,
        3500,
      ),
    )

    // Low-pressure spool speed — %

    const n1 = round(
      clamp(
        25 +
        load * 75 +
        randomBetween(random, -2, 2),
        20,
        105,
      ),
    )

    // High-pressure spool speed — %

    const n2 = round(
      clamp(
        55 +
        load * 45 +
        randomBetween(random, -1.5, 1.5),
        45,
        105,
      ),
    )

    readings.push({
      timestamp: timestamp.toISOString(),

      time: timestamp.toISOString().slice(
        11, 16,
      ),

      exhaustGasTemperature,

      vibration,

      oilTemperature,

      oilPressure,

      fuelFlow,

      n1,

      n2,
    })
  }

  return readings
}

// ========================================
// ENGINE HEALTH ASSESSMENT
// ========================================

function generateEngineTelemetry(
  engine: AviationEntity,
): EngineTelemetry {

  const random = createRandom(
    hashString(`${engine.id}-health`),
  )

  const componentHealth =
    getEngineComponents(engine.id)
      .map(generateComponentHealth)

  const averageComponentHealth =
    componentHealth.length > 0
      ? componentHealth.reduce(
          (sum, component) =>
            sum + component.healthScore,
          0,
        ) / componentHealth.length
      : randomBetween(random, 75, 95)

  const weakestComponent =
    componentHealth.length > 0
      ? Math.min(
          ...componentHealth.map(
            (component) =>
              component.healthScore,
          ),
        )
      : averageComponentHealth

  // Illustrative weighted health index.

  let healthScore =
    averageComponentHealth * 0.75 +
    weakestComponent * 0.25

  if (engine.status === 'maintenance') {
    healthScore = Math.min(
      healthScore, 65,
    )
  }

  if (
    engine.status === 'inspection_required'
  ) {
    healthScore = Math.min(
      healthScore, 72,
    )
  }

  if (engine.status === 'grounded') {
    healthScore = Math.min(
      healthScore, 24,
    )
  }

  if (engine.status === 'retired') {
    healthScore = Math.min(
      healthScore, 15,
    )
  }

  healthScore = round(
    clamp(healthScore, 0, 100),
  )

  const riskScore = round(
    100 - healthScore,
  )

  const readings = generateSensorReadings(
    engine,
    healthScore,
  )

  return {
    engineId: engine.id,

    engineName: engine.label,

    model: String(
      engine.metadata.model ??
      engine.label,
    ),

    serialNumber: String(
      engine.metadata.serialNumber ??
      engine.id,
    ),

    operatingHours: getNumber(
      engine.metadata.operatingHours,
    ),

    cycles: getNumber(
      engine.metadata.cycles,
    ),

    healthScore,

    riskScore,

    riskLevel: getRiskLevel(riskScore),

    readings,

    latestReading:
      readings[readings.length - 1]!,

    components: componentHealth,

    simulated: true,
  }
}

// ========================================
// GENERATE COMPLETE ENGINE DATASET
// ========================================

export function generateSensorData():
  EngineTelemetry[] {

  return engines.map(
    generateEngineTelemetry,
  )
}

// ========================================
// MAINTENANCE ALERTS
// ========================================

export function generateMaintenanceAlerts(
  telemetry: EngineTelemetry[],
): MaintenanceAlert[] {

  return telemetry
    .flatMap((engine) =>
      engine.components
        .filter(
          (component) =>
            component.riskLevel !== 'low',
        )
        .map((component) => ({
          id: `ALERT-${component.componentId}`,

          engineId: engine.engineId,

          engineName: engine.engineName,

          componentId: component.componentId,

          componentName: component.name,

          riskLevel: component.riskLevel,

          riskScore: component.riskScore,

          message:
            `${component.name}: ` +
            `simulated health index ` +
            `${component.healthScore}%`,

          recommendedAction:
            component.recommendedAction,

          estimatedRemainingHours:
            component.estimatedRemainingHours,

          simulated: true,
        })),
    )
    .sort(
      (first, second) =>
        second.riskScore - first.riskScore,
    )
}

// ========================================
// MAINTENANCE STATISTICS
// ========================================

export function getMaintenanceStatistics(
  telemetry: EngineTelemetry[],
): MaintenanceStatistics {

  const alerts =
    generateMaintenanceAlerts(telemetry)

  return {
    totalEngines: telemetry.length,

    monitoredComponents: telemetry.reduce(
      (sum, engine) =>
        sum + engine.components.length,
      0,
    ),

    averageHealth:
      telemetry.length > 0
        ? round(
            telemetry.reduce(
              (sum, engine) =>
                sum + engine.healthScore,
              0,
            ) / telemetry.length,
          )
        : 0,

    healthyEngines: telemetry.filter(
      (engine) =>
        engine.riskLevel === 'low',
    ).length,

    mediumRiskEngines: telemetry.filter(
      (engine) =>
        engine.riskLevel === 'medium',
    ).length,

    highRiskEngines: telemetry.filter(
      (engine) =>
        engine.riskLevel === 'high',
    ).length,

    criticalEngines: telemetry.filter(
      (engine) =>
        engine.riskLevel === 'critical',
    ).length,

    activeAlerts: alerts.length,
  }
}

// ========================================
// ENGINE LOOKUP
// ========================================

export function getEngineTelemetry(
  telemetry: EngineTelemetry[],
  engineId: string,
): EngineTelemetry | undefined {

  return telemetry.find(
    (engine) =>
      engine.engineId === engineId,
  )
}