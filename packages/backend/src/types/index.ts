export interface Image {
    id: string;
    filename: string;
    originalName: string;
    folderId: string;
    uploadedAt: Date;
    size: number;
    mimeType: string;
    prompt?: string; // AI generation prompt
}

export interface Folder {
    id: string;
    name: string;
    createdAt: Date;
    imageCount: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
