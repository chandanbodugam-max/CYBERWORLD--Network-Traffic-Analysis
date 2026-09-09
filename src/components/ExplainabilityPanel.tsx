import React from 'react';
import { Eye, ShieldAlert, Cpu, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { MITRE_STAGES } from '../data/attackScenarios';

export const ExplainabilityPanel: React.FC = () => {
  const featureAttribution = [
    { feature: 'TCP SYN Flag Ratio', weight: 0.28, category: 'Flow Header', detail: 'Rapid SYN surge without ACK response' },
    { feature: 'Inter-Arrival Time (IAT)', weight: 0.22, category: 'Temporal Flow', detail: 'Sub-10ms burst scanning or fixed C2 jitter' },
    { feature: 'TTL Variance', weight: 0.16, category: 'Packet Header', detail: 'Inconsistent hop counts indicating IP spoofing' },
    { feature: 'Bytes per Flow', weight: 0.14, category: 'Volume', detail: 'Exfiltration payload volume spikes' },
    { feature: 'TCP Window Size Buffer', weight: 0.11, category: 'Packet Header', detail: 'Fixed 1024/2048 buffer signature of automated tools' },
    { feature: 'TCP RST Ratio', weight: 0.05, category: 'Flow Header', detail: 'Port-closed responses from scanned targets' },
    { feature: 'Flow Duration', weight: 0.04, category: 'Temporal Flow', detail: 'Persistent exfiltration stream session time' }
  ];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider mb-2 border border-red-200">
          <Eye className="w-3.5 h-3.5 text-red-600" />
          Panel C: Model Explainability & Saliency
        </div>
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          Feature Attribution & <span className="text-orange-600">MITRE ATT&CK Mapping</span>
        </h2>
        <p className="text-neutral-600 text-sm mt-1 max-w-3xl">
          Black-box intrusion systems fail national security compliance. The World Model calculates input gradient sensitivities (|∂Risk/∂S_i| × |S_i|) and maps state trajectories to explicit MITRE ATT&CK enterprise tactics.
        </p>
      </div>

      {/* Grid: Saliency vs MITRE Stage Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-600" />
                Feature Sensitivity Attribution (SHAP Approximation)
              </h3>
              <p className="text-xs text-neutral-500">
                Normalized contribution to the World Model's future risk prediction.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-neutral-100 rounded text-neutral-600 font-semibold">
              Σ Weight = 1.00
            </span>
          </div>

          <div className="space-y-3.5">
            {featureAttribution.map((item) => (
              <div key={item.feature} className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-neutral-800">{item.feature}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-200">
                      {item.category}
                    </span>
                    <span className="font-mono font-bold text-red-700">
                      {(item.weight * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-500"
                    style={{ width: `${item.weight * 100 * 2.8}%` }}
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-0.5">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* MITRE ATT&CK Killchain Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                MITRE ATT&CK Enterprise Killchain Trajectory
              </h3>
              <p className="text-xs text-neutral-500">
                Mapped dynamically as state vector transitions across sequence steps.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {MITRE_STAGES.filter((s) => s.id > 0).map((stage) => (
              <div
                key={stage.id}
                className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/70 hover:bg-white hover:border-orange-300 transition-all text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span>{stage.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-white border border-neutral-200 rounded text-neutral-600">
                      {stage.techniqueId}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-orange-700">
                    {stage.tacticId}
                  </span>
                </div>

                <p className="text-neutral-600 text-[11px] mb-2">{stage.description}</p>

                <div className="p-2 bg-white rounded border border-neutral-100 text-[11px]">
                  <span className="font-semibold text-neutral-700">Key Signature: </span>
                  <span className="text-neutral-600">{stage.indicators.join(' • ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
