import React from 'react';
import { AlertTriangle, ShieldCheck, ShieldAlert, Clock, ArrowRight, Zap, Target } from 'lucide-react';
import { TelemetryFrame } from '../types';

interface ForecastTimelineProps {
  historyFrames: TelemetryFrame[];
  forecastFrames: TelemetryFrame[];
  rolloutK: number;
}

export const ForecastTimeline: React.FC<ForecastTimelineProps> = ({
  historyFrames,
  forecastFrames,
  rolloutK
}) => {
  const allFrames = [...historyFrames, ...forecastFrames];
  const peakForecastRisk = Math.max(...forecastFrames.map((f) => f.riskScore), 0);
  const worstStage = forecastFrames.reduce(
    (prev, curr) => (curr.riskScore > prev.riskScore ? curr : prev),
    forecastFrames[0] || historyFrames[historyFrames.length - 1]
  );

  const isSevere = peakForecastRisk > 0.6;
  const isElevated = peakForecastRisk > 0.3 && peakForecastRisk <= 0.6;

  // Chart dimensions
  const width = 850;
  const height = 260;
  const padding = { top: 25, right: 35, bottom: 40, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxT = allFrames.length - 1;
  const getX = (t: number) => padding.left + (t / maxT) * chartW;
  const getY = (risk: number) => padding.top + chartH - risk * chartH;

  const currentTIndex = historyFrames.length - 1;
  const currentX = getX(currentTIndex);

  // Path generators
  const historyPoints = historyFrames.map((f, i) => `${getX(i)},${getY(f.riskScore)}`).join(' ');
  const forecastPoints = [
    `${currentX},${getY(historyFrames[currentTIndex]?.riskScore || 0)}`,
    ...forecastFrames.map((f, i) => `${getX(currentTIndex + 1 + i)},${getY(f.riskScore)}`)
  ].join(' ');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-800 text-xs font-bold uppercase tracking-wider mb-2 border border-orange-200">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              Panel B: Predictive Timeline & Autonomous Rollout
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              Forward Simulation Horizon <span className="text-red-600">(T_0 to T_{'{n+K}'})</span>
            </h2>
            <p className="text-neutral-600 text-sm mt-1 max-w-3xl">
              Continuously rolls out state transitions into the future. Highlights the crucial <strong>proactive lead time window</strong> where defensive actions can neutralize threats before data exfiltration occurs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 ${
              isSevere
                ? 'bg-red-50 text-red-800 border-red-200'
                : isElevated
                ? 'bg-orange-50 text-orange-800 border-orange-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {isSevere ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  CRITICAL: BREACH IMMINENT
                </>
              ) : isElevated ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  ELEVATED THREAT DETECTED
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  NORMAL OPERATIONS
                </>
              )}
            </div>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Peak Forecasted Threat</span>
            <p className="text-2xl font-black text-red-600 mt-1 font-mono">
              {(peakForecastRisk * 100).toFixed(1)}%
            </p>
            <span className="text-[11px] text-neutral-500">Maximum projected probability</span>
          </div>

          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Projected Killchain Phase</span>
            <p className="text-lg font-bold text-orange-700 mt-1 truncate">
              {worstStage?.stage || 'Normal'}
            </p>
            <span className="text-[11px] text-neutral-500">MITRE ATT&CK Matrix mapping</span>
          </div>

          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Autonomous Lead Time</span>
            <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">
              +{rolloutK} Steps Ahead
            </p>
            <span className="text-[11px] text-neutral-500">Advance warning before impact</span>
          </div>

          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Current Sensor Time</span>
            <p className="text-2xl font-black text-neutral-900 mt-1 font-mono">
              T_{currentTIndex}
            </p>
            <span className="text-[11px] text-neutral-500">Observed cutoff boundary</span>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Chart (Custom SVG with threshold bands) */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Infiltration Risk Probability Trajectory
            </h3>
            <p className="text-xs text-neutral-500">
              Blue = Past Observed Telemetry (T_0 to T_n) | Red Dashed = World Model Autonomous Rollout (T_n to T_&#123;n+K&#125;)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-neutral-600">Observed History</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-600 border border-red-300" />
              <span className="text-neutral-600 font-semibold text-red-700">Forecast Rollout</span>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto py-4">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[700px] select-none"
          >
            {/* Shaded Threshold Bands */}
            <rect
              x={padding.left}
              y={getY(1.0)}
              width={chartW}
              height={getY(0.6) - getY(1.0)}
              fill="#fee2e2"
              fillOpacity="0.4"
            />
            <rect
              x={padding.left}
              y={getY(0.6)}
              width={chartW}
              height={getY(0.3) - getY(0.6)}
              fill="#ffedd5"
              fillOpacity="0.4"
            />
            <rect
              x={padding.left}
              y={getY(0.3)}
              width={chartW}
              height={getY(0.0) - getY(0.3)}
              fill="#dcfce7"
              fillOpacity="0.3"
            />

            {/* Threshold Labels */}
            <text x={padding.left + 8} y={getY(0.95)} fill="#b91c1c" fontSize="10" fontWeight="600">
              Severe Attack Imminent (&gt; 0.60)
            </text>
            <text x={padding.left + 8} y={getY(0.55)} fill="#c2410c" fontSize="10" fontWeight="600">
              Elevated Infiltration (0.30 - 0.60)
            </text>
            <text x={padding.left + 8} y={getY(0.25)} fill="#15803d" fontSize="10" fontWeight="600">
              Benign / Normal (&lt; 0.30)
            </text>

            {/* Grid lines */}
            {[0.0, 0.25, 0.5, 0.75, 1.0].map((val) => (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={getY(val)}
                  x2={padding.left + chartW}
                  y2={getY(val)}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding.left - 10}
                  y={getY(val) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#6b7280"
                  fontFamily="monospace"
                >
                  {(val * 100).toFixed(0)}%
                </text>
              </g>
            ))}

            {/* Vertical Split Line at Current Time (Tn) */}
            <line
              x1={currentX}
              y1={padding.top}
              x2={currentX}
              y2={padding.top + chartH}
              stroke="#374151"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            <rect
              x={currentX - 55}
              y={padding.top - 18}
              width="110"
              height="20"
              rx="4"
              fill="#1f2937"
            />
            <text
              x={currentX}
              y={padding.top - 4}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="10"
              fontWeight="bold"
            >
              Current Time T_{currentTIndex}
            </text>

            {/* Historical Path */}
            <polyline
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              points={historyPoints}
            />

            {/* Forecast Path */}
            <polyline
              fill="none"
              stroke="#dc2626"
              strokeWidth="3"
              strokeDasharray="6,4"
              points={forecastPoints}
            />

            {/* Data Points: Historical */}
            {historyFrames.map((f, i) => (
              <g key={`hist-${i}`}>
                <circle
                  cx={getX(i)}
                  cy={getY(f.riskScore)}
                  r="4"
                  fill="#1d4ed8"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            ))}

            {/* Data Points: Forecast */}
            {forecastFrames.map((f, i) => {
              const x = getX(currentTIndex + 1 + i);
              const y = getY(f.riskScore);
              return (
                <g key={`fc-${i}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5.5"
                    fill="#ea580c"
                    stroke="#dc2626"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fill="#991b1b"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {(f.riskScore * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}

            {/* X-axis T-labels */}
            {allFrames.map((f, i) => (
              <text
                key={`label-${i}`}
                x={getX(i)}
                y={padding.top + chartH + 20}
                textAnchor="middle"
                fontSize="10"
                fill={f.isForecast ? '#b91c1c' : '#4b5563'}
                fontWeight={f.isForecast ? 'bold' : 'normal'}
                fontFamily="monospace"
              >
                T_{i}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Proactive Incident Response Playbook */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white p-6 rounded-xl shadow-md border border-neutral-700">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold tracking-tight text-white">
            Autonomous SOC Defensive Countermeasures
          </h3>
          <span className="text-xs bg-amber-400/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-400/30 ml-auto">
            Zero-Lag Proactive Response
          </span>
        </div>

        <p className="text-xs text-neutral-300 mb-4">
          Because the World Model identified the upcoming threat transition at <span className="text-amber-400 font-semibold">T_{currentTIndex + 1}</span>, defensive engineers can orchestrate containment before the exfiltration or payload detonation threshold is breached:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-neutral-800/80 rounded-lg border border-neutral-700">
            <div className="font-bold text-red-400 flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5" />
              Ingress Rate Limiting & ACL
            </div>
            <p className="text-neutral-300 text-[11px]">
              Push stateless IP block rule to edge Fortinet/Cisco gateway. Drop incoming SYN packets exceeding 120 pkt/sec from affected CIDR blocks.
            </p>
          </div>

          <div className="p-3 bg-neutral-800/80 rounded-lg border border-neutral-700">
            <div className="font-bold text-orange-400 flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Micro-Segment Quarantine
            </div>
            <p className="text-neutral-300 text-[11px]">
              Isolate suspect workload onto isolated zero-trust VLAN. Prevent lateral SMB / RPC credential reuse across internal subnets.
            </p>
          </div>

          <div className="p-3 bg-neutral-800/80 rounded-lg border border-neutral-700">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
              <ArrowRight className="w-3.5 h-3.5" />
              DNS Sinkholing & Key Rotation
            </div>
            <p className="text-neutral-300 text-[11px]">
              Null-route suspicious C2 heartbeat domains identified in low-jitter IAT telemetry and invalidate temporary session tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
