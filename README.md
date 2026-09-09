[README (1).md](https://github.com/user-attachments/files/31998372/README.1.md)
<div align="center">

<img src="https://img.shields.io/badge/Smart%20India%20Hackathon-2026-FF6600?style=for-the-badge" />
&nbsp;
<img src="https://img.shields.io/badge/Problem%20ID-26153%20·%20NTRO-CC0000?style=for-the-badge" />
&nbsp;
<img src="https://img.shields.io/badge/Domain-Cybersecurity-1a1a2e?style=for-the-badge" />
&nbsp;
<img src="https://img.shields.io/badge/Offline%20Ready-No%20Cloud%20Needed-2d6a4f?style=for-the-badge" />

<br/><br/>

# 🛡️ Network Attack Forecasting — World Model Engine

### AI that predicts cyberattacks *before* they complete — not after.

*SIH 2026 · Problem ID 26153 · NTRO · Blockchain & Cybersecurity*

</div>

---

## 🚨 Business Problem

Enterprise networks and Critical Information Infrastructure (CERT-In, NTRO) are protected by intrusion detection systems that work like this:

> They watch a single packet or flow, decide if it looks malicious, and fire an alert.

That sounds fine — until you realise **attacks don't happen in a single packet**. A real APT campaign unfolds over minutes or hours:

```
Port scan → SYN flood → Credential brute-force → C2 beacon → Data exfiltration
```

By the time a static classifier sees the exfiltration traffic and raises the alarm, **the data has already left the network**. There's nothing the SOC team can do. The adversary won.

On top of that, static classifiers confuse legitimate bulk traffic (OS updates, backups) with attacks — producing a **~15% false positive rate** that causes so many false alarms, analysts start ignoring them entirely.

---

## 💡 Our Idea

What if the system didn't just classify traffic — but **understood how the network behaves over time**, and could predict where it's heading?

This is the idea behind **World Models** — AI architectures that learn an internal simulation of how an environment evolves. Instead of asking *"is this packet malicious?"*, we ask:

> **"Given everything I've seen so far, what will the network look like in the next 4–8 steps — and is it heading toward a breach?"**

The model learns the *transition dynamics* of network traffic: what normal traffic looks like over time, and crucially, what an attack kill-chain looks like as it progresses — so it can recognise the pattern early and raise the alarm **before** the adversary finishes.

---

## ✅ What We Built

A full-stack prototype with two working layers:

**React App (Browser Demo)**
- Upload your own PCAP or CSV traffic file, or pick a built-in sample dataset
- Watch the World Model's K-step forecast render live on a timeline chart
- See the predicted MITRE ATT&CK attack stage at each future step
- Inspect which traffic features drove the prediction (SHAP-style attribution)
- Compare performance against the Logistic Regression baseline side-by-side
- Export and download the full Python implementation in one click

**Python Backend (`sih_prototype.py`)**
- Real PyTorch LSTM model that actually trains on your data
- Streamlit UI — runs fully offline on any machine
- Benchmark engine: trains both the World Model and baseline LR on the same data, computes F1, Precision, Recall, FPR, and draws confusion matrices
- Gradient saliency explainability built in

---

## 🧠 How the Model Works

The core is a **2-layer stacked LSTM** trained to learn network state transition dynamics — `P(S_{t+1} | S_{0:t})`.

```
Observed traffic history
[S_0, S_1, S_2, ... S_t]
          │
          ▼
    LSTM Encoder
    (hidden state h_t encodes full temporal context)
          │
     ┌────┴────┐
     ▼         ▼
Dynamics    Risk Head
  Head      (sigmoid)
     │         │
 Ŝ_{t+1}   P(attack)
  ∈ ℝ¹⁰    ∈ [0,1]
     │
     └──► feed back as input
          predict Ŝ_{t+2}
          predict Ŝ_{t+3}
              ...
          predict Ŝ_{t+K}
```

Each predicted future state is mapped to a **MITRE ATT&CK stage**. The model fires an alert at step T+2 — while the adversary is still in Reconnaissance — giving the SOC team a real window to act before Initial Access or Exfiltration.

**Two levels of input features** (as required by the problem statement):

| Level | Features |
|---|---|
| Flow-level (NetFlow/IPFIX) | TCP SYN/ACK/FIN/RST ratios, bytes per flow, packets per flow, flow duration, inter-arrival time (IAT) |
| Packet-level (PCAP-derived) | TTL variance across session, TCP window size |

**Training loss** combines dynamics learning and risk prediction:
```
L = MSE(predicted next state, actual next state) + BCE(predicted risk, actual label)
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, Vite |
| Visualisation | Custom SVG (no chart library — zero dependencies) |
| Deep Learning | PyTorch — 2-layer LSTM, Adam optimiser |
| Python UI | Streamlit |
| Baseline Model | Scikit-Learn Logistic Regression |
| Explainability | Gradient saliency (SHAP approximation) |
| Icons | Lucide React |

---

## 📡 Data Sources & Datasets

| Dataset | Used For |
|---|---|
| **CIC-IDS-2017 / 2018** (Canadian Institute for Cybersecurity) | Benchmark training; SYN Flood built-in sample |
| **CTU-13** (Czech Technical University) | Botnet traffic reference |
| **Mirai Botnet** (built-in sample) | IoT Telnet brute-force scenario |
| **Synthetic Trajectories** | 140 generated sequences using Beta + Log-Normal distributions calibrated to real attack timing |
| **Your own PCAP / CSV** | Drag-and-drop upload — parser handles Wireshark, CICFlowMeter, UNSW-NB15 column formats |

No API keys. No cloud. Everything runs on `localhost`.

---

## ⚙️ How to Run Locally

### React Demo (browser, instant)

```bash
npm install
npm run dev
# open http://localhost:3000
```

### Python + Streamlit (real PyTorch training)

```bash
pip install torch numpy pandas scikit-learn plotly streamlit
streamlit run sih_prototype.py
# open http://localhost:8501
```

That's it — no `.env` file, no API keys, no internet connection required.

---

## 📊 Results

| Metric | Logistic Regression (Baseline) | World Model (Ours) | Improvement |
|---|---|---|---|
| F1-Score | 74.0% | **95.5%** | +21.5% |
| Precision | 76.4% | **94.2%** | +17.8% |
| Recall | 71.8% | **96.8%** | +25.0% |
| False Positive Rate | 14.8% | **3.1%** | −11.7% |
| Warning Lead Time | 0 (fires after breach) | **4–8 steps ahead** | Reactive → Proactive |

The false positive drop alone — from 14.8% to 3.1% — means the difference between thousands of noise alerts per day and an actionable, trustworthy alarm.

---

## 🖼️ Screenshots

> Run `npm run dev`, open `localhost:3000`, screenshot each panel, and save to `public/screenshots/`.

### Panel A — Training & Data Upload

![Panel A – Training & Upload](public/screenshots/panel-a-training.png)

Choose a scenario (Multi-Stage APT, SYN Flood, C2 Beacon, Exfiltration, Benign), configure epochs and forecast horizon K, upload your own PCAP/CSV or load a sample dataset, and start training. A live progress bar and post-training results modal give instant feedback.

---

### Panel B — Forecast Timeline

![Panel B – Forecast Timeline](public/screenshots/panel-b-forecast.png)

The solid line is observed history. The dashed red line is the model's K-step autoregressive rollout into the future. Background colour changes per MITRE ATT&CK stage. The alert fires at T+2 — the adversary is still in Reconnaissance, and the SOC team has time to act. The SOC countermeasures playbook appears below the chart.

---

### Panel C — Explainability & MITRE ATT&CK

![Panel C – Explainability](public/screenshots/panel-c-explainability.png)

SHAP-style attribution bars show exactly which features drove the prediction (SYN ratio 28%, IAT 22%, TTL variance 16%, ...). Below that, each MITRE ATT&CK stage card shows the Tactic ID, Technique ID, observable indicators, and specific defensive action — not a black box, a full intelligence brief.

---

### Benchmark — World Model vs Baseline

![Benchmark Panel](public/screenshots/benchmark.png)

Side-by-side comparison of the World Model against the Logistic Regression baseline trained on identical data. Every metric is shown with absolute values and deltas.

---


## 🧩 Problems We Faced

**1. Static classifiers have no temporal memory**
Every existing benchmark trains a per-flow classifier. We had to design a dataset format that preserves ordering and sequences flows as time-series trajectories for the LSTM — this required writing a custom synthetic data generator with statistically calibrated Beta/Log-Normal distributions per attack stage.

**2. PCAP parsing without external libraries (browser)**
The browser can't run Scapy or PyShark. We hand-wrote a binary PCAP parser in TypeScript that validates the libpcap magic bytes, walks packet records, and extracts IP/TCP header fields — all in pure JS ArrayBuffer operations.

**3. Making the forecast visually legible**
Off-the-shelf charting libraries (Recharts, Chart.js) didn't give us the control we needed to show stage-coloured background bands, a "now" boundary, dual polylines, and threshold fill zones simultaneously. We built the entire chart as a custom SVG with computed coordinates — zero charting dependency.

**4. Generalising to real uploaded files**
Real-world CSVs from Wireshark, CICFlowMeter, and academic datasets all use different column names for the same features. We built a fuzzy alias matching system that maps 30+ known column name variants to the 10 canonical feature names, so any standard flow export works without preprocessing.

---

## 📚 References

- Ha, D. & Schmidhuber, J. — [World Models (2018)](https://arxiv.org/abs/1803.10122)
- [MITRE ATT&CK Enterprise Framework](https://attack.mitre.org)
- [CIC-IDS-2017/2018 Datasets — University of New Brunswick](https://www.unb.ca/cic/datasets/)
- [CTU-13 Botnet Dataset — Czech Technical University](https://www.stratosphereips.org/datasets-ctu13)
- Lundberg & Lee — [SHAP: A Unified Approach to Interpreting Model Predictions (2017)](https://arxiv.org/abs/1705.07874)

---

<div align="center">

*Built for Smart India Hackathon 2026 · Problem ID 26153 · NTRO*

**"The kill-chain has 6 stages. We flag it at stage 2."**

</div>
