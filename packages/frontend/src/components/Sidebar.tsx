import React, { useState } from 'react';
import { Folder, Plus, Trash2, FolderOpen } from 'lucide-react';
import { Folder as FolderType } from '../types';
import toast from 'react-hot-toast';

interface SidebarProps {
    folders: FolderType[];
    selectedFolder: string | null;
    onFolderSelect: (folderId: string) => void;
    onFolderCreate: (name: string) => Promise<any>;
    onFolderDelete: (folderId: string) => Promise<any>;
}

export const Sidebar: React.FC<SidebarProps> = ({
    folders,
    selectedFolder,
    onFolderSelect,
    onFolderCreate,
    onFolderDelete,
}) => {
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            toast.error('Please enter a folder name');
            return;
        }

        const response = await onFolderCreate(newFolderName.trim());
        if (response.success) {
            toast.success('Folder created successfully!');
            setNewFolderName('');
            setIsCreatingFolder(false);
        } else {
            toast.error(response.error || 'Failed to create folder');
        }
    };

    const handleDeleteFolder = async (folderId: string, folderName: string) => {
        if (window.confirm(`Are you sure you want to delete the folder "${folderName}"?`)) {
            const response = await onFolderDelete(folderId);
            if (response.success) {
                toast.success('Folder deleted successfully!');
            } else {
                toast.error(response.error || 'Failed to delete folder');
            }
        }
    };

    return (
        <aside className="w-80 bg-gradient-to-b from-gray-800 to-gray-900 border-r border-dnd-brown-600 flex flex-col">
            <div className="p-4 border-b border-dnd-brown-600">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-dnd-gold-400 medieval-text">
                        Collections
                    </h2>
                    <button
                        onClick={() => setIsCreatingFolder(true)}
                        className="dnd-button-secondary p-2"
                        title="Create new folder"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                {isCreatingFolder && (
                    <div className="space-y-2 animate-slide-up">
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Folder name..."
                            className="dnd-input w-full"
                            autoFocus
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleCreateFolder();
                                if (e.key === 'Escape') {
                                    setIsCreatingFolder(false);
                                    setNewFolderName('');
                                }
                            }}
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleCreateFolder}
                                className="dnd-button flex-1 text-sm"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => {
                                    setIsCreatingFolder(false);
                                    setNewFolderName('');
                                }}
                                className="dnd-button-secondary flex-1 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto dnd-scrollbar">
                {folders.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                        <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No folders yet</p>
                        <p className="text-sm">Create your first collection!</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {folders.map((folder) => (
                            <div
                                key={folder.id}
                                className={`group relative rounded-lg border transition-all duration-200 ${selectedFolder === folder.id
                                    ? 'bg-dnd-brown-700 border-dnd-gold-500 shadow-lg shadow-dnd-gold-500/20'
                                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-dnd-brown-500'
                                    }`}
                            >
                                <button
                                    onClick={() => onFolderSelect(folder.id)}
                                    className="w-full p-3 text-left flex items-center space-x-3"
                                >
                                    {selectedFolder === folder.id ? (
                                        <FolderOpen className="h-5 w-5 text-dnd-gold-400 flex-shrink-0" />
                                    ) : (
                                        <Folder className="h-5 w-5 text-dnd-brown-300 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white truncate">
                                            {folder.name}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {folder.imageCount} {folder.imageCount === 1 ? 'image' : 'images'}
                                        </p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleDeleteFolder(folder.id, folder.name)}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 
                           opacity-0 group-hover:opacity-100 transition-opacity
                           p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    title="Delete folder"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
};
