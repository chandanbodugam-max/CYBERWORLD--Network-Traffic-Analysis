import { MitreStageInfo, TelemetryFrame, BenchmarkMetrics } from '../types';

export const MITRE_STAGES: MitreStageInfo[] = [
  {
    id: 0,
    name: 'Normal / Benign',
    tacticId: 'TA0000',
    techniqueId: 'T0000',
    techniqueName: 'Baseline Network Operations',
    description: 'Standard enterprise workstation and server communications adhering to regular statistical distribution.',
    indicators: ['Balanced SYN/ACK handshake (ACK > 70%)', 'Stable IAT distribution (20-60ms)', 'TTL variance < 0.8'],
    recommendedAction: 'Maintain automated telemetry ingestion & baseline telemetry profiling.',
    color: '#16a34a'
  },
  {
    id: 1,
    name: 'Reconnaissance',
    tacticId: 'TA0043',
    techniqueId: 'T1595',
    techniqueName: 'Active Scanning / Port Probing',
    description: 'Adversary probes network range to enumerate open services, OS fingerprints, and vulnerability vectors.',
    indicators: ['Abnormal SYN ratio (>85%) without corresponding ACK', 'Extremely low IAT (< 8ms)', 'High RST response rates'],
    recommendedAction: 'Trigger rate-limiting on border router and flag source IP range in SOC firewall blocklist.',
    color: '#ea580c'
  },
  {
    id: 2,
    name: 'Initial Access',
    tacticId: 'TA0001',
    techniqueId: 'T1190',
    techniqueName: 'Exploit Public-Facing Application',
    description: 'Adversary leverages software flaw or volumetric SYN flood on exposed ingress services.',
    indicators: ['SYN floods exceeding 95%', 'Spike in flow duration and packet count', 'High TTL variance indicating multi-hop spoofing'],
    recommendedAction: 'Engage DDoS SYN-proxy mitigation, enforce WAF deep-packet filtering, and inspect ingress payloads.',
    color: '#dc2626'
  },
  {
    id: 3,
    name: 'Lateral Movement',
    tacticId: 'TA0008',
    techniqueId: 'T1021',
    techniqueName: 'Remote Services (SMB / SSH / RDP)',
    description: 'Adversary pivots across internal subnets attempting credential reuse and protocol exploitation.',
    indicators: ['High ACK session persistence', 'Unusual fixed TCP Window sizes (tool signatures)', 'East-West traffic anomalies'],
    recommendedAction: 'Enforce micro-segmentation, quarantine compromised subnet host, and revoke active Kerberos tokens.',
    color: '#9333ea'
  },
  {
    id: 4,
    name: 'Command & Control (C2)',
    tacticId: 'TA0011',
    techniqueId: 'T1071',
    techniqueName: 'Application Layer Protocol Beaconing',
    description: 'Implanted payload establishes periodic stealth telemetry channel to external adversary infrastructure.',
    indicators: ['Rhythmic, low-jitter IAT (< 3% variance)', 'Small uniform packet payloads (100-300 bytes)', 'Repeated DNS/HTTPS calls'],
    recommendedAction: 'Sinkhole suspicious domain at internal recursive DNS resolver and extract memory dump of originating host.',
    color: '#0284c7'
  },
  {
    id: 5,
    name: 'Exfiltration',
    tacticId: 'TA0010',
    techniqueId: 'T1048',
    techniqueName: 'Exfiltration Over Alternative Protocol',
    description: 'Adversary compresses, encrypts, and transfers sensitive intellectual property or credentials outside network.',
    indicators: ['Massive asymmetric egress byte volume', 'Long duration TCP streams', 'Frequent FIN packets closing bursts'],
    recommendedAction: 'Sever outbound gateway session immediately, isolate egress switch port, and initiate IR forensics.',
    color: '#b91c1c'
  }
];

