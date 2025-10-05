'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Github, Twitter, Linkedin, Mail, Star, Rocket, ExternalLink } from 'lucide-react';

const socialLinks = [
  { icon: <Github className="h-5 w-5" />, label: 'GitHub', href: 'https://github.com/TayyabXtreme/A-World-Away-Hunting-EXO-PLANET---QUARK-' },
  { icon: <Linkedin className="h-5 w-5" />, label: 'LinkedIn', href: 'https://www.linkedin.com/in/muhammad-tayyab-xtreme' },
  { icon: <Mail className="h-5 w-5" />, label: 'Email', href: 'mailto:tayyabxtrem@gmail.com' }
];

const quickLinks = [
  { name: "Kepler Analysis", href: "/kepler" },
  { name: "K2 Analysis", href: "/k2" },
  { name: "TESS Analysis", href: "/tess" },
  { name: "Dataset Explorer", href: "/dataSetVisualize" }
];

const resources = [
  { name: "Challenge Resources", href: "https://www.spaceappschallenge.org/2025/challenges/a-world-away-hunting-for-exoplanets-with-ai/?tab=resources" },
  { name: "Our Project Dashboard", href: "https://www.spaceappschallenge.org/2025/find-a-team/quark/?tab=project" },
  { name: "Kepler Dataset", href: "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=cumulative" },
  { name: "TESS Dataset", href: "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=TOI" },
  { name: "K2 Dataset", href: "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=k2pandc" },
  { name: "Research Article", href: "https://academic.oup.com/mnras/article/513/4/5505/6472249" }
];

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-slate-800/50 overflow-hidden">
      {/* Space Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-950 to-slate-900"></div>
        {/* Twinkling Stars */}
        {Array.from({ length: 40 }).map((_, i) => {
          // Use deterministic values based on index to avoid hydration issues
          const leftPos = (i * 9) % 100;
          const topPos = (i * 13) % 100;
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
        {/* Cosmic Glow */}
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="mb-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                EXOQUARK
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                AI-powered exoplanet discovery platform for NASA Space Apps Challenge 2025
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
                  className="border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50 text-slate-400 hover:text-white backdrop-blur-sm"
                >
                  <a href={social.href} aria-label={social.label} target="_blank" rel="noopener noreferrer">
                    {social.icon}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">AI Analysis</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center group text-sm"
                  >
                    <Star className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-400" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              {resources.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : '_self'}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : ''}
                    className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center group text-sm"
                  >
                    <ExternalLink className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-purple-400" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-slate-800/50 mb-6" />

     

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <div className="text-slate-500 text-xs">
            © 2025 ExoQuark • NASA Space Apps Challenge 2025
          </div>
          <div className="text-xs text-slate-600">
            Built with Next.js • Data: NASA Exoplanet Archive
          </div>
        </div>
      </div>
    </footer>
  );
}