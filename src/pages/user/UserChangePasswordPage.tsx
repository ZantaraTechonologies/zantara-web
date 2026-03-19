import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as userService from '../../services/user/userService';
import { toast } from 'react-toastify';
import { Lock, ArrowLeft, Save, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Input, Row, SubmitButton } from '../../components/buy/Buy';

const UserChangePasswordPage: React.FC = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await userService.changePassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });
            toast.success("Password changed successfully");
            navigate('/app/profile/security');
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/app/profile/security')}
                    className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Change Password</h1>
                    <p className="text-sm text-slate-500 font-medium">Keep your account secure with a strong password</p>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-xl shadow-slate-200/40">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <Row label="Current Password">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                <Lock size={18} />
                            </div>
                            <Input 
                                type={showPasswords ? "text" : "password"}
                                value={formData.oldPassword}
                                onChange={(e: any) => setFormData({ ...formData, oldPassword: e.target.value })}
                                className="pl-12 pr-12"
                                placeholder="Enter current password"
                                required
                            />
                             <button 
                                type="button"
                                onClick={() => setShowPasswords(!showPasswords)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </Row>

                    <Row label="New Password">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                <Lock size={18} />
                            </div>
                            <Input 
                                type={showPasswords ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(e: any) => setFormData({ ...formData, newPassword: e.target.value })}
                                className="pl-12"
                                placeholder="Enter new password"
                                required
                            />
                        </div>
                    </Row>

                    <Row label="Confirm New Password">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                <ShieldCheck size={18} />
                            </div>
                            <Input 
                                type={showPasswords ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e: any) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="pl-12"
                                placeholder="Repeat new password"
                                required
                            />
                        </div>
                    </Row>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                         <div className="hidden sm:block">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                                Security Tip: Use at least 8 characters <br /> with symbols and numbers.
                            </p>
                         </div>
                         <div className="w-full sm:w-auto">
                            <SubmitButton loading={loading}>
                                <div className="flex items-center justify-center gap-2">
                                    <Save size={16} />
                                    <span>Update Password</span>
                                </div>
                            </SubmitButton>
                         </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserChangePasswordPage;
