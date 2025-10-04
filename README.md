# Exoplanet AI Predictor with Claude Integration

A Next.js application that uses Claude AI to predict exoplanet dispositions based on Kepler Object of Interest (KOI) data.

## Features

- **Claude AI Integration**: Uses AWS Bedrock and Claude AI for intelligent exoplanet analysis
- **Manual Input**: Single exoplanet prediction with detailed form
- **Batch Processing**: CSV upload for multiple predictions
- **Beautiful UI**: Modern dark theme with responsive design
- **Real-time Analysis**: Live prediction results with confidence scores and reasoning

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env.local
```

### 2. AWS Bedrock Setup

1. **Create AWS Account**: If you don't have one already
2. **Enable Bedrock Access**: 
   - Go to AWS Bedrock console
   - Request access to Claude models (Claude 3.5 Sonnet recommended)
   - Wait for approval (usually instant for Claude 3.5 Sonnet)
3. **Create IAM User**:
   - Create IAM user with Bedrock permissions
   - Attach policy: `AmazonBedrockFullAccess`
   - Generate access keys

### 3. Configure Environment Variables

Update `.env.local` with your AWS credentials:

```env
NEXT_AWS_REGION=us-east-1
NEXT_AWS_ACCESS_KEY_ID=your_actual_access_key_id
NEXT_AWS_SECRET_ACCESS_KEY=your_actual_secret_access_key
```

### 4. Install Dependencies

```bash
npm install
# or
yarn install
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Manual Prediction

1. Navigate to the "Parameter Input" tab
2. Fill in the exoplanet and stellar parameters
3. Click "Analyze with Claude AI"
4. View the detailed prediction with confidence score and reasoning

### Batch Processing

1. Navigate to the "Batch Upload" tab
2. Upload a CSV file with the required columns
3. Preview the data to ensure correct format
4. Click "Analyze with Claude AI" to process all rows
5. Download the results with predictions and reasoning

### Required CSV Columns

- `koi_score`: Confidence score for detection
- `koi_period`: Orbital period in days
- `koi_time0bk`: Transit epoch (BJD)
- `koi_impact`: Impact parameter
- `koi_duration`: Transit duration in hours
- `koi_depth`: Transit depth in ppm
- `koi_prad`: Planet radius in Earth radii
- `koi_teq`: Equilibrium temperature in Kelvin
- `koi_insol`: Insolation in Earth flux
- `koi_steff`: Stellar effective temperature in Kelvin
- `koi_slogg`: Stellar surface gravity log10(cm/s²)
- `koi_srad`: Stellar radius in Solar radii

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety and better development experience
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Beautiful and accessible UI components
- **AWS Bedrock**: Claude AI integration
- **Lucide React**: Beautiful icons

## Claude AI Integration

The application uses Claude 3.5 Sonnet via AWS Bedrock to analyze exoplanet data. Claude provides:

- **Intelligent Analysis**: Contextual understanding of astronomical parameters
- **Confidence Scoring**: Probability-based predictions with detailed reasoning
- **Disposition Classification**: CONFIRMED, CANDIDATE, or FALSE POSITIVE
- **Expert-level Reasoning**: Explanations based on astrophysical principles

## API Endpoints

- `POST /api/claude-predict`: Claude AI prediction endpoint

## Troubleshooting

### AWS Bedrock Access Issues
- Ensure you have requested access to Claude models in AWS Bedrock
- Check your AWS region is supported (us-east-1 recommended)
- Verify IAM permissions include Bedrock access

### API Errors
- Check environment variables are correctly set in `.env.local`
- Ensure AWS credentials have proper permissions
- Verify network connectivity to AWS services

### CSV Upload Issues
- Ensure all required columns are present
- Check data format matches expected numeric types
- Verify file encoding is UTF-8
