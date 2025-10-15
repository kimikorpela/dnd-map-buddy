import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { loadImages, addImage, deleteImage, updateFolderImageCount } from '../utils/storage';
import { ApiResponse, Image } from '../types';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Get all images
router.get('/', async (req, res) => {
    try {
        const images = await loadImages();
        const response: ApiResponse<Image[]> = {
            success: true,
            data: images
        };
        res.json(response);
    } catch (error) {
        const response: ApiResponse<null> = {
            success: false,
            error: 'Failed to load images'
        };
        res.status(500).json(response);
    }
});

// Get images by folder
router.get('/folder/:folderId', async (req, res) => {
    try {
        const { folderId } = req.params;
        const images = await loadImages();
        const folderImages = images.filter(img => img.folderId === folderId);

        const response: ApiResponse<Image[]> = {
            success: true,
            data: folderImages
        };
        res.json(response);
    } catch (error) {
        const response: ApiResponse<null> = {
            success: false,
            error: 'Failed to load folder images'
        };
        res.status(500).json(response);
    }
});

// Upload image
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            const response: ApiResponse<null> = {
                success: false,
                error: 'No image file provided'
            };
            return res.status(400).json(response);
        }

        const { folderId } = req.body;
        if (!folderId) {
            const response: ApiResponse<null> = {
                success: false,
                error: 'Folder ID is required'
            };
            return res.status(400).json(response);
        }

        const imageData = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            folderId,
            size: req.file.size,
            mimeType: req.file.mimetype
        };

        const newImage = await addImage(imageData);
        await updateFolderImageCount(folderId);

        const response: ApiResponse<Image> = {
            success: true,
            data: newImage
        };
        res.status(201).json(response);
    } catch (error) {
        const response: ApiResponse<null> = {
            success: false,
            error: 'Failed to upload image'
        };
        res.status(500).json(response);
    }
});

// Delete image
router.delete('/:imageId', async (req, res) => {
    try {
        const { imageId } = req.params;
        const success = await deleteImage(imageId);

        if (success) {
            const response: ApiResponse<null> = {
                success: true
            };
            res.json(response);
        } else {
            const response: ApiResponse<null> = {
                success: false,
                error: 'Image not found'
            };
            res.status(404).json(response);
        }
    } catch (error) {
        const response: ApiResponse<null> = {
            success: false,
            error: 'Failed to delete image'
        };
        res.status(500).json(response);
    }
});

export { router as imageRoutes };
