import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { Auth } from '@/types';

export default function AppLogo() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const appName = auth?.user?.app_name || 'Jahan CRM';
    const avatar = auth?.user?.avatar;

    return (
        <>
            {avatar ? (
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg shadow-lg shadow-teal-500/20">
                    <img
                        src={avatar}
                        alt={appName}
                        className="h-full w-full object-cover"
                    />
                </div>
            ) : (
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/20">
                    <AppLogoIcon className="size-5 fill-current text-white" />
                </div>
            )}
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate text-base font-bold tracking-tight text-white">
                    {appName}
                </span>
                <span className="truncate text-[10px] font-medium uppercase tracking-widest text-teal-400">
                    Customer Relations
                </span>
            </div>
        </>
    );
}
