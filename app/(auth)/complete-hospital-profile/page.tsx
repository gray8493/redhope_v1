"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Hospital, MapPin, Phone, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function CompleteHospitalProfilePage() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        hospitalName: "",
        phone: "",
        address: "",
        licenseNumber: "",
        description: ""
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                hospitalName: user.user_metadata?.full_name || ""
            }));
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Validation
        if (!formData.hospitalName || !formData.phone || !formData.address) {
            toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
            return;
        }

        setSubmitting(true);
        try {
            await userService.upsert(user.id, {
                hospital_name: formData.hospitalName,
                full_name: formData.hospitalName,
                phone: formData.phone,
                hospital_address: formData.address,
                address: formData.address,
                license_number: formData.licenseNumber,
                health_history: formData.description, // Dùng tạm trường này cho mô tả
                email: user.email || "",
                role: 'hospital'
            });

            if (refreshUser) await refreshUser();

            toast.success("Hồ sơ bệnh viện đã được kích hoạt!");
            router.push("/hospital-dashboard");
        } catch (err: any) {
            toast.error(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Side: Instructions */}
                <div className="lg:col-span-2 flex flex-col justify-center space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-[#0065FF] text-white shadow-lg shadow-blue-200">
                            <Hospital className="size-8" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 leading-tight">
                            Kích hoạt <br /> Hồ sơ Bệnh viện
                        </h1>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Hoàn thiện thông tin để bắt đầu tạo chiến dịch hiến máu và kết nối với mạng lưới tình nguyện viên.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {[
                            { title: "Thông tin cơ sở", desc: "Tên và giấy phép hoạt động" },
                            { title: "Địa điểm & Liên hệ", desc: "Địa chỉ chính xác trên bản đồ" },
                            { title: "Xác minh tài khoản", desc: "Đảm bảo tính chính danh y tế" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="flex items-center justify-center size-6 rounded-full bg-emerald-100 text-emerald-600 shrink-0 mt-1">
                                    <CheckCircle2 className="size-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">{item.title}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Form */}
                <Card className="lg:col-span-3 border-none shadow-2xl shadow-blue-100/50 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-100 p-8">
                        <CardTitle className="text-xl font-black text-slate-900">Chi tiết Hồ sơ</CardTitle>
                        <CardDescription className="font-medium">Vui lòng điền thông tin chính xác theo giấy phép y tế.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Tên Bệnh viện *</Label>
                                    <div className="relative">
                                        <Hospital className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                        <Input
                                            value={formData.hospitalName}
                                            onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                                            placeholder="Bệnh viện đa khoa..."
                                            className="pl-11 py-6 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-[#0065FF] transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Số điện thoại *</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="028 xxxx xxxx"
                                            className="pl-11 py-6 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-[#0065FF] transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Địa chỉ Trụ sở *</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Số nhà, đường, phường, quận, thành phố..."
                                        className="pl-11 py-6 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-[#0065FF] transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Giấy phép hoạt động (Số hiệu)</Label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <Input
                                        value={formData.licenseNumber}
                                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                        placeholder="GPHĐ/YT-xxxx"
                                        className="pl-11 py-6 rounded-2xl border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-[#0065FF] transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    className="w-full py-8 rounded-2xl bg-[#0065FF] hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex gap-3"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <Loader2 className="size-5 animate-spin" />
                                    ) : (
                                        <>
                                            Xác nhận & Bắt đầu
                                            <ArrowRight className="size-5" />
                                        </>
                                    )}
                                </Button>
                                <p className="text-center text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-[0.2em]">
                                    Bằng việc tiếp tục, bạn đồng ý với các điều khoản y tế của hệ thống.
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
