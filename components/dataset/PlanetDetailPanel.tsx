'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UnifiedPlanet } from '@/lib/dataset-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Globe, 
  Thermometer, 
  Orbit, 
  Star, 
  MapPin, 
  Ruler,
  Sun,
  Calendar,
  Telescope
} from 'lucide-react';
import { getPlanetColor, getTelescopeStyle } from '@/lib/dataset-utils';

interface PlanetDetailPanelProps {
  planet: UnifiedPlanet;
  onClose: () => void;
}

export default function PlanetDetailPanel({ planet, onClose }: PlanetDetailPanelProps) {
  const telescopeStyle = getTelescopeStyle(planet.telescope);
  const planetColor = getPlanetColor(planet.temperature);

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const getDispositionBadge = () => {
    const disposition = planet.disposition.toLowerCase();
    if (disposition.includes('confirmed')) {
      return <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Confirmed</Badge>;
    } else if (disposition.includes('candidate')) {
      return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">Candidate</Badge>;
    } else if (disposition.includes('fp') || disposition.includes('false')) {
      return <Badge className="bg-red-500/20 text-red-300 border-red-400/30">False Positive</Badge>;
    } else {
      return <Badge variant="secondary">{planet.disposition}</Badge>;
    }
  };

  const getPlanetType = () => {
    const radius = planet.radius;
    if (radius < 1.25) return { type: 'Earth-like', description: 'Rocky planet similar to Earth' };
    if (radius < 2) return { type: 'Super-Earth', description: 'Rocky planet larger than Earth' };
    if (radius < 4) return { type: 'Sub-Neptune', description: 'Small gas planet' };
    if (radius < 8) return { type: 'Neptune-like', description: 'Medium gas planet' };
    return { type: 'Jupiter-like', description: 'Large gas giant' };
  };

  const getHabitabilityZone = () => {
    const temp = planet.temperature;
    if (temp >= 273 && temp <= 373) {
      return { zone: 'Habitable Zone', color: 'text-green-400', description: 'Liquid water may exist' };
    } else if (temp > 200 && temp < 273) {
      return { zone: 'Cold Zone', color: 'text-blue-400', description: 'Too cold for liquid water' };
    } else if (temp > 373 && temp < 600) {
      return { zone: 'Hot Zone', color: 'text-orange-400', description: 'Too hot for liquid water' };
    } else {
      return { zone: 'Extreme Zone', color: 'text-red-400', description: 'Extreme temperatures' };
    }
  };

  const planetType = getPlanetType();
  const habitability = getHabitabilityZone();

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute right-0 top-16 bottom-0 w-96 z-30 bg-black/40 backdrop-blur-xl border-l border-gray-700/50"
    >
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
        <Card className="h-full bg-transparent border-0 rounded-none">
          {/* Header */}
          <CardHeader className="relative pb-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-gradient-to-br from-${telescopeStyle.primaryColor.replace('#', '')}/20 to-${telescopeStyle.secondaryColor.replace('#', '')}/20 rounded-lg border border-gray-600/50`}>
                  <Globe className="h-5 w-5" style={{ color: telescopeStyle.primaryColor }} />
                </div>
                <div>
                  <CardTitle className="text-xl text-white font-bold">
                    {planet.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${telescopeStyle.primaryColor}20`,
                        color: telescopeStyle.primaryColor,
                        borderColor: `${telescopeStyle.primaryColor}50`
                      }}
                    >
                      {planet.telescope}
                    </Badge>
                    {getDispositionBadge()}
                  </div>
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

            {/* Planet visualization */}
            <div className="flex items-center justify-center mt-4">
              <div 
                className="w-16 h-16 rounded-full shadow-lg relative"
                style={{ 
                  backgroundColor: planetColor,
                  boxShadow: `0 0 30px ${planetColor}50`
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(planet.radius, 2)}
                  </div>
                  <div className="text-xs text-gray-400">Earth Radii</div>
                  <div className="text-xs text-blue-300 mt-1">{planetType.type}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700/50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(planet.temperature, 0)}K
                  </div>
                  <div className="text-xs text-gray-400">Temperature</div>
                  <div className={`text-xs mt-1 ${habitability.color}`}>{habitability.zone}</div>
                </CardContent>
              </Card>
            </div>

            {/* Orbital Properties */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                  <Orbit className="h-4 w-4" />
                  Orbital Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Period:
                  </span>
                  <span className="text-white font-medium">{formatNumber(planet.period, 2)} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Thermometer className="h-3 w-3" />
                    Equilibrium Temp:
                  </span>
                  <span className="text-white font-medium">{formatNumber(planet.temperature, 0)} K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Sun className="h-3 w-3" />
                    Insolation:
                  </span>
                  <span className="text-white font-medium">{formatNumber(planet.insolation, 1)} S⊕</span>
                </div>
              </CardContent>
            </Card>

            {/* Physical Properties */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Physical Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Radius:</span>
                  <span className="text-white font-medium">{formatNumber(planet.radius, 2)} R⊕</span>
                </div>
                <div className="text-xs text-gray-500 bg-gray-900/50 p-2 rounded">
                  {planetType.description}
                </div>
                <div className="text-xs text-gray-500 bg-gray-900/50 p-2 rounded">
                  <span className={habitability.color}>{habitability.zone}:</span> {habitability.description}
                </div>
              </CardContent>
            </Card>

            {/* Stellar Properties */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Host Star
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {planet.hostname && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white font-medium">{planet.hostname}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Temperature:</span>
                  <span className="text-white font-medium">{formatNumber(planet.starTemp, 0)} K</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Radius:</span>
                  <span className="text-white font-medium">{formatNumber(planet.starRadius, 2)} R☉</span>
                </div>
                {planet.starMass && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Mass:</span>
                    <span className="text-white font-medium">{formatNumber(planet.starMass, 2)} M☉</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Position */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Position
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Right Ascension:</span>
                  <span className="text-white font-medium">{formatNumber(planet.ra, 4)}°</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Declination:</span>
                  <span className="text-white font-medium">{formatNumber(planet.dec, 4)}°</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Distance:</span>
                  <span className="text-white font-medium">{formatNumber(planet.distance, 1)} pc</span>
                </div>
              </CardContent>
            </Card>

            {/* Discovery Info */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-300 flex items-center gap-2">
                  <Telescope className="h-4 w-4" />
                  Discovery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Mission:</span>
                  <span className="text-white font-medium">{planet.telescope}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-white font-medium">{planet.disposition}</span>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}