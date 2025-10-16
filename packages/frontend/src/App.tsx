import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Folder, Image } from './types';
import { apiClient } from './utils/api';
import { FolderSelection } from './components/FolderSelection';
import { ImageGridOverlay } from './components/ImageGridOverlay';
import { ImageViewer } from './components/ImageViewer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AIMapGenerator } from './components/AIMapGenerator';

function App() {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [images, setImages] = useState<Image[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<Image | null>(null);
    const [showImageGrid, setShowImageGrid] = useState(false);
    const [showAIGenerator, setShowAIGenerator] = useState(false);
    const [aiGeneratorFolderId, setAiGeneratorFolderId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [foldersResponse, imagesResponse] = await Promise.all([
                apiClient.getFolders(),
                apiClient.getImages()
            ]);

            if (foldersResponse.success && foldersResponse.data) {
                setFolders(foldersResponse.data);
            }

            if (imagesResponse.success && imagesResponse.data) {
                setImages(imagesResponse.data);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFolderSelect = (folderId: string) => {
        setSelectedFolder(folderId);
        setSelectedImage(null);
        setShowImageGrid(true);
    };

    const handleImageSelect = (image: Image) => {
        setSelectedImage(image);
    };

    const handleImageUpload = async (file: File, folderId: string) => {
        const response = await apiClient.uploadImage(file, folderId);
        if (response.success && response.data) {
            setImages(prev => [...prev, response.data!]);
            await loadData(); // Refresh folders to update image counts
        }
        return response;
    };

    const handleImageDelete = async (imageId: string) => {
        const response = await apiClient.deleteImage(imageId);
        if (response.success) {
            setImages(prev => prev.filter(img => img.id !== imageId));
            if (selectedImage?.id === imageId) {
                setSelectedImage(null);
            }
            await loadData(); // Refresh folders to update image counts
        }
        return response;
    };

    const handleFolderCreate = async (name: string) => {
        const response = await apiClient.createFolder(name);
        if (response.success && response.data) {
            setFolders(prev => [...prev, response.data!]);
        }
        return response;
    };

    // const handleFolderDelete = async (folderId: string) => {
    //     const response = await apiClient.deleteFolder(folderId);
    //     if (response.success) {
    //         setFolders(prev => prev.filter(folder => folder.id !== folderId));
    //         if (selectedFolder === folderId) {
    //             setSelectedFolder(null);
    //         }
    //     }
    //     return response;
    // };

    const handleAIGeneratorOpen = (folderId: string) => {
        setAiGeneratorFolderId(folderId);
        setShowAIGenerator(true);
    };

    const currentFolderImages = images.filter(img => img.folderId === selectedFolder);
    const currentFolder = folders.find(f => f.id === selectedFolder);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-dnd-gold-500 mx-auto mb-4"></div>
                    <p className="text-dnd-gold-400 text-lg medieval-text">Loading your magical collection...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-dnd-brown-900 text-white overflow-hidden">
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1a1a1a',
                        color: '#fff',
                        border: '1px solid #8B4513',
                    },
                }}
            />

            {/* Main App Content */}
            {!selectedFolder && !showImageGrid && (
                <FolderSelection
                    folders={folders}
                    onFolderSelect={handleFolderSelect}
                    onFolderCreate={handleFolderCreate}
                    onImageUpload={handleImageUpload}
                />
            )}

            {/* Image Grid Overlay */}
            {showImageGrid && currentFolder && (
                <ImageGridOverlay
                    folder={currentFolder}
                    images={currentFolderImages}
                    onImageSelect={handleImageSelect}
                    onImageDelete={handleImageDelete}
                    onImageUpload={handleImageUpload}
                    onClose={() => {
                        setShowImageGrid(false);
                        setSelectedFolder(null);
                    }}
                    onAIGeneratorOpen={handleAIGeneratorOpen}
                />
            )}

            {/* Full Screen Image Viewer */}
            {selectedImage && (
                <ImageViewer
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                    images={currentFolderImages}
                    onImageSelect={handleImageSelect}
                />
            )}

            {/* AI Map Generator */}
            <AIMapGenerator
                isVisible={showAIGenerator}
                onClose={() => {
                    setShowAIGenerator(false);
                    setAiGeneratorFolderId(null);
                }}
                onMapGenerated={() => {
                    // Refresh the images after generating a new map
                    loadData();
                    setShowAIGenerator(false);
                    setAiGeneratorFolderId(null);
                }}
                folders={folders}
                currentFolderId={aiGeneratorFolderId || undefined}
            />

            <OfflineIndicator />
        </div>
    );
}

export default App;
