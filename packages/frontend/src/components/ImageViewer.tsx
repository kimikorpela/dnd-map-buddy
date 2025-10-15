import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, Maximize2, Grid3X3, RotateCcw, Maximize } from 'lucide-react';
import { Image } from '../types';
import { apiClient } from '../utils/api';
import { useScreenInfo } from '../hooks/useScreenInfo';

interface ImageViewerProps {
    image: Image;
    onClose: () => void;
    onShowGrid?: () => void;
    images?: Image[];
    onImageSelect?: (image: Image) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
    image,
    onClose,
    images = [],
    onImageSelect
}) => {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [, setIsFullscreen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

    // Screen information
    const screenInfo = useScreenInfo();

    // Dragging and panning state
    const [isDragging, setIsDragging] = useState(false);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const dragStartRef = useRef({ x: 0, y: 0 });
    const lastPanOffsetRef = useRef({ x: 0, y: 0 });
    const wheelTimeoutRef = useRef<number | null>(null);

    const imageUrl = apiClient.getImageUrl(image.filename);

    // Simple auto-fit: rotate if beneficial, fit without cropping
    const calculateAutoFit = (imgWidth: number, imgHeight: number) => {
        const { width: screenWidth, height: screenHeight } = screenInfo;

        // Account for UI elements - leave some margin
        const availableWidth = screenWidth - 60;
        const availableHeight = screenHeight - 100;

        // Calculate scale for both orientations (contain approach - no cropping)
        const scaleLandscape = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
        const scalePortrait = Math.min(availableWidth / imgHeight, availableHeight / imgWidth);

        // Determine if rotation would be beneficial
        const aspectRatio = imgWidth / imgHeight;
        const isVeryTall = aspectRatio < 0.7; // Image is much taller than wide
        const wouldBenefitFromRotation = scalePortrait > scaleLandscape * 1.1 || isVeryTall;

        let optimalScale: number;
        let optimalRotation: number;

        if (wouldBenefitFromRotation) {
            // Rotate the image for better fit
            optimalScale = scalePortrait;
            optimalRotation = 90;
        } else {
            // Keep original orientation
            optimalScale = scaleLandscape;
            optimalRotation = 0;
        }

        // Ensure scale is within reasonable bounds
        optimalScale = Math.max(0.1, Math.min(optimalScale, 3));

        return { scale: optimalScale, rotation: optimalRotation };
    };

    // Simple auto-fit function
    const applyAutoFit = useCallback(() => {
        if (imageDimensions) {
            const { scale: optimalScale, rotation: optimalRotation } = calculateAutoFit(
                imageDimensions.width,
                imageDimensions.height
            );

            setScale(optimalScale);
            setRotation(optimalRotation);
            setPanOffset({ x: 0, y: 0 });
        }
    }, [imageDimensions, screenInfo]);

    // Reset when image changes
    useEffect(() => {
        setImageDimensions(null);
        setScale(1);
        setRotation(0);
        setPanOffset({ x: 0, y: 0 });
    }, [image.id]);

    // No automatic auto-fit - user controls it manually with Fill button

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === '+') setScale(prev => Math.min(prev + 0.1, 5));
            if (e.key === '-') setScale(prev => Math.max(prev - 0.1, 0.1));
            if (e.key === 'r') setRotation(prev => (prev + 90) % 360);

            // Arrow key navigation (rotation-aware)
            const moveStep = 30; // Reduced from 50 to 30 for more precise movement
            const radians = (rotation * Math.PI) / 180;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);

            if (e.key === 'ArrowLeft') {
                setPanOffset(prev => ({
                    x: prev.x + moveStep * cos,
                    y: prev.y + moveStep * sin
                }));
            }
            if (e.key === 'ArrowRight') {
                setPanOffset(prev => ({
                    x: prev.x - moveStep * cos,
                    y: prev.y - moveStep * sin
                }));
            }
            if (e.key === 'ArrowUp') {
                setPanOffset(prev => ({
                    x: prev.x - moveStep * sin,
                    y: prev.y + moveStep * cos
                }));
            }
            if (e.key === 'ArrowDown') {
                setPanOffset(prev => ({
                    x: prev.x + moveStep * sin,
                    y: prev.y - moveStep * cos
                }));
            }
            if (e.key === '0') {
                resetView();
            }
            if (e.key === 'a' || e.key === 'A') {
                // Apply auto-fit
                applyAutoFit();
            }
        };

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            // Clear any existing timeout
            if (wheelTimeoutRef.current) {
                clearTimeout(wheelTimeoutRef.current);
            }

            const zoomStep = 0.01; // Very small step for extremely fine zoom control
            const zoomFactor = e.deltaY > 0 ? -zoomStep : zoomStep;

            // Use requestAnimationFrame for smoother updates
            requestAnimationFrame(() => {
                setScale(prev => {
                    const newScale = Math.max(0.1, Math.min(5, prev + zoomFactor));
                    return newScale;
                });
            });
        };

        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDragging && scale > 1) {
                e.preventDefault();
                const deltaX = e.clientX - dragStartRef.current.x;
                const deltaY = e.clientY - dragStartRef.current.y;

                // Adjust drag direction based on rotation
                const radians = (rotation * Math.PI) / 180;
                const cos = Math.cos(radians);
                const sin = Math.sin(radians);

                // Rotate the delta coordinates
                const rotatedDeltaX = deltaX * cos + deltaY * sin;
                const rotatedDeltaY = -deltaX * sin + deltaY * cos;

                setPanOffset({
                    x: lastPanOffsetRef.current.x + rotatedDeltaX,
                    y: lastPanOffsetRef.current.y + rotatedDeltaY
                });
            }
        };

        const handleGlobalMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            if (wheelTimeoutRef.current) {
                clearTimeout(wheelTimeoutRef.current);
            }
        };
    }, [onClose, isDragging, scale, rotation]);

    // Mouse event handlers for dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            e.preventDefault();
            setIsDragging(true);
            dragStartRef.current = { x: e.clientX, y: e.clientY };
            lastPanOffsetRef.current = panOffset;
        }
    };


    const resetView = () => {
        setScale(1);
        setRotation(0);
        setPanOffset({ x: 0, y: 0 });
        lastPanOffsetRef.current = { x: 0, y: 0 };
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = image.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="fixed inset-0 bg-black z-50">
            {/* Minimal Transparent Menu - Top Right */}
            <div className="absolute top-4 right-4 z-20">
                <div className="flex items-center space-x-2">
                    {/* Grid Button */}
                    {images.length > 0 && (
                        <button
                            onClick={() => setShowGrid(!showGrid)}
                            className="p-3 bg-black/20 hover:bg-black/60 rounded-full text-white transition-all duration-300 backdrop-blur-sm"
                            title="Show image grid"
                        >
                            <Grid3X3 className="h-6 w-6" />
                        </button>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="p-3 bg-red-600/20 hover:bg-red-600/60 rounded-full text-white transition-all duration-300 backdrop-blur-sm"
                        title="Close viewer"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Image Grid Overlay */}
            {showGrid && (
                <div className="absolute inset-0 bg-black/90 z-30 flex items-center justify-center p-8">
                    <div className="bg-black/80 rounded-lg p-6 max-w-4xl max-h-full overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white text-xl font-semibold">Select Image</h3>
                            <button
                                onClick={() => setShowGrid(false)}
                                className="p-2 bg-red-600/50 rounded-lg text-white hover:bg-red-600/70 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((img) => (
                                <div
                                    key={img.id}
                                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${img.id === image.id
                                        ? 'ring-4 ring-dnd-gold-500 scale-105'
                                        : 'hover:scale-105 hover:ring-2 hover:ring-dnd-gold-300'
                                        }`}
                                    onClick={() => {
                                        if (onImageSelect) {
                                            onImageSelect(img);
                                        }
                                        setShowGrid(false);
                                    }}
                                >
                                    <img
                                        src={apiClient.getImageUrl(img.filename)}
                                        alt={img.originalName}
                                        className="w-full h-32 object-cover"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs">
                                        {img.originalName}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Full Screen Image */}
            <div className="h-full w-full flex items-center justify-center">
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-dnd-gold-500"></div>
                    </div>
                )}

                {imageError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="text-6xl mb-4">❌</div>
                            <p className="text-xl mb-2">Failed to load image</p>
                            <p className="text-sm text-gray-400">URL: {imageUrl}</p>
                        </div>
                    </div>
                )}

                <img
                    src={imageUrl}
                    alt={image.originalName}
                    className={`max-w-full max-h-full object-contain ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                        transform: `scale(${scale}) rotate(${rotation}deg) translate(${panOffset.x}px, ${panOffset.y}px)`,
                        cursor: isDragging ? 'grabbing' : (scale > 1 ? 'grab' : 'default'),
                        transition: isDragging ? 'none' : 'opacity 0.3s ease-in-out'
                    }}
                    onLoad={(e) => {
                        const img = e.target as HTMLImageElement;
                        const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
                        setImageDimensions(dimensions);
                        setImageLoaded(true);
                    }}
                    onError={() => setImageError(true)}
                    onMouseDown={handleMouseDown}
                    draggable={false}
                />
            </div>

            {/* Minimal Controls - Bottom Right */}
            <div className="absolute bottom-4 right-4 z-20">
                <div className="flex items-center space-x-2 bg-black/20 hover:bg-black/60 rounded-full p-2 transition-all duration-300 backdrop-blur-sm">
                    <button
                        onClick={() => setScale(prev => Math.max(prev - 0.1, 0.1))}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                        title="Zoom out"
                    >
                        <ZoomOut className="h-5 w-5" />
                    </button>

                    <span className="text-white text-sm min-w-[3rem] text-center">
                        {Math.round(scale * 100)}%
                    </span>

                    <button
                        onClick={() => setScale(prev => Math.min(prev + 0.1, 5))}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                        title="Zoom in"
                    >
                        <ZoomIn className="h-5 w-5" />
                    </button>

                    <button
                        onClick={() => setRotation(prev => (prev + 90) % 360)}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                        title="Rotate"
                    >
                        <RotateCw className="h-5 w-5" />
                    </button>

                    <button
                        onClick={resetView}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                        title="Reset view"
                    >
                        <RotateCcw className="h-5 w-5" />
                    </button>

                    <button
                        onClick={applyAutoFit}
                        className="p-2 bg-blue-600/50 text-white hover:bg-blue-600/70 rounded-full transition-colors"
                        title="Auto-fit to screen"
                    >
                        <Maximize className="h-5 w-5" />
                    </button>


                    <button
                        onClick={toggleFullscreen}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                        title="Fullscreen"
                    >
                        <Maximize2 className="h-5 w-5" />
                    </button>

                    <button
                        onClick={handleDownload}
                        className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                        title="Download"
                    >
                        <Download className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Image Info - Bottom Left */}
            <div className="absolute bottom-4 left-4 z-20 bg-black/20 hover:bg-black/60 rounded-lg px-4 py-2 text-white text-sm transition-all duration-300 backdrop-blur-sm">
                <p className="font-medium">{image.originalName}</p>
                <p className="text-gray-300">
                    {formatFileSize(image.size)} • {new Date(image.uploadedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Scroll to zoom • Drag to pan • Arrow keys to navigate • 0 to reset • A to auto-fit
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Scale: {Math.round(scale * 100)}% • Rotation: {rotation}°
                </p>
            </div>
        </div>
    );
};
