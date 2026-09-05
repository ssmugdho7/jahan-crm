import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const kuwaitTime = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Kuwait',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            }).format(now);
            setTime(kuwaitTime);
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div
                className="rounded-lg px-4 py-1.5 text-lg font-bold tracking-wider"
                style={{ backgroundColor: '#000000', color: '#00F0FF' }}
            >
                {time}
            </div>
        </header>
    );
}
