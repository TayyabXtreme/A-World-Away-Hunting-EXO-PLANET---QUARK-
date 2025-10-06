# 🌌 ExoQuark - AI-Powered Exoplanet Classification System

<div align="center">

![ExoQuark Banner](https://img.shields.io/badge/ExoQuark-Exoplanet%20Hunter-blueviolet?style=for-the-badge)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Live Demo](https://img.shields.io/badge/Live-exoquark.vercel.app-00C7B7?style=for-the-badge&logo=vercel)](https://exoquark.vercel.app)

**A World Away: Hunting Exoplanets with AI**

*NASA Space Apps Challenge 2025 - Hyderabad, Pakistan*

[Live Demo](https://exoquark.vercel.app) • [Presentation](https://docs.google.com/presentation/d/1ivUFFT94jl8inqFNnVOXdlu4mQIUbSSC/edit?usp=sharing&ouid=118208340032333936540&rtpof=true&sd=true) • [GitHub Repository](https://github.com/TayyabXtreme/A-World-Away-Hunting-EXO-PLANET---QUARK-)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [The Challenge](#-the-challenge)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [NASA Datasets](#-nasa-datasets)
- [AI Integration](#-ai-integration)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Team](#-team)
- [Acknowledgments](#-acknowledgments)
- [License & Disclaimer](#-license--disclaimer)

---

## 🌟 Overview

**ExoQuark** is a production-ready exoplanet classification system developed for the NASA Space Apps Challenge. Our platform transforms NASA's extensive catalog data from three major space telescopes (Kepler, K2, and TESS) into actionable, explainable predictions that accelerate the discovery and validation of exoplanets.

The system combines state-of-the-art machine learning models with an immersive 3D visualization interface, making exoplanet research accessible to both professional astronomers and citizen scientists.

### 🎯 Key Objectives

- **Automate Candidate Triage**: Speed up the process of identifying promising exoplanet candidates
- **Mission-Specific Models**: Train specialized models for each telescope mission (Kepler, K2, TESS)
- **Reproducible Science**: Provide fully serialized preprocessing artifacts and model parameters
- **Interactive Visualization**: Enable real-time exploration of exoplanet datasets in 3D space
- **AI-Assisted Analysis**: Integrate Claude AI for contextual explanations and insights

---

## 🚀 The Challenge

**NASA Space Apps Challenge**: *Hunting for Exoplanets*

The task requires building a reliable system to triage and classify exoplanet candidates across different space telescope missions. Each mission has unique characteristics, observation methods, and data structures, making it challenging to create a unified yet mission-aware classification system.

### Problem Statement

- **Data Complexity**: Multiple datasets with different features and classification schemes
- **Class Imbalance**: Rare confirmed exoplanets vs. abundant false positives
- **Mission Specificity**: Each telescope requires tailored preprocessing and modeling
- **Accessibility**: Making advanced AI tools available to non-experts

### Our Solution

ExoQuark addresses these challenges through:

1. **Mission-Aware Models**: Separate XGBoost/LightGBM models trained on mission-specific features
2. **Unified Interface**: Single platform to explore all three datasets with consistent UX
3. **Real-Time Predictions**: API endpoints for instant classification of new candidates
4. **3D Visualization**: Interactive Three.js-powered exploration of planetary systems
5. **AI Explanations**: Claude integration for human-readable insights

---

## ✨ Features

### 🔭 Multi-Mission Support

- **Kepler Mission**: Classification of KOI (Kepler Objects of Interest) with `koi_pdisposition`
- **K2 Mission**: Analysis of K2 candidates with `archive_disposition`
- **TESS Mission**: TOI (TESS Objects of Interest) classification with `tfopwg_disp`

### 🎨 Interactive 3D Visualization

- Real-time rendering of exoplanetary systems using Three.js and React Three Fiber
- Realistic planet textures and orbital mechanics
- Zoom, rotate, and explore thousands of candidates
- Dynamic filtering by telescope, stellar parameters, and planetary characteristics

### 📊 Dataset Explorer

- **Comprehensive Filtering**: Period, radius, insolation flux, stellar magnitude, and more
- **Cross-Mission Comparison**: View distribution patterns across all three datasets
- **Statistical Analysis**: Interactive charts showing class balances and key metrics
- **Search Functionality**: Find specific candidates by name or host star

### 🤖 AI-Powered Predictions

- **Real-Time Classification**: Edit candidate parameters and get instant predictions
- **Probability Scores**: Per-class confidence levels for informed decision-making
- **Feature Importance**: Understand which parameters drive classification
- **Claude AI Integration**: Natural language explanations via AWS Bedrock

### 🛠️ Analysis Panel

- **Parameter Editor**: Modify orbital period, radius, temperature, transit depth, and more
- **CSV Upload**: Batch analyze multiple candidates
- **Single-Row Testing**: Quick validation of individual systems
- **Export Results**: Download predictions for further analysis

---

## 🛠️ Technology Stack

### Frontend

```json
{
  "framework": "Next.js 15.5.4",
  "language": "TypeScript 5.0",
  "styling": "Tailwind CSS 4.0",
  "3D Graphics": "Three.js + React Three Fiber",
  "UI Components": "Radix UI + shadcn/ui",
  "Animation": "Framer Motion",
  "Charts": "Recharts",
  "State Management": "React Hooks"
}
```

### Backend & AI

```json
{
  "API Framework": "Next.js API Routes",
  "AI Provider": "AWS Bedrock (Claude)",
  "HTTP Client": "Axios",
  "Form Validation": "Zod + React Hook Form"
}
```

### Machine Learning Stack (Python Backend)

```json
{
  "Models": "XGBoost (Kepler/K2), LightGBM (TESS)",
  "API Server": "Flask",
  "Preprocessing": "scikit-learn (StandardScaler, SimpleImputer)",
  "Training Platform": "Kaggle (GPU-accelerated)",
  "Model Serialization": "Pickle/Joblib",
  "ML Libraries": "pandas, numpy, scikit-learn"
}
```

### AI Integration

```json
{
  "AI Provider": "AWS Bedrock",
  "Model": "Anthropic Claude 3.5 Sonnet",
  "Use Cases": [
    "Natural Language Explanations",
    "Parameter Insights",
    "Educational Context",
    "Real-time Analysis"
  ],
  "Integration": "Next.js API Routes + AWS SDK"
}
```

### Deployment

```json
{
  "Frontend": "Vercel (Next.js)",
  "ML Backend": "Render (Flask API)",
  "AI Service": "AWS Bedrock",
  "CI/CD": "GitHub Actions",
  "Version Control": "Git/GitHub"
}
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Landing    │  │  3D Dataset  │  │  Mission Pages   │   │
│  │  Page       │  │  Visualizer  │  │  (K/K2/TESS)     │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js API Routes                         │
│  /api/predict-kepler  /api/predict-k2  /api/predict-tess    │
└──────────────────────────┬──────────────────────────────────┘
                           │
           ┌───────────────┴────────────────┐
           ▼                                ▼
┌──────────────────────┐         ┌─────────────────────┐
│  ML Models (Flask)   │         │  AWS Bedrock        │
│  Deployed on Render  │         │  (Claude 3.5)       │
│  - XGBoost (Kepler)  │         │  - Explanations     │
│  - XGBoost (K2)      │         │  - Insights         │
│  - LightGBM (TESS)   │         │  - Real-time AI     │
└──────────────────────┘         └─────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│                    NASA Open Datasets                         │
│  Kepler KOI  |  K2 Candidates  |  TESS TOI                   │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Data Ingestion**: NASA datasets loaded from JSON files
2. **Preprocessing**: Median imputation, standard scaling, feature engineering
3. **Model Training**: Mission-specific models with class balancing and threshold tuning
4. **API Serving**: Flask endpoints expose `/features/<sat>` and `/predict/<sat>`
5. **Frontend Integration**: Next.js API routes call ML backend and Claude AI
6. **User Interaction**: 3D visualization, parameter editing, real-time predictions
7. **Result Presentation**: Probability scores + AI-generated explanations

---

## 🛰️ NASA Datasets

ExoQuark utilizes three official NASA exoplanet catalogs:

### 1. Kepler Mission

- **Source**: [NASA Exoplanet Archive - Kepler Cumulative KOI Table](https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=cumulative)
- **Total Candidates**: ~10,000+ Kepler Objects of Interest
- **Key Features**: Orbital period, planet radius, transit depth, stellar parameters
- **Classification**: `koi_pdisposition` (CANDIDATE, FALSE POSITIVE, CONFIRMED)
- **Mission Duration**: 2009-2018

### 2. K2 Mission

- **Source**: [NASA Exoplanet Archive - K2 Candidates & Planets Table](https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=k2pandc)
- **Total Candidates**: ~1,000+ K2 planet candidates
- **Key Features**: Similar to Kepler with extended field observations
- **Classification**: `archive_disposition` (PC, FP, CP)
- **Mission Duration**: 2014-2018 (extended Kepler mission)

### 3. TESS Mission

- **Source**: [NASA Exoplanet Archive - TESS TOI Table](https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=TOI)
- **Total Candidates**: ~6,000+ TESS Objects of Interest
- **Key Features**: All-sky survey data, shorter orbital periods
- **Classification**: `tfopwg_disp` (APC, FP, CP, KP)
- **Mission Duration**: 2018-present (ongoing)

### Data Processing Pipeline

```python
# Preprocessing Steps
1. Load raw NASA JSON catalogs
2. Handle missing values (median imputation)
3. Feature engineering:
   - Log transforms (period, radius)
   - Depth/duration ratio
   - Missingness indicators
4. Standard scaling
5. Class balancing (upsampling, class weights)
6. Per-class threshold calibration
7. Serialize artifacts (scaler, imputer, feature list)
```

---

## 🤖 AI Integration

### Machine Learning Models

ExoQuark employs **mission-specific gradient boosting models** trained on NASA datasets:

#### Model Architecture
- **Kepler**: XGBoost classifier (14 features)
- **K2**: XGBoost classifier (16 features)
- **TESS**: LightGBM classifier (13 features)

#### Training Process
1. **Data Preparation**: Feature engineering, missing value imputation, standard scaling
2. **Model Training**: Hyperparameter tuning with cross-validation on Kaggle (GPU)
3. **Class Balancing**: SMOTE oversampling + class weight adjustment
4. **Threshold Calibration**: Per-class probability thresholds for optimal F1 scores
5. **Serialization**: Models saved as `.pkl` files with preprocessing artifacts

#### Deployment
- **Backend**: Flask API serving predictions
- **Hosting**: Render (cloud deployment for ML backend)
- **Endpoint**: `https://ml-backend-1zgp.onrender.com/predict/{mission}`
- **Format**: JSON requests with planetary features → JSON responses with probabilities

### Claude AI via AWS Bedrock

ExoQuark integrates **Anthropic's Claude 3.5 Sonnet** through **AWS Bedrock** for:

#### 1. **Natural Language Explanations**
After ML model predictions, Claude provides:
- Human-readable interpretation of classification results
- Feature importance explanations
- Physical context about planetary characteristics
- Suggested follow-up observations for astronomers

#### 2. **Real-time Parameter Insights**
Interactive guidance when users modify candidate parameters:
- Alerts for unrealistic value combinations
- Educational context about exoplanet physics
- Comparisons with known confirmed exoplanets
- Habitability assessments

#### 3. **Integration Architecture**
```javascript
// Next.js API Route → AWS Bedrock
const claudeResponse = await bedrock.invokeModel({
  modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
  body: JSON.stringify({
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1500,
    temperature: 0.7
  })
});
```

#### 4. **Use Cases**
- **Landing Page Chatbot**: AI-powered Q&A about exoplanets (Gemini integration)
- **Analysis Panels**: Real-time explanations for ML predictions
- **Mission Pages**: Contextual insights for candidate characteristics

### AI Transparency

> ⚠️ **AI Disclosure**: 
> - **Machine Learning Models**: Trained by Team ExoQuark using XGBoost/LightGBM on NASA datasets
> - **Claude AI**: Used for natural language explanations and educational context
> - **Design Assistance**: Landing page layout and content created with AI assistance (Claude/GPT)
> - **Mission Pages**: Kepler, K2, TESS visualizers and analysis panels developed manually by our team

---

## 📦 Installation

### Prerequisites

```bash
# Required Software
- Node.js 20+ (with npm or yarn)
- Python 3.9+ (for ML backend - optional)
- Git
```

### Clone Repository

```bash
git clone https://github.com/TayyabXtreme/A-World-Away-Hunting-EXO-PLANET---QUARK-.git
cd A-World-Away-Hunting-EXO-PLANET---QUARK-
```

### Frontend Setup

```bash
# Install dependencies
npm install
# or
yarn install

# Run development server
npm run dev
# or
yarn dev

# Build for production
npm run build
npm start
```

The application will be available at `http://localhost:3000`

### Environment Variables (Optional)

Create a `.env.local` file for AWS Bedrock integration:

```env
# AWS Credentials for Claude AI
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

> **Note**: AWS credentials can also be provided via the in-app dialog during prediction

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 💻 Usage

### 1. **Landing Page** (`/`)

- Overview of the ExoQuark project
- Team information and challenge description
- Links to datasets and documentation
- Quick navigation to mission pages

### 2. **Dataset Visualizer** (`/dataSetVisualize`)

**Interactive 3D Exploration**
- Rotate, zoom, and navigate through planetary systems
- Filter by telescope (All, Kepler, K2, TESS)
- Search by planet or host star name
- Click planets for detailed information

**Filtering Options**
- Orbital period range
- Planet radius range
- Insolation flux
- Stellar magnitude
- Transit depth
- Number of planets per system

### 3. **Mission-Specific Pages**

#### Kepler Page (`/kepler`)
- Browse Kepler KOI catalog
- View candidate details
- Edit parameters and predict
- Analyze orbital characteristics

#### K2 Page (`/k2`)
- Explore K2 mission candidates
- Interactive 3D planetary systems
- Real-time classification
- Parameter sensitivity analysis

#### TESS Page (`/tess`)
- Access TESS TOI database
- Short-period exoplanet focus
- Live prediction API
- Statistical distributions

### 4. **Making Predictions**

**Option A: Edit Existing Candidate**
1. Select a planet from the table
2. Click "Edit Parameters"
3. Adjust values (orbital period, radius, etc.)
4. Click "Analyze with AI"
5. View probability and AI explanation

**Option B: Upload CSV**
1. Prepare single-row CSV with required features
2. Upload via analysis panel
3. Receive batch predictions
4. Export results

**Option C: API Integration**
```javascript
// Example API call
const response = await fetch('/api/predict-kepler', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    features: {
      koi_period: 10.5,
      koi_prad: 2.3,
      koi_depth: 500,
      // ... other features
    },
    aws_credentials: {
      aws_region: 'us-east-1',
      aws_access_key_id: 'YOUR_KEY',
      aws_secret_access_key: 'YOUR_SECRET'
    }
  })
});

const result = await response.json();
// {
//   prediction: "CANDIDATE",
//   probability: 0.87,
//   planet_type: "Super-Earth",
//   explanation: "High probability due to..."
// }
```

---

## 🌐 API Endpoints

### Next.js API Routes

#### 1. Check Environment
```
GET /api/check-env
```
Verifies AWS credentials are configured

#### 2. Predict Kepler
```
POST /api/predict-kepler
Content-Type: application/json

{
  "features": { ... },
  "aws_credentials": { ... }
}
```

#### 3. Predict K2
```
POST /api/predict-k2
Content-Type: application/json

{
  "features": { ... },
  "aws_credentials": { ... }
}
```

#### 4. Predict TESS
```
POST /api/predict-tess
Content-Type: application/json

{
  "features": { ... },
  "aws_credentials": { ... }
}
```

### Response Format

```json
{
  "success": true,
  "prediction": "CANDIDATE",
  "probability": 0.87,
  "planet_type": "Super-Earth",
  "is_exoplanet": true,
  "confidence_scores": {
    "CANDIDATE": 0.87,
    "FALSE POSITIVE": 0.10,
    "CONFIRMED": 0.03
  },
  "explanation": "This candidate exhibits characteristics typical of a Super-Earth exoplanet. The moderate orbital period (10.5 days) combined with a planet radius of 2.3 Earth radii suggests a potentially rocky composition with a substantial atmosphere. The transit depth of 500 ppm indicates a detectable signal, and the stellar parameters are favorable for follow-up observations. Recommended actions include radial velocity measurements to confirm planetary nature and atmospheric spectroscopy to characterize composition.",
  "features_used": {
    "koi_period": 10.5,
    "koi_prad": 2.3,
    "koi_depth": 500
    // ... other features
  }
}
```

---

## 👥 Team

**Team ExoQuark** - NASA Space Apps Challenge 2025, Hyderabad, Pakistan

| Name | Role | GitHub |
|------|------|--------|
| **Muhammad Tayyab** | Full-Stack Developer, DevOps  | [@TayyabXtreme](https://github.com/TayyabXtreme) |
| **Munib Ur Rehman Memon** | TeamLead, Machine Learning Engineer, Backend Developer | [@MunibUrRehmanMemon](https://github.com/MunibUrRehmanMemon) |
| **Abrar Hussain** | Frontend Developer| - |
| **Hassan** | Data Scientist|
| **Tauha** | API Integration, Testing | - |
| **Asadullah** |  Data Scientist | - |

### Contributions

- **Machine Learning**: Mission-specific model training (XGBoost, LightGBM), hyperparameter tuning, class balancing
- **Backend**: Flask API development, artifact serialization, AWS Bedrock integration
- **Frontend**: Next.js + TypeScript, Three.js visualizations, Radix UI components
- **Data Processing**: NASA dataset cleaning, feature engineering, unified schema design
- **Deployment**: Vercel hosting, CI/CD pipeline, environment configuration

---

## 🙏 Acknowledgments

### NASA & Data Sources

- **NASA Exoplanet Archive** for providing open-access datasets
- **Kepler, K2, and TESS Missions** for groundbreaking exoplanet discoveries
- **NASA Space Apps Challenge** for organizing this global hackathon

### Technologies & Libraries

- **Next.js** - React framework by Vercel
- **Three.js** - 3D graphics library
- **XGBoost & LightGBM** - Gradient boosting frameworks
- **AWS Bedrock** - Managed AI service
- **Anthropic Claude** - Large language model
- **shadcn/ui** - UI component library
- **Radix UI** - Accessible primitives

### Inspiration

- Scientific exoplanet research community
- Open-source ML and web development communities
- Citizen science initiatives like Planet Hunters

---

## 📄 License & Disclaimer

### License

This project is licensed under the **MIT License**. See `LICENSE` file for details.

### NASA Data Disclaimer

> **IMPORTANT**: NASA does not endorse non-U.S. Government entities and is not responsible for information on third-party sites. This project uses publicly available NASA datasets under their respective data-use policies. Users must comply with:
> 
> - [NASA Exoplanet Archive Data Policy](https://exoplanetarchive.ipac.caltech.edu/)
> - [Kepler Mission Data Rights](https://archive.stsci.edu/kepler/)
> - [TESS Mission Data Rights](https://archive.stsci.edu/tess/)
> 
> All dataset attributions and citations must be preserved when using ExoQuark outputs for research or publication.

### AI Usage Transparency

- **Landing Page**: Designed with AI assistance (layout, content suggestions)
- **Dataset Visualizer Page**: Structure created with AI assistance
- **Mission Pages (Kepler/K2/TESS)**: Manually developed by Team ExoQuark
- **Analysis Panels**: Custom-built without AI design assistance
- **Machine Learning Models**: Trained by team using open-source libraries

### Academic Use

If you use ExoQuark in academic research, please cite:

```bibtex
@software{exoquark2025,
  title={ExoQuark: AI-Powered Exoplanet Classification System},
  author={Team ExoQuark: Tayyab, Muhammad and Memon, Munib Ur Rehman and Hussain, Abrar and Hassan and Tauha and Asadullah},
  year={2024},
  url={https://github.com/TayyabXtreme/A-World-Away-Hunting-EXO-PLANET---QUARK-},
  note={NASA Space Apps Challenge 2025}
}
```

---

## 🔗 Links

- **Live Demo**: [exoquark.vercel.app](https://exoquark.vercel.app)
- **GitHub Repository**: [TayyabXtreme/A-World-Away-Hunting-EXO-PLANET---QUARK-](https://github.com/TayyabXtreme/A-World-Away-Hunting-EXO-PLANET---QUARK-)
- **Presentation**: [Google Slides](https://docs.google.com/presentation/d/1ivUFFT94jl8inqFNnVOXdlu4mQIUbSSC/edit?usp=sharing&ouid=118208340032333936540&rtpof=true&sd=true)
- **NASA Space Apps Challenge**: [spaceappschallenge.org](https://www.spaceappschallenge.org/)

---

## 📞 Contact

For questions, collaboration, or feedback:

- **Team Lead**: Muhammad Tayyab
- **Repository**: [GitHub Issues](https://github.com/TayyabXtreme/A-World-Away-Hunting-EXO-PLANET---QUARK-/issues)

---

<div align="center">

**🌌 Built with ❤️ by Team ExoQuark**

*Exploring the universe, one exoplanet at a time*

[![NASA Space Apps Challenge](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge-blue?style=for-the-badge&logo=nasa)](https://www.spaceappschallenge.org/)

</div>

