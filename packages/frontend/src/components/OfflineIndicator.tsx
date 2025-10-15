import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOffline } from '../hooks/useOffline';

export const OfflineIndicator: React.FC = () => {
    const isOffline = useOffline();

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-up">
            <WifiOff className="h-5 w-5" />
            <span className="font-medium">You're offline</span>
        </div>
    );
};
