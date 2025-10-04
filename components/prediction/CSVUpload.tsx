import React, { useState, useRef, ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, Loader2, CheckCircle, AlertCircle, Brain } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useClaudePrediction } from "@/hooks/useClaudePrediction";

interface CSVUploadProps {
  onPredictions: (predictions: Array<{ row: number; prediction: string; data: any }>) => void;
}

interface UploadStatus {
  type: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message: string;
  details?: string;
}

export default function CSVUpload({ onPredictions }: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>({ type: 'idle', message: '' });
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loading, error, predictBatch } = useClaudePrediction();

  const requiredColumns = [
    'koi_score', 'koi_period', 'koi_time0bk', 'koi_impact', 'koi_duration',
    'koi_depth', 'koi_prad', 'koi_teq', 'koi_insol', 'koi_steff', 'koi_slogg', 'koi_srad'
  ];

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setStatus({
        type: 'error',
        message: 'Invalid file type',
        details: 'Please select a CSV file'
      });
      return;
    }

    setFile(selectedFile);
    setStatus({ type: 'idle', message: '' });
    previewCSV(selectedFile);
  };

  const previewCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setStatus({
            type: 'error',
            message: 'Invalid CSV format',
            details: 'CSV must have at least a header row and one data row'
          });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          setStatus({
            type: 'error',
            message: 'Missing required columns',
            details: `Missing: ${missingColumns.join(', ')}`
          });
          return;
        }

        // Preview first 5 rows
        const preview = lines.slice(1, 6).map((line, index) => {
          const values = line.split(',');
          const row: any = { rowNumber: index + 1 };
          headers.forEach((header, i) => {
            row[header.trim()] = values[i]?.trim() || '';
          });
          return row;
        });

        setPreviewData(preview);
        setStatus({
          type: 'success',
          message: 'CSV file is valid',
          details: `Found ${lines.length - 1} rows with all required columns`
        });
      } catch (error) {
        setStatus({
          type: 'error',
          message: 'Error reading CSV file',
          details: 'Please check the file format and try again'
        });
      }
    };
    reader.readAsText(file);
  };

  const processCSV = async () => {
    if (!file) return;

    setStatus({ type: 'uploading', message: 'Reading CSV file...' });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        setStatus({ type: 'processing', message: 'Preparing data for Claude AI analysis...' });
        
        // Convert CSV rows to FormData objects
        const formDataArray: any[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          const rowData: any = {};
          
          headers.forEach((header, j) => {
            rowData[header.trim()] = values[j]?.trim() || '';
          });

          // Extract features for prediction
          const features: any = {};
          requiredColumns.forEach(col => {
            features[col] = rowData[col] || '';
          });

          formDataArray.push(features);
        }

        setStatus({ type: 'processing', message: 'Claude AI analyzing exoplanet data...' });
        
        // Use Claude for batch prediction
        const results = await predictBatch(formDataArray);
        
        if (results) {
          const predictions = results.map((result, index) => ({
            row: index + 1,
            prediction: result.disposition,
            data: {
              ...formDataArray[index],
              confidence: result.confidence,
              reasoning: result.reasoning,
            }
          }));

          onPredictions(predictions);
          setStatus({
            type: 'success',
            message: 'Claude AI analysis complete',
            details: `Successfully analyzed ${predictions.length} rows`
          });
        } else {
          throw new Error(error || 'Failed to get predictions from Claude AI');
        }
        
      } catch (err) {
        setStatus({
          type: 'error',
          message: 'Error processing CSV with Claude AI',
          details: err instanceof Error ? err.message : 'Please check the file format and try again'
        });
      }
    };
    reader.readAsText(file);
  };

  const downloadSampleCSV = () => {
    const headers = requiredColumns.join(',');
    const sampleRow = '0.5,365.25,2454833.0,0.2,3.5,100,1.0,288,1.0,5778,4.44,1.0';
    const csvContent = `${headers}\n${sampleRow}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exoplanet_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="relative bg-gray-900/80 border-gray-700/50 shadow-2xl backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />
        
        <CardHeader className="relative pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
              <Upload className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-white font-semibold">
                Batch Processing
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Upload CSV file for multiple exoplanet predictions using Claude AI
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Compact Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
              file
                ? 'border-emerald-400/50 bg-emerald-400/5'
                : 'border-gray-600/50 hover:border-gray-500 bg-gray-800/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {file ? (
              <div className="space-y-3">
                <FileText className="h-8 w-8 text-emerald-400 mx-auto" />
                <div>
                  <p className="font-medium text-white text-sm">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-gray-600/50 text-gray-300 hover:bg-gray-800/60 h-8 text-xs"
                >
                  Change File
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                <div>
                  <p className="font-medium text-white text-sm">Upload CSV File</p>
                  <p className="text-xs text-gray-400">Drag & drop or click to browse</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {/* Compact Status */}
          {status.message && (
            <Alert className={`${
              status.type === 'error' ? 'border-red-400/50 bg-red-400/5' :
              status.type === 'success' ? 'border-emerald-400/50 bg-emerald-400/5' :
              'border-blue-400/50 bg-blue-400/5'
            } py-2`}>
              <div className="flex items-center gap-2">
                {status.type === 'error' && <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                {status.type === 'success' && <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
                {(status.type === 'uploading' || status.type === 'processing') && (
                  <Loader2 className="h-4 w-4 text-blue-400 animate-spin flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <AlertDescription className="text-white text-sm">
                    <span className="font-medium">{status.message}</span>
                    {status.details && <div className="text-xs text-gray-300 mt-0.5">{status.details}</div>}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {/* Compact Preview */}
          {previewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Data Preview</h3>
                <Badge variant="outline" className="border-emerald-400/50 text-emerald-400 bg-emerald-400/10 text-xs">
                  {previewData.length} rows shown
                </Badge>
              </div>
              <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-1 px-2 text-gray-300 font-medium">Row</th>
                        {requiredColumns.slice(0, 3).map(col => (
                          <th key={col} className="text-left py-1 px-2 text-gray-300 font-medium">{col}</th>
                        ))}
                        <th className="text-left py-1 px-2 text-gray-400">+{requiredColumns.length - 3} more</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 3).map((row, index) => (
                        <tr key={index} className="border-b border-gray-700/50">
                          <td className="py-1 px-2 text-gray-400">{row.rowNumber}</td>
                          {requiredColumns.slice(0, 3).map(col => (
                            <td key={col} className="py-1 px-2 text-white">{row[col]}</td>
                          ))}
                          <td className="py-1 px-2 text-gray-500">...</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Compact Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-gray-700/50">
            <Button
              onClick={processCSV}
              disabled={!file || loading || status.type === 'processing' || status.type === 'uploading' || status.type === 'error'}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 
                text-white flex-1 h-11 font-medium shadow-lg transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || status.type === 'processing' || status.type === 'uploading' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {status.message || 'Claude AI Processing...'}
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze with Claude AI
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={downloadSampleCSV}
              className="border-gray-600/50 text-gray-300 hover:bg-gray-800/60 hover:border-gray-500 
                h-11 px-4 transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Sample
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}