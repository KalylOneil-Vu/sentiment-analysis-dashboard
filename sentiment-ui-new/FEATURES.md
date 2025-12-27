# Features & Functionality

## Core Technology

| Feature | Description |
|---------|-------------|
| **Face Detection** | Real-time facial landmark detection using MediaPipe Face Mesh (478 landmarks) |
| **Emotion Simulation** | Interprets facial cues to determine emotional state (Joy, Stress, Neutral, Anger, Confusion) |
| **Webcam Integration** | Live camera feed with mirrored display for natural interaction |
| **Focus Score** | Calculates engagement/attention level based on facial analysis |

---

## Scene Flow

| Scene | Functionality |
|-------|---------------|
| **Scene 0 - Attract Loop** | Idle screen that waits for user interaction to begin |
| **Scene 1 - Welcome** | Introduction screen with live face detection preview; "Begin" button to start |
| **Scene 2 - Analysis** | Full emotion analysis dashboard with confidence percentages and focus metrics |
| **Scene 3a - Retail** | Product matching demo; shows how emotions correlate to product preferences |
| **Scene 3b - Healthcare** | Healthcare signals demo; monitors patient-relevant emotional indicators |
| **Scene 3c - High Stress** | Scenario selector for high-stress roles (pilots, surgeons, etc.); real-time stress monitoring |
| **Scene 4 - Sensitivity** | Interactive slider demonstrating how bias adjustments affect AI predictions |
| **Scene 5 - Summary** | Recap of experience with auto-cycling takeaways; replay option |

---

## User Controls

| Feature | Description |
|---------|-------------|
| **Dark/Light Mode Toggle** | Switch between light and dark themes; persists across sessions |
| **Landmark Visibility Toggles** | Toggle display of eyes, nose, mouth, and ears landmarks on camera overlay |
| **Sensitivity Slider** | Adjust AI sensitivity to demonstrate bias effects on emotion detection |
| **Product Selection** | Tap through products to see emotion-based match scores |
| **Scenario Selection** | Choose different high-stress role scenarios to explore |

---

## Transitions & Navigation

| Feature | Description |
|---------|-------------|
| **Portal Transition** | Expanding radial wash effect for Scene 0 → Scene 1 |
| **Blur-Scale Transition** | Smooth blur + scale animation between all other scenes |
| **Scene Indicator** | Top-right badge showing current scene number and name |
| **Continue Buttons** | Navigate forward through the experience |
| **Replay Option** | Return to beginning from Summary scene |

---

## Camera Overlay Elements

| Feature | Description |
|---------|-------------|
| **Face Oval** | Green/teal outline tracing the detected face boundary |
| **Landmark Dots** | Cyan dots marking key facial points (toggleable by region) |
| **Grid Overlay** | 4×5 reference grid over camera feed |
| **Recording Indicator** | Pulsing red dot indicating active camera |
| **Corner Brackets** | Animated corner markers that lock on when face is detected |

---

## Data Displays

| Feature | Description |
|---------|-------------|
| **Emotion Display** | Shows detected emotion type with confidence percentage |
| **Focus Score Ring** | Circular progress indicator showing attention/engagement level |
| **Signal Bars** | Healthcare-specific metrics (pain indicators, fatigue, anxiety) |
| **Stress Bar** | Visual stress level indicator for high-stress scenarios |
| **Metric Cards** | Sensitivity scene cards showing how bias affects different metrics |
| **Match Score** | Retail scene percentage showing product-emotion correlation |

---

## Visual Enhancements

### Phase 1

| Feature | Description |
|---------|-------------|
| **Animated Numbers** | Numeric values (confidence %, focus score) smoothly interpolate between changes instead of jumping |
| **Value Pulse Effect** | Glowing pulse animation triggers when emotion type changes |
| **Ambient Gradients** | Subtle background color tint shifts based on detected emotion (joy = warm amber, stress = blue, etc.) |

### Phase 2

| Feature | Description |
|---------|-------------|
| **Noise Texture** | Subtle film grain overlay across the entire app for premium depth (2.5% opacity) |
| **Shimmer Skeleton** | Reusable loading placeholder component with sweeping shimmer animation |
| **Animated Brackets** | Camera corner brackets gently pulse when idle, "lock on" with animation when face is detected |
| **Floating Particles** | Small glowing dots rise upward from the camera area during active face analysis |

### Phase 3: Subtle Interactions

| Feature | Description |
|---------|-------------|
| **Cursor Glow** | Soft accent-colored glow follows the mouse cursor |
| **Ripple Click** | Material-style ripple effect on button clicks |
| **Hover Lift** | Cards lift and scale slightly on hover |
| **Tooltips** | Glassmorphic tooltips on theme toggle and landmark buttons |

### Phase 4: Polish & Feel

| Feature | Description |
|---------|-------------|
| **Magnetic Button** | Begin button subtly pulls toward cursor on hover |
| **Breathing Idle** | Camera panel gently pulses when no face detected |
| **Blur Transition** | Emotion display blurs briefly when emotion changes |

### Phase 5: HUD Elements

| Feature | Description |
|---------|-------------|
| **Scan Line Sweep** | Horizontal light line sweeps down camera feed every 4 seconds |
| **Status Badge** | Shows "Standby" (amber) or "Locked" (green) based on face detection |
| **Frame Counter** | Displays current FPS in camera corner |

### Phase 6: Atmosphere & Motion

| Feature | Description |
|---------|-------------|
| **Gradient Shift** | Background slowly cycles through subtle hue changes over 20 seconds |
| **Light Leak** | Soft glow drifts diagonally across camera panel |
| **Grid Pulse** | Camera grid brightens when face is first detected |
| **Staggered Entry** | Grid items cascade in with sequential delays |
| **Morphing Icons** | Emotion icons scale and rotate when transitioning between states |

### Additional Visual Polish

| Feature | Description |
|---------|-------------|
| **Grid Background** | Subtle grid pattern across all scenes |
| **Dark Mode Transitions** | Scene transitions use appropriate wash colors for current theme |
| **Glassmorphism Panels** | Frosted glass effect with backdrop blur on all content panels |
