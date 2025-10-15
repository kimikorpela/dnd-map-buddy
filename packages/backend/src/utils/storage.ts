import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Image, Folder } from '../types';

const DATA_DIR = path.join(__dirname, '../../data');
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const IMAGES_FILE = path.join(DATA_DIR, 'images.json');
const FOLDERS_FILE = path.join(DATA_DIR, 'folders.json');

// Ensure directories exist
export const ensureDirectories = async () => {
    await fs.ensureDir(DATA_DIR);
    await fs.ensureDir(UPLOADS_DIR);
};

// Image storage functions
export const loadImages = async (): Promise<Image[]> => {
    try {
        await ensureDirectories();
        if (await fs.pathExists(IMAGES_FILE)) {
            const data = await fs.readJson(IMAGES_FILE);
            return data.map((img: any) => ({
                ...img,
                uploadedAt: new Date(img.uploadedAt)
            }));
        }
        return [];
    } catch (error) {
        console.error('Error loading images:', error);
        return [];
    }
};

export const saveImages = async (images: Image[]): Promise<void> => {
    try {
        await ensureDirectories();
        await fs.writeJson(IMAGES_FILE, images, { spaces: 2 });
    } catch (error) {
        console.error('Error saving images:', error);
        throw error;
    }
};

export const addImage = async (imageData: Omit<Image, 'id' | 'uploadedAt'>): Promise<Image> => {
    const images = await loadImages();
    const newImage: Image = {
        ...imageData,
        id: uuidv4(),
        uploadedAt: new Date()
    };

    images.push(newImage);
    await saveImages(images);
    return newImage;
};

export const deleteImage = async (imageId: string): Promise<boolean> => {
    const images = await loadImages();
    const imageIndex = images.findIndex(img => img.id === imageId);

    if (imageIndex === -1) return false;

    const image = images[imageIndex];
    const imagePath = path.join(UPLOADS_DIR, image.filename);

    // Delete file from filesystem
    try {
        await fs.remove(imagePath);
    } catch (error) {
        console.error('Error deleting image file:', error);
    }

    // Remove from data
    images.splice(imageIndex, 1);
    await saveImages(images);
    return true;
};

// Folder storage functions
export const loadFolders = async (): Promise<Folder[]> => {
    try {
        await ensureDirectories();
        if (await fs.pathExists(FOLDERS_FILE)) {
            const data = await fs.readJson(FOLDERS_FILE);
            return data.map((folder: any) => ({
                ...folder,
                createdAt: new Date(folder.createdAt)
            }));
        }
        return [];
    } catch (error) {
        console.error('Error loading folders:', error);
        return [];
    }
};

export const saveFolders = async (folders: Folder[]): Promise<void> => {
    try {
        await ensureDirectories();
        await fs.writeJson(FOLDERS_FILE, folders, { spaces: 2 });
    } catch (error) {
        console.error('Error saving folders:', error);
        throw error;
    }
};

export const addFolder = async (name: string): Promise<Folder> => {
    const folders = await loadFolders();
    const newFolder: Folder = {
        id: uuidv4(),
        name,
        createdAt: new Date(),
        imageCount: 0
    };

    folders.push(newFolder);
    await saveFolders(folders);
    return newFolder;
};

export const updateFolderImageCount = async (folderId: string): Promise<void> => {
    const images = await loadImages();
    const folders = await loadFolders();

    const imageCount = images.filter(img => img.folderId === folderId).length;
    const folderIndex = folders.findIndex(folder => folder.id === folderId);

    if (folderIndex !== -1) {
        folders[folderIndex].imageCount = imageCount;
        await saveFolders(folders);
    }
};
