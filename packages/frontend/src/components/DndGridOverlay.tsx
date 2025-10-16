import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Palette } from 'lucide-react';

interface DndGridOverlayProps {
    isVisible: boolean;
    imageScale: number;
    imageRotation: number;
    imagePanOffset: { x: number; y: number };
    isLockedToImage: boolean;
    onLockToggle: () => void;
    imageDimensions?: { width: number; height: number } | null;
    showHUD?: boolean;
}

export const DndGridOverlay: React.FC<DndGridOverlayProps> = ({
    isVisible,
    imageScale,
    imageRotation,
    imagePanOffset,
    isLockedToImage,
    onLockToggle,
    imageDimensions,
    showHUD = true
}) => {
    const [gridColumns, setGridColumns] = useState(10); // Number of grid columns
    const [gridRows, setGridRows] = useState(10); // Number of grid rows
    const [cellSize, setCellSize] = useState(50); // Base cell size in pixels
    const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 }); // Grid position offset
    const [gridColor, setGridColor] = useState('#000000'); // Default black
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialGridOffset, setInitialGridOffset] = useState({ x: 0, y: 0 });
    const gridRef = useRef<HTMLDivElement>(null);

    // Auto-fit grid to image dimensions
    const autoFitGrid = () => {
        if (!imageDimensions) {
            console.log('Auto-fit: No image dimensions available');
            return;
        }

        // Calculate how many cells would fit based on image dimensions
        const targetCellSize = 20; // Even smaller cell size for maximum squares
        const scaledWidth = imageDimensions.width * imageScale;
        const scaledHeight = imageDimensions.height * imageScale;

        // Create maximum squares by using very small cell size
        const calculatedColumns = Math.max(12, Math.round(scaledWidth / targetCellSize));
        const calculatedRows = Math.max(12, Math.round(scaledHeight / targetCellSize));

        console.log('Auto-fit calculation:', {
            imageDimensions,
            imageScale,
            scaledWidth,
            scaledHeight,
            targetCellSize,
            calculatedColumns,
            calculatedRows
        });

        setGridColumns(calculatedColumns);
        setGridRows(calculatedRows);
        setCellSize(targetCellSize);
    };

    // Calculate grid position based on lock state
    const getGridTransform = () => {
        if (isLockedToImage) {
            // Grid moves with the image
            return {
                transform: `scale(${imageScale}) rotate(${imageRotation}deg) translate(${imagePanOffset.x}px, ${imagePanOffset.y}px)`,
                transformOrigin: 'center center'
            };
        } else {
            // Grid has independent position
            return {
                transform: `translate(${gridOffset.x}px, ${gridOffset.y}px)`,
                transformOrigin: 'center center'
            };
        }
    };

    // Handle grid dragging (only when not locked to image)
    const handleMouseDown = (e: React.MouseEvent) => {
        if (isLockedToImage) return;

        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setInitialGridOffset(gridOffset);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || isLockedToImage) return;

        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        setGridOffset({
            x: initialGridOffset.x + deltaX,
            y: initialGridOffset.y + deltaY
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStart, initialGridOffset]);

    // Close color picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showColorPicker) {
                const target = event.target as Element;
                // Don't close if clicking on color picker elements
                if (!target.closest('[data-color-picker]')) {
                    setShowColorPicker(false);
                }
            }
        };

        if (showColorPicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showColorPicker]);

    // Generate grid lines
    const generateGridLines = () => {
        const lines = [];
        const totalWidth = gridColumns * cellSize;
        const totalHeight = gridRows * cellSize;
        const halfWidth = totalWidth / 2;
        const halfHeight = totalHeight / 2;

        // Vertical lines
        for (let i = 0; i <= gridColumns; i++) {
            const x = -halfWidth + (i * cellSize);
            lines.push(
                <line
                    key={`v-${i}`}
                    x1={x}
                    y1={-halfHeight}
                    x2={x}
                    y2={halfHeight}
                    stroke={gridColor}
                    strokeWidth="1"
                    opacity="0.7"
                />
            );
        }

        // Horizontal lines
        for (let i = 0; i <= gridRows; i++) {
            const y = -halfHeight + (i * cellSize);
            lines.push(
                <line
                    key={`h-${i}`}
                    x1={-halfWidth}
                    y1={y}
                    x2={halfWidth}
                    y2={y}
                    stroke={gridColor}
                    strokeWidth="1"
                    opacity="0.7"
                />
            );
        }

        return lines;
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Grid Overlay - Always visible when grid is active */}
            <div
                ref={gridRef}
                className="absolute inset-0 pointer-events-none z-10"
                style={getGridTransform()}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`${-gridColumns * cellSize / 2 - 50} ${-gridRows * cellSize / 2 - 50} ${gridColumns * cellSize + 100} ${gridRows * cellSize + 100}`}
                    className="w-full h-full"
                    style={{ pointerEvents: isLockedToImage ? 'none' : 'auto' }}
                    onMouseDown={handleMouseDown}
                >
                    {generateGridLines()}
                </svg>
            </div>

            {/* Grid Controls - Only visible when HUD is shown */}
            {showHUD && (
                <div className="absolute top-4 left-4 z-20 bg-black/20 hover:bg-black/60 rounded-lg p-3 transition-all duration-300 backdrop-blur-sm">
                    <div className="flex flex-col space-y-3">
                        {/* Lock Toggle */}
                        <button
                            onClick={onLockToggle}
                            className={`p-2 rounded-full text-white transition-all duration-300 ${isLockedToImage
                                ? 'bg-green-600/50 hover:bg-green-600/70'
                                : 'bg-gray-600/50 hover:bg-gray-600/70'
                                }`}
                            title={isLockedToImage ? 'Unlock grid from image' : 'Lock grid to image'}
                        >
                            {isLockedToImage ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                        </button>

                        {/* Grid Columns Control */}
                        <div className="flex flex-col space-y-2">
                            <label className="text-white text-xs">Columns</label>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setGridColumns(Math.max(3, gridColumns - 1))}
                                    className="p-1 bg-white/20 hover:bg-white/40 rounded text-white text-xs transition-colors"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min="3"
                                    max="70"
                                    value={gridColumns}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        if (!isNaN(value) && value >= 3 && value <= 70) {
                                            setGridColumns(value);
                                        }
                                    }}
                                    className="w-12 px-1 py-1 bg-white/20 border border-white/30 rounded text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-white/50"
                                />
                                <button
                                    onClick={() => setGridColumns(Math.min(70, gridColumns + 1))}
                                    className="p-1 bg-white/20 hover:bg-white/40 rounded text-white text-xs transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Grid Rows Control */}
                        <div className="flex flex-col space-y-2">
                            <label className="text-white text-xs">Rows</label>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setGridRows(Math.max(3, gridRows - 1))}
                                    className="p-1 bg-white/20 hover:bg-white/40 rounded text-white text-xs transition-colors"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min="3"
                                    max="70"
                                    value={gridRows}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        if (!isNaN(value) && value >= 3 && value <= 70) {
                                            setGridRows(value);
                                        }
                                    }}
                                    className="w-12 px-1 py-1 bg-white/20 border border-white/30 rounded text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-white/50"
                                />
                                <button
                                    onClick={() => setGridRows(Math.min(70, gridRows + 1))}
                                    className="p-1 bg-white/20 hover:bg-white/40 rounded text-white text-xs transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Auto-fit Button */}
                        <button
                            onClick={autoFitGrid}
                            className="p-2 bg-blue-600/50 hover:bg-blue-600/70 rounded text-white text-xs transition-colors"
                            title="Auto-fit grid to image"
                        >
                            Auto-fit
                        </button>

                        {/* Grid Color Control */}
                        <div className="flex flex-col space-y-2">
                            <label className="text-white text-xs">Grid Color</label>
                            <div className="flex items-center space-x-2">
                                <div
                                    className="w-8 h-6 rounded border-2 border-white/30 cursor-pointer hover:border-white/60"
                                    style={{ backgroundColor: gridColor }}
                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                    title="Click to change color"
                                />
                                <button
                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                    className="p-2 bg-white/20 hover:bg-white/40 rounded text-white transition-colors"
                                    title="Change grid color"
                                >
                                    <Palette className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Simple Color Picker */}
                            {showColorPicker && (
                                <div className="absolute left-full ml-2 top-0 bg-black/90 rounded-lg p-2 z-30" data-color-picker>
                                    <div className="flex flex-col space-y-2">
                                        {/* Preset Colors */}
                                        <div className="flex space-x-1">
                                            {[
                                                '#b0b0b0', // Light gray
                                                '#ffd700', // Gold
                                                '#ffffff', // White
                                                '#000000', // Black
                                                '#ff0000', // Red
                                                '#0000ff', // Blue
                                            ].map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setGridColor(color);
                                                        setShowColorPicker(false);
                                                    }}
                                                    className={`w-6 h-6 rounded border-2 ${gridColor === color
                                                        ? 'border-white'
                                                        : 'border-white/30'
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                    title={color}
                                                />
                                            ))}
                                        </div>

                                        {/* Custom Color Input */}
                                        <input
                                            type="color"
                                            value={gridColor}
                                            onChange={(e) => setGridColor(e.target.value)}
                                            className="w-full h-6 rounded border border-white/30 bg-transparent cursor-pointer"
                                            title="Custom color"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Grid Info */}
                        <div className="text-white text-xs">
                            <div>Grid: {gridColumns}×{gridRows}</div>
                            <div>Cell: {cellSize}px</div>
                            <div>Status: {isLockedToImage ? 'Locked' : 'Free'}</div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
