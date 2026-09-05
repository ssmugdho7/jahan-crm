import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Package, Image as ImageIcon, X, ZoomIn } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import HeroBackground from '@/components/hero-background';

type Product = {
    id: number;
    name: string;
    price: number;
    images: string[] | null;
    description: string | null;
    created_at: string;
};

export default function ProductsPage({ products }: { products: Product[] }) {
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const mainRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        price: '',
        description: '',
        images: [] as File[],
        existing_images: [] as string[],
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
            const items = listRef.current.querySelectorAll('.product-item');
            gsap.fromTo(
                items,
                { opacity: 0, x: -10 },
                { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' },
            );
        }
    }, [products]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const remainingSlots = 10 - existingImages.length - files.length;

        if (remainingSlots < 0) {
            alert('Maximum 10 images allowed');
            return;
        }

        const validFiles = files.filter((file) => {
            if (file.size > 2 * 1024 * 1024) {
                alert(`${file.name} exceeds 2MB limit`);
                return false;
            }
            return true;
        });

        const newImages = validFiles.slice(0, 10 - existingImages.length);
        setData('images', [...data.images, ...newImages]);

        const newPreviews = newImages.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...newPreviews]);
    };

    const removeImage = (index: number, isNew: boolean) => {
        if (isNew) {
            const newImages = data.images.filter((_, i) => i !== index);
            setData('images', newImages);

            const newPreviews = imagePreviews.filter((_, i) => i !== index);
            setImagePreviews(newPreviews);
        } else {
            const newExisting = existingImages.filter((_, i) => i !== index);
            setExistingImages(newExisting);
            setData('existing_images', newExisting);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/products', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setImagePreviews([]);
                setShowForm(false);
            },
        });
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setExistingImages(product.images || []);
        setImagePreviews([]);
        setData({
            name: product.name,
            price: product.price.toString(),
            description: product.description ?? '',
            images: [],
            existing_images: product.images || [],
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingProduct) {
            return;
        }

        put(`/products/${editingProduct.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setEditingProduct(null);
                setImagePreviews([]);
                setExistingImages([]);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(`/products/${id}`, { preserveScroll: true });
        }
    };

    const formatPrice = (value: number) => {
        return `KWD ${value.toLocaleString('en-KW', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingProduct(null);
        setImagePreviews([]);
        setExistingImages([]);
        reset();
    };

    const productForm = (
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/30">
            <h2 className="mb-5 text-lg font-semibold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={editingProduct ? handleUpdate : handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Product Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g., T-Shirt"
                            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-white outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300">Price (KWD)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.001"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            placeholder="0.000"
                            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-white outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                            required
                        />
                        {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300">Description</label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Product description (optional)"
                        rows={3}
                        className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-white outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300">
                        Product Images <span className="text-slate-500">(Max 10, up to 2MB each)</span>
                    </label>
                    <div className="mt-2 flex flex-wrap gap-3">
                        {existingImages.map((img, index) => (
                            <div key={`existing-${index}`} className="group relative">
                                <img
                                    src={`/storage/${img}`}
                                    alt={`Product ${index + 1}`}
                                    className="h-24 w-24 rounded-xl border border-slate-700 object-cover shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index, false)}
                                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-red-600"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {imagePreviews.map((preview, index) => (
                            <div key={`new-${index}`} className="group relative">
                                <img
                                    src={preview}
                                    alt={`New ${index + 1}`}
                                    className="h-24 w-24 rounded-xl border border-slate-700 object-cover shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index, true)}
                                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-red-600"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        {existingImages.length + imagePreviews.length < 10 && (
                            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-600 bg-slate-950 transition-all hover:border-teal-500 hover:bg-slate-900">
                                <ImageIcon size={24} className="text-slate-400" />
                                <span className="mt-1 text-xs font-medium text-slate-400">Add Image</span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                    {errors.images && <p className="mt-2 text-xs text-red-500">{errors.images}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-2.5 font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50"
                    >
                        <Package size={18} />
                        {processing ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                    <button
                        type="button"
                        onClick={closeForm}
                        className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-2.5 font-medium text-white transition-all hover:bg-slate-700"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </section>
    );

    return (
        <>
            <Head title="Products" />
            <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-7" ref={mainRef}>
                <section className="relative isolate flex flex-col justify-between gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/50 md:flex-row md:items-center">
                    <HeroBackground />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                        <p className="mt-1 text-sm text-slate-300">
                            Manage your product catalog with images and pricing
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            closeForm();
                            setShowForm(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 font-medium text-white shadow-lg shadow-teal-500/25 transition-all hover:from-teal-400 hover:to-cyan-400 hover:shadow-teal-500/40"
                    >
                        <Plus size={18} /> Add Product
                    </button>
                </section>

                {showForm && productForm}
                {editingProduct && productForm}

                <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-lg">
                    <h2 className="mb-4 font-semibold text-slate-900">Product Catalog</h2>

                    <div ref={listRef} className="space-y-3">
                        {products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-12">
                                <Package className="mb-3 h-12 w-12 text-slate-300" />
                                <p className="text-sm font-medium text-slate-500">No products yet</p>
                                <p className="text-xs text-slate-400">Add your first product to get started</p>
                            </div>
                        ) : (
                            products.map((product) => (
                                <div
                                    key={product.id}
                                    className="product-item group flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-900 p-4 transition-all duration-300 hover:border-slate-600 hover:bg-slate-800 hover:shadow-md"
                                >
                                    <button
                                        onClick={() => product.images?.[0] && setPreviewImage(`/storage/${product.images[0]}`)}
                                        className="relative flex-shrink-0 overflow-hidden rounded-xl"
                                    >
                                        {product.images && product.images.length > 0 ? (
                                            <>
                                                <img
                                                    src={`/storage/${product.images[0]}`}
                                                    alt={product.name}
                                                    loading="lazy"
                                                    className="h-[120px] w-[120px] rounded-xl border border-slate-200 object-cover shadow-sm"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 transition-all group-hover:bg-black/40">
                                                    <ZoomIn size={24} className="text-white opacity-0 transition-opacity group-hover:opacity-100" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex h-[120px] w-[120px] items-center justify-center rounded-xl border border-slate-200 bg-slate-100">
                                                <ImageIcon size={40} className="text-slate-300" />
                                            </div>
                                        )}
                                        {product.images && product.images.length > 1 && (
                                            <span className="absolute bottom-1 right-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                                +{product.images.length - 1}
                                            </span>
                                        )}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-lg font-semibold text-slate-900">
                                                    {product.name}
                                                </h3>
                                                {product.description && (
                                                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="rounded-lg p-2 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="rounded-lg p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="mt-2 text-xl font-bold text-emerald-600">
                                            {formatPrice(product.price)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute -right-3 -top-3 rounded-full bg-white p-2 shadow-lg transition-all hover:bg-slate-100"
                        >
                            <X size={20} className="text-slate-600" />
                        </button>
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

ProductsPage.layout = {
    breadcrumbs: [{ title: 'Products', href: '/products' }],
};
