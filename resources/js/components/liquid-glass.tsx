import { useState, useRef, useCallback, type ReactNode, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LiquidGlassProps {
    children: ReactNode;
    isActive?: boolean;
    className?: string;
    href?: string;
}

export default function LiquidGlass({ children, isActive = false, className }: LiquidGlassProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
    }, []);

    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    return (
        <div
            ref={containerRef}
            className={cn('liquid-glass-container', className)}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Active state - persistent subtle glass */}
            {isActive && (
                <motion.div
                    className="liquid-glass-active"
                    layoutId="sidebar-active-glass"
                    transition={{
                        type: 'spring',
                        stiffness: 280,
                        damping: 24,
                    }}
                />
            )}

            {/* Hover state - full liquid glass bubble with shared layout animation */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        className="liquid-glass-hover"
                        layoutId="sidebar-hover-glass"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                            type: 'spring',
                            stiffness: 280,
                            damping: 24,
                            mass: 0.8,
                        }}
                        style={{
                            '--mouse-x': `${mousePos.x}%`,
                            '--mouse-y': `${mousePos.y}%`,
                        } as React.CSSProperties}
                    />
                )}
            </AnimatePresence>

            {/* Specular highlight that follows mouse */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        className="liquid-glass-highlight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            '--mouse-x': `${mousePos.x}%`,
                            '--mouse-y': `${mousePos.y}%`,
                        } as React.CSSProperties}
                    />
                )}
            </AnimatePresence>

            {/* Animated glossy reflection */}
            <div className="liquid-glass-reflection" />

            {/* Content */}
            <div className="liquid-glass-content">
                {children}
            </div>
        </div>
    );
}
