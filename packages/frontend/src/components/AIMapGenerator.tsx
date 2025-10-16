import React, { useState } from 'react';
import { Wand2, X, Loader2, Save } from 'lucide-react';
import { apiClient } from '../utils/api';
import { Folder as FolderType } from '../types';

interface AIMapGeneratorProps {
    isVisible: boolean;
    onClose: () => void;
    onMapGenerated: (imageUrl: string, prompt: string) => void;
    folders: FolderType[];
    currentFolderId?: string;
}

export const AIMapGenerator: React.FC<AIMapGeneratorProps> = ({
    isVisible,
    onClose,
    onMapGenerated,
    folders,
    currentFolderId
}) => {
    const [prompt, setPrompt] = useState('');
    const [mapName, setMapName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedFolderId, setSelectedFolderId] = useState<string>(currentFolderId || '');
    const [isSaving, setIsSaving] = useState(false);

    // Enhanced D&D map prompts
    const examplePrompts = [
        "Medieval fantasy dungeon with stone walls, torches, and treasure chest, clean lines, vibrant colors",
        "Forest clearing with ancient ruins and magical crystals, sharp details, rich textures, well-lit",
        "Tavern interior with wooden tables, fireplace, and bar, cozy atmosphere, crisp edges, atmospheric lighting",
        "Mountain cave entrance with glowing runes and stalactites, mysterious lighting, professional cartography",
        "Desert oasis with palm trees and ancient temple, vibrant colors, clear visibility, game map style",
        "Underground crypt with coffins and mysterious altar, dark atmosphere, ultra detailed, no blur",
        "Castle courtyard with training grounds and weapon racks, medieval fantasy, sharp details, vibrant colors",
        "Swamp with twisted trees and glowing mushrooms, eerie atmosphere, clean lines, rich textures",
        "Volcanic lair with lava flows and obsidian formations, dramatic lighting, crisp edges, well-lit",
        "Elven tree city with bridges and platforms, fantasy architecture, ultra detailed, vibrant colors"
    ];

    const generateMap = async () => {
        if (!prompt.trim()) return;

        // Check if token is set
        const token = (import.meta as any).env?.VITE_HF_TOKEN;
        if (!token || token === 'demo') {
            setError('Please set your VITE_HF_TOKEN environment variable with your Hugging Face API token.');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setGeneratedImage(null);

        try {
            // Using Hugging Face Inference API (free tier)
            const response = await fetch(
                'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inputs: `${prompt}, fantasy map, top-down view, ultra detailed, high quality, D&D style, 16:9 aspect ratio, wide format, clean lines, vibrant colors, sharp details, no blur, crisp edges, professional cartography, clear visibility, rich textures, well-lit, atmospheric lighting, game map style`,
                        parameters: {
                            num_inference_steps: 30,
                            guidance_scale: 8.5,
                            width: 1024,
                            height: 576
                        }
                    }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setGeneratedImage(imageUrl);
        } catch (err) {
            setError(`Failed to generate map: ${err instanceof Error ? err.message : 'Unknown error'}`);
            console.error('AI generation error:', err);
        } finally {
            setIsGenerating(false);
        }
    };


    const handleSaveToFolder = async () => {
        if (!generatedImage || !selectedFolderId) return;

        setIsSaving(true);
        try {
            // Convert image to base64
            const response = await fetch(generatedImage);
            const blob = await response.blob();
            const reader = new FileReader();

            reader.onloadend = async () => {
                const base64Data = reader.result as string;

                try {
                    await apiClient.uploadGeneratedImage(
                        base64Data,
                        prompt,
                        selectedFolderId,
                        mapName.trim() || `AI Generated: ${prompt.substring(0, 30)}...`
                    );

                    // Close the generator and refresh the folder
                    onMapGenerated(generatedImage, prompt);
                    onClose();
                } catch (error) {
                    setError('Failed to save map to folder');
                    console.error('Save error:', error);
                } finally {
                    setIsSaving(false);
                }
            };

            reader.readAsDataURL(blob);
        } catch (error) {
            setError('Failed to process image for saving');
            setIsSaving(false);
        }
    };


    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <Wand2 className="h-6 w-6 mr-2 text-purple-400" />
                        AI Map Generator
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-full text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Folder Selection */}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            Save to folder:
                        </label>
                        <select
                            value={selectedFolderId}
                            onChange={(e) => setSelectedFolderId(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">Select a folder...</option>
                            {folders.map((folder) => (
                                <option key={folder.id} value={folder.id}>
                                    {folder.name} ({folder.imageCount} images)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Prompt Input */}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            Describe your D&D map:
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Medieval fantasy dungeon with stone walls, torches, and treasure chest..."
                            className="w-full h-24 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Map Name Input */}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            Map name (optional):
                        </label>
                        <input
                            type="text"
                            value={mapName}
                            onChange={(e) => setMapName(e.target.value)}
                            placeholder="e.g., Goblin Cave Entrance, Tavern of the Golden Dragon..."
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Example Prompts */}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">
                            Example prompts:
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {examplePrompts.map((example, index) => (
                                <button
                                    key={index}
                                    onClick={() => setPrompt(example)}
                                    className="text-left p-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300 hover:text-white transition-colors"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={generateMap}
                        disabled={!prompt.trim() || isGenerating}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Generating Map...
                            </>
                        ) : (
                            <>
                                <Wand2 className="h-5 w-5 mr-2" />
                                Generate Map
                            </>
                        )}
                    </button>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Generated Image */}
                    {generatedImage && (
                        <div className="space-y-4">
                            <div className="bg-gray-800 rounded-lg p-4">
                                <img
                                    src={generatedImage}
                                    alt="Generated D&D Map"
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>

                            {selectedFolderId ? (
                                <button
                                    onClick={handleSaveToFolder}
                                    disabled={isSaving}
                                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Saving to Folder...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5 mr-2" />
                                            Save to Folder
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="text-center text-gray-400 py-4">
                                    Please select a folder to save the generated map
                                </div>
                            )}
                        </div>
                    )}

                    {/* API Setup Instructions */}
                    <div className="bg-blue-900/30 border border-blue-500 text-blue-200 px-4 py-3 rounded-lg text-sm">
                        <strong>Setup Required:</strong> To use AI generation, you'll need a free Hugging Face API token.
                        <br />
                        1. Get your token from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">Hugging Face Settings</a>
                        <br />
                        2. Create a <code>.env</code> file in your project root
                        <br />
                        3. Add: <code>VITE_HF_TOKEN=your_token_here</code>
                        <br />
                        4. Restart your development server
                    </div>
                </div>
            </div>
        </div>
    );
};
