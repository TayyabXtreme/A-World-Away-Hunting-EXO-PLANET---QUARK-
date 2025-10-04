import * as THREE from 'three';
import { PlanetCategory } from '@/lib/types';

// Create procedural planet textures based on planet properties
export function createPlanetTexture(category: PlanetCategory, temperature: number, radius: number): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Clear canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 256, 256);

  // Create base color based on category
  let baseColor: string;
  let secondaryColor: string;

  switch (category) {
    case 'habitable':
      baseColor = '#4a90e2'; // Ocean blue
      secondaryColor = '#27ae60'; // Land green
      break;
    case 'hot':
      baseColor = '#e74c3c'; // Hot red
      secondaryColor = '#f39c12'; // Hot orange
      break;
    case 'cold':
      baseColor = '#95a5a6'; // Ice gray
      secondaryColor = '#ecf0f1'; // Ice white
      break;
    case 'gas-giant':
      baseColor = '#9b59b6'; // Purple
      secondaryColor = '#8e44ad'; // Darker purple
      break;
  }

  // Create gradient background
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, baseColor);
  gradient.addColorStop(1, secondaryColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  // Add surface features based on planet type
  if (category === 'habitable') {
    // Add continents for habitable planets
    ctx.fillStyle = secondaryColor;
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = 20 + Math.random() * 40;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (category === 'gas-giant') {
    // Add bands for gas giants
    for (let y = 0; y < 256; y += 20) {
      const opacity = 0.3 + Math.random() * 0.4;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fillRect(0, y, 256, 10 + Math.random() * 10);
    }
  } else if (category === 'cold') {
    // Add ice caps and cracks
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 256, Math.random() * 256);
      ctx.lineTo(Math.random() * 256, Math.random() * 256);
      ctx.stroke();
    }
  } else if (category === 'hot') {
    // Add lava flows
    ctx.fillStyle = '#f1c40f';
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = 5 + Math.random() * 15;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Add some noise for texture
  const imageData = ctx.getImageData(0, 0, 256, 256);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 30;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));     // Red
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // Green
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // Blue
  }
  
  ctx.putImageData(imageData, 0, 0);

  // Create Three.js texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;

  return texture;
}

// Create normal map for surface detail
export function createPlanetNormalMap(category: PlanetCategory): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Create height map first
  const imageData = ctx.createImageData(256, 256);
  const data = imageData.data;

  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const index = (y * 256 + x) * 4;
      
      // Generate height based on noise
      const height = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5 + 0.5;
      const heightValue = Math.floor(height * 255);
      
      data[index] = heightValue;     // Red
      data[index + 1] = heightValue; // Green  
      data[index + 2] = heightValue; // Blue
      data[index + 3] = 255;         // Alpha
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;

  return texture;
}