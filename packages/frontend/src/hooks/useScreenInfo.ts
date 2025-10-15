import { useState, useEffect } from 'react';

interface ScreenInfo {
    width: number;
    height: number;
    orientation: 'portrait' | 'landscape';
    isMobile: boolean;
    pixelRatio: number;
}

export const useScreenInfo = (): ScreenInfo => {
    const [screenInfo, setScreenInfo] = useState<ScreenInfo>({
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        isMobile: window.innerWidth < 768,
        pixelRatio: window.devicePixelRatio || 1,
    });

    useEffect(() => {
        const updateScreenInfo = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            setScreenInfo({
                width,
                height,
                orientation: width > height ? 'landscape' : 'portrait',
                isMobile: width < 768,
                pixelRatio: window.devicePixelRatio || 1,
            });
        };

        // Listen for resize and orientation change events
        window.addEventListener('resize', updateScreenInfo);
        window.addEventListener('orientationchange', () => {
            // Small delay to ensure orientation change is complete
            setTimeout(updateScreenInfo, 100);
        });

        return () => {
            window.removeEventListener('resize', updateScreenInfo);
            window.removeEventListener('orientationchange', updateScreenInfo);
        };
    }, []);

    return screenInfo;
};
