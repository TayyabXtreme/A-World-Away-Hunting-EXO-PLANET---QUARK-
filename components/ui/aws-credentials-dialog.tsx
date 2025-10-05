"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Info
} from 'lucide-react';

interface AWSCredentials {
  aws_region: string;
  aws_access_key_id: string;
  aws_secret_access_key: string;
}

interface AWSCredentialsDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (credentials: AWSCredentials) => void;
  onSkip?: () => void;
  canSkip?: boolean;
  isLoading?: boolean;
}

export default function AWSCredentialsDialog({ 
  open, 
  onClose, 
  onSubmit,
  onSkip,
  canSkip = false,
  isLoading = false 
}: AWSCredentialsDialogProps) {
  const [credentials, setCredentials] = useState<AWSCredentials>({
    aws_region: 'us-east-1',
    aws_access_key_id: '',
    aws_secret_access_key: ''
  });
  
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateCredentials = (): boolean => {
    const errors: string[] = [];
    
    if (!credentials.aws_region.trim()) {
      errors.push('AWS Region is required');
    }
    
    if (!credentials.aws_access_key_id.trim()) {
      errors.push('AWS Access Key ID is required');
    } else if (credentials.aws_access_key_id.length < 16) {
      errors.push('AWS Access Key ID seems too short');
    }
    
    if (!credentials.aws_secret_access_key.trim()) {
      errors.push('AWS Secret Access Key is required');
    } else if (credentials.aws_secret_access_key.length < 32) {
      errors.push('AWS Secret Access Key seems too short');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = () => {
    if (validateCredentials()) {
      onSubmit(credentials);
      // Dialog will be closed by parent component after successful submission
    }
  };

  const handleInputChange = (field: keyof AWSCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const regions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-central-1',
    'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1'
  ];

  const handleClose = () => {
    onClose();
  };

  const handleSkip = () => {
    if (canSkip && onSkip) {
      onSkip();
    }
  };

  // Handle dialog close through onOpenChange
  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent 
        className="sm:max-w-md bg-gray-900 border border-gray-700 text-white"
        showCloseButton={true}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900 rounded-lg border border-blue-700">
              <Shield className="h-4 w-4 text-blue-300" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-white">
                AWS Credentials
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-sm">
                {canSkip ? 'Configure or skip to use environment variables' : 'Configure AWS Bedrock credentials'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info Alert */}
          {canSkip ? (
            <Alert className="border-blue-700 bg-blue-900/20">
              <Info className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200 text-sm">
                Environment variables are available. You can skip this or provide custom credentials.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-red-700 bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200 text-sm">
                AWS credentials required. Please provide your AWS access credentials.
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert className="border-red-700 bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200 text-sm">
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* AWS Region */}
          <div className="space-y-2">
            <Label htmlFor="aws-region" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <span className="text-blue-400">🌍</span>
              AWS Region
            </Label>
            <select
              id="aws-region"
              value={credentials.aws_region}
              onChange={(e) => handleInputChange('aws_region', e.target.value)}
              className="w-full h-9 px-3 bg-gray-800 border border-gray-600 rounded-md text-white text-sm
                focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none"
            >
              {regions.map(region => (
                <option key={region} value={region} className="bg-gray-800">
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* AWS Access Key ID */}
          <div className="space-y-2">
            <Label htmlFor="aws-access-key" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-400" />
              AWS Access Key ID
            </Label>
            <Input
              id="aws-access-key"
              type="text"
              placeholder="AKIA..."
              value={credentials.aws_access_key_id}
              onChange={(e) => handleInputChange('aws_access_key_id', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-500 h-9
                focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* AWS Secret Access Key */}
          <div className="space-y-2">
            <Label htmlFor="aws-secret-key" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              AWS Secret Access Key
            </Label>
            <div className="relative">
              <Input
                id="aws-secret-key"
                type={showSecretKey ? "text" : "password"}
                placeholder="Enter your secret access key..."
                value={credentials.aws_secret_access_key}
                onChange={(e) => handleInputChange('aws_secret_access_key', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-500 pr-10 h-9
                  focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 p-0 text-gray-400 hover:text-white"
              >
                {showSecretKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {canSkip && (
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isLoading}
              className="border-gray-600 bg-black text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Skip (Use Environment)
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !credentials.aws_access_key_id || !credentials.aws_secret_access_key}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Use Credentials
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}