"use client";

import React, { useMemo } from 'react';
import { Search, Filter, RotateCcw, Eye, EyeOff, Sun, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/state/store';

export function SidebarFilters() {
  const { state, actions, statistics, starSystems, filteredStarSystems } = useApp();
  const { filters, viewControls } = state;

  // Get unique discovery methods for dropdown
  const discoveryMethods = useMemo(() => {
    const methods = new Set<string>();
    starSystems.forEach(system => {
      system.planets.forEach(planet => {
        methods.add(planet.discovery_method);
      });
    });
    return Array.from(methods).sort();
  }, [starSystems]);

  // Get min/max values for sliders
  const ranges = useMemo(() => {
    const temperatures: number[] = [];
    const planetRadii: number[] = [];
    const orbitalPeriods: number[] = [];
    const discoveryYears: number[] = [];

    starSystems.forEach(system => {
      temperatures.push(system.star_properties.temperature_K);
      system.planets.forEach(planet => {
        planetRadii.push(planet.radius_earth);
        orbitalPeriods.push(planet.orbital_period_days);
        discoveryYears.push(planet.discovery_year);
      });
    });

    return {
      temperature: [Math.min(...temperatures), Math.max(...temperatures)],
      planetRadius: [Math.min(...planetRadii), Math.max(...planetRadii)],
      orbitalPeriod: [Math.min(...orbitalPeriods), Math.max(...orbitalPeriods)],
      discoveryYear: [Math.min(...discoveryYears), Math.max(...discoveryYears)],
    };
  }, [starSystems]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    actions.updateFilters({ search: e.target.value });
  };

  const handleTemperatureChange = (value: number[]) => {
    actions.updateFilters({ temperatureRange: [value[0], value[1]] });
  };

  const handlePlanetRadiusChange = (value: number[]) => {
    actions.updateFilters({ planetRadiusRange: [value[0], value[1]] });
  };

  const handleOrbitalPeriodChange = (value: number[]) => {
    actions.updateFilters({ orbitalPeriodRange: [value[0], value[1]] });
  };

  const handleDiscoveryYearChange = (value: number[]) => {
    actions.updateFilters({ discoveryYearRange: [value[0], value[1]] });
  };

  const handleDiscoveryMethodChange = (value: string) => {
    actions.updateFilters({ discoveryMethod: value });
  };

  const handleHabitableZoneToggle = (checked: boolean) => {
    actions.updateFilters({ habitableZoneOnly: checked });
  };

  const handleShowOrbitsToggle = (checked: boolean) => {
    actions.updateViewControls({ showOrbits: checked });
  };

  const handleScalePlanetSizesToggle = (checked: boolean) => {
    actions.updateViewControls({ scalePlanetSizes: checked });
  };

  const handleStarBrightnessChange = (value: number[]) => {
    actions.updateViewControls({ starBrightness: value[0] });
  };

  const handleStarSpacingChange = (value: number[]) => {
    actions.updateViewControls({ starSpacing: value[0] });
  };

  const handleMaxStarSystemsChange = (value: number[]) => {
    actions.updateFilters({ maxStarSystems: value[0], currentStarSystemIndex: 0 });
  };

  // Calculate total available systems for navigation
  const totalFilteredSystems = useMemo(() => {
    return starSystems.filter(system => {
      const temp = system.star_properties.temperature_K;
      if (temp < filters.temperatureRange[0] || temp > filters.temperatureRange[1]) {
        return false;
      }
      return system.planets.some(planet => {
        if (planet.radius_earth < filters.planetRadiusRange[0] || 
            planet.radius_earth > filters.planetRadiusRange[1]) {
          return false;
        }
        if (filters.habitableZoneOnly && !(planet.equilibrium_temp_K >= 200 && planet.equilibrium_temp_K <= 320)) {
          return false;
        }
        return true;
      });
    }).length;
  }, [starSystems, filters.temperatureRange, filters.planetRadiusRange, filters.habitableZoneOnly]);

  const currentBatch = Math.floor(filters.currentStarSystemIndex / filters.maxStarSystems) + 1;
  const totalBatches = Math.ceil(totalFilteredSystems / filters.maxStarSystems);

  return (
    <div className="w-80 h-full bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters & Controls
        </h2>
        
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-white/90">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <Input
              id="search"
              placeholder="Search star or planet..."
              value={filters.search}
              onChange={handleSearchChange}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>
      </div>

      {/* Star System Navigation */}
      <div className="p-6 border-b border-white/10 bg-white/5">
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <Star className="w-4 h-4" />
          Star System Navigation
        </h3>
        
        <div className="space-y-4">
          {/* Batch Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={actions.previousStarSystemBatch}
              disabled={filters.currentStarSystemIndex === 0}
              className="border-white/20 text-white hover:bg-white/10"
            >
              ← Previous
            </Button>
            <span className="text-white/70 text-sm">
              {currentBatch} / {totalBatches}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={actions.nextStarSystemBatch}
              disabled={filters.currentStarSystemIndex + filters.maxStarSystems >= totalFilteredSystems}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Next →
            </Button>
          </div>

          {/* Max Systems Slider */}
          <div className="space-y-2">
            <Label className="text-white/90">
              Systems Shown: {filters.maxStarSystems}
            </Label>
            <Slider
              value={[filters.maxStarSystems]}
              onValueChange={handleMaxStarSystemsChange}
              min={3}
              max={10}
              step={1}
              className="w-full"
            />
          </div>

          {/* Star Spacing Slider */}
          <div className="space-y-2">
            <Label className="text-white/90">
              Star Spacing: {viewControls.starSpacing}
            </Label>
            <Slider
              value={[viewControls.starSpacing]}
              onValueChange={handleStarSpacingChange}
              min={20}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Filters Section */}
        <Card className="p-4 bg-white/5 border-white/10">
          <h3 className="text-white font-medium mb-4">Filters</h3>
          
          {/* Star Temperature */}
          <div className="space-y-3 mb-4">
            <Label className="text-white/90">
              Star Temperature: {filters.temperatureRange[0].toLocaleString()}K - {filters.temperatureRange[1].toLocaleString()}K
            </Label>
            <Slider
              value={filters.temperatureRange}
              onValueChange={handleTemperatureChange}
              min={ranges.temperature[0]}
              max={ranges.temperature[1]}
              step={100}
              className="w-full"
            />
          </div>

          {/* Planet Radius */}
          <div className="space-y-3 mb-4">
            <Label className="text-white/90">
              Planet Radius: {filters.planetRadiusRange[0].toFixed(1)} - {filters.planetRadiusRange[1].toFixed(1)} Earth radii
            </Label>
            <Slider
              value={filters.planetRadiusRange}
              onValueChange={handlePlanetRadiusChange}
              min={ranges.planetRadius[0]}
              max={ranges.planetRadius[1]}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Orbital Period */}
          <div className="space-y-3 mb-4">
            <Label className="text-white/90">
              Orbital Period: {filters.orbitalPeriodRange[0].toFixed(1)} - {filters.orbitalPeriodRange[1].toFixed(1)} days
            </Label>
            <Slider
              value={filters.orbitalPeriodRange}
              onValueChange={handleOrbitalPeriodChange}
              min={ranges.orbitalPeriod[0]}
              max={ranges.orbitalPeriod[1]}
              step={1}
              className="w-full"
            />
          </div>

          {/* Discovery Year */}
          <div className="space-y-3 mb-4">
            <Label className="text-white/90">
              Discovery Year: {filters.discoveryYearRange[0]} - {filters.discoveryYearRange[1]}
            </Label>
            <Slider
              value={filters.discoveryYearRange}
              onValueChange={handleDiscoveryYearChange}
              min={ranges.discoveryYear[0]}
              max={ranges.discoveryYear[1]}
              step={1}
              className="w-full"
            />
          </div>

          {/* Discovery Method */}
          <div className="space-y-3 mb-4">
            <Label className="text-white/90">Discovery Method</Label>
            <Select value={filters.discoveryMethod} onValueChange={handleDiscoveryMethodChange}>
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="all">All Methods</SelectItem>
                {discoveryMethods.map(method => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Habitable Zone Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-white/90">Habitable Zone Only</Label>
            <Switch
              checked={filters.habitableZoneOnly}
              onCheckedChange={handleHabitableZoneToggle}
            />
          </div>
        </Card>

        {/* View Controls */}
        <Card className="p-4 bg-white/5 border-white/10">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            View Controls
          </h3>
          
          <div className="space-y-4">
            {/* Show Orbits */}
            <div className="flex items-center justify-between">
              <Label className="text-white/90">Show Orbits</Label>
              <Switch
                checked={viewControls.showOrbits}
                onCheckedChange={handleShowOrbitsToggle}
              />
            </div>

            {/* Scale Planet Sizes */}
            <div className="flex items-center justify-between">
              <Label className="text-white/90">Scale Planet Sizes</Label>
              <Switch
                checked={viewControls.scalePlanetSizes}
                onCheckedChange={handleScalePlanetSizesToggle}
              />
            </div>

            {/* Star Brightness */}
            <div className="space-y-3">
              <Label className="text-white/90 flex items-center gap-2">
                <Sun className="w-4 h-4" />
                Star Brightness: {(viewControls.starBrightness * 100).toFixed(0)}%
              </Label>
              <Slider
                value={[viewControls.starBrightness]}
                onValueChange={handleStarBrightnessChange}
                min={0.1}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Star Spacing */}
            <div className="space-y-3">
              <Label className="text-white/90 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Star Spacing: {viewControls.starSpacing}
              </Label>
              <Slider
                value={[viewControls.starSpacing]}
                onValueChange={handleStarSpacingChange}
                min={20}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Camera Presets */}
            <div className="space-y-3">
              <Label className="text-white/90">Camera View</Label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={state.cameraPreset === 'galaxy' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => actions.setCameraPreset('galaxy')}
                  className="justify-start"
                >
                  🌌 Galaxy View
                </Button>
                <Button
                  variant={state.cameraPreset === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => actions.setCameraPreset('system')}
                  className="justify-start"
                >
                  ⭐ Star System
                </Button>
                <Button
                  variant={state.cameraPreset === 'closeup' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => actions.setCameraPreset('closeup')}
                  className="justify-start"
                >
                  🔍 Close-up
                </Button>
                <Button
                  variant={state.cameraPreset === 'planet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => actions.setCameraPreset('planet')}
                  className="justify-start"
                >
                  🪐 Planet View
                </Button>
              </div>
              
              {/* Enhanced Navigation Tip */}
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-blue-300 text-xs space-y-1">
                  <div><strong>💡 Pro Tip:</strong></div>
                  <div>Use WASD keys to fly around!</div>
                  <div>Q/E to go up/down, R/F to zoom</div>
                  <div>Mouse wheel for precise zoom control</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Card className="p-4 bg-white/5 border-white/10">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Statistics
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Total Stars</span>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                {statistics.totalStars.toLocaleString()}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Total Planets</span>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                {statistics.totalPlanets.toLocaleString()}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Filtered Planets</span>
              <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                {statistics.filteredPlanets.toLocaleString()}
              </Badge>
            </div>
            {state.multiSelectedPlanets.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-white/70">Selected</span>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
                  {state.multiSelectedPlanets.length}
                </Badge>
              </div>
            )}
          </div>
        </Card>

        {/* Star System Navigation */}
        {filteredStarSystems && filteredStarSystems.length > 0 && (
          <Card className="p-4 bg-white/5 border-white/10">
            <h3 className="text-white font-medium mb-3">Current Star System</h3>
            
            {/* Current system display with navigation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => actions.setStarSystemIndex(Math.max(0, filters.currentStarSystemIndex - 1))}
                  disabled={filters.currentStarSystemIndex === 0}
                  className="p-2 rounded bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:opacity-50 text-white"
                >
                  ‹
                </button>
                
                <div className="flex-1 mx-3 text-center">
                  <div className="text-white font-medium text-sm">
                    {filteredStarSystems[filters.currentStarSystemIndex]?.hostname}
                  </div>
                  <div className="text-white/60 text-xs">
                    {filters.currentStarSystemIndex + 1} of {filteredStarSystems.length}
                  </div>
                  <div className="text-white/60 text-xs">
                    {filteredStarSystems[filters.currentStarSystemIndex]?.planets.length} planets
                  </div>
                </div>
                
                <button
                  onClick={() => actions.setStarSystemIndex(Math.min(filteredStarSystems.length - 1, filters.currentStarSystemIndex + 1))}
                  disabled={filters.currentStarSystemIndex >= filteredStarSystems.length - 1}
                  className="p-2 rounded bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:opacity-50 text-white"
                >
                  ›
                </button>
              </div>
              
              {/* Star system selector dropdown */}
              <select
                value={filters.currentStarSystemIndex}
                onChange={(e) => actions.setStarSystemIndex(parseInt(e.target.value))}
                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white text-sm"
              >
                {filteredStarSystems.map((system, index) => (
                  <option key={system.hostname} value={index} className="bg-gray-800">
                    {system.hostname} ({system.planets.length}p)
                  </option>
                ))}
              </select>
            </div>
          </Card>
        )}

        {/* Reset Filters */}
        <Button
          variant="outline"
          onClick={actions.resetFilters}
          className="w-full border-white/20 text-white hover:bg-white/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}