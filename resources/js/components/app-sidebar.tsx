import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Calculator,
    ChevronDown,
    ChevronRight,
    Contact,
    DollarSign,
    FileText,
    History,
    LayoutDashboard,
    LogOut,
    MapPin,
    Megaphone,
    MessageCircle,
    MessageSquare,
    Package,
    Receipt,
    Settings as SettingsIcon,
    Users,
    CalendarDays,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { playLogoutSound } from '@/hooks/use-sounds';
import { dashboard, report } from '@/routes';
import { logout } from '@/routes';
import { edit as editProfile } from '@/routes/profile';
import type { Auth, NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Report',
        href: report(),
        icon: BarChart3,
    },
    {
        title: 'Smart Calendar',
        href: '/smart-calendar',
        icon: CalendarDays,
    },
];

const managementNavItems: NavItem[] = [
    {
        title: 'Contacts',
        href: '/contacts',
        icon: Users,
    },
    {
        title: 'WhatsApp Marketing',
        href: '/whatsapp-marketing',
        icon: MessageCircle,
    },
];

const toolsNavItems: NavItem[] = [
    {
        title: 'Currency',
        href: '/currency',
        icon: DollarSign,
    },
    {
        title: 'Income Statement',
        href: '/income-statement',
        icon: Receipt,
    },
    {
        title: 'Calculator',
        href: '/calculator',
        icon: Calculator,
    },
    {
        title: 'Products',
        href: '/products',
        icon: Package,
    },
    {
        title: 'Location Charges',
        href: '/location-delivery-charges',
        icon: MapPin,
    },
];

const whatsappNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/whatsapp/dashboard', icon: LayoutDashboard },
    { title: 'Campaigns', href: '/whatsapp/campaigns', icon: Megaphone },
    { title: 'Templates', href: '/whatsapp/templates', icon: FileText },
    { title: 'Audience', href: '/whatsapp/audience', icon: Users },
    { title: 'Contacts', href: '/whatsapp/contacts', icon: Contact },
    { title: 'Chat Inbox', href: '/whatsapp/chat', icon: MessageSquare },
    { title: 'Message History', href: '/whatsapp/messages', icon: History },
    { title: 'Analytics', href: '/whatsapp/analytics', icon: BarChart3 },
    { title: 'Settings', href: '/whatsapp/settings', icon: SettingsIcon },
];

export function AppSidebar() {
    const { isCurrentUrl } = useCurrentUrl();
    const { auth } = usePage<{ auth: Auth }>().props;
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        playLogoutSound();
        cleanup();
        router.flushAll();
    };

    const userName = auth?.user?.name || 'User';
    const userEmail = auth?.user?.email || '';
    const userAvatar = auth?.user?.avatar;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {managementNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Tools</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {toolsNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <div className="px-2 py-1">
                    <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-emerald-400">
                        <MessageCircle size={14} />
                        <span>WhatsApp Marketing</span>
                    </div>
                    <SidebarMenu className="gap-0.5">
                        {whatsappNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href)}
                                    tooltip={{ children: item.title }}
                                    size="sm"
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </div>
            </SidebarContent>

            <SidebarFooter>
                <SidebarSeparator />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-3 py-2">
                            {userAvatar ? (
                                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full">
                                    <img
                                        src={userAvatar}
                                        alt={userName}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-bold text-white">
                                    {userName
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate text-sm font-medium text-white">
                                    {userName}
                                </p>
                                <p className="truncate text-xs text-slate-400">
                                    {userEmail}
                                </p>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(editProfile())}
                            tooltip={{ children: 'Settings' }}
                        >
                            <Link
                                href={editProfile()}
                                prefetch
                                onClick={cleanup}
                            >
                                <SettingsIcon />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip={{ children: 'Log out' }}
                        >
                            <Link
                                href={logout()}
                                as="button"
                                onClick={handleLogout}
                                data-test="logout-button"
                            >
                                <LogOut />
                                <span>Log out</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
