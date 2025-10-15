# 🎲 D&D Map Buddy

A modern, D&D-themed image viewer application designed for Dungeon Masters and players to organize and display their maps, tokens, and assets. Built with a focus on offline functionality and easy customization.

![D&D Map Buddy](https://img.shields.io/badge/D&D-Map%20Buddy-8B4513?style=for-the-badge&logo=d20&logoColor=D4AF37)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

## ✨ Features

- **🎨 D&D-Themed UI**: Beautiful, customizable interface with medieval fonts and fantasy colors
- **📁 Folder Management**: Create and organize folders for different campaigns or asset types
- **🖼️ Image Viewer**: Full-featured image viewer with zoom, rotate, and fullscreen support
- **📤 Easy Upload**: Drag & drop or click to upload images (supports JPEG, PNG, GIF, WebP, BMP)
- **💾 Offline Support**: Works completely offline with PWA capabilities
- **🔧 Easily Customizable**: Simple CSS classes and component structure for easy theming
- **⚡ Modern Stack**: Built with TypeScript, React, Node.js, and Express
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices

## 🏗️ Architecture

This is a monorepo containing:

- **Frontend** (`packages/frontend`): React + TypeScript + Vite + Tailwind CSS
- **Backend** (`packages/backend`): Node.js + Express + TypeScript
- **Shared Types**: Common TypeScript interfaces

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dnd-map-buddy
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 📖 Usage

### Getting Started

1. **Create your first folder**: Click the "+" button in the sidebar to create a collection
2. **Upload images**: Drag & drop or click to upload your maps and assets
3. **View images**: Click on any image to open the full viewer
4. **Organize**: Create multiple folders for different campaigns or asset types

### Image Viewer Controls

- **Zoom**: Use +/- keys or the zoom buttons
- **Rotate**: Press 'R' key or use the rotate button
- **Fullscreen**: Click the maximize button or press F11
- **Download**: Click the download button to save images
- **Close**: Press ESC or click the X button

### Keyboard Shortcuts

- `+` / `-`: Zoom in/out
- `R`: Rotate image
- `ESC`: Close image viewer
- `F11`: Toggle fullscreen

## 🎨 Customization

### Theming

The application uses a D&D-themed color palette that's easily customizable:

```css
/* Main D&D colors */
--dnd-brown: #8B4513 (leather/wood)
--dnd-gold: #D4AF37 (treasure/magic)
--dnd-red: #DC2626 (danger/combat)
--dnd-blue: #2563EB (mystical/arcane)
```

### Customizing Components

All components are built with Tailwind CSS and custom D&D classes:

```tsx
// Example: Custom button styling
<button className="dnd-button">
  Adventure Awaits
</button>

// Example: Custom card styling
<div className="dnd-card">
  Your content here
</div>
```

### Adding New Themes

1. Update `tailwind.config.js` with new color schemes
2. Modify CSS classes in `src/index.css`
3. Update component styles as needed

## 🛠️ Development

### Project Structure

```
dnd-map-buddy/
├── packages/
│   ├── frontend/          # React frontend
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── types/         # TypeScript types
│   │   │   ├── utils/         # Utility functions
│   │   │   └── assets/        # Static assets
│   │   └── public/            # Public assets
│   └── backend/           # Node.js backend
│       ├── src/
│       │   ├── routes/        # API routes
│       │   ├── types/         # TypeScript types
│       │   └── utils/         # Utility functions
│       └── uploads/           # Image storage
└── package.json           # Root package.json
```

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend

# Production
npm run build           # Build both frontend and backend
npm start              # Start production server

# Utilities
npm run install:all    # Install all dependencies
npm run kill           # Stop all development servers (simple)
npm run kill:all       # Stop all servers with detailed feedback
```

### API Endpoints

#### Folders
- `GET /api/folders` - Get all folders
- `POST /api/folders` - Create new folder
- `DELETE /api/folders/:id` - Delete folder

#### Images
- `GET /api/images` - Get all images
- `GET /api/images/folder/:folderId` - Get images by folder
- `POST /api/images/upload` - Upload image
- `DELETE /api/images/:id` - Delete image

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=development
```

### File Upload Limits

Default limits (configurable in `packages/backend/src/routes/images.ts`):
- Max file size: 50MB
- Supported formats: JPEG, PNG, GIF, WebP, BMP

## 📱 PWA Features

The application includes Progressive Web App features:

- **Offline Support**: Works without internet connection
- **Installable**: Can be installed on desktop and mobile
- **Service Worker**: Caches resources for offline use
- **Manifest**: App-like experience with custom icons

## 🎯 Use Cases

### For Dungeon Masters
- Organize maps by campaign or session
- Quick access to battle maps during games
- Store and categorize NPC portraits
- Manage handouts and documents

### For Players
- View character art and tokens
- Access campaign materials
- Browse shared assets from the DM

### For Content Creators
- Organize map collections
- Preview and showcase work
- Manage asset libraries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Fonts**: [Google Fonts](https://fonts.google.com/) - Cinzel and Uncial Antiqua
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful, customizable icons
- **UI Framework**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **D&D Community**: Inspired by the amazing creativity of D&D players and DMs worldwide

## 🐛 Troubleshooting

### Common Issues

**Images not loading**
- Check if the backend server is running on port 3001
- Verify file permissions in the uploads directory

**Upload fails**
- Ensure file size is under 50MB
- Check file format is supported (JPEG, PNG, GIF, WebP, BMP)

**Offline mode not working**
- Clear browser cache and reload
- Check if service worker is registered in browser dev tools

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Create a new issue with detailed information
- Include browser console logs if applicable

---

**Happy adventuring! 🎲⚔️🏰**