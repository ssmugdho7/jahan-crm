import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function useGsapFadeIn(options?: { delay?: number; duration?: number; y?: number }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            gsap.fromTo(
                ref.current,
                {
                    opacity: 0,
                    y: options?.y ?? 20,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: options?.duration ?? 0.6,
                    delay: options?.delay ?? 0,
                    ease: 'power3.out',
                }
            );
        }
    }, []);

    return ref;
}

export function useGsapStagger(selector: string, options?: { delay?: number; stagger?: number }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            const elements = containerRef.current.querySelectorAll(selector);
            if (elements.length > 0) {
                gsap.fromTo(
                    elements,
                    {
                        opacity: 0,
                        y: 15,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        delay: options?.delay ?? 0,
                        stagger: options?.stagger ?? 0.08,
                        ease: 'power2.out',
                    }
                );
            }
        }
    }, []);

    return containerRef;
}

export function useGsapScaleIn(options?: { delay?: number; duration?: number }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            gsap.fromTo(
                ref.current,
                {
                    opacity: 0,
                    scale: 0.95,
                },
                {
                    opacity: 1,
                    scale: 1,
                    duration: options?.duration ?? 0.5,
                    delay: options?.delay ?? 0,
                    ease: 'back.out(1.2)',
                }
            );
        }
    }, []);

    return ref;
}
