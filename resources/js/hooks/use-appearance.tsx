import { useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

const listeners = new Set<() => void>();
let currentAppearance: Appearance = 'system';

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

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getStoredAppearance = (): Appearance => {
    if (typeof window === 'undefined') {
        return 'system';
    }

    return (localStorage.getItem('appearance') as Appearance) || 'system';
};

const isDarkMode = (appearance: Appearance): boolean => {
    if (appearance === 'dark') return true;
    if (appearance === 'light') return false;
    return !isBdtAm();
};

const applyTheme = (appearance: Appearance): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const isDark = isDarkMode(appearance);

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((listener) => listener());

const applyCustomTheme = (themeId: string): void => {
    if (typeof window === 'undefined') {
        return;
    }

    const themes: Record<string, { colors: Record<string, string> }> = {
        'midnight-pro': {
            colors: {
                background: '#0F172A',
                surface: '#1E293B',
                primary: '#3B82F6',
                secondary: '#60A5FA',
                accent: '#60A5FA',
                text: '#FFFFFF',
            },
        },
        'royal-indigo': {
            colors: {
                background: '#111827',
                surface: '#1F2937',
                primary: '#4338CA',
                secondary: '#6366F1',
                accent: '#818CF8',
                text: '#FFFFFF',
            },
        },
        'cyber-neon': {
            colors: {
                background: '#09090B',
                surface: '#18181B',
                primary: '#8B5CF6',
                secondary: '#06B6D4',
                accent: '#EC4899',
                text: '#FFFFFF',
            },
        },
        'emerald-business': {
            colors: {
                background: '#F8FAFC',
                surface: '#FFFFFF',
                primary: '#16A34A',
                secondary: '#22C55E',
                accent: '#4ADE80',
                text: '#0F172A',
            },
        },
        'sunset-orange': {
            colors: {
                background: '#FFFFFF',
                surface: '#FFFBEB',
                primary: '#F97316',
                secondary: '#FACC15',
                accent: '#FBBF24',
                text: '#1C1917',
            },
        },
    };

    const theme = themes[themeId];
    if (!theme) return;

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
    if (typeof document === 'undefined') {
        return;
    }
    document.documentElement.classList.remove('theme-custom');
};

export function initializeTheme(): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (!localStorage.getItem('appearance')) {
        localStorage.setItem('appearance', 'system');
        setCookie('appearance', 'system');
    }

    currentAppearance = getStoredAppearance();
    applyTheme(currentAppearance);

    // Apply saved custom theme
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        applyCustomTheme(savedTheme);
    }

    setInterval(() => {
        if (currentAppearance === 'system') {
            applyTheme(currentAppearance);
            notify();
        }
    }, 60000);
}

export function useAppearance(): UseAppearanceReturn {
    const appearance: Appearance = useSyncExternalStore(
        subscribe,
        () => currentAppearance,
        () => 'system',
    );

    const resolvedAppearance: ResolvedAppearance = isDarkMode(appearance)
        ? 'dark'
        : 'light';

    const updateAppearance = (mode: Appearance): void => {
        currentAppearance = mode;

        localStorage.setItem('appearance', mode);
        setCookie('appearance', mode);

        applyTheme(mode);
        notify();
    };

    return { appearance, resolvedAppearance, updateAppearance } as const;
}
