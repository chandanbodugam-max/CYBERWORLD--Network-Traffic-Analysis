import React, { useState, useMemo } from 'react';
import {
  Shield,
  Cpu,
  Clock,
  Eye,
  Scale,
  FileCode,
  AlertOctagon,
  Activity,
  CheckCircle2,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { TrainingPanel } from './components/TrainingPanel';
import { ForecastTimeline } from './components/ForecastTimeline';
import { ExplainabilityPanel } from './components/ExplainabilityPanel';
import { BenchmarkPanel } from './components/BenchmarkPanel';
import { CodeExportPanel } from './components/CodeExportPanel';
import { generateSimulationSequence, generateForecastFromCustomFrames } from './data/attackScenarios';
import { PYTHON_SCRIPT_CODE } from './data/pythonScriptContent';
import { TelemetryFrame, TrainingLog } from './types';
import { UploadSummary } from './utils/packetParser';

export default function App() {
  const [activeTab, setActiveTab] = useState<'panelA' | 'panelB' | 'panelC' | 'benchmark' | 'code'>('panelA');
  const [scenario, setScenario] = useState<string>('multistage');
  const [rolloutK, setRolloutK] = useState<number>(6);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [hasTrained, setHasTrained] = useState<boolean>(true);
  const [customFrames, setCustomFrames] = useState<TelemetryFrame[] | null>(null);
  const [customSummary, setCustomSummary] = useState<UploadSummary | null>(null);

  // Generate telemetry streams: from custom uploaded CSV/PCAP frames or synthetic scenarios
  const { history, forecast } = useMemo(() => {
    if (customFrames && customFrames.length > 0) {
      return generateForecastFromCustomFrames(customFrames, rolloutK);
    }
    return generateSimulationSequence(scenario, 22, rolloutK);
  }, [customFrames, scenario, rolloutK]);

  // Handle custom upload
  const handleCustomDatasetLoaded = (frames: TelemetryFrame[], summary: UploadSummary) => {
    setCustomFrames(frames);
    setCustomSummary(summary);
  };

  const handleResetToSynthetic = () => {
    setCustomFrames(null);
    setCustomSummary(null);
  };

  // Handle Training Simulation
  const handleTrainComplete = (logs: TrainingLog[]) => {
    setIsTraining(true);
    setTrainingProgress(0.0);

    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 1.0) {
          clearInterval(interval);
          setIsTraining(false);
          setHasTrained(true);
          return 1.0;
        }
        return prev + 0.12;
      });
    }, 120);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 flex flex-col selection:bg-red-100 selection:text-red-900">
      {/* Top Hackathon Context Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  Autonomous Cyber Defense
                </span>
                <span className="text-[11px] font-medium text-neutral-500 hidden sm:inline">
                  • AI based Network Attack Forecasting
                </span>
              </div>
              <h1 className="text-lg font-black tracking-tight text-neutral-900">
                Network Attack Forecasting <span className="text-red-600 font-extrabold">World Model Engine</span>
              </h1>
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="flex items-center gap-2 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-100 text-neutral-700 font-medium border border-neutral-200">
              <Cpu className="w-3.5 h-3.5 text-neutral-500" />
              <span>PyTorch LSTM</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline Ready</span>
            </div>
            <button
              onClick={() => setActiveTab('code')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs transition-colors"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>sih_prototype.py</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-1 border-t border-neutral-100 no-scrollbar">
            <button
              id="tab-panel-a"
              onClick={() => setActiveTab('panelA')}
              className={`py-2.5 px-3 rounded-md text-xs sm:text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'panelA'
                  ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Cpu className="w-4 h-4 text-red-600" />
              Panel A: In-App Training
            </button>

            <button
              id="tab-panel-b"
              onClick={() => setActiveTab('panelB')}
              className={`py-2.5 px-3 rounded-md text-xs sm:text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'panelB'
                  ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Clock className="w-4 h-4 text-orange-600" />
              Panel B: Forecasting Timeline
            </button>

            <button
              id="tab-panel-c"
              onClick={() => setActiveTab('panelC')}
              className={`py-2.5 px-3 rounded-md text-xs sm:text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'panelC'
                  ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Eye className="w-4 h-4 text-red-600" />
              Panel C: Explainability & MITRE
            </button>

            <button
              id="tab-benchmark"
              onClick={() => setActiveTab('benchmark')}
              className={`py-2.5 px-3 rounded-md text-xs sm:text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'benchmark'
                  ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Scale className="w-4 h-4 text-orange-600" />
              Benchmark Engine (vs Baseline)
            </button>

            <button
              id="tab-code"
              onClick={() => setActiveTab('code')}
              className={`py-2.5 px-3 rounded-md text-xs sm:text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <FileCode className="w-4 h-4 text-red-600" />
              Python Script & Instructions
            </button>
          </nav>
        </div>
      </header>

      {/* Custom Upload Active Alert Banner */}
      {customSummary && (
        <div className="bg-emerald-50 border-b border-emerald-200 py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-emerald-900">Custom Dataset Active:</span>
              <span className="font-mono text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                {customSummary.fileName}
              </span>
              <span className="text-emerald-700 hidden sm:inline">
                ({customSummary.totalRecords} records, {customSummary.parsedFrames.length} frames) — All panels reflecting uploaded traffic.
              </span>
            </div>
            <button
              onClick={handleResetToSynthetic}
              className="text-xs text-neutral-600 hover:text-red-700 font-semibold underline ml-3"
            >
              Reset to Synthetic
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'panelA' && (
          <TrainingPanel
            onTrainComplete={handleTrainComplete}
            isTraining={isTraining}
            trainingProgress={trainingProgress}
            sampleData={[...history, ...forecast]}
            scenario={scenario}
            setScenario={setScenario}
            rolloutK={rolloutK}
            setRolloutK={setRolloutK}
            onCustomDatasetLoaded={handleCustomDatasetLoaded}
            customSummary={customSummary}
          />
        )}

        {activeTab === 'panelB' && (
          <ForecastTimeline
            historyFrames={history}
            forecastFrames={forecast}
            rolloutK={rolloutK}
          />
        )}

        {activeTab === 'panelC' && <ExplainabilityPanel />}

        {activeTab === 'benchmark' && <BenchmarkPanel />}

        {activeTab === 'code' && <CodeExportPanel pythonCode={PYTHON_SCRIPT_CODE} />}
      </main>

      {/* Hackathon Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-auto py-4 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-700">SIH Internal Hackathon Qualifying Prototype</span>
            <span>• Problem ID: 26153 (NTRO)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Reproducibility: Torch Seed 42</span>
            <span>Latency: &lt; 30s Local CPU</span>
            <span className="text-orange-700 font-semibold">World Model State Dynamics P(S_{'{t+1}'}|S_t)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
