import React, { useState } from 'react';
import { Image, Folder } from '../types';
import { UploadArea } from './UploadArea';
import { ImageGrid } from './ImageGrid';
import { FolderPlus, Image as ImageIcon } from 'lucide-react';

interface FolderManagerProps {
    folder: Folder | undefined;
    images: Image[];
    onImageSelect: (image: Image) => void;
    onImageDelete: (imageId: string) => Promise<any>;
    onImageUpload: (file: File, folderId: string) => Promise<any>;
}

export const FolderManager: React.FC<FolderManagerProps> = ({
    folder,
    images,
    onImageSelect,
    onImageDelete,
    onImageUpload,
}) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (file: File) => {
        if (!folder) return;

        setIsUploading(true);
        try {
            await onImageUpload(file, folder.id);
        } finally {
            setIsUploading(false);
        }
    };

    if (!folder) {
        return (
            <div className="text-center text-gray-400">
                <p>Folder not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Folder Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <FolderPlus className="h-6 w-6 text-dnd-gold-400" />
                    <div>
                        <h2 className="text-xl font-semibold text-white">{folder.name}</h2>
                        <p className="text-sm text-gray-400">
                            {images.length} {images.length === 1 ? 'image' : 'images'}
                        </p>
                    </div>
                </div>

                <UploadArea
                    onUpload={handleUpload}
                    disabled={isUploading}
                    className="w-auto"
                />
            </div>

            {/* Images Grid */}
            {images.length === 0 ? (
                <div className="text-center py-12">
                    <ImageIcon className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">
                        No images in this folder
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Upload your first map or asset to get started
                    </p>
                    <UploadArea
                        onUpload={handleUpload}
                        disabled={isUploading}
                        className="inline-block"
                    />
                </div>
            ) : (
                <ImageGrid
                    images={images}
                    onImageSelect={onImageSelect}
                    onImageDelete={onImageDelete}
                />
            )}
        </div>
    );
};
