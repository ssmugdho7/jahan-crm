import { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    y?: number;
    className?: string;
}

export function FadeIn({ children, delay = 0, duration = 0.6, y = 20, className = '' }: FadeInProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            gsap.fromTo(
                ref.current,
                { opacity: 0, y },
                { opacity: 1, y: 0, duration, delay, ease: 'power3.out' }
            );
        }
    }, []);

    return (
        <div ref={ref} className={className} style={{ opacity: 0 }}>
            {children}
        </div>
    );
}

interface StaggerProps {
    children: ReactNode;
    stagger?: number;
    delay?: number;
    className?: string;
}

export function StaggerContainer({ children, stagger = 0.08, delay = 0, className = '' }: StaggerProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            const items = ref.current.children;
            if (items.length > 0) {
                gsap.fromTo(
                    items,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5, delay, stagger, ease: 'power2.out' }
                );
            }
        }
    }, []);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}

interface ScaleInProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export function ScaleIn({ children, delay = 0, duration = 0.5, className = '' }: ScaleInProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            gsap.fromTo(
                ref.current,
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration, delay, ease: 'back.out(1.2)' }
            );
        }
    }, []);

    return (
        <div ref={ref} className={className} style={{ opacity: 0 }}>
            {children}
        </div>
    );
}

interface SlideInProps {
    children: ReactNode;
    direction?: 'left' | 'right' | 'up' | 'down';
    delay?: number;
    duration?: number;
    className?: string;
}

export function SlideIn({ children, direction = 'left', delay = 0, duration = 0.6, className = '' }: SlideInProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            const fromProps: gsap.TweenVars = { opacity: 0 };
            const toProps: gsap.TweenVars = { opacity: 1, duration, delay, ease: 'power3.out' };

            switch (direction) {
                case 'left':
                    fromProps.x = -30;
                    toProps.x = 0;
                    break;
                case 'right':
                    fromProps.x = 30;
                    toProps.x = 0;
                    break;
                case 'up':
                    fromProps.y = 30;
                    toProps.y = 0;
                    break;
                case 'down':
                    fromProps.y = -30;
                    toProps.y = 0;
                    break;
            }

            gsap.fromTo(ref.current, fromProps, toProps);
        }
    }, []);

    return (
        <div ref={ref} className={className} style={{ opacity: 0 }}>
            {children}
        </div>
    );
}
