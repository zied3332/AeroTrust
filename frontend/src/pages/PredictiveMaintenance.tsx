import { useId, useMemo, useState } from 'react'

import {
  Activity,
  AlertTriangle,
  Clock,
  Cog,
  Gauge,
  Thermometer,
  Droplets,
  Fuel,
  ShieldCheck,
  ChevronDown,
  Radio,
  TrendingUp,
  BarChart3,
  Info,
  Layers,
  Zap,
  Download,
} from 'lucide-react'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import {
  generateSensorData,
  generateMaintenanceAlerts,
  getMaintenanceStatistics,
  getHealthColor,
  RISK_COLORS,
  type EngineTelemetry,
  type SensorReading,
  type RiskLevel,
} from '../data/generateSensorData'

import MaintenanceFlow from
  '../components/maintenance/MaintenanceFlow'

// ========================================
// DATASET
// ========================================

const telemetry = generateSensorData()

const statistics =
  getMaintenanceStatistics(telemetry)

const maintenanceAlerts =
  generateMaintenanceAlerts(telemetry)

// ========================================
// TYPES
// ========================================

type TimeRange = '6h' | '12h' | '24h'

type SensorKey =
  | 'exhaustGasTemperature'
  | 'vibration'
  | 'oilTemperature'
  | 'oilPressure'
  | 'fuelFlow'
  | 'n1'
  | 'n2'

interface MetricCardProps {
  label: string
  value: string
  description: string
  color?: string
  icon: typeof Activity
}

interface SensorChartProps {
  title: string
  description: string
  data: SensorReading[]
  dataKey: SensorKey
  unit: string
  color: string
  icon: typeof Activity
  height?: number
}

// ========================================
// HELPERS
// ========================================

function formatRisk(risk: RiskLevel) {
  return risk.charAt(0).toUpperCase() +
    risk.slice(1)
}

function formatNumber(value: number) {
  return value.toLocaleString('en-US')
}

function formatDecimal(value: number) {
  return value.toFixed(1)
}

// ========================================
// METRIC CARD
// ========================================

