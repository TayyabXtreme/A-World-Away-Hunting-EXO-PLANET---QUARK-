# Dataset Visualization - Exoplanet Observatory

A comprehensive 3D visualization of exoplanets from three major space telescopes: K2, Kepler, and TESS.

## Features

### 🌌 3D Space Visualization
- **Interactive 3D Environment**: Navigate through space using mouse controls
- **Glowing Planet Spheres**: Each planet appears as a glowing sphere with realistic proportions
- **Color-Coded by Temperature**: Planets are colored based on their equilibrium temperature
  - Blue: Cool planets (<300K)
  - Green: Temperate planets (300-600K)
  - Yellow: Warm planets (600-1000K)
  - Red: Hot planets (1000-1500K)
  - Pink: Very hot planets (>1500K)

### 🔭 Telescope Filters
- **Multi-Mission Support**: View data from K2, Kepler, and TESS missions
- **Individual Filters**: Filter by specific telescope or view all combined
- **Mission Information**: Detailed information about each telescope mission
- **Real-time Counts**: Live planet counts for each filter

### 🪐 Planet Interaction
- **Click Detection**: Click on any planet to view detailed information
- **Smooth Animations**: Seamless zoom and selection animations
- **Selection Effects**: Visual rings and glow effects for selected planets
- **Hover Effects**: Interactive hover states with cursor changes

### 📊 Detailed Planet Information
- **Comprehensive Data**: Orbital, physical, and stellar properties
- **Visual Classification**: Automatic planet type classification (Earth-like, Super-Earth, etc.)
- **Habitability Assessment**: Habitability zone analysis
- **Mission Context**: Discovery information and telescope details

### 🎨 Modern UI Design
- **Space Theme**: Dark, elegant space-themed interface
- **Responsive Layout**: Sidebar filters and detail panels
- **Smooth Animations**: Framer Motion powered transitions
- **Professional Components**: shadcn/ui component library

## Data Sources

### K2 Mission (2014-2018)
- Extended Kepler mission observing different fields
- 14 parameters per planet including orbital and stellar properties
- Focus on continued exoplanet discovery

### Kepler Space Telescope (2009-2013)
- Original mission focused on habitable zone planets
- 20+ parameters including detailed orbital characteristics
- Primary goal: Earth-like planet detection

### TESS Mission (2018-Present)
- All-sky survey for nearby exoplanets
- 15 parameters with focus on nearby star systems
- Ongoing mission for comprehensive exoplanet catalog

## Technical Implementation

### Performance Optimizations
- **Instanced Rendering**: Efficient rendering of thousands of planets
- **Level of Detail**: Optimized geometry for distant objects
- **Data Limiting**: Smart dataset limiting for optimal performance
- **Smooth Controls**: 60fps navigation and interactions

### Data Processing
- **Unified Schema**: Normalized data from different telescope formats
- **3D Positioning**: RA/Dec coordinates converted to 3D Cartesian
- **Smart Scaling**: Appropriate sizing for visualization clarity
- **Error Handling**: Graceful handling of missing or invalid data

## Usage

1. **Navigation**: 
   - Use mouse to rotate, zoom, and pan through 3D space
   - Scroll to zoom in/out
   - Drag to rotate view
   - Right-click drag to pan

2. **Filtering**:
   - Use left sidebar to filter by telescope mission
   - Search for specific planets by name
   - View mission statistics and information

3. **Planet Details**:
   - Click any planet to view detailed information
   - Right panel shows comprehensive planetary data
   - Close panel with X button or click elsewhere

4. **Visual Legend**:
   - Color indicates planet temperature
   - Size represents planet radius
   - Glow effects highlight selections

## Technologies Used

- **Next.js 14**: React framework with app router
- **React Three Fiber**: 3D rendering with Three.js
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Modern component library
- **Framer Motion**: Smooth animations
- **Lucide Icons**: Professional iconography

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Semantic HTML structure
- **High Contrast**: Clear visual hierarchy
- **Responsive Design**: Works on all screen sizes

## Performance Stats

- **Concurrent Planets**: Up to 3000+ planets rendered simultaneously
- **Frame Rate**: Maintains 60fps on modern hardware
- **Load Time**: Dataset loading with progress indicators
- **Memory Usage**: Optimized for minimal memory footprint