import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    RefreshCcw, 
    Search,
    Network,
    Info,
    LayoutGrid,
    ArrowLeft,
    Layers,
    Activity,
    ShieldCheck,
    MoreVertical,
    Trash2,
    Edit3,
    CheckCircle2,
    XCircle,
    Package,
    PlusCircle,
    Archive,
    TrendingUp
} from 'lucide-react';
import apiClient from '../../../../services/api/apiClient';
import { ListSkeleton } from '../../../../components/feedback/Skeletons';
import { toast } from 'react-hot-toast';
import CatalogMaintenanceTools from './CatalogMaintenanceTools';

type PurchaseMode = 'plan' | 'amount';

interface IdentifierPolicy {
    label: string;
    kind: 'text' | 'phone' | 'numeric' | 'email';
    placeholder?: string;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    normalization: 'none' | 'trim' | 'lowercase' | 'uppercase' | 'digits_only';
}

interface VerificationPolicy {
    mode: 'none' | 'optional' | 'required';
    evidenceRequired: boolean;
    ttlSeconds: number;
}

interface AmountPolicy {
    min: number;
    max: number;
    step: number;
    currency: 'NGN';
}

interface Identity {
    _id: string;
    name: string;
    internalCode: string;
    categoryId?: { _id: string; name: string };
    typeId?: { _id: string; name: string; slug?: string; aliases?: string[] };
    brandId?: { _id: string; name: string };
    providerCode?: string;
    plansCount: number;
    offersCount: number;
    hasPricing: boolean;
    status: boolean;
    fulfillmentMode: string;
    purchaseMode?: PurchaseMode;
    identifierPolicy?: IdentifierPolicy;
    verificationPolicy?: VerificationPolicy;
    amountPolicy?: AmountPolicy;
    suggestedRetailPrice?: number;
    readiness: {
        hasVariants: boolean;
        hasFulfillment: boolean;
        hasPricing: boolean;
        isVisible: boolean;
    };
}

interface CreateIdentityFormData {
    name: string;
    internalCode: string;
    categoryId: string;
    typeId: string;
    brandId: string;
    providerCode: string;
    fulfillmentMode: string;
    suggestedRetailPrice: string;
    status: boolean;
    purchaseMode: PurchaseMode;
    identifierPolicy: IdentifierPolicy;
    verificationPolicy: VerificationPolicy;
    amountPolicy: Partial<Pick<AmountPolicy, 'min' | 'max'>> & Pick<AmountPolicy, 'step' | 'currency'>;
}

interface ServiceTypeMetadata {
    _id: string;
    name?: string;
    slug?: string;
    aliases?: string[];
}

interface EditIdentityData extends Omit<Identity, 'purchaseMode' | 'identifierPolicy' | 'verificationPolicy' | 'amountPolicy' | 'suggestedRetailPrice'> {
    suggestedRetailPrice: number | string;
    purchaseMode: PurchaseMode;
    identifierPolicy: IdentifierPolicy;
    verificationPolicy: VerificationPolicy;
    amountPolicy: Partial<Pick<AmountPolicy, 'min' | 'max'>> & Pick<AmountPolicy, 'step' | 'currency'>;
}

const createInitialFormData = (): CreateIdentityFormData => ({
    name: '',
    internalCode: '',
    categoryId: '',
    typeId: '',
    brandId: '',
    providerCode: '',
    fulfillmentMode: 'sync',
    suggestedRetailPrice: '',
    status: true,
    purchaseMode: 'plan',
    identifierPolicy: {
        label: '',
        kind: 'text',
        normalization: 'trim'
    },
    verificationPolicy: {
        mode: 'none',
        evidenceRequired: false,
        ttlSeconds: 300
    },
    amountPolicy: {
        step: 1,
        currency: 'NGN'
    }
});

const hasBroadbandSemantic = (type?: Pick<ServiceTypeMetadata, 'name' | 'slug' | 'aliases'>): boolean => {
    if (!type) return false;

    const values = [
        type.name,
        type.slug,
        ...(Array.isArray(type.aliases) ? type.aliases : [])
    ];

    return values.some(value => typeof value === 'string' && value.trim().toLowerCase() === 'broadband');
};

const isBroadbandServiceType = (typeId: string, types: ServiceTypeMetadata[]): boolean => {
    const selectedType = types.find(type => type._id === typeId);

    return hasBroadbandSemantic(selectedType);
};

const isBroadbandIdentity = (identity: Pick<Identity, 'typeId'> | null, types: ServiceTypeMetadata[]): boolean => Boolean(
    identity && (
        hasBroadbandSemantic(identity.typeId) ||
        isBroadbandServiceType(identity.typeId?._id || '', types)
    )
);

const createEditIdentityData = (identity: Identity): EditIdentityData => ({
    ...identity,
    suggestedRetailPrice: identity.suggestedRetailPrice ?? '',
    purchaseMode: identity.purchaseMode ?? 'plan',
    identifierPolicy: {
        label: identity.identifierPolicy?.label ?? '',
        kind: identity.identifierPolicy?.kind ?? 'text',
        placeholder: identity.identifierPolicy?.placeholder,
        pattern: identity.identifierPolicy?.pattern,
        minLength: identity.identifierPolicy?.minLength === undefined
            ? undefined
            : Number(identity.identifierPolicy.minLength),
        maxLength: identity.identifierPolicy?.maxLength === undefined
            ? undefined
            : Number(identity.identifierPolicy.maxLength),
        normalization: identity.identifierPolicy?.normalization ?? 'trim'
    },
    verificationPolicy: {
        mode: identity.verificationPolicy?.mode ?? 'none',
        evidenceRequired: identity.verificationPolicy?.evidenceRequired ?? false,
        ttlSeconds: Number(identity.verificationPolicy?.ttlSeconds ?? 300)
    },
    amountPolicy: {
        min: identity.amountPolicy?.min === undefined ? undefined : Number(identity.amountPolicy.min),
        max: identity.amountPolicy?.max === undefined ? undefined : Number(identity.amountPolicy.max),
        step: Number(identity.amountPolicy?.step ?? 1),
        currency: identity.amountPolicy?.currency ?? 'NGN'
    }
});

interface Plan {
    _id: string;
    name: string;
    code: string;
    status: boolean;
    price: number;
    suggestedRetailPrice?: number;
}

type ServiceExecutionCategory =
    | 'airtime'
    | 'data'
    | 'tv'
    | 'electricity'
    | 'pin'
    | 'broadband';

