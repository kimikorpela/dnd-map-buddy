import { ApiResponse, Image, Folder } from '../types';

const API_BASE_URL = '/api';

class ApiClient {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            const data = await response.json();
            return data;
        } catch (error) {
            return {
                success: false,
                error: 'Network error occurred'
            };
        }
    }

    // Folder endpoints
    async getFolders(): Promise<ApiResponse<Folder[]>> {
        return this.request<Folder[]>('/folders');
    }

    async createFolder(name: string): Promise<ApiResponse<Folder>> {
        return this.request<Folder>('/folders', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    }

    async deleteFolder(folderId: string): Promise<ApiResponse<null>> {
        return this.request<null>(`/folders/${folderId}`, {
            method: 'DELETE',
        });
    }

    // Image endpoints
    async getImages(): Promise<ApiResponse<Image[]>> {
        return this.request<Image[]>('/images');
    }

    async getImagesByFolder(folderId: string): Promise<ApiResponse<Image[]>> {
        return this.request<Image[]>(`/images/folder/${folderId}`);
    }

    async uploadImage(
        file: File,
        folderId: string,
        onProgress?: (progress: number) => void
    ): Promise<ApiResponse<Image>> {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('folderId', folderId);

        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();

            if (onProgress) {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const progress = (event.loaded / event.total) * 100;
                        onProgress(progress);
                    }
                });
            }

            xhr.addEventListener('load', () => {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (error) {
                    resolve({
                        success: false,
                        error: 'Failed to parse response'
                    });
                }
            });

            xhr.addEventListener('error', () => {
                resolve({
                    success: false,
                    error: 'Upload failed'
                });
            });

            xhr.open('POST', `${API_BASE_URL}/images/upload`);
            xhr.send(formData);
        });
    }

    async deleteImage(imageId: string): Promise<ApiResponse<null>> {
        return this.request<null>(`/images/${imageId}`, {
            method: 'DELETE',
        });
    }

    getImageUrl(filename: string): string {
        // Backend serves static files from uploads directory at root path
        return `http://localhost:3001/${filename}`;
    }
}

export const apiClient = new ApiClient();
