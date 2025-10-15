import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Image, Folder } from '../types';
import { UploadArea } from './UploadArea';

interface ImageGridOverlayProps {
    folder: Folder;
    images: Image[];
    onImageSelect: (image: Image) => void;
    onImageDelete: (imageId: string) => Promise<any>;
    onImageUpload: (file: File, folderId: string) => Promise<any>;
    onClose: () => void;
}

export const ImageGridOverlay: React.FC<ImageGridOverlayProps> = ({
    folder,
    images,
    onImageSelect,
    onImageDelete,
    onImageUpload,
    onClose
}) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        try {
            await onImageUpload(file, folder.id);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-40 flex flex-col">
            {/* Header */}
            <div className="bg-dnd-brown-800/90 backdrop-blur-sm border-b border-dnd-brown-600 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-2xl font-semibold text-white">{folder.name}</h2>
                        <span className="text-gray-400">
                            {images.length} {images.length === 1 ? 'image' : 'images'}
                        </span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <UploadArea
                            onUpload={handleUpload}
                            disabled={isUploading}
                            className="inline-block"
                        />
                        <button
                            onClick={onClose}
                            className="p-3 bg-red-600/50 hover:bg-red-600/70 rounded-lg text-white transition-colors"
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Grid */}
            <div className="flex-1 overflow-auto p-6">
                {images.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🗺️</div>
                            <h3 className="text-xl font-semibold text-gray-400 mb-2">
                                No images in this collection
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Upload your first map or asset to get started
                            </p>
                            <UploadArea
                                onUpload={handleUpload}
                                disabled={isUploading}
                                className="inline-block"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                className="group relative bg-dnd-brown-700/50 rounded-lg overflow-hidden border border-dnd-brown-600 hover:border-dnd-gold-500 transition-all duration-300 hover:scale-105 cursor-pointer"
                                onClick={() => onImageSelect(image)}
                            >
                                <img
                                    src={`http://localhost:3001/${image.filename}`}
                                    alt={image.originalName}
                                    className="w-full h-48 object-cover"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="text-center text-white">
                                            <p className="font-semibold mb-1">{image.originalName}</p>
                                            <p className="text-sm text-gray-300">
                                                {new Date(image.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onImageDelete(image.id);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-red-600/50 hover:bg-red-600/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    title="Delete image"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