const resolveExecutionCategory = (typeName?: string): ServiceExecutionCategory | null => {
    const normalizedType = typeName?.trim().toLowerCase();

    if (!normalizedType) return null;

    if (normalizedType.includes('broadband') || normalizedType.includes('internet')) return 'broadband';
    if (normalizedType.includes('airtime')) return 'airtime';
    if (normalizedType.includes('data')) return 'data';
    if (normalizedType.includes('tv') || normalizedType.includes('cable')) return 'tv';
    if (normalizedType.includes('electricity') || normalizedType.includes('electric')) return 'electricity';
    if (normalizedType.includes('pin') || normalizedType.includes('exam')) return 'pin';

    return null;
};

const CatalogRegistryTab: React.FC = () => {
    const [identities, setIdentities] = useState<Identity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIdentity, setSelectedIdentity] = useState<Identity | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [plansLoading, setPlansLoading] = useState(false);
    const [variantSearchTerm, setVariantSearchTerm] = useState('');
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [metadata, setMetadata] = useState<any>({ categories: [], types: [], brands: [] });
    const [formData, setFormData] = useState<CreateIdentityFormData>(createInitialFormData);
    const [editData, setEditData] = useState<EditIdentityData | null>(null);
    const [editOriginalStatus, setEditOriginalStatus] = useState<boolean | null>(null);
    const isBroadbandSelected = isBroadbandServiceType(formData.typeId, metadata.types);
    const isBroadbandEdit = isBroadbandIdentity(editData, metadata.types);
    const isSelectedIdentityBroadband = isBroadbandIdentity(selectedIdentity, metadata.types);

    const [showVariantModal, setShowVariantModal] = useState(false);
    const [editingVariant, setEditingVariant] = useState<Plan | null>(null);
    const [variantOriginalStatus, setVariantOriginalStatus] = useState<boolean | null>(null);
    const [variantFormData, setVariantFormData] = useState({
        name: '',
        code: '',
        status: true,
        suggestedRetailPrice: ''
    });

    useEffect(() => {
        loadIdentities();
        loadMetadata();
    }, []);

    const loadIdentities = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/hierarchy/identities');
            setIdentities(res.data.data);
        } catch (err) {
            toast.error("Failed to load catalog registry");
        } finally {
            setLoading(false);
        }
    };

    const loadMetadata = async () => {
        try {
            const res = await apiClient.get('/admin/hierarchy/metadata');
            setMetadata({ ...res.data.data, brands: [] }); // Start with empty brands
        } catch {
            console.error('Metadata load failed');
        }
    };

    const loadBrands = async (typeId: string) => {
        if (!typeId) {
            setMetadata((prev: any) => ({ ...prev, brands: [] }));
            return;
        }
        try {
            const res = await apiClient.get(`/admin/hierarchy/metadata?typeId=${typeId}`);
            setMetadata((prev: any) => ({ ...prev, brands: res.data.data.brands }));
        } catch {
            console.error('Brand metadata load failed');
        }
    };

    useEffect(() => {
        if (formData.typeId) {
            loadBrands(formData.typeId);
            setFormData(prev => ({ ...prev, brandId: '' })); // Reset brand if type changes
        }
    }, [formData.typeId]);

    const loadPlans = async (identityId: string) => {
        setPlansLoading(true);
        try {
            const res = await apiClient.get(`/admin/services?identityId=${identityId}`);
            setPlans(res.data.data);
        } catch (err) {
            toast.error("Failed to load plan variants");
        } finally {
            setPlansLoading(false);
        }
    };

    const openEditIdentity = (identity: Identity) => {
        setEditData(createEditIdentityData(identity));
        setEditOriginalStatus(identity.status);
        setShowEditModal(true);
    };

    const openCreateVariant = (identity: Identity) => {
        const isBroadband = isBroadbandIdentity(identity, metadata.types);
        const existingPlanCount = selectedIdentity?._id === identity._id && !plansLoading
            ? plans.length
            : identity.plansCount;

        if (
            isBroadband &&
            identity.purchaseMode === 'amount' &&
            existingPlanCount > 0
        ) {
            toast.error("AMOUNT Broadband identities use one canonical purchase service.");
            return;
        }

        setSelectedIdentity(identity);
        if (selectedIdentity?._id !== identity._id) {
            setPlans([]);
            loadPlans(identity._id);
        }
        setEditingVariant(null);
        setVariantOriginalStatus(null);
        setVariantFormData({
            name: '',
            code: '',
            status: !isBroadband,
            suggestedRetailPrice: ''
        });
        setShowVariantModal(true);
    };

    const openEditVariant = (plan: Plan) => {
        setEditingVariant(plan);
        setVariantOriginalStatus(plan.status);
        setVariantFormData({
            name: plan.name,
            code: plan.code,
            status: plan.status,
            suggestedRetailPrice: plan.suggestedRetailPrice === undefined
                ? ''
                : String(plan.suggestedRetailPrice)
        });
        setShowVariantModal(true);
    };

    const handleCreateIdentity = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isBroadbandSelected) {
            const { minLength, maxLength } = formData.identifierPolicy;
            const { ttlSeconds } = formData.verificationPolicy;

            if (!formData.identifierPolicy.label.trim()) {
                toast.error("Identifier Label is required for Broadband identities");
                return;
            }

            if (
                minLength !== undefined &&
                maxLength !== undefined &&
                maxLength < minLength
            ) {
                toast.error("Maximum Length must be greater than or equal to Minimum Length");
                return;
            }

            if (!Number.isFinite(ttlSeconds) || ttlSeconds < 30 || ttlSeconds > 1800) {
                toast.error("Verification TTL must be between 30 and 1800 seconds");
                return;
            }

            if (formData.purchaseMode === 'amount') {
                const { min, max, step } = formData.amountPolicy;

                if (min === undefined || !Number.isFinite(min) || min <= 0) {
                    toast.error("Minimum Amount must be greater than 0");
                    return;
                }

                if (max === undefined || !Number.isFinite(max) || max < min) {
                    toast.error("Maximum Amount must be greater than or equal to Minimum Amount");
                    return;
                }

                if (!Number.isFinite(step) || step <= 0) {
                    toast.error("Amount Increment / Step must be greater than 0");
                    return;
                }
            }
        }

        setIsProcessing(true);
        try {
            const {
                purchaseMode,
                identifierPolicy,
                verificationPolicy,
                amountPolicy,
                ...identityData
            } = formData;
            const payload = isBroadbandSelected
                ? {
                    ...identityData,
                    status: false,
                    purchaseMode,
                    identifierPolicy: {
                        ...identifierPolicy,
                        label: identifierPolicy.label.trim()
                    },
                    verificationPolicy,
                    ...(purchaseMode === 'amount' ? { amountPolicy } : {})
                }
                : identityData;

            await apiClient.post('/admin/hierarchy/identities', payload);
            toast.success("Service Identity registered successfully");
            setShowCreateModal(false);
            setFormData(createInitialFormData());
            loadIdentities();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateIdentity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editData) return;

        if (isBroadbandEdit) {
            const { minLength, maxLength } = editData.identifierPolicy;
            const { mode, evidenceRequired, ttlSeconds } = editData.verificationPolicy;

            if (editData.purchaseMode !== 'plan' && editData.purchaseMode !== 'amount') {
                toast.error("Purchase Mode must be PLAN or AMOUNT");
                return;
            }

            if (!editData.identifierPolicy.label.trim()) {
                toast.error("Identifier Label is required for Broadband identities");
                return;
            }

            if (
                (minLength !== undefined && !Number.isFinite(minLength)) ||
                (maxLength !== undefined && !Number.isFinite(maxLength))
            ) {
                toast.error("Identifier lengths must be valid numbers");
                return;
            }

            if (
                minLength !== undefined &&
                maxLength !== undefined &&
                maxLength < minLength
            ) {
                toast.error("Maximum Length must be greater than or equal to Minimum Length");
                return;
            }

            if (!Number.isFinite(ttlSeconds) || ttlSeconds < 30 || ttlSeconds > 1800) {
                toast.error("Verification TTL must be between 30 and 1800 seconds");
                return;
            }

            if (evidenceRequired && mode !== 'required') {
                toast.error("Evidence can only be required when Verification Mode is Required");
                return;
            }

            if (editData.purchaseMode === 'amount') {
                const { min, max, step, currency } = editData.amountPolicy;

                if (min === undefined || !Number.isFinite(min) || min <= 0) {
                    toast.error("Minimum Amount must be greater than 0");
                    return;
                }

                if (max === undefined || !Number.isFinite(max) || max < min) {
                    toast.error("Maximum Amount must be greater than or equal to Minimum Amount");
                    return;
                }

                if (!Number.isFinite(step) || step <= 0) {
                    toast.error("Amount Increment / Step must be greater than 0");
                    return;
                }

                if (currency !== 'NGN') {
                    toast.error("Broadband amount currency must be NGN");
                    return;
                }
            }
        }

        setIsProcessing(true);
        try {
            const {
                purchaseMode,
                identifierPolicy,
                verificationPolicy,
                amountPolicy,
                ...identityData
            } = editData;
            const payload = isBroadbandEdit
                ? {
                    name: editData.name,
                    internalCode: editData.internalCode,
                    providerCode: editData.providerCode,
                    suggestedRetailPrice: editData.suggestedRetailPrice,
                    status: editData.status,
                    purchaseMode,
                    identifierPolicy: {
                        label: identifierPolicy.label.trim(),
                        kind: identifierPolicy.kind,
                        normalization: identifierPolicy.normalization,
                        ...(identifierPolicy.placeholder !== undefined
                            ? { placeholder: identifierPolicy.placeholder }
                            : {}),
                        ...(identifierPolicy.pattern !== undefined
                            ? { pattern: identifierPolicy.pattern }
                            : {}),
                        ...(identifierPolicy.minLength !== undefined
                            ? { minLength: Number(identifierPolicy.minLength) }
                            : {}),
                        ...(identifierPolicy.maxLength !== undefined
                            ? { maxLength: Number(identifierPolicy.maxLength) }
                            : {})
                    },
                    verificationPolicy: {
                        mode: verificationPolicy.mode,
                        ttlSeconds: Number(verificationPolicy.ttlSeconds),
                        evidenceRequired: verificationPolicy.evidenceRequired
                    },
                    ...(purchaseMode === 'amount' ? {
                        amountPolicy: {
                            min: Number(amountPolicy.min),
                            max: Number(amountPolicy.max),
                            step: Number(amountPolicy.step),
                            currency: 'NGN' as const
                        }
                    } : {})
                }
                : identityData;

            await apiClient.put(`/admin/hierarchy/identities/${editData._id}`, payload);
            toast.success("Identity updated");
            setShowEditModal(false);
            setEditOriginalStatus(null);
            setSelectedIdentity(null); // Return to list to refresh
            loadIdentities();
        } catch (err: any) {
            if (isBroadbandEdit && editOriginalStatus !== null) {
                setEditData(current => current ? { ...current, status: editOriginalStatus } : current);
            }
            toast.error(err.response?.data?.message || "Update failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteIdentity = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete ${name}? This will remove all associated plans and fulfillment mappings.`)) return;
        
        try {
            await apiClient.delete(`/admin/hierarchy/identities/${id}`);
            setIdentities(identities.filter(i => i._id !== id));
            toast.success("Service identity deleted");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Deletion failed");
        }
    };

    const handleSaveVariant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedIdentity) return;

        if (
            isSelectedIdentityBroadband &&
            !editingVariant &&
            selectedIdentity.purchaseMode === 'amount' &&
            (plansLoading ? selectedIdentity.plansCount : plans.length) > 0
        ) {
            toast.error("AMOUNT Broadband identities use one canonical purchase service.");
            return;
        }

        const broadbandSuggestedRetailPrice = variantFormData.suggestedRetailPrice.trim();
        if (
            isSelectedIdentityBroadband &&
            broadbandSuggestedRetailPrice &&
            !Number.isFinite(Number(broadbandSuggestedRetailPrice))
        ) {
            toast.error("Suggested Retail Price must be a valid number");
            return;
        }

        setIsProcessing(true);
        try {
            if (isSelectedIdentityBroadband) {
                const payload = {
                    name: variantFormData.name,
                    code: variantFormData.code,
                    identityId: selectedIdentity._id,
                    categoryId: selectedIdentity.categoryId?._id,
                    typeId: selectedIdentity.typeId?._id,
                    brandId: selectedIdentity.brandId?._id,
                    category: 'broadband' as const,
                    fulfillmentMode: selectedIdentity.fulfillmentMode,
                    status: editingVariant ? variantFormData.status : false,
                    ...(broadbandSuggestedRetailPrice
                        ? { suggestedRetailPrice: Number(broadbandSuggestedRetailPrice) }
                        : {})
                };

                if (editingVariant) {
                    await apiClient.put(`/admin/services/${editingVariant._id}`, payload);
                    toast.success(selectedIdentity.purchaseMode === 'amount'
                        ? "Amount purchase service updated"
                        : "Broadband plan updated");
                } else {
                    await apiClient.post('/admin/services', payload);
                    toast.success(selectedIdentity.purchaseMode === 'amount'
                        ? "Amount purchase service created"
                        : "Broadband plan created");
                }
            } else if (editingVariant) {
                // Update Existing
                await apiClient.put(`/admin/services/${editingVariant._id}`, variantFormData);
                toast.success("Variant updated");
            } else {
                // Create New
                const executionCategory = resolveExecutionCategory(
                    selectedIdentity.typeId?.name
                );

                if (!executionCategory) {
                    toast.error(
                        `Unsupported service type "${selectedIdentity.typeId?.name || 'Unknown'}". Configure a supported service type before adding a variant.`
                    );
                    return;
                }

                const payload = {
                    ...variantFormData,
                    identityId: selectedIdentity._id,
                    categoryId: selectedIdentity.categoryId?._id,
                    typeId: selectedIdentity.typeId?._id,
                    brandId: selectedIdentity.brandId?._id,
                    category: executionCategory
                };
                await apiClient.post('/admin/services', payload);
                toast.success("Variant added to identity");
            }
            
            setShowVariantModal(false);
            setEditingVariant(null);
            setVariantOriginalStatus(null);
            setVariantFormData({ name: '', code: '', status: true, suggestedRetailPrice: '' });
            loadPlans(selectedIdentity._id);
        } catch (err: any) {
            if (
                isSelectedIdentityBroadband &&
                editingVariant &&
                variantOriginalStatus !== null
            ) {
                setVariantFormData(current => ({ ...current, status: variantOriginalStatus }));
            }
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePurgeData = async () => {
        if (!window.confirm("CRITICAL ACTION: This will delete all current noisy imported plans that aren't linked to a manual identity. Proceed?")) return;
        
        setIsProcessing(true);
        try {
            const res = await apiClient.post('/admin/hierarchy/purge-noisy-data');
            toast.success(res.data.message);
            loadIdentities();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Purge failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredIdentities = identities.filter(i => 
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.brandId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.internalCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredIdentities.length / itemsPerPage));
    const paginatedIdentities = filteredIdentities.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when searching or changing page size
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    if (loading) return <ListSkeleton count={5} />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {selectedIdentity ? (
                /* Drill-down View */
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => setSelectedIdentity(null)}
                                className="p-4 bg-surface border border-slate-200 rounded-3xl text-slate-400 hover:text-slate-900 transition-all shadow-xl"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedIdentity.name}</h2>
                                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Identity</span>
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                    {selectedIdentity.brandId?.name} • {selectedIdentity.typeId?.name} • {selectedIdentity.internalCode}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => openEditIdentity(selectedIdentity)}
                                className="flex items-center gap-2 px-6 py-3 bg-surface hover:bg-slate-50 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 transition-all"
                            >
                                <Edit3 size={14} /> Edit Identity
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-surface border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Plan Variants (SKUs)</h3>
                                        <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mt-0.5">Specific product definitions under this identity</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Search variants..."
                                            value={variantSearchTerm}
                                            onChange={(e) => setVariantSearchTerm(e.target.value)}
                                            className="bg-surface border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[10px] text-slate-900 focus:outline-none focus:border-indigo-500/50 transition-all w-56 font-bold"
                                        />
                                        <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                    </div>
                                    <button 
                                        onClick={() => openCreateVariant(selectedIdentity)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 transition-transform"
                                    >
                                        <PlusCircle size={14} /> {isSelectedIdentityBroadband
                                            ? (selectedIdentity.purchaseMode === 'amount' ? 'Add Amount Service' : 'Add Plan')
                                            : 'Add Variant'}
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100">
                                            <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Variant Name</th>
                                            <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">SKU Code</th>
                                            <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Routes</th>
                                            <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                                            <th className="text-right px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {plansLoading ? (
                                            Array(3).fill(0).map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-10 text-center text-slate-400 animate-pulse font-black uppercase tracking-widest text-[10px]">Updating Registry...</td></tr>)
                                        ) : plans.filter(p => 
                                            p.name.toLowerCase().includes(variantSearchTerm.toLowerCase()) ||
                                            p.code.toLowerCase().includes(variantSearchTerm.toLowerCase())
                                        ).length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-16 text-center">
                                                    <Archive size={40} className="text-slate-800 mx-auto mb-4" />
                                                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6">No variants found matching your search</p>
                                                </td>
                                            </tr>
                                        ) : plans.filter(p => 
                                            p.name.toLowerCase().includes(variantSearchTerm.toLowerCase()) ||
                                            p.code.toLowerCase().includes(variantSearchTerm.toLowerCase())
                                        ).map((plan) => (
                                            <tr key={plan._id} className="group hover:bg-slate-50/60 transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-black text-slate-900 tracking-tight">{plan.name}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <code className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-tighter">{plan.code}</code>
                                                </td>
                                                <td className="px-4 py-3 text-[10px] font-black text-indigo-600">2 Paths</td>
                                                <td className="px-4 py-3">
                                                    <div className={`w-2 h-2 rounded-full ${plan.status ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditVariant(plan)}
                                                            className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-all hover:bg-indigo-500/20"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={async () => {
                                                                if (window.confirm("Delete this variant?")) {
                                                                    await apiClient.delete(`/admin/services/${plan._id}`);
                                                                    loadPlans(selectedIdentity._id);
                                                                    toast.success("Variant deleted");
                                                                }
                                                            }}
                                                            className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:text-rose-500 transition-all hover:bg-rose-500/10"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <TrendingUp className="text-emerald-500" size={18} />
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Pricing Logic Insight</h3>
                                </div>
                                <div className="space-y-5">
                                    <div className="flex justify-between items-center text-[11px] font-bold">
                                        <span className="text-slate-500 uppercase tracking-widest">Base Provider Cost</span>
                                        <span className="text-indigo-600">Managed in Fulfillment</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] font-bold">
                                        <span className="text-slate-500 uppercase tracking-widest">Markup Rule</span>
                                        <span className="text-emerald-600">Managed in Pricing</span>
                                    </div>
                                    <div className="h-px bg-slate-100"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Global Result</span>
                                        <span className="text-lg font-black text-slate-900 tracking-tighter">Dynamic Selling Price</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-2xl">
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-tighter">
                                    <span className="text-indigo-600 font-black">Architecture Note:</span> This sub-view defines the identity of plans. Physical vendor logic and pricing strategy ownership remain decoupled for operational safety.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Registry List View */
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Legend & Stats */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-2xl flex items-start gap-8 relative overflow-hidden group">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
                                <Layers size={32} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">Service Registry Hub</h3>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed uppercase tracking-tighter max-w-xl">
                                    This is the <span className="text-indigo-600 font-black underline decoration-indigo-400/30">Manual Business Definition Layer</span>. Define high-level services like <span className="text-slate-900 font-black">"MTN Data"</span> or <span className="text-slate-900 font-black">"DStv"</span>.
                                    Plan variants and fulfillment routes are managed in nested views.
                                </p>
                            </div>
                        </div>

                        <div className="bg-surface border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Active Registry</span>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{identities.length}</p>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Defined Service Families</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-4 bg-surface p-2 rounded-3xl border border-slate-200">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Search Registry..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none pl-12 pr-6 py-3 text-xs text-slate-900 focus:outline-none w-64 font-bold"
                                />
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                            </div>
                            <button 
                                onClick={loadIdentities}
                                className="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:text-slate-900 transition-all border border-slate-100 hover:bg-indigo-500/10"
                            >
                                <RefreshCcw size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handlePurgeData}
                                className="flex items-center gap-2 px-5 py-3 bg-rose-500/10 text-rose-500 rounded-3xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/0 hover:shadow-rose-500/20"
                            >
                                <Trash2 size={16} /> Purge Noisy Data
                            </button>
                            <button 
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-3 px-5 py-3 bg-surface text-slate-950 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.1em] shadow-2xl hover:scale-105 transition-transform active:scale-95"
                            >
                                <PlusCircle size={18} /> Register New Service
                            </button>
                        </div>
                    </div>

                    {/* Registry Table */}
                    <div className="bg-surface border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-100">
                                        <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Business Family</th>
                                        <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Brand</th>
                                        <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Protocol Type</th>
                                        <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Readiness</th>
                                        <th className="text-left px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                                        <th className="text-right px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedIdentities.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-16 text-center">
                                                <Package size={48} className="text-slate-800 mx-auto mb-6" />
                                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">No matching entries found</p>
                                            </td>
                                        </tr>
                                    ) : paginatedIdentities.map((identity) => (
                                        <tr key={identity._id} className="group hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                                        <Network size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 tracking-tight leading-tight">{identity.name}</p>
                                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1 leading-none">{identity.internalCode}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{identity.brandId?.name || 'GENERIC'}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="px-3 py-1 rounded-lg bg-surface border border-slate-200 text-[9px] font-black text-slate-500 uppercase tracking-widest inline-block">
                                                    {identity.typeId?.name || 'UNDEFINED'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {[
                                                        { key: 'Variants', val: identity.readiness.hasVariants, tip: "Add at least one product variant (SKU)" },
                                                        { key: 'Fulfillment', val: identity.readiness.hasFulfillment, tip: "Map variants to vendor SKU codes" },
                                                        { key: 'Pricing', val: identity.readiness.hasPricing, tip: "Configure a pricing rule for this service" }
                                                    ].map(step => (
                                                        <div key={step.key} title={!step.val ? step.tip : ""} className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter ${step.val ? 'text-emerald-500' : 'text-rose-500/50'}`}>
                                                            {step.val ? <CheckCircle2 size={10} /> : <Activity size={10} />}
                                                            {step.key}
                                                        </div>
                                                    ))}
                                                    <div className="h-4 w-px bg-slate-200 mx-1"></div>
                                                    <div className={`px-2 py-0.5 rounded flex items-center gap-1 text-[8px] font-black uppercase ${identity.readiness.isVisible ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 text-slate-500'}`}>
                                                        {identity.readiness.isVisible ? <ShieldCheck size={10} /> : <XCircle size={10} />}
                                                        {identity.readiness.isVisible ? 'Live' : 'Hidden'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${identity.status ? 'text-emerald-500' : 'text-slate-600'}`}>
                                                    {identity.status ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                    {identity.status ? 'Active' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-3 transition-opacity">
                                                     {identity.plansCount === 0 ? (
                                                        <button
                                                            onClick={() => openCreateVariant(identity)}
                                                            className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20"
                                                         >
                                                            <Plus size={12} /> {isBroadbandIdentity(identity, metadata.types)
                                                                ? (identity.purchaseMode === 'amount' ? 'Add Amount Service' : 'Add Plan')
                                                                : 'Add Variant'}
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedIdentity(identity);
                                                                loadPlans(identity._id);
                                                            }}
                                                            className="px-4 py-2 bg-indigo-500 text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20"
                                                        >
                                                            <LayoutGrid size={12} /> Manage Variants
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openEditIdentity(identity)}
                                                        className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-100 transition-colors"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteIdentity(identity._id, identity.name)}
                                                        className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-rose-500 border border-slate-100 transition-all hover:bg-rose-500/10"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between bg-surface border border-slate-200 p-5 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Show</span>
                                <select 
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="bg-surface border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black text-slate-900 focus:outline-none focus:border-indigo-500"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Entries</span>
                            </div>
                            <div className="h-4 w-px bg-slate-200"></div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
                                <span className="mx-4 text-slate-800">•</span>
                                Showing <span className="text-indigo-600">{paginatedIdentities.length}</span> of <span className="text-slate-900">{filteredIdentities.length}</span> Results
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="px-6 py-3 bg-surface border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-all"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-500 text-slate-950 shadow-lg shadow-indigo-500/20' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="px-6 py-3 bg-surface border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Registration Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/80 animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl max-h-[90vh] bg-surface border border-slate-200 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
                        <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Register New Service Identity</h3>
                                <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-1 uppercase">Define the business-level service family</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-900"><XCircle size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleCreateIdentity} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Service Family Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="e.g., MTN Mobile Data"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Internal Business Code</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="e.g., MTN_DATA_FAMILY"
                                        value={formData.internalCode}
                                        onChange={(e) => setFormData({...formData, internalCode: e.target.value.toUpperCase()})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold uppercase"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Provider Service ID (e.g. mtn-data)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g., mtn-data"
                                        value={formData.providerCode}
                                        onChange={(e) => setFormData({...formData, providerCode: e.target.value})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Suggested Retail Price (Market Price Reference)</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g., 1000"
                                        value={formData.suggestedRetailPrice}
                                        onChange={(e) => setFormData({...formData, suggestedRetailPrice: e.target.value})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Category</label>
                                    <select 
                                        required
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold appearance-none"
                                    >
                                        <option value="">Select...</option>
                                        {metadata.categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Service Type</label>
                                    <select 
                                        required
                                        value={formData.typeId}
                                        onChange={(e) => setFormData({...formData, typeId: e.target.value})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold appearance-none"
                                    >
                                        <option value="">Select...</option>
                                        {metadata.types.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Brand Provider</label>
                                    <select 
                                        required
                                        disabled={!formData.typeId}
                                        value={formData.brandId}
                                        onChange={(e) => setFormData({...formData, brandId: e.target.value})}
                                        className={`w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold appearance-none transition-opacity ${!formData.typeId ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}`}
                                    >
                                        <option value="">{formData.typeId ? (metadata.brands.length > 0 ? "Select Brand..." : "No brands found for this type") : "Select service type first"}</option>
                                        {metadata.brands.map((b: any) => <option key={b._id} value={b._id}>{b.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {isBroadbandSelected && (
                                <section className="space-y-6 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Broadband Configuration</h4>
                                        <p className="mt-2 text-xs font-medium text-slate-500">Configure how customers identify their account and purchase this Broadband service.</p>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-2xl border border-indigo-200 bg-surface p-4 text-xs font-semibold leading-relaxed text-slate-600">
                                        <Info size={18} className="mt-0.5 shrink-0 text-indigo-500" />
                                        <span>New Broadband identities are created disabled. Configure the purchase service, provider offer and pricing before activation.</span>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Purchase Mode</label>
                                        <select
                                            value={formData.purchaseMode}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                purchaseMode: e.target.value as PurchaseMode
                                            })}
                                            className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold appearance-none"
                                        >
                                            <option value="plan">PLAN</option>
                                            <option value="amount">AMOUNT</option>
                                        </select>
                                        <p className="text-[11px] leading-relaxed text-slate-500">PLAN means the customer selects a predefined Broadband plan. AMOUNT means the customer enters an allowed monetary amount.</p>
                                    </div>

                                    <div className="space-y-4 border-t border-indigo-100 pt-6">
                                        <div>
                                            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest">Identifier Policy</h5>
                                            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Identifier Label is what the customer will see, for example Customer ID, Account Number, or Smile Number.</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2 sm:col-span-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identifier Label</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="e.g., Customer ID"
                                                    value={formData.identifierPolicy.label}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        identifierPolicy: {
                                                            ...formData.identifierPolicy,
                                                            label: e.target.value
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identifier Kind</label>
                                                <select
                                                    value={formData.identifierPolicy.kind}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        identifierPolicy: {
                                                            ...formData.identifierPolicy,
                                                            kind: e.target.value as IdentifierPolicy['kind']
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold appearance-none"
                                                >
                                                    <option value="text">Text</option>
                                                    <option value="phone">Phone</option>
                                                    <option value="numeric">Numeric</option>
                                                    <option value="email">Email</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Normalization</label>
                                                <select
                                                    value={formData.identifierPolicy.normalization}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        identifierPolicy: {
                                                            ...formData.identifierPolicy,
                                                            normalization: e.target.value as IdentifierPolicy['normalization']
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold appearance-none"
                                                >
                                                    <option value="none">None</option>
                                                    <option value="trim">Trim</option>
                                                    <option value="lowercase">Lowercase</option>
                                                    <option value="uppercase">Uppercase</option>
                                                    <option value="digits_only">Digits Only</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Placeholder</label>
                                                <input
                                                    type="text"
                                                    placeholder="Optional"
                                                    value={formData.identifierPolicy.placeholder ?? ''}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        identifierPolicy: {
                                                            ...formData.identifierPolicy,
                                                            placeholder: e.target.value || undefined
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Validation Pattern</label>
                                                <input
                                                    type="text"
                                                    placeholder="Optional regular expression"
                                                    value={formData.identifierPolicy.pattern ?? ''}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        identifierPolicy: {
                                                            ...formData.identifierPolicy,
                                                            pattern: e.target.value || undefined
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Minimum Length</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    placeholder="Optional"
                                                    value={formData.identifierPolicy.minLength ?? ''}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        identifierPolicy: {
                                                            ...formData.identifierPolicy,
                                                            minLength: e.target.value === '' ? undefined : Number(e.target.value)
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Maximum Length</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    placeholder="Optional"
                                                    value={formData.identifierPolicy.maxLength ?? ''}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        identifierPolicy: {
                                                            ...formData.identifierPolicy,
                                                            maxLength: e.target.value === '' ? undefined : Number(e.target.value)
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-t border-indigo-100 pt-6">
                                        <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest">Verification Policy</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Verification Mode</label>
                                                <select
                                                    value={formData.verificationPolicy.mode}
                                                    onChange={(e) => {
                                                        const mode = e.target.value as VerificationPolicy['mode'];
                                                        setFormData({
                                                            ...formData,
                                                            verificationPolicy: {
                                                                ...formData.verificationPolicy,
                                                                mode,
                                                                evidenceRequired: mode === 'required'
                                                                    ? formData.verificationPolicy.evidenceRequired
                                                                    : false
                                                            }
                                                        });
                                                    }}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold appearance-none"
                                                >
                                                    <option value="none">None</option>
                                                    <option value="optional">Optional</option>
                                                    <option value="required">Required</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Verification TTL Seconds</label>
                                                <input
                                                    required
                                                    type="number"
                                                    min="30"
                                                    max="1800"
                                                    step="1"
                                                    value={formData.verificationPolicy.ttlSeconds}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        verificationPolicy: {
                                                            ...formData.verificationPolicy,
                                                            ttlSeconds: Number(e.target.value)
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                disabled={formData.verificationPolicy.mode !== 'required'}
                                                onClick={() => setFormData({
                                                    ...formData,
                                                    verificationPolicy: {
                                                        ...formData.verificationPolicy,
                                                        evidenceRequired: !formData.verificationPolicy.evidenceRequired
                                                    }
                                                })}
                                                className={`w-12 h-6 rounded-full relative transition-all disabled:cursor-not-allowed disabled:opacity-40 ${formData.verificationPolicy.evidenceRequired ? 'bg-indigo-500' : 'bg-slate-200'}`}
                                            >
                                                <div className={`dark:border dark:border-slate-500/25 absolute top-1 w-4 h-4 rounded-full bg-surface transition-all ${formData.verificationPolicy.evidenceRequired ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Evidence Required</span>
                                        </div>
                                    </div>

                                    {formData.purchaseMode === 'amount' && (
                                        <div className="space-y-4 border-t border-indigo-100 pt-6">
                                            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest">Amount Policy</h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Minimum Amount</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        step="any"
                                                        value={formData.amountPolicy.min ?? ''}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            amountPolicy: {
                                                                ...formData.amountPolicy,
                                                                min: e.target.value === '' ? undefined : Number(e.target.value)
                                                            }
                                                        })}
                                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Maximum Amount</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        step="any"
                                                        value={formData.amountPolicy.max ?? ''}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            amountPolicy: {
                                                                ...formData.amountPolicy,
                                                                max: e.target.value === '' ? undefined : Number(e.target.value)
                                                            }
                                                        })}
                                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Increment / Step</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        step="any"
                                                        value={formData.amountPolicy.step}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            amountPolicy: {
                                                                ...formData.amountPolicy,
                                                                step: Number(e.target.value)
                                                            }
                                                        })}
                                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Currency</label>
                                                    <input
                                                        readOnly
                                                        type="text"
                                                        value={formData.amountPolicy.currency}
                                                        className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-4 text-sm text-slate-500 font-bold cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            <button 
                                type="submit"
                                disabled={isProcessing}
                                className="w-full py-3 bg-surface text-slate-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform disabled:opacity-50"
                            >
                                {isProcessing ? "Finalizing Entry..." : "Confirm & Register Identity"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Variant Modal */}
            {showVariantModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/80 animate-in fade-in duration-300">
                    <div className="w-full max-w-xl bg-surface border border-slate-200 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                                    {isSelectedIdentityBroadband
                                        ? (selectedIdentity?.purchaseMode === 'amount'
                                            ? `${editingVariant ? 'Edit' : 'Add'} Amount Purchase Service`
                                            : `${editingVariant ? 'Edit' : 'Add'} Broadband Plan`)
                                        : (editingVariant ? 'Edit Variant' : 'Add Product Variant')}
                                </h3>
                                <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-1 uppercase">
                                    {isSelectedIdentityBroadband && selectedIdentity?.purchaseMode === 'amount'
                                        ? `${editingVariant ? 'Update' : 'Define'} the canonical purchase service under ${selectedIdentity?.name}`
                                        : `${editingVariant ? 'Update' : 'Define'} a specific plan under ${selectedIdentity?.name}`}
                                </p>
                            </div>
                            <button onClick={() => { setShowVariantModal(false); setEditingVariant(null); setVariantOriginalStatus(null); }} className="text-slate-500 hover:text-slate-900"><XCircle size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleSaveVariant} className="p-10 space-y-8">
                            {isSelectedIdentityBroadband && !editingVariant && (
                                <div className="flex items-start gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 text-xs font-semibold leading-relaxed text-slate-600">
                                    <Info size={18} className="mt-0.5 shrink-0 text-indigo-500" />
                                    <span>New Broadband purchase services are created disabled. Configure the provider offer and pricing before activation.</span>
                                </div>
                            )}

                            {isSelectedIdentityBroadband && selectedIdentity?.purchaseMode === 'amount' && (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold leading-relaxed text-slate-600">
                                    AMOUNT Broadband identities use one canonical purchase service.
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                        {isSelectedIdentityBroadband
                                            ? (selectedIdentity?.purchaseMode === 'amount' ? 'Service Display Name' : 'Plan Display Name')
                                            : 'Variant Display Name'}
                                    </label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder={isSelectedIdentityBroadband
                                            ? (selectedIdentity?.purchaseMode === 'amount' ? 'e.g., Broadband Amount Purchase' : 'e.g., Home 50GB Monthly')
                                            : 'e.g., 1GB SME (30 Days)'}
                                        value={variantFormData.name}
                                        onChange={(e) => setVariantFormData({...variantFormData, name: e.target.value})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                        {isSelectedIdentityBroadband
                                            ? (selectedIdentity?.purchaseMode === 'amount' ? 'Internal Service Code' : 'Internal Plan Code')
                                            : 'Internal SKU Code (Universal)'}
                                    </label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder={isSelectedIdentityBroadband
                                            ? (selectedIdentity?.purchaseMode === 'amount' ? 'e.g., BROADBAND_AMOUNT' : 'e.g., BROADBAND_PLAN_50GB')
                                            : 'e.g., MTN_1GB_SME'}
                                        value={variantFormData.code}
                                        onChange={(e) => setVariantFormData({...variantFormData, code: e.target.value.toUpperCase()})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold uppercase"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Suggested Retail Price (Market Price Reference)</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g., 500"
                                        value={variantFormData.suggestedRetailPrice}
                                        onChange={(e) => setVariantFormData({...variantFormData, suggestedRetailPrice: e.target.value})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                </div>
                            </div>

                            {(!isSelectedIdentityBroadband || editingVariant) && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setVariantFormData({...variantFormData, status: !variantFormData.status})}
                                            className={`w-12 h-6 rounded-full relative transition-all ${variantFormData.status ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                        >
                                            <div className={`dark:border dark:border-slate-500/25 absolute top-1 w-4 h-4 rounded-full bg-surface transition-all ${variantFormData.status ? 'left-7' : 'left-1'}`}></div>
                                        </button>
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                            {variantFormData.status
                                                ? 'Active'
                                                : (isSelectedIdentityBroadband ? 'Disabled / Draft' : 'Disabled')}
                                        </span>
                                    </div>
                                    {isSelectedIdentityBroadband && variantOriginalStatus === false && variantFormData.status && (
                                        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-semibold leading-relaxed text-amber-900">
                                            <Info size={18} className="mt-0.5 shrink-0" />
                                            <span>Activation performs a server-side readiness check. A valid eligible provider offer and required Broadband configuration must already exist.</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={isProcessing}
                                className="w-full py-3 bg-indigo-500 text-slate-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform disabled:opacity-50"
                            >
                                {isProcessing
                                    ? (editingVariant ? "Updating..." : "Adding to Registry...")
                                    : (editingVariant
                                        ? "Save Changes"
                                        : (isSelectedIdentityBroadband
                                            ? (selectedIdentity?.purchaseMode === 'amount' ? "Create Amount Service" : "Create Broadband Plan")
                                            : "Save Variant"))}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Identity Modal */}
            {showEditModal && editData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-950/80 animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl max-h-[90vh] bg-surface border border-slate-200 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
                        <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Edit Service Identity</h3>
                                <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-1 uppercase">Modify business-level definitions</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-slate-900"><XCircle size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleUpdateIdentity} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Service Family Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={editData.name}
                                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Internal Business Code</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={editData.internalCode}
                                        onChange={(e) => setEditData({...editData, internalCode: e.target.value.toUpperCase()})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold uppercase"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Provider Service ID (e.g. mtn-data)</label>
                                    <input 
                                        type="text" 
                                        value={editData.providerCode || ''}
                                        placeholder="e.g., mtn-data"
                                        onChange={(e) => setEditData({...editData, providerCode: e.target.value})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                    {isBroadbandEdit && (
                                        <p className="text-[11px] leading-relaxed text-slate-500">Upstream provider routing and mapping are configured through Provider Offers. This identity field does not select the Broadband provider route.</p>
                                    )}
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Suggested Retail Price (Market Price Reference)</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g., 1000"
                                        value={editData.suggestedRetailPrice || ''}
                                        onChange={(e) => setEditData({...editData, suggestedRetailPrice: e.target.value})}
                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                    />
                                </div>
                            </div>

                            {isBroadbandEdit && (
                                <section className="space-y-6 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Broadband Configuration</h4>
                                        <p className="mt-2 text-xs font-medium text-slate-500">Update customer identification, purchase rules, verification, and availability.</p>
                                    </div>

                                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-surface p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Identity Status</p>
                                                <p className={`mt-1 text-sm font-black ${editData.status ? 'text-emerald-600' : 'text-slate-600'}`}>
                                                    {editData.status ? 'Active' : 'Disabled / Draft'}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setEditData({ ...editData, status: !editData.status })}
                                                className={`w-14 h-7 rounded-full relative transition-all ${editData.status ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-surface transition-all ${editData.status ? 'left-8' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                        {editOriginalStatus === false && editData.status && (
                                            <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-semibold leading-relaxed text-amber-900">
                                                <Info size={18} className="mt-0.5 shrink-0" />
                                                <span>Activation performs a server-side readiness check. The identity must have a valid Broadband purchase service, eligible provider offer and required configuration before it can become active.</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Purchase Mode</label>
                                        <select
                                            value={editData.purchaseMode}
                                            onChange={(e) => setEditData({
                                                ...editData,
                                                purchaseMode: e.target.value as PurchaseMode
                                            })}
                                            className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold appearance-none"
                                        >
                                            <option value="plan">PLAN</option>
                                            <option value="amount">AMOUNT</option>
                                        </select>
                                    </div>

                                    <div className="space-y-4 border-t border-indigo-100 pt-6">
                                        <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest">Identifier Policy</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2 sm:col-span-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identifier Label</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={editData.identifierPolicy.label}
                                                    onChange={(e) => setEditData({
                                                        ...editData,
                                                        identifierPolicy: {
                                                            ...editData.identifierPolicy,
                                                            label: e.target.value
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identifier Kind</label>
                                                <select
                                                    value={editData.identifierPolicy.kind}
                                                    onChange={(e) => setEditData({
                                                        ...editData,
                                                        identifierPolicy: {
                                                            ...editData.identifierPolicy,
                                                            kind: e.target.value as IdentifierPolicy['kind']
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold appearance-none"
                                                >
                                                    <option value="text">Text</option>
                                                    <option value="phone">Phone</option>
                                                    <option value="numeric">Numeric</option>
                                                    <option value="email">Email</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Normalization</label>
                                                <select
                                                    value={editData.identifierPolicy.normalization}
                                                    onChange={(e) => setEditData({
                                                        ...editData,
                                                        identifierPolicy: {
                                                            ...editData.identifierPolicy,
                                                            normalization: e.target.value as IdentifierPolicy['normalization']
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold appearance-none"
                                                >
                                                    <option value="none">None</option>
                                                    <option value="trim">Trim</option>
                                                    <option value="lowercase">Lowercase</option>
                                                    <option value="uppercase">Uppercase</option>
                                                    <option value="digits_only">Digits Only</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Placeholder</label>
                                                <input
                                                    type="text"
                                                    value={editData.identifierPolicy.placeholder ?? ''}
                                                    onChange={(e) => setEditData({
                                                        ...editData,
                                                        identifierPolicy: {
                                                            ...editData.identifierPolicy,
                                                            placeholder: e.target.value || undefined
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Validation Pattern</label>
                                                <input
                                                    type="text"
                                                    value={editData.identifierPolicy.pattern ?? ''}
                                                    onChange={(e) => setEditData({
                                                        ...editData,
                                                        identifierPolicy: {
                                                            ...editData.identifierPolicy,
                                                            pattern: e.target.value || undefined
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Minimum Length</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={editData.identifierPolicy.minLength ?? ''}
                                                    onChange={(e) => setEditData({
                                                        ...editData,
                                                        identifierPolicy: {
                                                            ...editData.identifierPolicy,
                                                            minLength: e.target.value === '' ? undefined : Number(e.target.value)
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Maximum Length</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={editData.identifierPolicy.maxLength ?? ''}
                                                    onChange={(e) => setEditData({
                                                        ...editData,
                                                        identifierPolicy: {
                                                            ...editData.identifierPolicy,
                                                            maxLength: e.target.value === '' ? undefined : Number(e.target.value)
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-t border-indigo-100 pt-6">
                                        <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest">Verification Policy</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Verification Mode</label>
                                                <select
                                                    value={editData.verificationPolicy.mode}
                                                    onChange={(e) => {
                                                        const mode = e.target.value as VerificationPolicy['mode'];
                                                        setEditData({
                                                            ...editData,
                                                            verificationPolicy: {
                                                                ...editData.verificationPolicy,
                                                                mode,
                                                                evidenceRequired: mode === 'required'
                                                                    ? editData.verificationPolicy.evidenceRequired
                                                                    : false
                                                            }
                                                        });
                                                    }}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold appearance-none"
                                                >
                                                    <option value="none">None</option>
                                                    <option value="optional">Optional</option>
                                                    <option value="required">Required</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Verification TTL Seconds</label>
                                                <input
                                                    required
                                                    type="number"
                                                    min="30"
                                                    max="1800"
                                                    step="1"
                                                    value={editData.verificationPolicy.ttlSeconds}
                                                    onChange={(e) => setEditData({
                                                        ...editData,
                                                        verificationPolicy: {
                                                            ...editData.verificationPolicy,
                                                            ttlSeconds: Number(e.target.value)
                                                        }
                                                    })}
                                                    className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                disabled={editData.verificationPolicy.mode !== 'required'}
                                                onClick={() => setEditData({
                                                    ...editData,
                                                    verificationPolicy: {
                                                        ...editData.verificationPolicy,
                                                        evidenceRequired: !editData.verificationPolicy.evidenceRequired
                                                    }
                                                })}
                                                className={`w-12 h-6 rounded-full relative transition-all disabled:cursor-not-allowed disabled:opacity-40 ${editData.verificationPolicy.evidenceRequired ? 'bg-indigo-500' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-surface transition-all ${editData.verificationPolicy.evidenceRequired ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Evidence Required</span>
                                        </div>
                                    </div>

                                    {editData.purchaseMode === 'amount' && (
                                        <div className="space-y-4 border-t border-indigo-100 pt-6">
                                            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest">Amount Policy</h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Minimum Amount</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        step="any"
                                                        value={editData.amountPolicy.min ?? ''}
                                                        onChange={(e) => setEditData({
                                                            ...editData,
                                                            amountPolicy: {
                                                                ...editData.amountPolicy,
                                                                min: e.target.value === '' ? undefined : Number(e.target.value)
                                                            }
                                                        })}
                                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Maximum Amount</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        step="any"
                                                        value={editData.amountPolicy.max ?? ''}
                                                        onChange={(e) => setEditData({
                                                            ...editData,
                                                            amountPolicy: {
                                                                ...editData.amountPolicy,
                                                                max: e.target.value === '' ? undefined : Number(e.target.value)
                                                            }
                                                        })}
                                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Increment / Step</label>
                                                    <input
                                                        required
                                                        type="number"
                                                        step="any"
                                                        value={editData.amountPolicy.step}
                                                        onChange={(e) => setEditData({
                                                            ...editData,
                                                            amountPolicy: {
                                                                ...editData.amountPolicy,
                                                                step: Number(e.target.value)
                                                            }
                                                        })}
                                                        className="w-full bg-surface border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Currency</label>
                                                    <input
                                                        readOnly
                                                        type="text"
                                                        value={editData.amountPolicy.currency}
                                                        className="w-full bg-slate-100 border border-slate-200 rounded-2xl p-4 text-sm text-slate-500 font-bold cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            <button 
                                type="submit"
                                disabled={isProcessing}
                                className="w-full py-3 bg-indigo-500 text-slate-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform disabled:opacity-50"
                            >
                                {isProcessing ? "Saving Changes..." : "Update Identity"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CatalogRegistryTab;
