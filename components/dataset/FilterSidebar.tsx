'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TelescopeFilter } from '@/lib/dataset-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Telescope, 
  Globe, 
  Satellite, 
  Eye, 
  X,
  Filter,
  Star,
  Calendar,
  Target
} from 'lucide-react';

interface FilterSidebarProps {
  currentFilter: TelescopeFilter;
  planetCounts: Record<TelescopeFilter, number>;
  onFilterChange: (filter: TelescopeFilter) => void;
  onClose: () => void;
}

const telescopeInfo = {
  K2: {
    icon: <Satellite className="h-5 w-5" />,
    name: 'K2 Mission',
    description: 'Extended Kepler mission observing different fields',
    color: 'bg-blue-500',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-300',
    years: '2014-2018',
    primaryGoal: 'Continued exoplanet search'
  },
  Kepler: {
    icon: <Telescope className="h-5 w-5" />,
    name: 'Kepler Space Telescope',
    description: 'Original mission focused on habitable zone planets',
    color: 'bg-green-500',
    borderColor: 'border-green-400',
    textColor: 'text-green-300',
    years: '2009-2013',
    primaryGoal: 'Earth-like planet detection'
  },
  TESS: {
    icon: <Eye className="h-5 w-5" />,
    name: 'TESS Mission',
    description: 'All-sky survey for nearby exoplanets',
    color: 'bg-red-500',
    borderColor: 'border-red-400',
    textColor: 'text-red-300',
    years: '2018-Present',
    primaryGoal: 'Nearby star systems'
  }
};

export default function FilterSidebar({ 
  currentFilter, 
  planetCounts, 
  onFilterChange, 
  onClose 
}: FilterSidebarProps) {
  return (
    <motion.div
      initial={{ x: -400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -400, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute left-0 top-16 bottom-0 w-80 z-30 bg-black/40 backdrop-blur-xl border-r border-gray-700/50"
    >
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-400/30">
                <Filter className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Telescope Filters</h2>
                <p className="text-sm text-gray-400">Select mission data to view</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800/60 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* All Telescopes Filter */}
          <Card className={`cursor-pointer transition-all duration-200 ${
            currentFilter === 'All' 
              ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-400/50 shadow-lg shadow-purple-500/20' 
              : 'bg-gray-800/30 border-gray-700/30 hover:bg-gray-700/40'
          }`}>
            <CardContent 
              className="p-4"
              onClick={() => onFilterChange('All')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
                    <Globe className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">All Missions</h3>
                    <p className="text-xs text-gray-400">Combined dataset view</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                  {planetCounts.All.toLocaleString()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Separator className="bg-gray-700/50" />

          {/* Individual Telescope Filters */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Individual Missions
            </h3>
            
            {(Object.keys(telescopeInfo) as Array<keyof typeof telescopeInfo>).map((telescope) => {
              const info = telescopeInfo[telescope];
              const isSelected = currentFilter === telescope;
              
              return (
                <Card 
                  key={telescope}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? `bg-gradient-to-br from-${telescope === 'K2' ? 'blue' : telescope === 'Kepler' ? 'green' : 'red'}-500/20 to-${telescope === 'K2' ? 'blue' : telescope === 'Kepler' ? 'green' : 'red'}-600/20 ${info.borderColor}/50 shadow-lg` 
                      : 'bg-gray-800/30 border-gray-700/30 hover:bg-gray-700/40'
                  }`}
                  onClick={() => onFilterChange(telescope)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-gradient-to-br from-${telescope === 'K2' ? 'blue' : telescope === 'Kepler' ? 'green' : 'red'}-500/20 to-${telescope === 'K2' ? 'blue' : telescope === 'Kepler' ? 'green' : 'red'}-600/20 rounded-lg border ${info.borderColor}/30`}>
                          {info.icon}
                        </div>
                        <div>
                          <CardTitle className="text-white text-base">{info.name}</CardTitle>
                          <p className="text-xs text-gray-400 mt-1">{info.description}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`${info.color}/20 ${info.textColor} ${info.borderColor}/30`}
                      >
                        {planetCounts[telescope].toLocaleString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-300">{info.years}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-300">{info.primaryGoal}</span>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-gray-400 pt-2 border-t border-gray-700/50"
                      >
                        Now viewing {planetCounts[telescope].toLocaleString()} planets from the {info.name}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Legend */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-300">Visualization Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300">Cool planets (&lt;300K)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Temperate (300-600K)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-300">Warm (600-1000K)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-gray-300">Hot (1000-1500K)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                  <span className="text-gray-300">Very hot (&gt;1500K)</span>
                </div>
              </div>
              
              <Separator className="bg-gray-700/50" />
              
              <div className="text-xs text-gray-400">
                <p>• Planet size represents radius</p>
                <p>• Click planets for details</p>
                <p>• Use mouse to navigate 3D space</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}