function MetricCard({
  label,
  value,
  description,
  color = '#e4e4e7',
  icon: Icon,
}: MetricCardProps) {

  return (
    <div className="
      min-w-0 rounded-md
      border border-[#27272d]
      bg-[#111114] p-4
    ">

      <div className="
        flex items-center justify-between gap-2
      ">

        <span className="
          text-[11px] text-[#a1a1aa]
        ">
          {label}
        </span>

        <Icon
          size={16}
          strokeWidth={1.5}
          style={{ color }}
        />

      </div>

      <div
        className="
          mt-4 text-[26px] font-semibold
          leading-none tracking-tight
          tabular-nums
        "
        style={{ color }}
      >
        {value}
      </div>

      <p className="
        mt-3 text-[10px] text-[#71717a]
      ">
        {description}
      </p>

    </div>
  )
}

// ========================================
// RISK BADGE
// ========================================

function RiskBadge({
  risk,
}: {
  risk: RiskLevel
}) {

  const color = RISK_COLORS[risk]

  return (
    <span
      className="
        inline-flex items-center gap-1.5
        rounded border px-2 py-1
        text-[10px] font-medium
      "
      style={{
        color,
        backgroundColor: `${color}10`,
        borderColor: `${color}30`,
      }}
    >

      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />

      {formatRisk(risk)}

    </span>
  )
}

// ========================================
// SENSOR CHART
// ========================================

function SensorChart({
  title,
  description,
  data,
  dataKey,
  unit,
  color,
  icon: Icon,
  height = 220,
}: SensorChartProps) {

  const gradientId = useId()

  const latestValue =
    data[data.length - 1]?.[dataKey] ?? 0

  const average =
    data.length > 0
      ? data.reduce(
          (sum, reading) =>
            sum + reading[dataKey],
          0,
        ) / data.length
      : 0

  return (
    <section className="
      min-w-0 overflow-hidden
      rounded-md border border-[#27272d]
      bg-[#111114]
    ">

      {/* Chart header */}

      <div className="
        flex items-start justify-between
        gap-3 px-4 pt-4
      ">

        <div>

          <div className="
            flex items-center gap-2
          ">

            <Icon
              size={14}
              strokeWidth={1.5}
              style={{ color }}
            />

            <h3 className="
              text-[12px] font-medium
              text-[#e4e4e7]
            ">
              {title}
            </h3>

          </div>

          <p className="
            mt-1.5 text-[10px]
            text-[#71717a]
          ">
            {description}
          </p>

        </div>

        <div className="text-right">

          <div
            className="
              text-[22px] font-semibold
              leading-none tabular-nums
            "
            style={{ color }}
          >

            {formatDecimal(latestValue)}

            <span className="
              ml-1 text-[11px]
              font-normal text-[#71717a]
            ">
              {unit}
            </span>

          </div>

          <p className="
            mt-2 text-[9px]
            text-[#71717a]
          ">
            Latest simulated reading
          </p>

        </div>

      </div>

      {/* Chart */}

      <div
        className="mt-4 px-2"
        style={{ height }}
      >

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 15,
              left: -12,
              bottom: 0,
            }}
          >

            <defs>

              <linearGradient
                id={gradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="0%"
                  stopColor={color}
                  stopOpacity={0.20}
                />

                <stop
                  offset="100%"
                  stopColor={color}
                  stopOpacity={0.01}
                />

              </linearGradient>

            </defs>

            <CartesianGrid
              stroke="#25252c"
              strokeDasharray="3 4"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{
                fill: '#71717a',
                fontSize: 9,
              }}
              axisLine={false}
              tickLine={false}
              minTickGap={30}
            />

            <YAxis
              domain={['auto', 'auto']}
              tick={{
                fill: '#71717a',
                fontSize: 9,
              }}
              axisLine={false}
              tickLine={false}
              tickCount={5}
              tickFormatter={(value) =>
                Number(value).toFixed(0)
              }
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#17171c',
                border: '1px solid #34343b',
                borderRadius: 4,
                fontSize: 11,
              }}
              labelStyle={{
                color: '#a1a1aa',
              }}
              itemStyle={{ color }}
              cursor={{
                stroke: '#52525b',
                strokeDasharray: '4 4',
              }}
            />

            <Area
              type="monotone"
              dataKey={dataKey}
              name={title}
              unit={` ${unit}`}
              stroke={color}
              strokeWidth={1.7}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
              dot={false}
              activeDot={{
                r: 4,
                fill: color,
                stroke: '#111114',
                strokeWidth: 2,
              }}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

      {/* Chart footer */}

      <div className="
        flex items-center justify-between
        border-t border-[#242429]
        px-4 py-2.5 text-[10px]
      ">

        <span className="text-[#71717a]">
          Period average
        </span>

        <span className="
          font-mono text-[#d4d4d8]
        ">
          {formatDecimal(average)} {unit}
        </span>

      </div>

    </section>
  )
}

// ========================================
// FLEET RISK DISTRIBUTION
// ========================================

function FleetRiskDistribution() {

  const riskData = [
    {
      name: 'Low',
      value: statistics.healthyEngines,
      color: RISK_COLORS.low,
    },
    {
      name: 'Medium',
      value: statistics.mediumRiskEngines,
      color: RISK_COLORS.medium,
    },
    {
      name: 'High',
      value: statistics.highRiskEngines,
      color: RISK_COLORS.high,
    },
    {
      name: 'Critical',
      value: statistics.criticalEngines,
      color: RISK_COLORS.critical,
    },
  ]

  return (
    <section className="
      rounded-md border border-[#27272d]
      bg-[#111114]
    ">

      <div className="
        border-b border-[#27272d]
        px-4 py-3
      ">

        <div className="flex items-center gap-2">

          <BarChart3
            size={15}
            className="text-[#8cdae8]"
          />

          <h2 className="
            text-[12px] font-medium
            text-[#e4e4e7]
          ">
            Fleet Risk Distribution
          </h2>

        </div>

        <p className="
          mt-1.5 text-[10px]
          text-[#71717a]
        ">
          Simulated engine condition classification
        </p>

      </div>

      <div className="
        flex flex-wrap items-center
        justify-center gap-5 p-4
      ">

        <div className="
          relative h-[180px] w-[180px]
          shrink-0
        ">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <PieChart>

              <Pie
                data={riskData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={78}
                paddingAngle={3}
                stroke="none"
                isAnimationActive={false}
              >

                {riskData.map((item) => (

                  <Cell
                    key={item.name}
                    fill={item.color}
                  />

                ))}

              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: '#17171c',
                  border: '1px solid #34343b',
                  borderRadius: 4,
                  fontSize: 11,
                }}
                itemStyle={{
                  color: '#e4e4e7',
                }}
              />

            </PieChart>

          </ResponsiveContainer>

          <div className="
            pointer-events-none absolute
            inset-0 flex flex-col
            items-center justify-center
          ">

            <span className="
              text-3xl font-semibold
              text-[#e4e4e7]
            ">
              {statistics.totalEngines}
            </span>

            <span className="
              mt-1 text-[10px]
              text-[#71717a]
            ">
              Total engines
            </span>

          </div>

        </div>

        <div className="
          min-w-[140px] flex-1 space-y-4
        ">

          {riskData.map((item) => (

            <div key={item.name}>

              <div className="
                flex items-center
                justify-between gap-3
              ">

                <div className="
                  flex items-center gap-2
                ">

                  <span
                    className="
                      h-2 w-2 rounded-sm
                    "
                    style={{
                      backgroundColor: item.color,
                    }}
                  />

                  <span className="
                    text-[11px] text-[#a1a1aa]
                  ">
                    {item.name} risk
                  </span>

                </div>

                <span className="
                  font-mono text-[11px]
                  text-[#e4e4e7]
                ">
                  {item.value}
                </span>

              </div>

              <div className="
                mt-2 h-1 overflow-hidden
                rounded-full bg-[#27272d]
              ">

                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${
                      statistics.totalEngines > 0
                        ? item.value /
                          statistics.totalEngines * 100
                        : 0
                    }%`,
                    backgroundColor: item.color,
                  }}
                />

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  )
}

// ========================================
// ENGINE HEALTH PANEL
// ========================================

function EngineHealthPanel({
  engine,
}: {
  engine: EngineTelemetry
}) {

  const color =
    getHealthColor(engine.healthScore)

  const circumference = 2 * Math.PI * 56

  const progress =
    circumference * engine.healthScore / 100

  return (
    <section className="
      rounded-md border border-[#27272d]
      bg-[#111114]
    ">

      <div className="
        border-b border-[#27272d]
        px-4 py-3
      ">

        <div className="flex items-center gap-2">

          <Gauge
            size={15}
            className="text-[#8cdae8]"
          />

          <h2 className="
            text-[12px] font-medium
            text-[#e4e4e7]
          ">
            Engine Health Assessment
          </h2>

        </div>

        <p className="
          mt-1.5 text-[10px]
          text-[#71717a]
        ">
          Composite simulated health index
        </p>

      </div>

      <div className="
        flex flex-wrap items-center
        justify-center gap-5 p-4
      ">

        {/* Health gauge */}

        <div className="
          relative h-[160px] w-[160px]
          shrink-0
        ">

          <svg
            viewBox="0 0 140 140"
            className="h-full w-full"
          >

            <circle
              cx="70"
              cy="70"
              r="56"
              fill="none"
              stroke="#27272d"
              strokeWidth="9"
            />

            <circle
              cx="70"
              cy="70"
              r="56"
              fill="none"
              stroke={color}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={
                `${progress} ${circumference}`
              }
              transform="rotate(-90 70 70)"
            />

          </svg>

          <div className="
            absolute inset-0 flex flex-col
            items-center justify-center
          ">

            <span
              className="
                text-[29px] font-semibold
                tabular-nums
              "
              style={{ color }}
            >
              {engine.healthScore}%
            </span>

            <span className="
              text-[10px] text-[#71717a]
            ">
              Health index
            </span>

          </div>

        </div>

        {/* Engine properties */}

        <div className="
          min-w-[140px] flex-1 space-y-3
        ">

          <div>

            <p className="
              text-[10px] text-[#71717a]
            ">
              Engine model
            </p>

            <p className="
              mt-1 text-[14px]
              font-medium text-[#e4e4e7]
            ">
              {engine.model}
            </p>

          </div>

          <div>

            <p className="
              text-[10px] text-[#71717a]
            ">
              Serial number
            </p>

            <p className="
              mt-1 font-mono text-[11px]
              text-[#8cdae8]
            ">
              {engine.serialNumber}
            </p>

          </div>

          <div className="
            flex items-center justify-between
            gap-2
          ">

            <span className="
              text-[10px] text-[#71717a]
            ">
              Risk classification
            </span>

            <RiskBadge risk={engine.riskLevel} />

          </div>

          <div className="
            flex items-center justify-between
            gap-2
          ">

            <span className="
              text-[10px] text-[#71717a]
            ">
              Operating cycles
            </span>

            <span className="
              font-mono text-[11px]
              text-[#e4e4e7]
            ">
              {formatNumber(engine.cycles)}
            </span>

          </div>

        </div>

      </div>

    </section>
  )
}

// ========================================
// COMPONENT HEALTH TABLE
// ========================================

function ComponentHealthTable({
  engine,
}: {
  engine: EngineTelemetry
}) {

  const sortedComponents = [
    ...engine.components,
  ].sort(
    (first, second) =>
      first.healthScore - second.healthScore,
  )

  return (
    <section className="
      overflow-hidden rounded-md
      border border-[#27272d]
      bg-[#111114]
    ">

      <div className="
        flex items-center justify-between
        gap-3 border-b border-[#27272d]
        px-4 py-3
      ">

        <div>

          <div className="
            flex items-center gap-2
          ">

            <Layers
              size={15}
              className="text-[#8cdae8]"
            />

            <h2 className="
              text-[12px] font-medium
              text-[#e4e4e7]
            ">
              Component Health Assessment
            </h2>

          </div>

          <p className="
            mt-1.5 text-[10px]
            text-[#71717a]
          ">
            Components ranked by simulated condition
          </p>

        </div>

        <span className="
          text-[10px] text-[#71717a]
        ">
          {engine.components.length} components
        </span>

      </div>

      <div className="overflow-x-auto">

        <table className="
          w-full min-w-[850px]
          text-left text-[11px]
        ">

          <thead className="
            border-b border-[#27272d]
            bg-[#151519]
            text-[10px] text-[#71717a]
          ">

            <tr>

              <th className="px-4 py-3 font-medium">
                Component
              </th>

              <th className="px-4 py-3 font-medium">
                Health index
              </th>

              <th className="px-4 py-3 font-medium">
                Risk level
              </th>

              <th className="px-4 py-3 font-medium">
                Operating hours
              </th>

              <th className="px-4 py-3 font-medium">
                Simulated RUL
              </th>

              <th className="px-4 py-3 font-medium">
                Demo recommendation
              </th>

            </tr>

          </thead>

          <tbody>

            {sortedComponents.map((component) => {

              const color = getHealthColor(
                component.healthScore,
              )

              return (
                <tr
                  key={component.componentId}
                  className="
                    border-b border-[#242429]
                    last:border-b-0
                    hover:bg-[#17171c]
                  "
                >

                  <td className="px-4 py-3">

                    <div className="
                      flex items-center gap-3
                    ">

                      <div className="
                        flex h-8 w-8 shrink-0
                        items-center justify-center
                        rounded border
                        border-[#30343b]
                        bg-[#1b2027]
                      ">

                        <Cog
                          size={15}
                          strokeWidth={1.5}
                          className="text-[#8cdae8]"
                        />

                      </div>

                      <div>

                        <p className="
                          font-medium
                          text-[#e4e4e7]
                        ">
                          {component.name}
                        </p>

                        <p className="
                          mt-1 font-mono
                          text-[9px] text-[#71717a]
                        ">
                          {component.componentId}
                        </p>

                      </div>

                    </div>

                  </td>

                  <td className="px-4 py-3">

                    <div className="
                      flex min-w-[110px]
                      items-center gap-3
                    ">

                      <div className="
                        h-1.5 flex-1
                        overflow-hidden
                        rounded-full
                        bg-[#27272d]
                      ">

                        <div
                          className="
                            h-full rounded-full
                          "
                          style={{
                            width:
                              `${component.healthScore}%`,
                            backgroundColor: color,
                          }}
                        />

                      </div>

                      <span
                        className="
                          font-mono text-[11px]
                        "
                        style={{ color }}
                      >
                        {component.healthScore}%
                      </span>

                    </div>

                  </td>

                  <td className="px-4 py-3">

                    <RiskBadge
                      risk={component.riskLevel}
                    />

                  </td>

                  <td className="
                    px-4 py-3 font-mono
                    text-[#a1a1aa]
                  ">
                    {formatNumber(
                      component.operatingHours,
                    )} h
                  </td>

                  <td className="
                    px-4 py-3 font-mono
                    text-[#8cdae8]
                  ">
                    {formatNumber(
                      component.estimatedRemainingHours,
                    )} h
                  </td>

                  <td className="
                    px-4 py-3
                    text-[#a1a1aa]
                  ">
                    {component.recommendedAction}
                  </td>

                </tr>
              )
            })}

            {sortedComponents.length === 0 && (

              <tr>

                <td
                  colSpan={6}
                  className="
                    px-4 py-10 text-center
                    text-[#71717a]
                  "
                >
                  No component data available
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </section>
  )
}

// ========================================
// MAINTENANCE ALERTS
// ========================================

function MaintenanceAlerts({
  onEngineSelect,
}: {
  onEngineSelect: (engineId: string) => void
}) {

  const [showAll, setShowAll] =
    useState(false)

  const visibleAlerts = showAll
    ? maintenanceAlerts
    : maintenanceAlerts.slice(0, 6)

  return (
    <section className="
      overflow-hidden rounded-md
      border border-[#27272d]
      bg-[#111114]
    ">

      <div className="
        flex items-center justify-between
        gap-3 border-b border-[#27272d]
        px-4 py-3
      ">

        <div>

          <div className="
            flex items-center gap-2
          ">

            <AlertTriangle
              size={15}
              className="text-[#fbbf24]"
            />

            <h2 className="
              text-[12px] font-medium
              text-[#e4e4e7]
            ">
              Fleet Maintenance Alerts
            </h2>

          </div>

          <p className="
            mt-1.5 text-[10px]
            text-[#71717a]
          ">
            Prioritized simulated component risks
          </p>

        </div>

        <span className="
          rounded border border-[#665126]
          bg-[#211c12] px-2 py-1
          font-mono text-[10px]
          text-[#fbbf24]
        ">
          {maintenanceAlerts.length} alerts
        </span>

      </div>

      <div className="max-h-[420px] overflow-auto">

        {visibleAlerts.map((alert) => (

          <button
            type="button"
            key={alert.id}
            onClick={() =>
              onEngineSelect(alert.engineId)
            }
            className="
              flex w-full items-center
              gap-3 border-b border-[#242429]
              px-4 py-3 text-left
              last:border-b-0
              hover:bg-[#19191f]
              focus-visible:outline
              focus-visible:outline-[#67e8f9]
            "
          >

            <div
              className="
                flex h-8 w-8 shrink-0
                items-center justify-center
                rounded border
              "
              style={{
                color:
                  RISK_COLORS[alert.riskLevel],
                backgroundColor:
                  `${RISK_COLORS[alert.riskLevel]}10`,
                borderColor:
                  `${RISK_COLORS[alert.riskLevel]}30`,
              }}
            >

              <AlertTriangle size={15} />

            </div>

            <div className="min-w-0 flex-1">

              <p className="
                truncate text-[11px]
                font-medium text-[#e4e4e7]
              ">
                {alert.componentName}
              </p>

              <p className="
                mt-1 font-mono text-[9px]
                text-[#71717a]
              ">
                {alert.engineId}
                {' · '}
                {alert.componentId}
              </p>

              <p className="
                mt-1.5 text-[10px]
                text-[#a1a1aa]
              ">
                {alert.recommendedAction}
              </p>

            </div>

            <RiskBadge risk={alert.riskLevel} />

          </button>

        ))}

        {visibleAlerts.length === 0 && (

          <div className="
            flex flex-col items-center
            py-10 text-[#71717a]
          ">

            <ShieldCheck
              size={24}
              className="text-[#4ade80]"
            />

            <p className="mt-3 text-[11px]">
              No simulated maintenance alerts
            </p>

          </div>

        )}

      </div>

      {maintenanceAlerts.length > 6 && (

        <button
          type="button"
          onClick={() =>
            setShowAll((previous) => !previous)
          }
          className="
            w-full border-t border-[#27272d]
            py-3 text-[11px]
            text-[#8cdae8]
            hover:bg-[#17171c]
          "
        >

          {showAll
            ? 'Show fewer alerts'
            : `View all ${maintenanceAlerts.length} alerts`}

        </button>

      )}

    </section>
  )
}

// ========================================
// CSV EXPORT
// ========================================

function exportTelemetry(
  engine: EngineTelemetry,
  readings: SensorReading[],
) {

  const headers = [
    'engineId',
    'timestamp',
    'exhaustGasTemperature',
    'vibration',
    'oilTemperature',
    'oilPressure',
    'fuelFlow',
    'n1',
    'n2',
    'simulated',
  ]

  const rows = readings.map((reading) => [

    engine.engineId,
    reading.timestamp,
    reading.exhaustGasTemperature,
    reading.vibration,
    reading.oilTemperature,
    reading.oilPressure,
    reading.fuelFlow,
    reading.n1,
    reading.n2,
    true,

  ].join(','))

  const csv = [
    headers.join(','),
    ...rows,
  ].join('\n')

  const blob = new Blob(
    [csv],
    { type: 'text/csv;charset=utf-8;' },
  )

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')

  link.href = url

  link.download =
    `aerotrust-${engine.engineId}-telemetry.csv`

  document.body.appendChild(link)

  link.click()

  link.remove()

  window.setTimeout(
    () => URL.revokeObjectURL(url),
    1000,
  )
}

// ========================================
// MAIN PREDICTIVE MAINTENANCE PAGE
// ========================================

export default function PredictiveMaintenance() {

  const [selectedEngineId, setSelectedEngineId] =
    useState(
      telemetry[0]?.engineId ?? '',
    )

  const [timeRange, setTimeRange] =
    useState<TimeRange>('24h')

  const selectedEngine =
    telemetry.find(
      (engine) =>
        engine.engineId === selectedEngineId,
    ) ?? telemetry[0]

  const readings = useMemo(() => {

    if (!selectedEngine) {
      return []
    }

    const readingCount =
      timeRange === '6h'
        ? 24
        : timeRange === '12h'
          ? 48
          : 96

    return selectedEngine.readings.slice(
      -readingCount,
    )

  }, [selectedEngine, timeRange])

  if (!selectedEngine) {

    return (
      <div className="
        flex h-full items-center
        justify-center bg-[#09090b]
        text-[12px] text-[#71717a]
      ">
        No engine telemetry available
      </div>
    )
  }

  const latestReading =
    selectedEngine.latestReading

  const elevatedRiskEngines =
    statistics.highRiskEngines +
    statistics.criticalEngines

  // ======================================
  // RENDER
  // ======================================

  return (
    <div className="
      h-full min-h-0 w-full min-w-0
      overflow-y-auto bg-[#09090b]
    ">

      <div className="
        mx-auto max-w-[1800px]
        space-y-5 p-5
      ">

        {/* ================================= */}
        {/* PAGE HEADER                       */}
        {/* ================================= */}

        <div className="
          flex flex-wrap items-start
          justify-between gap-4
        ">

          <div>

            <div className="
              flex items-center gap-2
              text-[10px] text-[#71717a]
            ">

              <Activity size={13} />

              <span>Intelligence Workspace</span>

              <span>/</span>

              <span className="text-[#8cdae8]">
                Maintenance
              </span>

            </div>

            <h1 className="
              mt-3 text-[25px] font-semibold
              tracking-tight text-[#e4e4e7]
            ">
              Predictive Maintenance Intelligence
            </h1>

            <p className="
              mt-2 text-[12px] text-[#71717a]
            ">
              Engine telemetry, component health,
              risk assessment and maintenance forecasting.
            </p>

          </div>

          <div className="
            flex flex-wrap items-center gap-2
          ">

            <div className="
              flex items-center gap-2
              rounded border border-[#31505a]
              bg-[#14252b] px-3 py-2
            ">

              <Radio
                size={13}
                className="text-[#67e8f9]"
              />

              <span className="
                text-[10px] tracking-wider
                text-[#8cdae8]
              ">
                SIMULATION MODE
              </span>

            </div>

            <button
              type="button"
              onClick={() =>
                exportTelemetry(
                  selectedEngine,
                  readings,
                )
              }
              className="
                flex items-center gap-2
                rounded border border-[#30343b]
                bg-[#151519] px-3 py-2
                text-[11px] text-[#a1a1aa]
                hover:border-[#487580]
                hover:text-[#67e8f9]
              "
            >

              <Download size={13} />

              Export telemetry

            </button>

          </div>

        </div>

        {/* ================================= */}
        {/* FLEET STATISTICS                  */}
        {/* ================================= */}

        <div className="
          grid grid-cols-2 gap-3
          lg:grid-cols-3 xl:grid-cols-5
        ">

          <MetricCard
            label="Monitored engines"
            value={String(statistics.totalEngines)}
            description="Registered fleet powerplants"
            icon={Cog}
            color="#67e8f9"
          />

          <MetricCard
            label="Average fleet health"
            value={`${statistics.averageHealth}%`}
            description="Simulated composite index"
            icon={Activity}
            color={getHealthColor(
              statistics.averageHealth,
            )}
          />

          <MetricCard
            label="Monitored components"
            value={formatNumber(
              statistics.monitoredComponents,
            )}
            description="Engine-linked components"
            icon={Layers}
            color="#a5b4fc"
          />

          <MetricCard
            label="Elevated risk engines"
            value={String(elevatedRiskEngines)}
            description="High and critical classifications"
            icon={AlertTriangle}
            color="#fb923c"
          />

          <MetricCard
            label="Maintenance alerts"
            value={String(statistics.activeAlerts)}
            description="Simulated condition alerts"
            icon={Zap}
            color="#fbbf24"
          />

        </div>

        {/* ================================= */}
        {/* ENGINE SELECTOR                   */}
        {/* ================================= */}

        <section className="
          rounded-md border border-[#27272d]
          bg-[#111114] p-4
        ">

          <div className="
            flex flex-wrap items-center
            justify-between gap-4
          ">

            <div className="
              flex flex-wrap items-center gap-4
            ">

              <div className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded border border-[#31505a]
                bg-[#14252b]
              ">

                <Cog
                  size={22}
                  strokeWidth={1.5}
                  className="text-[#67e8f9]"
                />

              </div>

              <div>

                <label
                  htmlFor="maintenance-engine"
                  className="
                    block text-[10px] uppercase
                    tracking-wider text-[#71717a]
                  "
                >
                  Selected powerplant
                </label>

                <div className="relative mt-1">

                  <select
                    id="maintenance-engine"
                    value={selectedEngine.engineId}
                    onChange={(event) =>
                      setSelectedEngineId(
                        event.target.value,
                      )
                    }
                    className="
                      max-w-[280px] appearance-none
                      rounded border border-[#30343b]
                      bg-[#17171c] py-2 pl-3 pr-9
                      text-[12px] text-[#e4e4e7]
                      outline-none
                      focus:border-[#67e8f9]
                    "
                  >

                    {telemetry.map((engine) => (

                      <option
                        key={engine.engineId}
                        value={engine.engineId}
                      >
                        {engine.engineId}
                        {' — '}
                        {engine.model}
                      </option>

                    ))}

                  </select>

                  <ChevronDown
                    size={13}
                    className="
                      pointer-events-none
                      absolute right-3 top-1/2
                      -translate-y-1/2
                      text-[#71717a]
                    "
                  />

                </div>

              </div>

              <div className="
                hidden h-9 w-px
                bg-[#30343b] md:block
              " />

              <div>

                <p className="
                  text-[10px] text-[#71717a]
                ">
                  Operating hours
                </p>

                <p className="
                  mt-1.5 font-mono text-[13px]
                  text-[#e4e4e7]
                ">
                  {formatNumber(
                    selectedEngine.operatingHours,
                  )} h
                </p>

              </div>

              <RiskBadge
                risk={selectedEngine.riskLevel}
              />

            </div>

            {/* Time range */}

            <div className="
              flex items-center gap-3
            ">

              <Clock
                size={14}
                className="text-[#71717a]"
              />

              <div className="
                flex rounded border
                border-[#30343b]
                bg-[#0d0d10] p-1
              ">

                {(
                  ['6h', '12h', '24h'] as const
                ).map((range) => (

                  <button
                    type="button"
                    key={range}
                    onClick={() =>
                      setTimeRange(range)
                    }
                    aria-pressed={
                      timeRange === range
                    }
                    className={`
                      rounded px-3 py-1.5
                      text-[11px] transition-colors
                      ${
                        timeRange === range
                          ? 'bg-[#20333c] text-[#67e8f9]'
                          : 'text-[#71717a] hover:text-[#e4e4e7]'
                      }
                    `}
                  >
                    {range}
                  </button>

                ))}

              </div>

            </div>

          </div>

        </section>

        {/* ================================= */}
        {/* SELECTED ENGINE SENSOR METRICS    */}
        {/* ================================= */}

        <div className="
          grid grid-cols-2 gap-3
          lg:grid-cols-4
        ">

          <MetricCard
            label="Exhaust gas temperature"
            value={`${formatDecimal(
              latestReading.exhaustGasTemperature,
            )}°C`}
            description="EGT · Simulated sensor"
            icon={Thermometer}
            color="#fbbf24"
          />

          <MetricCard
            label="Engine vibration"
            value={`${latestReading.vibration.toFixed(2)} mm/s`}
            description="Simulated vibration amplitude"
            icon={Activity}
            color="#67e8f9"
          />

          <MetricCard
            label="Oil temperature"
            value={`${formatDecimal(
              latestReading.oilTemperature,
            )}°C`}
            description="Lubrication system"
            icon={Droplets}
            color="#60a5fa"
          />

          <MetricCard
            label="Fuel flow"
            value={`${formatNumber(
              Math.round(latestReading.fuelFlow),
            )} kg/h`}
            description="Simulated fuel consumption"
            icon={Fuel}
            color="#a5b4fc"
          />

        </div>

        {/* ================================= */}
        {/* HEALTH AND FLEET RISK             */}
        {/* ================================= */}

        <div className="
          grid grid-cols-1 gap-4
          xl:grid-cols-2
        ">

          <EngineHealthPanel
            engine={selectedEngine}
          />

          <FleetRiskDistribution />

        </div>

        {/* ================================= */}
        {/* PRIMARY TELEMETRY CHARTS          */}
        {/* ================================= */}

        <div className="
          flex items-center justify-between
          gap-3
        ">

          <div className="
            flex items-center gap-2
          ">

            <Activity
              size={16}
              className="text-[#67e8f9]"
            />

            <h2 className="
              text-[13px] font-medium
              text-[#e4e4e7]
            ">
              Engine Telemetry Monitoring
            </h2>

          </div>

          <span className="
            text-[10px] text-[#71717a]
          ">
            {readings.length} samples
            {' · '}
            15-minute interval
            {' · '}
            UTC
          </span>

        </div>

        <div className="
          grid grid-cols-1 gap-4
          lg:grid-cols-2
        ">

          <SensorChart
            title="Exhaust Gas Temperature"
            description="EGT monitoring · Thermal performance"
            data={readings}
            dataKey="exhaustGasTemperature"
            unit="°C"
            color="#fbbf24"
            icon={Thermometer}
            height={240}
          />

          <SensorChart
            title="Engine Vibration"
            description="Mechanical condition monitoring"
            data={readings}
            dataKey="vibration"
            unit="mm/s"
            color="#67e8f9"
            icon={Activity}
            height={240}
          />

        </div>

        {/* ================================= */}
        {/* SECONDARY TELEMETRY               */}
        {/* ================================= */}

        <div className="
          grid grid-cols-1 gap-4
          md:grid-cols-2 xl:grid-cols-3
        ">

          <SensorChart
            title="Oil Temperature"
            description="Lubrication thermal condition"
            data={readings}
            dataKey="oilTemperature"
            unit="°C"
            color="#60a5fa"
            icon={Droplets}
            height={170}
          />

          <SensorChart
            title="Oil Pressure"
            description="Lubrication pressure monitoring"
            data={readings}
            dataKey="oilPressure"
            unit="PSI"
            color="#4ade80"
            icon={Gauge}
            height={170}
          />

          <SensorChart
            title="Fuel Flow"
            description="Simulated fuel consumption rate"
            data={readings}
            dataKey="fuelFlow"
            unit="kg/h"
            color="#a5b4fc"
            icon={Fuel}
            height={170}
          />

        </div>

        {/* ================================= */}
        {/* ENGINE ROTATIONAL SPEED           */}
        {/* ================================= */}

        <div className="
          grid grid-cols-1 gap-4
          lg:grid-cols-2
        ">

          <SensorChart
            title="N1 Rotational Speed"
            description="Low-pressure spool speed"
            data={readings}
            dataKey="n1"
            unit="%"
            color="#2dd4bf"
            icon={Cog}
            height={170}
          />

          <SensorChart
            title="N2 Rotational Speed"
            description="High-pressure spool speed"
            data={readings}
            dataKey="n2"
            unit="%"
            color="#c084fc"
            icon={Cog}
            height={170}
          />

        </div>

        {/* ================================= */}
        {/* MAINTENANCE DEPENDENCY NETWORK    */}
        {/* ================================= */}

        <MaintenanceFlow
          key={selectedEngine.engineId}
          engine={selectedEngine}
        />

        {/* ================================= */}
        {/* COMPONENT HEALTH                  */}
        {/* ================================= */}

        <ComponentHealthTable
          engine={selectedEngine}
        />

        {/* ================================= */}
        {/* MAINTENANCE FORECAST              */}
        {/* ================================= */}

        <div className="
          grid grid-cols-1 gap-4
          xl:grid-cols-[1.4fr_1fr]
        ">

          <MaintenanceAlerts
            onEngineSelect={setSelectedEngineId}
          />

          <section className="
            rounded-md border border-[#27272d]
            bg-[#111114]
          ">

            <div className="
              border-b border-[#27272d]
              px-4 py-3
            ">

              <div className="
                flex items-center gap-2
              ">

                <TrendingUp
                  size={15}
                  className="text-[#8cdae8]"
                />

                <h2 className="
                  text-[12px] font-medium
                  text-[#e4e4e7]
                ">
                  Maintenance Forecast
                </h2>

              </div>

              <p className="
                mt-1.5 text-[10px]
                text-[#71717a]
              ">
                Illustrative remaining useful life
              </p>

            </div>

            <div className="space-y-4 p-4">

              {[
                ...selectedEngine.components,
              ]
                .sort(
                  (first, second) =>
                    first.estimatedRemainingHours -
                    second.estimatedRemainingHours,
                )
                .map((component) => {

                  const color =
                    RISK_COLORS[
                      component.riskLevel
                    ]

                  return (
                    <div key={component.componentId}>

                      <div className="
                        flex items-center
                        justify-between gap-3
                      ">

                        <span className="
                          text-[11px]
                          text-[#d4d4d8]
                        ">
                          {component.name}
                        </span>

                        <span
                          className="
                            font-mono text-[11px]
                          "
                          style={{ color }}
                        >
                          {formatNumber(
                            component.estimatedRemainingHours,
                          )} h
                        </span>

                      </div>

                      <div className="
                        mt-2 h-2 overflow-hidden
                        rounded-sm bg-[#27272d]
                      ">

                        <div
                          className="
                            h-full rounded-sm
                          "
                          style={{
                            width: `${
                              Math.min(
                                100,
                                component.estimatedRemainingHours /
                                  3200 * 100,
                              )
                            }%`,
                            backgroundColor: color,
                            opacity: 0.85,
                          }}
                        />

                      </div>

                    </div>
                  )
                })}

              <div className="
                flex justify-between
                font-mono text-[9px]
                text-[#71717a]
              ">

                <span>0 h</span>

                <span>800 h</span>

                <span>1,600 h</span>

                <span>2,400 h</span>

                <span>3,200 h</span>

              </div>

              <div className="
                flex items-start gap-2
                rounded border border-[#30343b]
                bg-[#151519] p-3
              ">

                <Info
                  size={14}
                  className="
                    mt-0.5 shrink-0
                    text-[#8cdae8]
                  "
                />

                <p className="
                  text-[10px] leading-relaxed
                  text-[#71717a]
                ">
                  Remaining-life values are generated
                  using illustrative simulation rules,
                  not a trained or validated
                  predictive maintenance model.
                </p>

              </div>

            </div>

          </section>

        </div>

        {/* ================================= */}
        {/* FOOTER                            */}
        {/* ================================= */}

        <div className="
          flex flex-wrap items-center
          justify-between gap-3
          border-t border-[#242429]
          py-4 text-[10px]
          text-[#71717a]
        ">

          <div className="
            flex items-center gap-2
          ">

            <Info size={13} />

            Synthetic telemetry and simulated forecasts.
            Not for operational aviation decisions.

          </div>

          <span className="font-mono">
            AeroTrust · Maintenance Intelligence v0.1
          </span>

        </div>

      </div>

    </div>
  )
}