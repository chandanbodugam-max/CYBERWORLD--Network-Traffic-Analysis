import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  FileCode,
  ShieldAlert,
  ArrowRight,
  Database,
  Info
} from 'lucide-react';
import { TelemetryFrame } from '../types';
import {
  parseCsvNetworkData,
  parsePcapBinaryData,
  SAMPLE_DATASETS,
  UploadSummary
} from '../utils/packetParser';

interface UploadDatasetCardProps {
  onDatasetLoaded: (frames: TelemetryFrame[], summary: UploadSummary) => void;
  activeSummary: UploadSummary | null;
}

export const UploadDatasetCard: React.FC<UploadDatasetCardProps> = ({
  onDatasetLoaded,
  activeSummary
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const fileNameLower = file.name.toLowerCase();

      if (fileNameLower.endsWith('.csv') || fileNameLower.endsWith('.txt')) {
        const text = await file.text();
        const summary = parseCsvNetworkData(text, file.name);
        if (summary.parsedFrames.length === 0) {
          throw new Error('No valid network telemetry records could be parsed from the CSV.');
        }
        onDatasetLoaded(summary.parsedFrames, summary);
      } else if (fileNameLower.endsWith('.pcap') || fileNameLower.endsWith('.pcapng') || fileNameLower.endsWith('.cap')) {
        const arrayBuffer = await file.arrayBuffer();
        const summary = parsePcapBinaryData(arrayBuffer, file.name);
        if (summary.parsedFrames.length === 0) {
          throw new Error('No valid packet frames could be parsed from the PCAP capture.');
        }
        onDatasetLoaded(summary.parsedFrames, summary);
      } else {
        throw new Error(`Unsupported file extension for "${file.name}". Please upload a .csv, .pcap, or .pcapng file.`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error parsing file. Please check file format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const loadPredefinedSample = (sampleKey: keyof typeof SAMPLE_DATASETS, sampleName: string) => {
    try {
      const csvContent = SAMPLE_DATASETS[sampleKey];
      const summary = parseCsvNetworkData(csvContent, sampleName);
      onDatasetLoaded(summary.parsedFrames, summary);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Upload Custom Network Telemetry (CSV / PCAP)
            </h3>
            <p className="text-xs text-neutral-500">
              Ingest real-world Wireshark packet captures or exported flow CSVs to train & forecast attacks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200 shrink-0">
          <Info className="w-3.5 h-3.5 text-neutral-500" />
          <span>Supports .csv, .pcap, .pcapng</span>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        id="file-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-red-500 bg-red-50/50 scale-[1.005]'
            : 'border-neutral-300 hover:border-orange-500 hover:bg-neutral-50/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt,.pcap,.pcapng,.cap"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center shadow-xs">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-neutral-800">
              Click to browse or drag & drop your network file here
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Wireshark captures (.pcap, .pcapng) or Flow CSVs (CIC-IDS2017, UNSW-NB15, custom logs)
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px]">
            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded font-mono">.csv</span>
            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded font-mono">.pcap</span>
            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded font-mono">.pcapng</span>
            <span className="text-neutral-400">• Up to 50MB</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Active Dataset Inspection Summary */}
      {activeSummary && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-neutral-900">{activeSummary.fileName}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    Active Telemetry Source
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500">
                  {(activeSummary.fileSizeBytes / 1024).toFixed(1)} KB • {activeSummary.totalRecords} records parsed • {activeSummary.parsedFrames.length} temporal frames
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                activeSummary.riskTrend === 'critical'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : activeSummary.riskTrend === 'escalating'
                  ? 'bg-orange-50 text-orange-700 border-orange-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                Detected: {activeSummary.mitreStageDetected}
              </span>
            </div>
          </div>

          {/* Feature Mapping Status */}
          <div className="pt-2 border-t border-neutral-200 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-neutral-500 font-medium">Extracted Features:</span>
            {activeSummary.detectedFeatures.map(f => (
              <span key={f} className="px-2 py-0.5 bg-white border border-neutral-200 text-neutral-800 rounded font-mono text-[10px]">
                {f}
              </span>
            ))}
            {activeSummary.missingFeatures.length > 0 && (
              <span className="text-neutral-400 text-[10px]">
                ({activeSummary.missingFeatures.length} standard features auto-interpolated)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Predefined Sample Datasets */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-xs text-neutral-600 mb-2 font-medium">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Or load a verified benchmark sample instantly:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => loadPredefinedSample('cicidsSynFlood', 'CIC-IDS2017_DDoS_SYNFlood.csv')}
            className="flex items-center justify-between p-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-red-400 rounded-lg text-left text-xs transition-colors group"
          >
            <div>
              <p className="font-bold text-neutral-800 group-hover:text-red-600">CIC-IDS2017 SYN Flood</p>
              <p className="text-[10px] text-neutral-500">DDoS inundation CSV</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-red-600 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => loadPredefinedSample('miraiBotnet', 'Mirai_IoT_TelnetScan.pcap')}
            className="flex items-center justify-between p-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-orange-400 rounded-lg text-left text-xs transition-colors group"
          >
            <div>
              <p className="font-bold text-neutral-800 group-hover:text-orange-600">Mirai Botnet Recon</p>
              <p className="text-[10px] text-neutral-500">Telnet scan & brute-force</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-orange-600 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={() => loadPredefinedSample('benignWorkstation', 'Benign_Office_Traffic.csv')}
            className="flex items-center justify-between p-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-emerald-400 rounded-lg text-left text-xs transition-colors group"
          >
            <div>
              <p className="font-bold text-neutral-800 group-hover:text-emerald-600">Benign Enterprise</p>
              <p className="text-[10px] text-neutral-500">Baseline workstation traffic</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
