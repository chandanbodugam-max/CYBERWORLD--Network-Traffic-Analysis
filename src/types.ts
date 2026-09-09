export interface TelemetryFrame {
  timeStep: number;
  isForecast: boolean;
  syn: number;
  ack: number;
  fin: number;
  rst: number;
  bytesPerFlow: number;
  packetsPerFlow: number;
  flowDuration: number;
  iat: number;
  ttlVariance: number;
  windowSize: number;
  riskScore: number;
  stage: string;
  stageId: number;
}

export interface MitreStageInfo {
  id: number;
  name: string;
  tacticId: string;
  techniqueId: string;
  techniqueName: string;
  description: string;
  indicators: string[];
  recommendedAction: string;
  color: string;
}

export interface BenchmarkMetrics {
  name: string;
  precision: number;
  recall: number;
  f1: number;
  fpr: number;
  leadTime: string;
  description: string;
}

export interface TrainingLog {
  epoch: number;
  loss: number;
  dynamicsMse: number;
  riskLoss: number;
}
