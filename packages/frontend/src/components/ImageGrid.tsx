import React, { useState } from 'react';
import { Image } from '../types';
import { apiClient } from '../utils/api';
import { Trash2, Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageGridProps {
    images: Image[];
    onImageSelect: (image: Image) => void;
    onImageDelete: (imageId: string) => Promise<any>;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
    images,
    onImageSelect,
    onImageDelete,
}) => {
    const [hoveredImage, setHoveredImage] = useState<string | null>(null);

    const handleDelete = async (imageId: string, imageName: string) => {
        if (window.confirm(`Are you sure you want to delete "${imageName}"?`)) {
            const response = await onImageDelete(imageId);
            if (response.success) {
                toast.success('Image deleted successfully!');
            } else {
                toast.error(response.error || 'Failed to delete image');
            }
        }
    };

    const handleDownload = (image: Image) => {
        const link = document.createElement('a');
        link.href = apiClient.getImageUrl(image.filename);
        link.download = image.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {images.map((image) => (
                <div
                    key={image.id}
                    className="dnd-card group relative aspect-square overflow-hidden cursor-pointer"
                    onMouseEnter={() => setHoveredImage(image.id)}
                    onMouseLeave={() => setHoveredImage(null)}
                    onClick={() => onImageSelect(image)}
                >
                    <img
                        src={apiClient.getImageUrl(image.filename)}
                        alt={image.originalName}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                    />

                    {/* Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent 
                          transition-opacity duration-300 ${hoveredImage === image.id ? 'opacity-100' : 'opacity-0'
                        }`}>
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                            <h3 className="text-white font-medium text-sm truncate mb-1">
                                {image.originalName}
                            </h3>
                            <p className="text-gray-300 text-xs">
                                {formatFileSize(image.size)}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={`absolute top-2 right-2 flex space-x-1 transition-opacity duration-300 ${hoveredImage === image.id ? 'opacity-100' : 'opacity-0'
                        }`}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onImageSelect(image);
                            }}
                            className="p-1.5 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
                            title="View image"
                        >
                            <Eye className="h-4 w-4" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(image);
                            }}
                            className="p-1.5 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
                            title="Download image"
                        >
                            <Download className="h-4 w-4" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(image.id, image.originalName);
                            }}
                            className="p-1.5 bg-red-600/50 rounded-lg text-white hover:bg-red-600/70 transition-colors"
                            title="Delete image"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Loading indicator */}
                    <div className="absolute inset-0 bg-gray-800 animate-pulse opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </div>
            ))}
        </div>
    );
};
