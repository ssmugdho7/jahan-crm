import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun, Check } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { useState } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

type Theme = {
    id: string;
    name: string;
    description: string;
    icon: string;
    colors: {
        background: string;
        surface: string;
        primary: string;
        secondary: string;
        accent: string;
        text: string;
    };
    isDark: boolean;
};

const themes: Theme[] = [
    {
        id: 'midnight-pro',
        name: 'Midnight Pro',
        description: 'Soft blue glow with glassmorphism cards',
        icon: '🌌',
        colors: {
            background: '#0F172A',
            surface: '#1E293B',
            primary: '#3B82F6',
            secondary: '#60A5FA',
            accent: '#60A5FA',
            text: '#FFFFFF',
        },
        isDark: true,
    },
    {
        id: 'royal-indigo',
        name: 'Royal Indigo',
        description: 'Premium enterprise appearance',
        icon: '🚀',
        colors: {
            background: '#111827',
            surface: '#1F2937',
            primary: '#4338CA',
            secondary: '#6366F1',
            accent: '#818CF8',
            text: '#FFFFFF',
        },
        isDark: true,
    },
    {
        id: 'cyber-neon',
        name: 'Cyber Neon',
        description: 'Futuristic UI with neon glow effects',
        icon: '⚡',
        colors: {
            background: '#09090B',
            surface: '#18181B',
            primary: '#8B5CF6',
            secondary: '#06B6D4',
            accent: '#EC4899',
            text: '#FFFFFF',
        },
        isDark: true,
    },
    {
        id: 'emerald-business',
        name: 'Emerald Business',
        description: 'Finance and business dashboard',
        icon: '🌿',
        colors: {
            background: '#F8FAFC',
            surface: '#FFFFFF',
            primary: '#16A34A',
            secondary: '#22C55E',
            accent: '#4ADE80',
            text: '#0F172A',
        },
        isDark: false,
    },
    {
        id: 'sunset-orange',
        name: 'Sunset Orange',
        description: 'Modern startup style',
        icon: '🌅',
        colors: {
            background: '#FFFFFF',
            surface: '#FFFBEB',
            primary: '#F97316',
            secondary: '#FACC15',
            accent: '#FBBF24',
            text: '#1C1917',
        },
        isDark: false,
    },
];

const getBdtHours = (): number => {
    if (typeof window === 'undefined') {
        return 12;
    }
    const now = new Date();
    const bdtOffset = 6 * 60;
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const bdt = new Date(utc + bdtOffset * 60000);
    return bdt.getHours();
};

const isBdtAm = (): boolean => {
    const hours = getBdtHours();
    return hours >= 0 && hours < 12;
};

const applyCustomTheme = (theme: Theme): void => {
    const root = document.documentElement;
    root.style.setProperty('--custom-bg', theme.colors.background);
    root.style.setProperty('--custom-surface', theme.colors.surface);
    root.style.setProperty('--custom-primary', theme.colors.primary);
    root.style.setProperty('--custom-secondary', theme.colors.secondary);
    root.style.setProperty('--custom-accent', theme.colors.accent);
    root.style.setProperty('--custom-text', theme.colors.text);
    root.classList.add('theme-custom');
};

const removeCustomTheme = (): void => {
    document.documentElement.classList.remove('theme-custom');
};

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();
    const [selectedTheme, setSelectedTheme] = useState<string | null>(
        () => localStorage.getItem('selectedTheme') || null
    );
    const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
    const isSystemDark = !isBdtAm();

    const handleThemeSelect = (theme: Theme) => {
        setSelectedTheme(theme.id);
        localStorage.setItem('selectedTheme', theme.id);
        applyCustomTheme(theme);
    };

    const handleModeSelect = (mode: Appearance) => {
        updateAppearance(mode);
        setSelectedTheme(null);
        localStorage.removeItem('selectedTheme');
        removeCustomTheme();
    };

    const modes: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div className={cn('space-y-6', className)} {...props}>
            <div>
                <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Theme Gallery</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {themes.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => handleThemeSelect(theme)}
                            onMouseEnter={() => setHoveredTheme(theme.id)}
                            onMouseLeave={() => setHoveredTheme(null)}
                            className={cn(
                                'group relative overflow-hidden rounded-2xl p-1 transition-all duration-300',
                                selectedTheme === theme.id
                                    ? 'ring-2 ring-blue-500 scale-[1.02]'
                                    : 'hover:scale-[1.01] hover:shadow-xl',
                            )}
                        >
                            <div
                                className="relative overflow-hidden rounded-xl p-4"
                                style={{ backgroundColor: theme.colors.background }}
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{theme.icon}</span>
                                        <div className="text-left">
                                            <p className="text-sm font-bold" style={{ color: theme.colors.text }}>
                                                {theme.name}
                                            </p>
                                            <p className="text-[10px]" style={{ color: theme.colors.secondary }}>
                                                {theme.description}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedTheme === theme.id && (
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                                            <Check size={14} className="text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div
                                        className="rounded-lg p-2"
                                        style={{ backgroundColor: theme.colors.surface }}
                                    >
                                        <div className="mb-1 h-1.5 w-16 rounded" style={{ backgroundColor: theme.colors.primary }} />
                                        <div className="flex gap-1">
                                            <div className="h-1 w-8 rounded" style={{ backgroundColor: theme.colors.secondary }} />
                                            <div className="h-1 w-6 rounded" style={{ backgroundColor: theme.colors.accent }} />
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.colors.secondary }} />
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Appearance Modes</h3>
                <div className="inline-flex gap-1 rounded-xl bg-slate-200 p-1 dark:bg-slate-800">
                    {modes.map(({ value, icon: Icon, label }) => (
                        <button
                            key={value}
                            onClick={() => handleModeSelect(value)}
                            className={cn(
                                'flex items-center rounded-lg px-4 py-2 transition-all duration-200',
                                appearance === value && !selectedTheme
                                    ? 'bg-white text-slate-900 shadow-md dark:bg-slate-700 dark:text-white'
                                    : 'text-slate-600 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-slate-700/50',
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="ml-2 text-sm font-medium">{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
