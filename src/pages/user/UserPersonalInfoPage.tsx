import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore';
import * as userService from '../../services/user/userService';
import { toast } from 'react-toastify';
import { User, Mail, Phone, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Input, Row, SubmitButton } from '../../components/buy/Buy';

const UserPersonalInfoPage: React.FC = () => {
    const { user, fetchMe } = useAuthStore();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Hardened Payload: Only send editable fields
            const updateData = {
                name: formData.name,
                phone: formData.phone
            };
            await userService.updateProfile(updateData);
            toast.success("Profile updated successfully");
            await fetchMe(); // Refresh global user state
            navigate('/app/profile');
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/app/profile')}
                    className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personal Information</h1>
                    <p className="text-sm text-slate-500 font-medium">Update your identity and contact details</p>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-xl shadow-slate-200/40">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <Row label="Full Legal Name">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                <User size={18} />
                            </div>
                            <Input 
                                type="text"
                                value={formData.name}
                                onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                                className="pl-12"
                                placeholder="Enter full name"
                                required
                            />
                        </div>
                    </Row>

                    <Row label="Email Address">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                <Mail size={18} />
                            </div>
                            <Input 
                                type="email"
                                value={formData.email}
                                onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                                className="pl-12"
                                placeholder="name@example.com"
                                required
                                disabled // Usually email is changed via specialized flow
                            />
                        </div>
                        <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <AlertCircle size={12} />
                            Email verification required for changes
                        </p>
                    </Row>

                    <Row label="Phone Number">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                <Phone size={18} />
                            </div>
                            <Input 
                                type="tel"
                                value={formData.phone}
                                onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                                className="pl-12"
                                placeholder="0801 234 5678"
                                required
                            />
                        </div>
                    </Row>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                                Security Protocol: Changes are logged <br /> and verified by the system.
                            </p>
                        </div>
                        <div className="w-full sm:w-auto">
                            <SubmitButton loading={loading}>
                                <div className="flex items-center justify-center gap-2">
                                    <Save size={16} />
                                    <span>Save Changes</span>
                                </div>
                            </SubmitButton>
                        </div>
                    </div>
                </form>
            </div>

            {/* Info Notice */}
            <div className="bg-slate-950 p-6 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 border border-slate-800 shrink-0">
                    <AlertCircle size={20} />
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                    Identity updates may temporarily restrict certain account features while our compliance team verifies the new information. Ensure all details match your valid government-issued ID.
                </p>
            </div>
        </div>
    );
};

export default UserPersonalInfoPage;
