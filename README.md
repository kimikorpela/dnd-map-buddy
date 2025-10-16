# D&D Map Buddy

A D&D-themed image viewer for organizing and displaying maps and assets. Features AI map generation, D&D grid overlays, and offline functionality.

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd dnd-map-buddy
   npm run install:all
   ```

2. **Start the app**
   ```bash
   npm run dev
   ```
   
   This starts:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## AI Map Generation Setup

To use the AI map generation feature, you need a free Hugging Face API token:

### Step 1: Get Your Token
1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Sign up or log in to your account
3. Click "New token"
4. Give it a name (e.g., "D&D Map Buddy")
5. Select "Read" permissions
6. Click "Generate a token"
7. Copy the token (starts with `hf_...`)

### Step 2: Configure the App
1. Create a file named `.env` in the `packages/frontend/` directory
2. Add your token:
   ```
   VITE_HF_TOKEN=your_token_here
   ```
3. Restart the development server:
   ```bash
   npm run dev
   ```

### Step 3: Use AI Generation
1. Open any folder in the app
2. Click the purple "Generate AI Map" button
3. Describe your map (e.g., "Medieval tavern with wooden tables and fireplace")
4. Optionally name your map
5. Click "Generate" and wait for the AI to create your map
6. Save it to your folder

## Features

- **Image Organization**: Create folders and upload maps/assets
- **D&D Grid Overlay**: Add resizable, lockable movement grids
- **AI Map Generation**: Create custom maps from text descriptions
- **Image Viewer**: Zoom, rotate, and navigate images
- **Offline Support**: Works without internet connection
- **Keyboard Shortcuts**: Quick controls for image viewing

## Keyboard Shortcuts

- `H`: Toggle HUD visibility
- `+/-`: Zoom in/out
- `R`: Rotate image
- `ESC`: Close image viewer
- `F11`: Toggle fullscreen

## Troubleshooting

**AI generation not working:**
- Check that your `.env` file is in `packages/frontend/` directory
- Verify the token starts with `hf_`
- Restart the development server after adding the token

**Images not loading:**
- Ensure backend is running on port 3001
- Check file size is under 100MB

**Grid not showing:**
- Click the D&D Grid button in the top-right
- Use the controls to adjust columns/rows
- Press `H` to hide HUD for clean gameplay view