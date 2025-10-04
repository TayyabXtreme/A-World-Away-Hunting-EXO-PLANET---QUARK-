'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
    name: 'Kepler Space Telescope',
    subtitle: 'The Pioneer of Exoplanet Discovery',
    description: 'Revolutionary space telescope that monitored over 150,000 stars to discover Earth-sized planets in habitable zones.',
    route: '/kepler',
    period: '2009-2013',
    discoveries: '2,600+',
    status: 'Completed',
    icon: <Telescope className="h-8 w-8" />,
    color: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-500/10',
    stats: [
      { label: 'Confirmed Planets', value: '2,600+', icon: <Target className="h-4 w-4" /> },
      { label: 'Candidates', value: '4,000+', icon: <Search className="h-4 w-4" /> },
      { label: 'Field Coverage', value: 'Single', icon: <Globe className="h-4 w-4" /> }
    ],
    highlights: ['First Earth-size planets', 'Habitable zone discoveries', 'Statistical foundation']
  },
  {
    id: 'k2',
    name: 'K2 Mission',
    subtitle: 'Extended Kepler Operations',
    description: 'Continued exoplanet discoveries across multiple star fields, expanding our understanding of planetary systems.',
    route: '/k2',
    period: '2014-2018',
    discoveries: '500+',
    status: 'Completed',
    icon: <Activity className="h-8 w-8" />,
    color: 'from-blue-500 to-cyan-600',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
    stats: [
      { label: 'Confirmed Planets', value: '500+', icon: <Target className="h-4 w-4" /> },
      { label: 'Campaigns', value: '19', icon: <Search className="h-4 w-4" /> },
      { label: 'Field Coverage', value: 'Multiple', icon: <Globe className="h-4 w-4" /> }
    ],
    highlights: ['Multi-field observations', 'Diverse stellar environments', 'Extended mission success']
  },
  {
    id: 'tess',
    name: 'TESS Mission',
    subtitle: 'Transiting Exoplanet Survey Satellite',
    description: 'All-sky survey mission discovering planets around the brightest stars for detailed follow-up observations.',
    route: '/tess',
    period: '2018-Present',
    discoveries: '7,000+',
    status: 'Active',
    icon: <Satellite className="h-8 w-8" />,
    color: 'from-purple-500 to-violet-600',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
    stats: [
      { label: 'TOI Candidates', value: '7,000+', icon: <Target className="h-4 w-4" /> },
      { label: 'Confirmed Planets', value: '400+', icon: <Search className="h-4 w-4" /> },
      { label: 'Sky Coverage', value: '85%', icon: <Globe className="h-4 w-4" /> }
    ],
    highlights: ['All-sky survey', 'Bright star targets', 'Real-time discoveries']
  }
];

export default function SatelliteSection() {
  const router = useRouter();

  return (
    <section id="missions" className="py-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-slate-800 text-slate-300 border-slate-700">
            <Star className="h-4 w-4 mr-2" />
            Space Missions
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Pioneering Space Telescopes
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Explore data from NASA&apos;s most successful exoplanet discovery missions. 
            Each telescope has contributed unique insights to our understanding of worlds beyond our solar system.
          </p>
        </div>

        {/* Mission Cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {missions.map((mission, index) => (
            <Card 
              key={mission.id} 
              className={`group relative overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-700/50 hover:border-slate-600 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-2 backdrop-blur-sm`}
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mission.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${mission.bgColor} border ${mission.borderColor} backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white">{mission.icon}</span>
                  </div>
                  <Badge 
                    variant={mission.status === 'Active' ? 'default' : 'secondary'}
                    className={`${mission.status === 'Active' ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' : 'bg-slate-700'} shadow-lg`}
                  >
                    {mission.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-white mb-1 group-hover:text-blue-100 transition-colors duration-300">
                  {mission.name}
                </CardTitle>
                <p className="text-xs font-medium text-slate-400 mb-2">
                  {mission.subtitle}
                </p>
                <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
                  {mission.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4 relative z-10">
                {/* Compact Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800/60 rounded-lg p-2 backdrop-blur-sm border border-slate-700/50">
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">Period</span>
                    </div>
                    <span className="text-white font-semibold text-xs">{mission.period}</span>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-2 backdrop-blur-sm border border-slate-700/50">
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <Target className="h-3 w-3" />
                      <span className="text-xs">Found</span>
                    </div>
                    <span className="text-white font-semibold text-xs">{mission.discoveries}</span>
                  </div>
                </div>

                {/* Key Highlights - Simplified */}
                <div className="space-y-1">
                  {mission.highlights.slice(0, 2).map((highlight, highlightIndex) => (
                    <div key={highlightIndex} className="flex items-center gap-2 text-xs text-slate-400">
                      <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${mission.color}`}></div>
                      {highlight}
                    </div>
                  ))}
                </div>

                {/* Compact CTA Button */}
                <Button 
                  size="sm"
                  className={`w-full group bg-gradient-to-r ${mission.color} hover:shadow-lg hover:shadow-blue-500/25 text-white border-none font-medium transition-all duration-300`}
                  onClick={() => router.push(mission.route)}
                >
                  Explore Data
                  <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-400 mb-6">
            Ready to dive deeper into exoplanet discovery?
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6"
            onClick={() => router.push('/dataSetVisualize')}
          >
            Dataset Visualize
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}