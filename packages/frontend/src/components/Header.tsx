import React from 'react';
import { Dices, Map } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-dnd-brown-800 to-dnd-brown-900 border-b-2 border-dnd-gold-500 shadow-lg">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Dices className="h-8 w-8 text-dnd-gold-400" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-dnd-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-dnd-gold-400 medieval-text text-shadow">
                            D&D Map Buddy
                        </h1>
                        <p className="text-sm text-dnd-brown-200">
                            Your magical collection of maps and assets
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Map className="h-6 w-6 text-dnd-gold-400" />
                    <span className="text-dnd-gold-300 font-medium">
                        Adventure Awaits
                    </span>
                </div>
            </div>
        </header>
    );
};
