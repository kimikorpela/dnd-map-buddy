import React, { useState } from 'react';
import { FolderPlus, FolderOpen } from 'lucide-react';
import { Folder } from '../types';
import { UploadArea } from './UploadArea';

interface FolderSelectionProps {
    folders: Folder[];
    onFolderSelect: (folderId: string) => void;
    onFolderCreate: (name: string) => Promise<any>;
    onImageUpload: (file: File, folderId: string) => Promise<any>;
}

export const FolderSelection: React.FC<FolderSelectionProps> = ({
    folders,
    onFolderSelect,
    onFolderCreate,
    onImageUpload
}) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        setIsCreating(true);
        try {
            await onFolderCreate(newFolderName.trim());
            setNewFolderName('');
            setShowCreateForm(false);
        } catch (error) {
            console.error('Failed to create folder:', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-dnd-brown-900 via-dnd-brown-800 to-dnd-brown-900 flex items-center justify-center p-8">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="text-8xl mb-6">🎲</div>
                    <h1 className="text-5xl font-bold text-dnd-gold-400 mb-4 medieval-text">
                        D&D Map Buddy
                    </h1>
                    <p className="text-xl text-gray-300 mb-8">
                        Organize and view your maps, tokens, and assets
                    </p>
                </div>

                {/* Folder Grid */}
                {folders.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                            Your Collections
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {folders.map((folder) => (
                                <div
                                    key={folder.id}
                                    onClick={() => onFolderSelect(folder.id)}
                                    className="group cursor-pointer bg-dnd-brown-700/50 hover:bg-dnd-brown-600/50 rounded-lg p-6 border border-dnd-brown-600 hover:border-dnd-gold-500 transition-all duration-300 hover:scale-105"
                                >
                                    <div className="flex items-center space-x-3 mb-3">
                                        <FolderOpen className="h-8 w-8 text-dnd-gold-400" />
                                        <h3 className="text-xl font-semibold text-white group-hover:text-dnd-gold-300 transition-colors">
                                            {folder.name}
                                        </h3>
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        {folder.imageCount} {folder.imageCount === 1 ? 'image' : 'images'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create New Folder */}
                <div className="text-center">
                    {!showCreateForm ? (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center space-x-2 bg-dnd-gold-600 hover:bg-dnd-gold-500 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                        >
                            <FolderPlus className="h-6 w-6" />
                            <span>Create New Collection</span>
                        </button>
                    ) : (
                        <div className="bg-dnd-brown-800/50 rounded-lg p-8 border border-dnd-brown-600 max-w-md mx-auto">
                            <h3 className="text-xl font-semibold text-white mb-4">
                                Create New Collection
                            </h3>
                            <form onSubmit={handleCreateFolder} className="space-y-4">
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="Collection name..."
                                    className="w-full px-4 py-3 bg-dnd-brown-700 border border-dnd-brown-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-dnd-gold-500 focus:border-transparent"
                                    autoFocus
                                />
                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        disabled={!newFolderName.trim() || isCreating}
                                        className="flex-1 bg-dnd-gold-600 hover:bg-dnd-gold-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        {isCreating ? 'Creating...' : 'Create'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setNewFolderName('');
                                        }}
                                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Quick Upload */}
                {folders.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-lg font-semibold text-white mb-4 text-center">
                            Quick Upload to First Collection
                        </h3>
                        <div className="max-w-md mx-auto">
                            <UploadArea
                                onUpload={async (file) => {
                                    if (folders.length > 0) {
                                        await onImageUpload(file, folders[0].id);
                                    }
                                }}
                                disabled={folders.length === 0}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