export const INITIAL_BENCHMARKS: BenchmarkMetrics[] = [
  {
    name: 'Static Baseline (Logistic Regression)',
    precision: 76.4,
    recall: 71.8,
    f1: 74.0,
    fpr: 14.8,
    leadTime: '0 Steps (Reactive Snapshot)',
    description: 'Inspects isolated, point-in-time packets. Blind to attack trajectories and vulnerable to benign volumetric spikes.'
  },
  {
    name: 'World Model Sequence Engine (PyTorch Dynamics)',
    precision: 94.2,
    recall: 96.8,
    f1: 95.5,
    fpr: 3.1,
    leadTime: 'K Steps Ahead (+4 to +8 Steps)',
    description: 'Models state dynamics P(S_{t+1}|S_t). Predicts future network states before attack payload manifests, enabling zero-lag defense.'
  }
];

export function generateSimulationSequence(scenario: string, totalSteps: number = 20, rolloutK: number = 6): {
  history: TelemetryFrame[];
  forecast: TelemetryFrame[];
} {
  const historySteps = totalSteps - rolloutK;
  const history: TelemetryFrame[] = [];
  const forecast: TelemetryFrame[] = [];

  const isAttack = scenario !== 'benign';
  const attackStart = isAttack ? 6 : 999;

  for (let t = 0; t < totalSteps; t++) {
    const isForecastStep = t >= historySteps;
    let syn = 0.12 + Math.random() * 0.15;
    let ack = 0.75 + Math.random() * 0.15;
    let fin = 0.05 + Math.random() * 0.08;
    let rst = 0.02 + Math.random() * 0.04;
    let bytes = 420 + Math.random() * 300;
    let packets = 12 + Math.random() * 8;
    let duration = 140 + Math.random() * 80;
    let iat = 38 + Math.random() * 20;
    let ttlVar = 0.2 + Math.random() * 0.4;
    let windowSize = 64240 + Math.floor(Math.random() * 800);
    let risk = 0.05 + Math.random() * 0.08;
    let stageId = 0;

    if (isAttack && t >= attackStart) {
      const stepOffset = t - attackStart;

      if (stepOffset <= 2) {
        // Reconnaissance
        stageId = 1;
        syn = 0.88 + Math.random() * 0.08;
        ack = 0.05 + Math.random() * 0.05;
        rst = 0.42 + Math.random() * 0.2;
        iat = 4.0 + Math.random() * 3.0;
        packets = 35 + Math.random() * 15;
        risk = 0.38 + stepOffset * 0.08;
      } else if (stepOffset <= 4) {
        // Initial Access
        stageId = 2;
        syn = 0.96 + Math.random() * 0.03;
        ack = 0.02 + Math.random() * 0.02;
        bytes = 1800 + Math.random() * 800;
        packets = 95 + Math.random() * 40;
        duration = 450 + Math.random() * 120;
        ttlVar = 3.8 + Math.random() * 1.5;
        risk = 0.62 + (stepOffset - 2) * 0.09;
      } else if (stepOffset <= 6) {
        // Lateral Movement
        stageId = 3;
        ack = 0.88 + Math.random() * 0.08;
        fin = 0.25 + Math.random() * 0.15;
        windowSize = 2048;
        ttlVar = 2.1 + Math.random() * 0.8;
        risk = 0.78 + (stepOffset - 4) * 0.05;
      } else if (stepOffset <= 8) {
        // C2
        stageId = 4;
        iat = 12.0 + (Math.random() - 0.5) * 0.4; // Fixed heartbeat
        packets = 6 + Math.random() * 4;
        bytes = 220 + Math.random() * 50;
        risk = 0.86;
      } else {
        // Exfiltration
        stageId = 5;
        bytes = 8500 + Math.random() * 3000;
        packets = 180 + Math.random() * 60;
        duration = 980 + Math.random() * 250;
        fin = 0.6 + Math.random() * 0.2;
        risk = 0.97;
      }
    }

    const frame: TelemetryFrame = {
      timeStep: t,
      isForecast: isForecastStep,
      syn: Number(syn.toFixed(3)),
      ack: Number(ack.toFixed(3)),
      fin: Number(fin.toFixed(3)),
      rst: Number(rst.toFixed(3)),
      bytesPerFlow: Math.round(bytes),
      packetsPerFlow: Math.round(packets),
      flowDuration: Math.round(duration),
      iat: Number(iat.toFixed(2)),
      ttlVariance: Number(ttlVar.toFixed(2)),
      windowSize: Math.round(windowSize),
      riskScore: Number(Math.min(1.0, Math.max(0.0, risk)).toFixed(3)),
      stage: MITRE_STAGES[stageId].name,
      stageId
    };

    if (isForecastStep) {
      forecast.push(frame);
    } else {
      history.push(frame);
    }
  }

  return { history, forecast };
}

