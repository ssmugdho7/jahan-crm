import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { BarChart3, Users, Building2, Shield, Zap, Globe } from 'lucide-react';

export default function Welcome() {
    const heroRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (heroRef.current) {
            gsap.fromTo(
                heroRef.current.children,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
            );
        }
        if (featuresRef.current) {
            const cards = featuresRef.current.querySelectorAll('.feature-card');
            gsap.fromTo(
                cards,
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, delay: 0.4, ease: 'back.out(1.2)' }
            );
        }
    }, []);

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                {/* Navigation */}
                <nav className="flex items-center justify-between px-6 py-4 md:px-12">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600">
                            <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">Jahan CRM</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
                        >
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-400 hover:shadow-teal-500/40"
                        >
                            Get Started
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="mx-auto max-w-6xl px-6 py-20 md:py-32" ref={heroRef}>
                    <div className="text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm text-teal-400">
                            <Zap className="h-4 w-4" />
                            Modern CRM Solution
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
                            Manage Your Customer
                            <br />
                            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                                Relationships Better
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
                            Streamline your sales pipeline, track customer interactions, and close more deals
                            with Jahan CRM. The all-in-one platform for modern businesses.
                        </p>
                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-3.5 text-lg font-semibold text-white shadow-xl shadow-teal-500/30 transition-all hover:from-teal-400 hover:to-cyan-400 hover:shadow-teal-500/50"
                            >
                                Start Free Trial
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-8 py-3.5 text-lg font-semibold text-white transition-all hover:bg-slate-800"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mx-auto max-w-6xl px-6 py-20" ref={featuresRef}>
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-bold text-white">Everything You Need</h2>
                        <p className="mt-3 text-slate-400">Powerful features to grow your business</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="feature-card group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:border-teal-500/50 hover:bg-slate-900">
                            <div className="mb-4 inline-flex rounded-xl bg-blue-500/20 p-3">
                                <Users className="h-6 w-6 text-blue-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-white">Contact Management</h3>
                            <p className="text-sm text-slate-400">
                                Keep all your customer information organized and accessible in one place.
                            </p>
                        </div>
                        <div className="feature-card group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:border-teal-500/50 hover:bg-slate-900">
                            <div className="mb-4 inline-flex rounded-xl bg-violet-500/20 p-3">
                                <Building2 className="h-6 w-6 text-violet-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-white">Company Tracking</h3>
                            <p className="text-sm text-slate-400">
                                Track your business relationships and company interactions effortlessly.
                            </p>
                        </div>
                        <div className="feature-card group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:border-teal-500/50 hover:bg-slate-900">
                            <div className="mb-4 inline-flex rounded-xl bg-emerald-500/20 p-3">
                                <BarChart3 className="h-6 w-6 text-emerald-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-white">Sales Pipeline</h3>
                            <p className="text-sm text-slate-400">
                                Visualize and manage your sales process from lead to close.
                            </p>
                        </div>
                        <div className="feature-card group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:border-teal-500/50 hover:bg-slate-900">
                            <div className="mb-4 inline-flex rounded-xl bg-amber-500/20 p-3">
                                <Zap className="h-6 w-6 text-amber-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-white">Quick Actions</h3>
                            <p className="text-sm text-slate-400">
                                Create and manage contacts, deals, and tasks with lightning speed.
                            </p>
                        </div>
                        <div className="feature-card group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:border-teal-500/50 hover:bg-slate-900">
                            <div className="mb-4 inline-flex rounded-xl bg-rose-500/20 p-3">
                                <Shield className="h-6 w-6 text-rose-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-white">Secure & Reliable</h3>
                            <p className="text-sm text-slate-400">
                                Your data is protected with enterprise-grade security measures.
                            </p>
                        </div>
                        <div className="feature-card group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:border-teal-500/50 hover:bg-slate-900">
                            <div className="mb-4 inline-flex rounded-xl bg-cyan-500/20 p-3">
                                <Globe className="h-6 w-6 text-cyan-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-white">Multi-Currency</h3>
                            <p className="text-sm text-slate-400">
                                Support for multiple currencies with automatic conversion rates.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-slate-800 bg-slate-950 py-8">
                    <div className="mx-auto max-w-6xl px-6 text-center">
                        <p className="text-sm text-slate-500">
                            &copy; {new Date().getFullYear()} Jahan CRM App. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
