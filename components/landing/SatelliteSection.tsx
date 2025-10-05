'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { 
  Satellite, 
  ArrowRight, 
  Calendar, 
  Target, 
  Globe, 
  Star,
  Telescope,
  Search,
  Activity
} from 'lucide-react';

const missions = [
  {
    id: 'kepler',
    name: 'Kepler',
    subtitle: 'ML Transit Detection',
    description: 'AI models trained on transit light curves for exoplanet classification.',
    route: '/kepler',
    period: '2009-2013',
    discoveries: '2,600+',
    status: 'Trained',
    image: '/kepler.jpeg',
    color: 'from-green-400 to-emerald-500',
    borderColor: 'border-green-400/20',
    bgColor: 'bg-green-400/5',
    highlights: [' XGBoost Model','Claude 3.5']
  },
  {
    id: 'k2',
    name: 'K2',
    subtitle: 'Extended ML Pipeline',
    description: 'Advanced neural networks for multi-field exoplanet prediction.',
    route: '/k2',
    period: '2014-2018',
    discoveries: '500+',
    status: 'Trained',
    image: '/k2.jpg',
    color: 'from-blue-400 to-cyan-500',
    borderColor: 'border-blue-400/20',
    bgColor: 'bg-blue-400/5',
    highlights: ['XGBoost Model', 'Claude 3.5']
  },
  {
    id: 'tess',
    name: 'TESS',
    subtitle: 'Real-time AI Analysis',
    description: 'Live machine learning predictions on all-sky survey data.',
    route: '/tess',
    period: '2018-Present',
    discoveries: '7,000+',
    status: 'Active',
    image: '/tesss.jpg',
    color: 'from-purple-400 to-violet-500',
    borderColor: 'border-purple-400/20',
    bgColor: 'bg-purple-400/5',
    highlights: ['LGBM Model', 'Claude 3.5']
  }
];

export default function SatelliteSection() {
  const router = useRouter();

  return (
    <section id="missions" className="py-20 bg-gradient-to-b from-black via-slate-950 to-black relative overflow-hidden">
      {/* Space Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/20 via-transparent to-transparent"></div>
        {/* Animated Stars */}
        {Array.from({ length: 50 }).map((_, i) => {
          // Use deterministic values based on index to avoid hydration issues
          const leftPos = (i * 7) % 100;
          const topPos = (i * 11) % 100;
          const delay = (i % 6) * 0.5;
          const duration = 2 + ((i % 3) + 1);
          
          return (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
              style={{
                left: `${leftPos}%`,
                top: `${topPos}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-slate-900/80 text-slate-300 border-slate-700/50 backdrop-blur-sm">
            <Star className="h-4 w-4 mr-2" />
            AI Models
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Machine Learning Analysis
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Advanced AI models trained on satellite data for exoplanet detection and prediction.
          </p>
        </div>

        {/* Mission Cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {missions.map((mission, index) => (
            <Card 
              key={mission.id} 
              className="group relative overflow-hidden bg-black/40 border-slate-800/30 hover:border-slate-700/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 backdrop-blur-lg"
            >
              {/* Glowing Border Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mission.color} opacity-3 group-hover:opacity-8 transition-opacity duration-500 rounded-lg`}></div>
              <div className={`absolute inset-[1px] bg-black/60 rounded-lg transition-all duration-500 group-hover:bg-black/50`}></div>
              
              <div className="relative z-10 p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`relative p-1 rounded-xl ${mission.bgColor} border ${mission.borderColor} backdrop-blur-sm group-hover:scale-105 transition-transform duration-300`}>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={mission.image}
                        alt={mission.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-tr ${mission.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                    </div>
                  </div>
                  <Badge 
                    variant={mission.status === 'Active' ? 'default' : 'secondary'}
                    className={`${mission.status === 'Active' ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-slate-700/30 text-slate-400 border-slate-600/30'} backdrop-blur-sm`}
                  >
                    {mission.status}
                  </Badge>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className={`text-lg font-bold bg-gradient-to-r ${mission.color} bg-clip-text text-transparent mb-1`}>
                      {mission.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-2 h-[32px]">
                      {mission.subtitle}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {mission.description}
                    </p>
                  </div>

                  {/* ML Features */}
                  <div className="space-y-1">
                    {mission.highlights.map((highlight, highlightIndex) => (
                      <div key={highlightIndex} className="flex items-center gap-2 text-xs text-slate-500">
                        <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${mission.color}`}></div>
                        {highlight}
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button 
                    size="sm"
                    className={`w-full group bg-gradient-to-r ${mission.color} hover:shadow-lg hover:shadow-blue-500/20 text-white border-none font-medium transition-all duration-300 mt-4`}
                    onClick={() => router.push(mission.route)}
                  >
                    AI Analysis
                    <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-slate-500 mb-4 text-sm">
            Experience advanced machine learning predictions
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            onClick={() => router.push('/dataSetVisualize')}
          >
            Explore Current Stellites
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}