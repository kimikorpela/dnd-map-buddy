export interface Image {
    id: string;
    filename: string;
    originalName: string;
    folderId: string;
    uploadedAt: string;
    size: number;
    mimeType: string;
    prompt?: string; // AI generation prompt
}

export interface Folder {
    id: string;
    name: string;
    createdAt: string;
    imageCount: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}
