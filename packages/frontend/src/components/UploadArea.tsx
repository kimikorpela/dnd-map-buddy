import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadAreaProps {
    onUpload: (file: File) => Promise<any>;
    disabled?: boolean;
    className?: string;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
    onUpload,
    disabled = false,
    className = '',
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        console.log('onDrop called with files:', acceptedFiles);
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];

        // Validate file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            toast.error('File size must be less than 50MB');
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, GIF, WebP, or BMP)');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const response = await onUpload(file);
            if (response.success) {
                toast.success('Image uploaded successfully!');
                setUploadProgress(100);
            } else {
                toast.error(response.error || 'Failed to upload image');
            }
        } catch (error) {
            toast.error('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/gif': ['.gif'],
            'image/webp': ['.webp'],
            'image/bmp': ['.bmp']
        },
        maxFiles: 1,
        disabled: disabled || isUploading,
        noClick: false,
        noKeyboard: false
    });

    const handleClick = () => {
        console.log('Upload area clicked');
        if (fileInputRef.current && !disabled && !isUploading) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('File input changed:', event.target.files);
        const files = event.target.files;
        if (files && files.length > 0) {
            onDrop(Array.from(files));
        }
    };

    const hasErrors = fileRejections.length > 0;

    return (
        <div className={`relative ${className}`}>
            <div
                {...getRootProps()}
                onClick={handleClick}
                className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragActive
                        ? 'border-dnd-gold-500 bg-dnd-gold-500/10 scale-105'
                        : 'border-dnd-brown-500 hover:border-dnd-gold-500 hover:bg-dnd-gold-500/5'
                    }
          ${disabled || isUploading
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:scale-102'
                    }
          ${hasErrors ? 'border-red-500 bg-red-500/10' : ''}
        `}
            >
                <input
                    {...getInputProps()}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                    style={{ display: 'none' }}
                />

                {isUploading ? (
                    <div className="space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dnd-gold-500 mx-auto"></div>
                        <p className="text-dnd-gold-400 font-medium">Uploading...</p>
                        {uploadProgress > 0 && (
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-dnd-gold-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                ) : hasErrors ? (
                    <div className="space-y-2">
                        <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
                        <p className="text-red-400 font-medium">Invalid file</p>
                        <p className="text-sm text-gray-400">
                            {fileRejections[0]?.errors[0]?.message}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {isDragActive ? (
                            <FileImage className="h-8 w-8 text-dnd-gold-400 mx-auto animate-bounce" />
                        ) : (
                            <Upload className="h-8 w-8 text-dnd-brown-400 mx-auto" />
                        )}

                        <div>
                            <p className="text-white font-medium">
                                {isDragActive ? 'Drop your image here' : 'Upload an image'}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                Drag & drop or click to select
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Supports: JPEG, PNG, GIF, WebP, BMP (max 50MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
