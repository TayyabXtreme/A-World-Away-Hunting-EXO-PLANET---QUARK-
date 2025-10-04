'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Github, Twitter, Linkedin, Mail, Star, Rocket, ExternalLink } from 'lucide-react';

const socialLinks = [
  { icon: <Github className="h-5 w-5" />, label: 'GitHub', href: '#' },
  { icon: <Twitter className="h-5 w-5" />, label: 'Twitter', href: '#' },
  { icon: <Linkedin className="h-5 w-5" />, label: 'LinkedIn', href: '#' },
  { icon: <Mail className="h-5 w-5" />, label: 'Email', href: '#' }
];

const quickLinks = [
  { name: "Kepler Mission", href: "/kepler_prid" },
  { name: "K2 Mission", href: "/k2_prid" },
  { name: "TESS Survey", href: "/3dVisual" },
  { name: "Dataset Explorer", href: "/dataSetVisualize" }
];

const resources = [
  { name: "Documentation", href: "#" },
  { name: "API Reference", href: "#" },
  { name: "Research Papers", href: "#" },
  { name: "Support Center", href: "#" }
];

export default function Footer() {
  return (
    <footer className="bg-black border-t border-slate-800">
      <div className="container mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                EXOQUARK
              </h3>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                Advanced exoplanet discovery through AI-powered analysis and interactive 3D visualization. 
                Explore the cosmos with cutting-edge technology.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="icon"
                  asChild
                  className="border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Explore Missions</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <Star className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Resources</h4>
            <ul className="space-y-3">
              {resources.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <ExternalLink className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-slate-800 mb-8" />

        {/* Stats Card */}
        <Card className="bg-slate-900/50 border-slate-800 mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-white mb-1">5,000+</div>
                <div className="text-slate-400 text-sm">Confirmed Exoplanets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">3</div>
                <div className="text-slate-400 text-sm">Space Missions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">Real-time</div>
                <div className="text-slate-400 text-sm">Data Updates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">AI</div>
                <div className="text-slate-400 text-sm">Powered Analysis</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-slate-400 text-sm">
            © 2025 ExoQuark. Built for space exploration enthusiasts.
          </div>
          <div className="flex items-center space-x-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors duration-200">
              Contact
            </a>
          </div>
        </div>

        {/* Credits */}
        <div className="text-center mt-8 pt-8 border-t border-slate-800/50">
          <p className="text-xs text-slate-500">
            Data sources: NASA Exoplanet Archive • AI: Claude 3.5 Sonnet • Built with Next.js & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}