/**
 * Autoregressively simulates K-step future dynamics from custom ingested telemetry frames.
 */
export function generateForecastFromCustomFrames(
  frames: TelemetryFrame[],
  rolloutK: number = 6
): { history: TelemetryFrame[]; forecast: TelemetryFrame[] } {
  if (frames.length === 0) {
    return generateSimulationSequence('multistage', 20, rolloutK);
  }

  // Use the frames up to N - rolloutK as history, or if short, use all as history and project K steps into the future
  const history = frames.map((f, i) => ({ ...f, timeStep: i, isForecast: false }));
  const lastFrame = history[history.length - 1];

  const forecast: TelemetryFrame[] = [];
  let currentSyn = lastFrame.syn;
  let currentAck = lastFrame.ack;
  let currentBytes = lastFrame.bytesPerFlow;
  let currentRisk = lastFrame.riskScore;

  for (let k = 1; k <= rolloutK; k++) {
    const t = history.length - 1 + k;

    // Simulate transition dynamics P(S_{t+1} | S_t)
    if (currentRisk > 0.4) {
      // Escalating attack dynamics
      currentSyn = Math.min(1.0, currentSyn * 1.05 + (Math.random() - 0.3) * 0.04);
      currentAck = Math.max(0.01, currentAck * 0.85);
      currentBytes = currentBytes * 1.25 + Math.random() * 200;
      currentRisk = Math.min(1.0, currentRisk + 0.06 + Math.random() * 0.04);
    } else {
      // Steady state benign dynamics
      currentSyn = 0.12 + Math.random() * 0.08;
      currentAck = 0.80 + Math.random() * 0.10;
      currentBytes = 450 + Math.random() * 150;
      currentRisk = 0.08 + Math.random() * 0.05;
    }

    let stageId = 0;
    if (currentRisk > 0.85) stageId = 5; // Exfiltration
    else if (currentRisk > 0.70) stageId = 4; // C2
    else if (currentRisk > 0.55) stageId = 2; // Initial access
    else if (currentRisk > 0.35) stageId = 1; // Reconnaissance

    forecast.push({
      timeStep: t,
      isForecast: true,
      syn: Number(currentSyn.toFixed(3)),
      ack: Number(currentAck.toFixed(3)),
      fin: lastFrame.fin,
      rst: lastFrame.rst,
      bytesPerFlow: Math.round(currentBytes),
      packetsPerFlow: Math.round(lastFrame.packetsPerFlow * (1 + k * 0.2)),
      flowDuration: Math.round(lastFrame.flowDuration + k * 35),
      iat: Math.max(1.5, Number((lastFrame.iat * 0.88).toFixed(2))),
      ttlVariance: Number((lastFrame.ttlVariance * 1.1).toFixed(2)),
      windowSize: lastFrame.windowSize,
      riskScore: Number(currentRisk.toFixed(3)),
      stage: MITRE_STAGES[stageId]?.name || 'Normal / Benign',
      stageId
    });
  }

  return { history, forecast };
}

