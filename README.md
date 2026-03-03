# Aryan Yadav - Scrollytelling Portfolio

A high-performance, immersive 3D/Canvas scrollytelling personal portfolio built with Next.js 14, React, Framer Motion, and Tailwind CSS.

## Features

- **Immersive 3D Scrollytelling**: Custom HTML5 Canvas implementation that scrubs through a 119-frame high-resolution image sequence synced strictly to scroll progress for a buttery smooth parallax effect.
- **Lenis Smooth Scrolling**: Overhauled default browser scrolling with Lenis for an inertial, frictionless narrative experience.
- **3D Neural Clusters**: Interactive WebGL experience built with Three.js/React Three Fiber to dynamically render skills as interconnected nodes in a 3D gravity simulation.
- **Radial Orbital Contact Node**: Intricate orbital UI component for the contact and social links, featuring expanding nested cards and pulsing animations.
- **Fully Responsive Architecture**: Custom-tailored layout queries to ensure 3D canvas and components look stunning on both 1280px desktops and 390px mobile screens without sacrificing the overarching artistic direction.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D Rendering**: React Three Fiber / Drei / Three.js
- **Scrolling Mechanics**: Lenis smooth scroll
- **Performance**: HTML5 Canvas optimizations for 60fps frame scrubbing

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture Highlights
- Complete avoidance of React component hydration mismatches through precision coordinate math.
- Component layouts driven by CSS `transform: scale()` downsampling to preserve 3D radial aesthetics on small device widths natively.

---
*Built by Aryan Yadav - Let's build the future.*
