"use client";

import React from 'react';
import { Heart, Star, Globe, Thermometer, Clock, Calendar, Telescope, GitCompare, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/state/store';

// Format numbers with proper units
const formatTemperature = (temp: number) => `${temp.toLocaleString()} K`;
const formatRadius = (radius: number) => `${radius.toFixed(2)} R⊕`;
const formatMass = (mass: number) => `${mass.toFixed(2)} M⊕`;
const formatDistance = (distance: number) => `${distance.toFixed(1)} pc`;
const formatPeriod = (period: number) => `${period.toFixed(2)} days`;
const formatYear = (year: number) => year.toString();

// Planet category badges
const PlanetCategoryBadge = ({ category }: { category: string }) => {
  const variants = {
    'cold': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'hot': 'bg-red-500/20 text-red-300 border-red-500/30',
    'habitable': 'bg-green-500/20 text-green-300 border-green-500/30',
    'gas-giant': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };
  
  return (
    <Badge className={variants[category as keyof typeof variants] || 'bg-gray-500/20 text-gray-300'}>
      {category.replace('-', ' ').toUpperCase()}
    </Badge>
  );
};

// Star details component
function StarDetails() {
  const { state, actions, utils } = useApp();
  const star = state.selectedStar;
  
  if (!star) return null;

  const isFavorite = utils.isFavorite(star);
  const starTemp = star.star_properties.temperature_K;
  const spectralClass = star.star_properties.spectral_type || 'Unknown';

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Star System
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => actions.toggleFavorite(star)}
            className="text-white hover:bg-white/10"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
        <h3 className="text-xl font-bold text-white">{star.hostname}</h3>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Properties */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-white/70 text-sm">Spectral Type</div>
            <div className="text-white font-medium">{spectralClass}</div>
          </div>
          <div className="space-y-2">
            <div className="text-white/70 text-sm flex items-center gap-1">
              <Thermometer className="w-3 h-3" />
              Temperature
            </div>
            <div className="text-white font-medium">{formatTemperature(starTemp)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-white/70 text-sm">Radius</div>
            <div className="text-white font-medium">{star.star_properties.radius_solar.toFixed(2)} R☉</div>
          </div>
          <div className="space-y-2">
            <div className="text-white/70 text-sm">Mass</div>
            <div className="text-white font-medium">{star.star_properties.mass_solar.toFixed(2)} M☉</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-white/70 text-sm">Metallicity</div>
            <div className="text-white font-medium">{star.star_properties.metallicity.toFixed(3)}</div>
          </div>
          <div className="space-y-2">
            <div className="text-white/70 text-sm">Distance</div>
            <div className="text-white font-medium">{formatDistance(star.star_properties.distance_pc)}</div>
          </div>
        </div>

        {/* Coordinates */}
        <Separator className="bg-white/10" />
        <div>
          <div className="text-white/70 text-sm mb-2">Coordinates</div>
          <div className="space-y-1">
            <div className="text-white text-sm">
              RA: {star.star_properties.ra_deg.toFixed(4)}°
            </div>
            <div className="text-white text-sm">
              Dec: {star.star_properties.dec_deg.toFixed(4)}°
            </div>
          </div>
        </div>

        {/* Planets in system */}
        <Separator className="bg-white/10" />
        <div>
          <div className="text-white/70 text-sm mb-2">Planets in System</div>
          <div className="text-2xl font-bold text-blue-400">{star.planets.length}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Planet details component
function PlanetDetails() {
  const { state, actions, utils } = useApp();
  const planet = state.selectedPlanet;
  
  if (!planet) return null;

  const isFavorite = utils.isFavorite(planet);
  const category = utils.getPlanetCategory(planet);
  const isHabitable = utils.isInHabitableZone(planet);

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Exoplanet
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => actions.toggleFavorite(planet)}
            className="text-white hover:bg-white/10"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
        <h3 className="text-xl font-bold text-white">{planet.planet_name}</h3>
        <div className="flex gap-2">
          <PlanetCategoryBadge category={category} />
          {isHabitable && (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              HABITABLE ZONE
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Physical Properties */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-white/70 text-sm">Radius</div>
            <div className="text-white font-medium">{formatRadius(planet.radius_earth)}</div>
          </div>
          <div className="space-y-2">
            <div className="text-white/70 text-sm">Mass</div>
            <div className="text-white font-medium">{formatMass(planet.mass_earth)}</div>
          </div>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <div className="text-white/70 text-sm flex items-center gap-1">
            <Thermometer className="w-3 h-3" />
            Equilibrium Temperature
          </div>
          <div className="text-white font-medium">{formatTemperature(planet.equilibrium_temp_K)}</div>
        </div>

        {/* Orbital Properties */}
        <Separator className="bg-white/10" />
        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Orbital Properties</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-white/70 text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Period
              </div>
              <div className="text-white font-medium">{formatPeriod(planet.orbital_period_days)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-white/70 text-sm">Eccentricity</div>
              <div className="text-white font-medium">{planet.eccentricity.toFixed(4)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-white/70 text-sm">Insolation</div>
            <div className="text-white font-medium">{planet.insolation_earth.toFixed(2)} S⊕</div>
          </div>
        </div>

        {/* Discovery Information */}
        <Separator className="bg-white/10" />
        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Discovery</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-white/70 text-sm flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Year
              </div>
              <div className="text-white font-medium">{formatYear(planet.discovery_year)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-white/70 text-sm flex items-center gap-1">
                <Telescope className="w-3 h-3" />
                Method
              </div>
              <div className="text-white font-medium text-xs">{planet.discovery_method}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Multi-selection component
function MultiSelectionDetails() {
  const { state, actions } = useApp();
  const planets = state.multiSelectedPlanets;

  if (planets.length === 0) return null;

  const avgRadius = planets.reduce((sum, p) => sum + p.radius_earth, 0) / planets.length;
  const avgMass = planets.reduce((sum, p) => sum + p.mass_earth, 0) / planets.length;
  const avgTemp = planets.reduce((sum, p) => sum + p.equilibrium_temp_K, 0) / planets.length;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-purple-400" />
            Multi-Selection ({planets.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.clearMultiSelection}
            className="text-white hover:bg-white/10"
          >
            Clear
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Average Properties */}
        <div className="space-y-3">
          <div className="text-white/70 text-sm font-medium">Average Properties</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-white/70 text-sm">Avg Radius</div>
              <div className="text-white font-medium">{formatRadius(avgRadius)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-white/70 text-sm">Avg Mass</div>
              <div className="text-white font-medium">{formatMass(avgMass)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-white/70 text-sm">Avg Temperature</div>
            <div className="text-white font-medium">{formatTemperature(avgTemp)}</div>
          </div>
        </div>

        {/* Selected Planets List */}
        <Separator className="bg-white/10" />
        <div className="space-y-2">
          <div className="text-white/70 text-sm font-medium">Selected Planets</div>
          <ScrollArea className="h-32">
            {planets.map((planet, index) => (
              <div key={planet.planet_name} className="flex items-center justify-between py-1">
                <div className="text-white text-sm truncate">{planet.planet_name}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => actions.toggleMultiSelect(planet)}
                  className="text-red-400 hover:text-red-300 hover:bg-white/10 px-2"
                >
                  ×
                </Button>
              </div>
            ))}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

// Favorites component
function FavoritesSection() {
  const { state, actions } = useApp();
  const favorites = state.favorites;

  if (favorites.length === 0) return null;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-400" />
          Favorites ({favorites.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-32">
          <div className="space-y-2">
            {favorites.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <div className="text-white text-sm truncate">
                  {'hostname' in item ? item.hostname : item.planet_name}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if ('hostname' in item) {
                        actions.selectStarSystem(item);
                      } else {
                        actions.selectPlanet(item);
                      }
                    }}
                    className="text-blue-400 hover:text-blue-300 hover:bg-white/10 px-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.toggleFavorite(item)}
                    className="text-red-400 hover:text-red-300 hover:bg-white/10 px-2"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Main component
export function DetailsPanel() {
  const { state } = useApp();

  return (
    <div className="w-80 h-full bg-black/20 backdrop-blur-xl border-l border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-semibold text-white">Details</h2>
        {!state.selectedStar && !state.selectedPlanet && state.multiSelectedPlanets.length === 0 && (
          <p className="text-white/60 text-sm mt-2">
            Select a star or planet to view details
          </p>
        )}
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {/* Multi-selection takes priority */}
          {state.multiSelectedPlanets.length > 0 && <MultiSelectionDetails />}
          
          {/* Star details */}
          {state.selectedStar && state.multiSelectedPlanets.length === 0 && <StarDetails />}
          
          {/* Planet details */}
          {state.selectedPlanet && state.multiSelectedPlanets.length === 0 && <PlanetDetails />}
          
          {/* Favorites */}
          <FavoritesSection />
        </div>
      </ScrollArea>
    </div>
  );
}