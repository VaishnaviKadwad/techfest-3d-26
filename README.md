# Techfest 2026 — Beyond the Surface

Welcome to the official frontend repository for **Techfest 2026**, Asia's largest science and technology festival hosted by **IIT Bombay**. This year's edition, themed *"Beyond the Surface"*,  invites pioneering minds into an immersive, deep-ocean digital experience centered around robotics, AI, aerospace, and deep-tech frontiers.

## 🔗 Project Links
* **GitHub Repository:** [VaishnaviKadwad/techfest-3d-26](https://github.com/VaishnaviKadwad/techfest-3d-26)
* **Live Demo:** [Techfest 2026 — Beyond the Surface | IIT Bombay](https://vaishnavikadwad.github.io/techfest-3d-26/)

---

## ✨ Features

- **Intro Cinematic Overlay:** A custom WebGL cinematic entrance tunnel system simulating core system initialization before transitioning into the main deck.
- **Dynamic 3D Ocean Environment:** Built entirely on top of **Three.js**, featuring an active biome with:
  - Bioluminescent particle fields and neural tendrils.
  - A mathematically animated, gliding Manta Ray and a pulsing centerpiece Jellyfish.
  - Generative silhouette kelp forests with glowing tips and independent plankton twinkling.
  - Active jellyfish swarms, thermal vent shimmers, and a waving aurora curtain[cite: 1].
- **Scroll-Reactive Dive Engine:** The camera structurally dives deeper down the coordinate planes (altering FOV and positions) dynamically as the user scrolls, driving an active sidebar **Depth Gauge HUD**[cite: 1].
- **Interactive Dive Control Panel:** Switch between multi-zone modes (*Sunlit Currents, Twilight Drift, Abyssal Flux*) updating the engine telemetry array and fine-tuning engine speed via a custom range slider[cite: 1].
- **Custom Built-In Synthesizer:** An integrated AudioContext engine that dynamically synthesizes low-frequency ambient ocean drone waves and periodic sub-aquatic bubble pops on demand[cite: 1].
- **Fully Responsive Architecture:** Gracefully transitions into a distraction-free mobile view, hiding complex 3D viewports while keeping accessibility intact[cite: 1].

---

## 🛠️ Built With

- **HTML5 & CSS3** - Hard-coded responsive positioning, custom neon grid matrices, structural overlay masking, and component styling[cite: 1].
- **JavaScript (ES6+)** - Reactive event handling, scrolling computation engines, and Web Audio API architecture[cite: 1].
- **Three.js (r128)** - Fully standalone WebGL graphics architecture utilizing custom buffers, custom Catmull-Rom tube math, geometries, and procedural shaders[cite: 1].

---

## 🚀 Getting Started

Since this project is fully client-side and contains zero external build dependencies, you can launch it locally in seconds[cite: 1].

### Prerequisites
You only need a modern web browser (Chrome, Firefox, Edge, or Safari) with WebGL enabled[cite: 1].

### Running Locally
1. Clone the repository to your desktop machine:
   ```bash
   git clone [https://github.com/VaishnaviKadwad/techfest-3d-26.git](https://github.com/VaishnaviKadwad/techfest-3d-26.git)
