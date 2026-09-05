import { Head, router, useForm } from '@inertiajs/react';
import { MapPin, Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight, Search, ZoomIn, ZoomOut, RotateCcw, Wand2, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import HeroBackground from '@/components/hero-background';

type LocationDeliveryCharge = {
    id: number;
    location_name: string;
    delivery_charge_kwd: number;
    is_active: boolean;
};

const kuwaitCities = [
    { name: 'Kuwait City', x: 520, y: 120, governorate: 'Al Asimah' },
    { name: 'Hawalli', x: 580, y: 180, governorate: 'Hawalli' },
    { name: 'Salmiya', x: 640, y: 200, governorate: 'Hawalli' },
    { name: 'Jabriya', x: 590, y: 220, governorate: 'Hawalli' },
    { name: 'Bayan', x: 610, y: 230, governorate: 'Hawalli' },
    { name: 'Mishref', x: 600, y: 210, governorate: 'Hawalli' },
    { name: 'Rumaithiya', x: 570, y: 200, governorate: 'Hawalli' },
    { name: 'Salwa', x: 620, y: 215, governorate: 'Hawalli' },
    { name: 'Shaab', x: 555, y: 190, governorate: 'Hawalli' },
    { name: 'Bneid Al Qar', x: 530, y: 145, governorate: 'Al Asimah' },
    { name: 'Kaifan', x: 510, y: 150, governorate: 'Al Asimah' },
    { name: 'Adailiya', x: 500, y: 160, governorate: 'Al Asimah' },
    { name: 'Khalidiya', x: 490, y: 155, governorate: 'Al Asimah' },
    { name: 'Al Asimah', x: 515, y: 135, governorate: 'Al Asimah' },
    { name: 'Al Daiya', x: 505, y: 145, governorate: 'Al Asimah' },
    { name: 'Surra', x: 480, y: 170, governorate: 'Al Asimah' },
    { name: 'Al Naeem', x: 470, y: 165, governorate: 'Al Asimah' },
    { name: 'Al Bedae', x: 495, y: 155, governorate: 'Al Asimah' },
    { name: 'Al Sadiq', x: 500, y: 150, governorate: 'Al Asimah' },
    { name: 'Al Shahed', x: 560, y: 195, governorate: 'Hawalli' },
    { name: 'Al Zuhoor', x: 630, y: 210, governorate: 'Hawalli' },
    { name: 'Al Firdaws', x: 615, y: 220, governorate: 'Hawalli' },
    { name: 'Al Qadesiya', x: 545, y: 185, governorate: 'Hawalli' },
    { name: 'Al Andalus', x: 535, y: 175, governorate: 'Al Asimah' },
    { name: 'Al Franklin', x: 540, y: 180, governorate: 'Al Asimah' },
    { name: 'Bab Al Bahr', x: 525, y: 130, governorate: 'Al Asimah' },
    { name: 'Green Island', x: 570, y: 130, governorate: 'Hawalli' },
    { name: 'Kuwait Towers', x: 545, y: 125, governorate: 'Al Asimah' },
    { name: 'Al Jahra', x: 350, y: 100, governorate: 'Al Jahra' },
    { name: 'Qairawan', x: 280, y: 80, governorate: 'Al Jahra' },
    { name: 'Abdali', x: 200, y: 60, governorate: 'Al Jahra' },
    { name: 'Nuweiba', x: 300, y: 110, governorate: 'Al Jahra' },
    { name: 'Saad Al Abdullah', x: 320, y: 90, governorate: 'Al Jahra' },
    { name: 'Taima', x: 260, y: 75, governorate: 'Al Jahra' },
    { name: 'Kayfan', x: 230, y: 65, governorate: 'Al Jahra' },
    { name: 'Al Funaitis', x: 310, y: 95, governorate: 'Al Jahra' },
    { name: 'Al Sulaibiya', x: 380, y: 120, governorate: 'Al Jahra' },
    { name: 'Al Jleeb Al Shuyoukh', x: 420, y: 140, governorate: 'Al Farwaniyah' },
    { name: 'Al Farwaniyah', x: 440, y: 160, governorate: 'Al Farwaniyah' },
    { name: 'Eqaila', x: 390, y: 130, governorate: 'Al Jahra' },
    { name: 'Farwaniya', x: 450, y: 170, governorate: 'Al Farwaniyah' },
    { name: 'Al Ahmadi', x: 520, y: 320, governorate: 'Al Ahmadi' },
    { name: 'Mangaf', x: 580, y: 350, governorate: 'Al Ahmadi' },
    { name: 'Fahaheel', x: 600, y: 370, governorate: 'Al Ahmadi' },
    { name: 'Sabah Al Ahmad', x: 560, y: 400, governorate: 'Al Ahmadi' },
    { name: 'Al Wafra', x: 550, y: 450, governorate: 'Al Ahmadi' },
    { name: 'Al Khiran', x: 620, y: 420, governorate: 'Al Ahmadi' },
    { name: 'Al Zour', x: 600, y: 440, governorate: 'Al Ahmadi' },
    { name: 'Al Mahbulah', x: 590, y: 360, governorate: 'Al Ahmadi' },
    { name: 'Al Oyoon', x: 570, y: 340, governorate: 'Al Ahmadi' },
    { name: 'Al Kout', x: 610, y: 380, governorate: 'Al Ahmadi' },
    { name: 'Daher', x: 510, y: 250, governorate: 'Al Ahmadi' },
    { name: 'Zahra', x: 480, y: 240, governorate: 'Hawalli' },
    { name: 'Subaysiyah', x: 420, y: 300, governorate: 'Al Ahmadi' },
    { name: 'Al Nuwaiseeb', x: 640, y: 460, governorate: 'Al Ahmadi' },
    { name: 'Fnaitees', x: 660, y: 470, governorate: 'Al Ahmadi' },
    { name: 'Messila', x: 670, y: 430, governorate: 'Al Ahmadi' },
    { name: 'Adan', x: 650, y: 440, governorate: 'Al Ahmadi' },
    { name: 'Al Adami', x: 580, y: 310, governorate: 'Al Ahmadi' },
    { name: 'Mina Alzour', x: 630, y: 410, governorate: 'Al Ahmadi' },
    { name: 'Firdous', x: 360, y: 220, governorate: 'Al Farwaniyah' },
    { name: 'Ardiya', x: 380, y: 230, governorate: 'Al Farwaniyah' },
    { name: 'Sabah Al Nasser', x: 350, y: 250, governorate: 'Al Farwaniyah' },
    { name: 'Abdullah Al Mubarak', x: 370, y: 270, governorate: 'Al Farwaniyah' },
    { name: 'Al Sabah', x: 390, y: 260, governorate: 'Al Farwaniyah' },
    { name: 'Granada', x: 340, y: 210, governorate: 'Al Jahra' },
    { name: 'Al Hishan', x: 300, y: 180, governorate: 'Al Jahra' },
    { name: 'Shuwaikh Port', x: 460, y: 130, governorate: 'Al Asimah' },
    { name: 'Al Rai', x: 470, y: 145, governorate: 'Al Asimah' },
    { name: 'Al Naseem', x: 550, y: 200, governorate: 'Hawalli' },
    { name: 'Al Salam', x: 620, y: 195, governorate: 'Hawalli' },
    { name: 'Al Reem', x: 600, y: 190, governorate: 'Hawalli' },
    { name: 'Al Yasmin', x: 585, y: 195, governorate: 'Hawalli' },
    { name: 'Al Ghous', x: 575, y: 185, governorate: 'Hawalli' },
    { name: 'Al Fatih', x: 565, y: 175, governorate: 'Al Asimah' },
    { name: 'Al Ommiya', x: 555, y: 165, governorate: 'Al Asimah' },
    { name: 'Al Qadisiya', x: 545, y: 155, governorate: 'Al Asimah' },
    { name: 'Al Ujra', x: 535, y: 145, governorate: 'Al Asimah' },
    { name: 'Al Wista', x: 525, y: 140, governorate: 'Al Asimah' },
    { name: 'Al Manakh', x: 515, y: 135, governorate: 'Al Asimah' },
    { name: 'Al Qibla', x: 505, y: 130, governorate: 'Al Asimah' },
    { name: 'Al Sharq', x: 495, y: 125, governorate: 'Al Asimah' },
    { name: 'Al Gharb', x: 485, y: 120, governorate: 'Al Asimah' },
    { name: 'Al Janoub', x: 475, y: 115, governorate: 'Al Asimah' },
    { name: 'Al Shamal', x: 465, y: 110, governorate: 'Al Asimah' },
    { name: 'Al Awsat', x: 455, y: 105, governorate: 'Al Asimah' },
];

export default function LocationDeliveryChargesPage({ locations }: { locations: LocationDeliveryCharge[] }) {
    const [showForm, setShowForm] = useState(false);
    const [editingLocation, setEditingLocation] = useState<LocationDeliveryCharge | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<typeof kuwaitCities>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [hoveredCity, setHoveredCity] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [aiInput, setAiInput] = useState('');
    const mainRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, put, processing, reset } = useForm({
        location_name: '',
        delivery_charge_kwd: '',
    });

    useEffect(() => {
        if (mainRef.current) {
            gsap.fromTo(
                mainRef.current.children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
            );
        }
    }, []);

    useEffect(() => {
        if (listRef.current) {
            const items = listRef.current.querySelectorAll('.location-item');
            gsap.fromTo(
                items,
                { opacity: 0, x: -10 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' },
            );
        }
    }, [locations]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearch(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleZoomIn = useCallback(() => {
        setZoom((prev) => Math.min(prev + 0.25, 3));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom((prev) => Math.max(prev - 0.25, 0.5));
    }, []);

    const handleResetView = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            setZoom((prev) => Math.min(prev + 0.1, 3));
        } else {
            setZoom((prev) => Math.max(prev - 0.1, 0.5));
        }
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 0) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    }, [pan]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }
        const results = kuwaitCities.filter((city) =>
            city.name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(results);
    };

    const translateBengaliToEnglish = (text: string): string => {
        const bengaliNumbers: Record<string, string> = {
            '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
            '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
        };

        const bengaliToEnglishMap: Record<string, string> = {
            'এলাকা': 'Location', 'লোকেশন': 'Location', 'শহর': 'City', 'এলাকার': 'Area',
            'ঠিকানা': 'Address', 'থেকে': 'From', 'পর্যন্ত': 'To',
            'ডেলিভারি': 'Delivery', 'চার্জ': 'Charge', 'ফি': 'Fee',
            'খরচ': 'Cost', 'মূল্য': 'Price', 'পরিমাণ': 'Amount',
            'কেজেড': 'KWD', 'কেডি': 'KD', 'দিনার': 'KWD',
            'হাওলি': 'Hawalli', 'হাওলি': 'Hawalli',
            'সালমিয়া': 'Salmiya', 'সালমিয়াহ': 'Salmiya',
            'কুয়েত সিটি': 'Kuwait City', 'কুয়েত': 'Kuwait',
            'জাহরা': 'Al Jahra', 'জাহরা': 'Al Jahra',
            'ফারওয়ানিয়া': 'Al Farwaniyah', 'ফারোয়ানিয়া': 'Al Farwaniyah',
            'আহমাদি': 'Al Ahmadi', 'আহমেদি': 'Al Ahmadi',
            'মঙ্গফ': 'Mangaf', 'মাঙ্গফ': 'Mangaf',
            'ফাহাইল': 'Fahaheel', 'ফাহিল': 'Fahaheel',
            'সাবাহ আল আহমাদ': 'Sabah Al Ahmad',
            'আল ওয়াফরা': 'Al Wafra', 'ওয়াফরা': 'Al Wafra',
            'আল খিরান': 'Al Khiran', 'খিরান': 'Al Khiran',
            'আল যুর': 'Al Zour', 'যুর': 'Al Zour',
            'মিশরেফ': 'Mishref', 'বায়ান': 'Bayan',
            'জাবরিয়া': 'Jabriya', 'রুমাইথিয়া': 'Rumaithiya',
            'সালওয়া': 'Salwa', 'শাব': 'Shaab',
            'কাইফান': 'Kaifan', 'আদাইলিয়া': 'Adailiya',
            'খালিদিয়া': 'Khalidiya', 'সুররা': 'Surra',
            'নুয়েবা': 'Nuweiba', 'তাইমা': 'Taima',
            'কায়ফান': 'Kayfan', 'গ্রানাডা': 'Granada',
            'ফিরদৌস': 'Firdous', 'আরদিয়া': 'Ardiya',
            'জাহরা': 'Jahra', 'মাহবুলাহ': 'Al Mahbulah',
            'ফাহিতিল': 'Fahaheel', 'আদান': 'Adan',
            'মেসিলা': 'Messila', 'ফনাইতিস': 'Fnaitees',
        };

        let translated = text;

        for (const [bengali, english] of Object.entries(bengaliNumbers)) {
            translated = translated.split(bengali).join(english);
        }

        for (const [bengali, english] of Object.entries(bengaliToEnglishMap)) {
            translated = translated.split(bengali).join(english);
        }

        return translated;
    };

    const parseAndFill = (text: string) => {
        const translated = translateBengaliToEnglish(text);
        const locationMatch = translated.match(/(?:Location|City|Area|Place|Address|From|To)\s*[:#]?\s*(.+)/i);
        if (locationMatch) {
            setData('location_name', locationMatch[1].trim());
        } else {
            const lines = translated.split('\n').filter((l) => l.trim());
            if (lines.length > 0) {
                const firstLine = lines[0].trim();
                const cityMatch = firstLine.match(/^([A-Za-z\s]+?)(?:\s*[-–:]\s*|\s+$)/);
                if (cityMatch) {
                    setData('location_name', cityMatch[1].trim());
                } else if (kuwaitCities.some((c) => firstLine.toLowerCase().includes(c.name.toLowerCase()))) {
                    const matchedCity = kuwaitCities.find((c) => firstLine.toLowerCase().includes(c.name.toLowerCase()));
                    if (matchedCity) setData('location_name', matchedCity.name);
                } else {
                    setData('location_name', firstLine);
                }
            }
        }

        const chargeMatch = text.match(/(?:Charge|Delivery|Fee|Cost|Price|Amount|KWD|KD)\s*[:#]?\s*([\d.,]+)/i);
        if (chargeMatch) {
            setData('delivery_charge_kwd', chargeMatch[1].replace(/,/g, ''));
        } else {
            const kwdMatch = text.match(/([\d.,]+)\s*(?:KWD|KD)/i);
            if (kwdMatch) {
                setData('delivery_charge_kwd', kwdMatch[1].replace(/,/g, ''));
            }
        }
    };

    const handleAiAutofill = () => {
        parseAndFill(aiInput);
    };

    const parseMultipleLocations = (text: string): Array<{ location_name: string; delivery_charge_kwd: number }> => {
        const translated = translateBengaliToEnglish(text);
        const lines = translated.split('\n').filter((l) => l.trim());
        const results: Array<{ location_name: string; delivery_charge_kwd: number }> = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            let locationName = '';
            let charge = 0;

            const dashMatch = trimmed.match(/^(.+?)\s*[-–]\s*(?:KWD|KD)?\s*([\d.,]+)/i);
            if (dashMatch) {
                locationName = dashMatch[1].trim();
                charge = parseFloat(dashMatch[2].replace(/,/g, '')) || 0;
            } else {
                const colonMatch = trimmed.match(/^(.+?)\s*[:#]\s*(?:KWD|KD)?\s*([\d.,]+)/i);
                if (colonMatch) {
                    locationName = colonMatch[1].trim();
                    charge = parseFloat(colonMatch[2].replace(/,/g, '')) || 0;
                } else {
                    const kwdMatch = trimmed.match(/^(.+?)\s+(?:KWD|KD)\s*([\d.,]+)/i);
                    if (kwdMatch) {
                        locationName = kwdMatch[1].trim();
                        charge = parseFloat(kwdMatch[2].replace(/,/g, '')) || 0;
                    }
                }
            }

            if (locationName && charge > 0) {
                results.push({ location_name: locationName, delivery_charge_kwd: charge });
            }
        }

        return results;
    };

    const handleBulkSave = () => {
        const locations = parseMultipleLocations(aiInput);
        if (locations.length === 0) {
            alert('No valid locations found. Please use format: Location - KWD 2.000');
            return;
        }

        post('/location-delivery-charges/bulk', {
            data: { locations },
            preserveScroll: true,
            onSuccess: () => {
                setAiInput('');
                setShowForm(false);
            },
        });
    };

    const handleCityClick = (cityName: string) => {
        setSelectedCity(cityName);
        const existing = locations.find(
            (l) => l.location_name.toLowerCase() === cityName.toLowerCase()
        );
        if (existing) {
            handleEdit(existing);
            setShowForm(true);
        } else {
            setData('location_name', cityName);
            setData('delivery_charge_kwd', '');
            setEditingLocation(null);
            setShowForm(true);
        }
        setShowSearch(false);
        setSearchQuery('');
    };

    const getCityLocation = (cityName: string) => {
        return locations.find(
            (l) => l.location_name.toLowerCase() === cityName.toLowerCase()
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/location-delivery-charges', {
            data,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const handleEdit = (location: LocationDeliveryCharge) => {
        setEditingLocation(location);
        setData({
            location_name: location.location_name,
            delivery_charge_kwd: location.delivery_charge_kwd.toString(),
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLocation) return;
        put(`/location-delivery-charges/${editingLocation.id}`, {
            data,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setEditingLocation(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this location?')) {
            router.delete(`/location-delivery-charges/${id}`, { preserveScroll: true });
        }
    };

    const handleToggleActive = (location: LocationDeliveryCharge) => {
        put(`/location-delivery-charges/${location.id}`, {
            data: { ...location, is_active: !location.is_active, delivery_charge_kwd: location.delivery_charge_kwd },
            preserveScroll: true,
        });
    };

    const moneyKwd = (value: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
        }).format(value);

    return (
        <>
            <Head title="Location Delivery Charges" />

            <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-7" ref={mainRef}>
                <section className="relative isolate flex flex-col justify-between gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/50 md:flex-row md:items-center">
                    <HeroBackground />
                    <div>
                        <h1 className="text-2xl font-bold">Location Delivery Charges</h1>
                        <p className="mt-1 text-sm text-slate-400">Manage delivery charges for different locations</p>
                    </div>
                    <button
                        onClick={() => { reset(); setShowForm(true); setEditingLocation(null); }}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-500"
                    >
                        <Plus size={18} /> Add Location
                    </button>
                </section>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-semibold">
                                <MapPin size={20} className="text-teal-400" />
                                Kuwait Map
                            </h2>
                            <div ref={searchRef} className="relative">
                                <button
                                    onClick={() => setShowSearch(!showSearch)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-400 hover:to-pink-400"
                                >
                                    <Search size={16} /> Map Search
                                </button>
                                {showSearch && (
                                    <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            placeholder="Search city name..."
                                            className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-purple-500"
                                            autoFocus
                                        />
                                        <div className="max-h-60 overflow-y-auto">
                                            {searchResults.length > 0 ? (
                                                searchResults.map((city) => {
                                                    const loc = getCityLocation(city.name);
                                                    return (
                                                        <button
                                                            key={city.name}
                                                            onClick={() => handleCityClick(city.name)}
                                                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-800"
                                                        >
                                                            <div>
                                                                <span className="text-sm text-white">{city.name}</span>
                                                                <span className="ml-2 text-xs text-slate-500">{city.governorate}</span>
                                                            </div>
                                                            {loc ? (
                                                                <span className="text-xs text-teal-400">KWD {moneyKwd(loc.delivery_charge_kwd)}</span>
                                                            ) : (
                                                                <span className="text-xs text-slate-500">Not set</span>
                                                            )}
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <p className="py-2 text-center text-sm text-slate-500">
                                                    {searchQuery ? 'No cities found' : 'Type to search cities'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-xl bg-[#e8f0e5] p-0">
                            <div
                                ref={mapRef}
                                className="relative h-[400px] overflow-hidden cursor-grab active:cursor-grabbing"
                                onWheel={handleWheel}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                <svg
                                    viewBox="0 0 800 550"
                                    className="h-full w-full"
                                    style={{
                                        transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                                        transformOrigin: 'center center',
                                    }}
                                >
                                    <defs>
                                        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#a8d5e2" />
                                            <stop offset="100%" stopColor="#87ceeb" />
                                        </linearGradient>
                                        <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#f5f5dc" />
                                            <stop offset="100%" stopColor="#e8e4d4" />
                                        </linearGradient>
                                    </defs>

                                    <rect x="0" y="0" width="800" height="550" fill="url(#waterGradient)" />

                                    <path
                                        d="M150,50 L200,30 L300,20 L400,25 L500,40 L600,60 L700,90 L750,130 L770,180 L780,240 L770,300 L740,360 L700,400 L650,440 L600,470 L550,490 L500,500 L450,505 L400,500 L350,485 L300,460 L250,425 L200,380 L160,330 L130,270 L110,200 L120,140 L140,90 Z"
                                        fill="url(#landGradient)"
                                        stroke="#d4c9a8"
                                        strokeWidth="2"
                                    />

                                    <path
                                        d="M550,100 Q580,95 620,105 Q660,120 680,150 Q690,180 680,210 Q660,240 630,250 Q600,255 570,245 Q540,230 530,200 Q525,170 535,140 Q545,115 550,100 Z"
                                        fill="#87ceeb"
                                        stroke="#5fa8d3"
                                        strokeWidth="1"
                                    />

                                    <path d="M200,180 L350,180 L350,200 L200,200 Z" fill="#ccc" stroke="#999" strokeWidth="0.5" />
                                    <path d="M350,180 L500,180 L500,195 L350,195 Z" fill="#ccc" stroke="#999" strokeWidth="0.5" />
                                    <path d="M500,180 L650,180 L650,190 L500,190 Z" fill="#ccc" stroke="#999" strokeWidth="0.5" />
                                    <path d="M300,200 L300,400 L305,400 L305,200 Z" fill="#ccc" stroke="#999" strokeWidth="0.5" />
                                    <path d="M450,180 L450,350 L455,350 L455,180 Z" fill="#ccc" stroke="#999" strokeWidth="0.5" />
                                    <path d="M580,180 L580,300 L585,300 L585,180 Z" fill="#ccc" stroke="#999" strokeWidth="0.5" />
                                    <path d="M350,280 L550,280 L550,285 L350,285 Z" fill="#ccc" stroke="#999" strokeWidth="0.5" />
                                    <path d="M400,350 L600,350 L600,355 L400,355 Z" fill="#ccc" stroke="#999" strokeWidth="0.5" />
                                    <path d="M500,400 L700,400 L700,405 L500,405 Z" fill="#ccc" stroke="#999" strokeWidth="0.5" />

                                    <path d="M250,250 L250,450" stroke="#b8860b" strokeWidth="3" strokeDasharray="8,4" fill="none" />
                                    <path d="M150,350 L750,350" stroke="#b8860b" strokeWidth="3" strokeDasharray="8,4" fill="none" />

                                    <g transform="translate(420,160)">
                                        <rect x="0" y="0" width="80" height="50" fill="#fff" stroke="#ccc" rx="2" />
                                        <text x="40" y="20" textAnchor="middle" fontSize="8" fill="#333" fontWeight="bold">Kuwait</text>
                                        <text x="40" y="35" textAnchor="middle" fontSize="6" fill="#666">International</text>
                                        <text x="40" y="45" textAnchor="middle" fontSize="6" fill="#666">Airport</text>
                                    </g>

                                    {kuwaitCities.map((city) => {
                                        const loc = getCityLocation(city.name);
                                        const isHovered = hoveredCity === city.name;
                                        const isSelected = selectedCity === city.name;
                                        const showLabel = isHovered || isSelected || loc;

                                        return (
                                            <g
                                                key={city.name}
                                                onMouseEnter={() => setHoveredCity(city.name)}
                                                onMouseLeave={() => setHoveredCity(null)}
                                                onClick={() => handleCityClick(city.name)}
                                                className="cursor-pointer"
                                            >
                                                <circle
                                                    cx={city.x}
                                                    cy={city.y}
                                                    r={isHovered ? 10 : loc ? 8 : 5}
                                                    fill={loc ? (loc.is_active ? '#14b8a6' : '#94a3b8') : '#64748b'}
                                                    stroke={isHovered || isSelected ? '#ffffff' : '#ffffff'}
                                                    strokeWidth={isHovered || isSelected ? 3 : loc ? 2 : 1}
                                                    className="transition-all duration-200"
                                                    opacity={loc ? 1 : 0.7}
                                                />
                                                {showLabel && (
                                                    <>
                                                        <rect
                                                            x={city.x - 40}
                                                            y={city.y - 30}
                                                            width="80"
                                                            height="18"
                                                            fill="rgba(0,0,0,0.8)"
                                                            rx="4"
                                                        />
                                                        <text
                                                            x={city.x}
                                                            y={city.y - 18}
                                                            textAnchor="middle"
                                                            fill="#ffffff"
                                                            fontSize="9"
                                                            fontWeight="bold"
                                                            className="pointer-events-none"
                                                        >
                                                            {city.name}
                                                        </text>
                                                        {loc && (
                                                            <>
                                                                <rect
                                                                    x={city.x - 35}
                                                                    y={city.y - 10}
                                                                    width="70"
                                                                    height="14"
                                                                    fill="rgba(20,184,166,0.9)"
                                                                    rx="3"
                                                                />
                                                                <text
                                                                    x={city.x}
                                                                    y={city.y}
                                                                    textAnchor="middle"
                                                                    fill="#ffffff"
                                                                    fontSize="8"
                                                                    className="pointer-events-none"
                                                                >
                                                                    KWD {moneyKwd(loc.delivery_charge_kwd)}
                                                                </text>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>

                            <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                                <button
                                    onClick={handleZoomIn}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-lg transition-colors hover:bg-slate-100"
                                    title="Zoom In"
                                >
                                    <ZoomIn size={16} className="text-slate-700" />
                                </button>
                                <button
                                    onClick={handleZoomOut}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-lg transition-colors hover:bg-slate-100"
                                    title="Zoom Out"
                                >
                                    <ZoomOut size={16} className="text-slate-700" />
                                </button>
                                <button
                                    onClick={handleResetView}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-lg transition-colors hover:bg-slate-100"
                                    title="Reset View"
                                >
                                    <RotateCcw size={16} className="text-slate-700" />
                                </button>
                            </div>

                            <div className="absolute bottom-4 right-4 rounded-lg bg-white px-3 py-1.5 shadow-lg">
                                <span className="text-xs font-medium text-slate-700">Zoom: {Math.round(zoom * 100)}%</span>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-teal-500"></span> Active Location
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-slate-400"></span> Inactive Location
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-slate-600"></span> Unassigned City
                            </div>
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-semibold">
                                <MapPin size={20} className="text-teal-400" />
                                All Locations ({locations.length})
                            </h2>
                        </div>

                        <div ref={listRef} className="space-y-3">
                            {locations.map((location) => (
                                <div
                                    key={location.id}
                                    className="location-item flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 transition-all hover:border-slate-700"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{location.location_name}</h3>
                                            <p className="text-sm text-slate-400">
                                                KWD {moneyKwd(location.delivery_charge_kwd)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleActive(location)}
                                            className={`rounded-lg p-2 transition-colors ${
                                                location.is_active
                                                    ? 'text-green-400 hover:bg-green-500/20'
                                                    : 'text-slate-500 hover:bg-slate-800'
                                            }`}
                                            title={location.is_active ? 'Active' : 'Inactive'}
                                        >
                                            {location.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                        </button>
                                        <button
                                            onClick={() => { handleEdit(location); setShowForm(true); }}
                                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-500/20 hover:text-blue-400"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(location.id)}
                                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {locations.length === 0 && (
                                <div className="py-12 text-center text-slate-500">
                                    No locations added yet. Click on the map or "Add Location" to get started.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {(showForm || editingLocation) && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                {editingLocation ? 'Edit Location' : 'Add Location'}
                            </h2>
                            <button
                                onClick={() => { setShowForm(false); setEditingLocation(null); reset(); setAiInput(''); }}
                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {!editingLocation && (
                            <div className="mb-4 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <Sparkles size={16} className="text-purple-400" />
                                    <span className="text-sm font-medium text-purple-400">AI Assistant</span>
                                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-medium text-purple-400">New</span>
                                </div>
                                <p className="mb-3 text-xs text-slate-400">Paste multiple locations to save all at once (1-50)</p>
                                <textarea
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    placeholder={"Hawalli - KWD 2.000\nSalmiya - KWD 3.000\nKuwait City - KWD 1.500\nAl Jahra - KWD 2.500"}
                                    rows={5}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20"
                                />
                                <div className="mt-2 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleAiAutofill}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-400 hover:to-pink-400"
                                    >
                                        <Wand2 size={14} /> AI Autofill
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleBulkSave}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-green-500/25 transition-all hover:from-green-400 hover:to-emerald-400"
                                    >
                                        <Plus size={14} /> Save All
                                    </button>
                                    <span className="text-[10px] text-slate-500">Paste multiple lines</span>
                                </div>
                                <p className="mt-2 text-[10px] text-slate-500">Format: Location - KWD amount (one per line)</p>
                            </div>
                        )}

                        <form onSubmit={editingLocation ? handleUpdate : handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Location Name</label>
                                <input
                                    type="text"
                                    value={data.location_name}
                                    onChange={(e) => setData('location_name', e.target.value)}
                                    placeholder="e.g., Hawalli, Salmiya, Kuwait City"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-teal-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-300">Delivery Charge (KWD)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value={data.delivery_charge_kwd}
                                    onChange={(e) => setData('delivery_charge_kwd', e.target.value)}
                                    placeholder="0.000"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-teal-500"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setEditingLocation(null); reset(); setAiInput(''); }}
                                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-500 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : editingLocation ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
