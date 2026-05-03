import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as userService from '../../services/user/userService';
import { toast } from 'react-toastify';
import { 
    Upload, 
    Camera, 
    FileText, 
    ArrowLeft, 
    X, 
    CheckCircle2, 
    AlertCircle,
    Info,
    Shield
} from 'lucide-react';
import { SubmitButton, Row, Select } from '../../components/buy/Buy';

const KYCUploadPage: React.FC = () => {
    const navigate = useNavigate();
    
    const [docType, setDocType] = useState('NIN');
    const [docNumber, setDocNumber] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const compressImage = (file: File, quality = 0.7): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject('Canvas error');

                    let width = img.width;
                    let height = img.height;
                    const max = 1200;
                    if (width > max || height > max) {
                        if (width > height) {
                            height *= max / width;
                            width = max;
                        } else {
                            width *= max / height;
                            height = max;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject('Compression failed');
                    }, 'image/jpeg', quality);
                };
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error("File is too large. Maximum size is 5MB.");
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(selectedFile.type)) {
                toast.error("Invalid file type. Please upload JPEG, PNG, or PDF.");
                return;
            }
            setFile(selectedFile);
            setPreview(selectedFile.type === 'application/pdf' 
                ? 'https://cdn-icons-png.flaticon.com/512/337/337946.png'
                : URL.createObjectURL(selectedFile)
            );
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !docNumber) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            
            // Tier 2 is the standard for ID upload in this screen
            formData.append('tier', '2');
            formData.append('documentType', docType);
            formData.append('documentNumber', docNumber);

            if (file.type === 'application/pdf') {
                formData.append('documentImage', file, `kyc_${docType.toLowerCase()}.pdf`);
            } else {
                try {
                    const compressedBlob = await compressImage(file);
                    formData.append('documentImage', compressedBlob, `kyc_${docType.toLowerCase()}.jpg`);
                } catch (compErr) {
                    formData.append('documentImage', file, file.name);
                }
            }
            
            await userService.uploadKYC(formData);
            toast.success("Document submitted for verification");
            navigate('/app/kyc/status');
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/app/kyc')}
                    className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Level 2 Verification</h1>
                    <p className="text-sm text-slate-500 font-medium">Upload government-issued identification</p>
                </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-8">
                <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-xl shadow-slate-200/40 space-y-8">
                    <Row label="Document Category">
                        <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
                            <option value="NIN">National ID (NIN)</option>
                            <option value="BVN">BVN Slip</option>
                            <option value="Driver License">Driver's License</option>
                            <option value="International Passport">International Passport</option>
                            <option value="Voters Card">PVC / Voter's Card</option>
                        </Select>
                    </Row>

                    <Row label="Document Number">
                        <input 
                            type="text" 
                            value={docNumber}
                            onChange={(e) => setDocNumber(e.target.value)}
                            placeholder="Enter the ID number"
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                        />
                    </Row>

                    <Row label="Document Image">
                        {!preview ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-100 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer group"
                            >
                                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <Upload size={28} />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-900">Click to Upload</p>
                                    <p className="text-xs text-slate-500 font-medium">JPEG, PNG or PDF (Max 5MB)</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative rounded-3xl overflow-hidden border border-slate-200 group">
                                <img src={preview} alt="KYC Preview" className="w-full h-64 object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-3 bg-white rounded-xl text-slate-900 hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
                                    >
                                        <Camera size={20} />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => { setFile(null); setPreview(null); }}
                                        className="p-3 bg-white rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </Row>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-emerald-500">
                            <Shield size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-loose">
                                End-to-End Encrypted <br /> Compliance Tunnel
                            </span>
                         </div>
                         <div className="w-full sm:w-auto">
                            <SubmitButton loading={loading} disabled={!file || !docNumber}>
                                Submit for Verification
                            </SubmitButton>
                         </div>
                    </div>
                </div>
            </form>

            {/* Compliance Checklist */}
            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Verification Checklist</h4>
                <div className="grid gap-3">
                    {[
                        'Document must be original (no photocopies)',
                        'All four corners of the ID must be visible',
                        'Details must be clear and legible',
                        'Document must be currently valid (not expired)'
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                            <p className="text-xs text-slate-600 font-medium">{item}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Final Info */}
            <div className="bg-slate-950 p-6 rounded-2xl flex items-start gap-4">
                 <AlertCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                    By submitting, you authorize Zantara to share this information with regulatory authorities (CBN/NIBSS) for identity verification purposes only. Your data is stored in air-gapped secure nodes.
                 </p>
            </div>
        </div>
    );
};

export default KYCUploadPage;
