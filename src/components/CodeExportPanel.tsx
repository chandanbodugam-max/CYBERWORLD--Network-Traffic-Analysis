import React, { useState } from 'react';
import { Download, Copy, Check, Terminal, FileCode, Shield, Sparkles } from 'lucide-react';

interface CodeExportPanelProps {
  pythonCode: string;
}

export const CodeExportPanel: React.FC<CodeExportPanelProps> = ({ pythonCode }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sih_prototype.py');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider mb-2 border border-red-200">
              <FileCode className="w-3.5 h-3.5 text-red-600" />
              Complete Single-Script Deliverable
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              Standalone <span className="text-orange-600">sih_prototype.py</span> Engine
            </h2>
            <p className="text-neutral-600 text-sm mt-1 max-w-3xl">
              Contains the 100% unified Python code including the PyTorch World Model, feature engineering pipeline, forward rollout simulation, Streamlit dashboard, and benchmark suite.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold text-xs transition-all shadow-sm active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-neutral-600" />
                  <span>Copy Script</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-all shadow-sm hover:shadow active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download sih_prototype.py</span>
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Instructions */}
      <div className="bg-neutral-900 text-neutral-100 p-6 rounded-xl border border-neutral-800 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Local Setup & Terminal Execution Commands
          </h3>
        </div>

        <div className="space-y-4 text-xs font-mono">
          <div>
            <span className="text-neutral-400 font-sans text-[11px] block mb-1">
              Step 1: Install required dependencies (PyTorch, Streamlit, Scikit-Learn, Plotly)
            </span>
            <div className="p-3 bg-black/60 rounded-lg border border-neutral-800 flex items-center justify-between">
              <span className="text-emerald-400">pip install torch streamlit pandas networkx plotly scikit-learn</span>
            </div>
          </div>

          <div>
            <span className="text-neutral-400 font-sans text-[11px] block mb-1">
              Step 2: Launch the interactive Streamlit offline interface
            </span>
            <div className="p-3 bg-black/60 rounded-lg border border-neutral-800 flex items-center justify-between">
              <span className="text-amber-400">streamlit run sih_prototype.py</span>
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-neutral-700">
            sih_prototype.py (Self-Contained Full System)
          </span>
          <span className="text-[11px] text-neutral-500">
            ~450 Lines • Zero External Cloud Dependencies
          </span>
        </div>

        <pre className="p-4 bg-neutral-900 text-neutral-200 text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed">
          <code>{pythonCode}</code>
        </pre>
      </div>

      {/* Hackathon Defense Pitch Guide */}
      <div className="p-5 bg-orange-50/70 border border-orange-200 rounded-xl text-xs space-y-2">
        <div className="font-bold text-orange-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-orange-600" />
          SIH Presentation & Defense Tip (Answering the NTRO Problem ID 26153)
        </div>
        <p className="text-orange-950">
          When asked by judges: <em>"Why use a World Model rather than standard XGBoost, Random Forest, or a simple classifier?"</em>
        </p>
        <p className="text-neutral-700 bg-white p-3 rounded-lg border border-orange-100 italic">
          &ldquo;Static classifiers only trigger an alert after an anomaly breaches thresholds—which is already too late during rapid data exfiltration or ransomware encryption. Our World Model explicitly learns the <strong>state transition physics</strong> P(S_{'{t+1}'} | S_t) of network sessions. By performing autoregressive <strong>K-step forward rollouts</strong>, we forecast attack vectors <strong>before</strong> destructive payloads land, giving automated SOC firewalls actionable lead time.&rdquo;
        </p>
      </div>
    </div>
  );
};
