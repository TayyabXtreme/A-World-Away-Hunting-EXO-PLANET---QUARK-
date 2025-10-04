'use client';

import React from 'react';
import DatasetVisualizer from '@/components/dataset/DatasetVisualizer';

export default function DataSetVisualizePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900">
      <DatasetVisualizer />
    </div>
  );
}