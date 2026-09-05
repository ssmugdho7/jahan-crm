import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
            </defs>
            <rect width="40" height="40" rx="8" fill="white"/>
            <path d="M10 8 L10 28 Q10 32 14 32" stroke="url(#navyGrad)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M22 12 Q16 12 14 16 L14 26 Q16 30 22 30" stroke="url(#blueGrad)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <rect x="17" y="20" width="2" height="6" fill="url(#blueGrad)" rx="0.5"/>
            <rect x="20" y="17" width="2" height="9" fill="url(#blueGrad)" rx="0.5"/>
            <rect x="23" y="14" width="2" height="12" fill="url(#blueGrad)" rx="0.5"/>
        </svg>
    );
}
