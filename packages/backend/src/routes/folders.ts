import { Router } from 'express';
import { loadFolders, addFolder, saveFolders, loadImages } from '../utils/storage';
import { ApiResponse, Folder } from '../types';

const router = Router();

// Get all folders
router.get('/', async (req, res) => {
    try {
        const folders = await loadFolders();
        const response: ApiResponse<Folder[]> = {
            success: true,
            data: folders
        };
        res.json(response);
    } catch (error) {
        const response: ApiResponse<null> = {
            success: false,
            error: 'Failed to load folders'
        };
        res.status(500).json(response);
    }
});

// Create new folder
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim().length === 0) {
            const response: ApiResponse<null> = {
                success: false,
                error: 'Folder name is required'
            };
            return res.status(400).json(response);
        }

        const newFolder = await addFolder(name.trim());
        const response: ApiResponse<Folder> = {
            success: true,
            data: newFolder
        };
        res.status(201).json(response);
    } catch (error) {
        const response: ApiResponse<null> = {
            success: false,
            error: 'Failed to create folder'
        };
        res.status(500).json(response);
    }
});

// Delete folder
router.delete('/:folderId', async (req, res) => {
    try {
        const { folderId } = req.params;
        const folders = await loadFolders();
        const images = await loadImages();

        // Check if folder has images
        const folderImages = images.filter(img => img.folderId === folderId);
        if (folderImages.length > 0) {
            const response: ApiResponse<null> = {
                success: false,
                error: 'Cannot delete folder with images. Please delete all images first.'
            };
            return res.status(400).json(response);
        }

        const folderIndex = folders.findIndex(folder => folder.id === folderId);
        if (folderIndex === -1) {
            const response: ApiResponse<null> = {
                success: false,
                error: 'Folder not found'
            };
            return res.status(404).json(response);
        }

        folders.splice(folderIndex, 1);
        await saveFolders(folders);

        const response: ApiResponse<null> = {
            success: true
        };
        res.json(response);
    } catch (error) {
        const response: ApiResponse<null> = {
            success: false,
            error: 'Failed to delete folder'
        };
        res.status(500).json(response);
    }
});

export { router as folderRoutes };
