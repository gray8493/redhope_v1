"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { campaignService, userService } from '@/services';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Users,
    LayoutGrid,
    Droplet,
    MapPin,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Download,
    Megaphone,
    Search,
    ChevronRight,
    Edit2,
    Phone,
    MoreVertical,
    FileText,
    ChevronDown,
    X,
    Clock,
    Check,
    CalendarDays,
    Loader2
} from "lucide-react";
import { format } from 'date-fns';
import { vi } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as ShCalendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Blood volume options
const BLOOD_VOLUMES = [250, 350, 450];
// Blood type options
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Helper to parse blood groups from various formats (Array, CSV string, JSON string)
const parseBloodGroups = (data: any): string[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
        const trimmed = data.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {
                // fall back to CSV if parse fails
            }
        }
        return trimmed.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
};

// Utility function to strip HTML tags and decode HTML entities
const stripHtml = (html: string): string => {
    if (!html) return '';
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, '');
    // Decode HTML entities
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
    // Clean up extra spaces
    text = text.replace(/\s+/g, ' ').trim();
    return text;
};

// Manual Time Input Component (Compact)
const TimeInput = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const parts = (value || "08:00").split(':');
    const [h, setH] = useState(parts[0] || "08");
    const [m, setM] = useState(parts[1] || "00");

    useEffect(() => {
        const p = (value || "08:00").split(':');
        setH(p[0] || "08");
        setM(p[1] || "00");
    }, [value]);

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
        if (val !== "" && parseInt(val) > 23) return;
        setH(val);
        if (val.length === 2) onChange(`${val}:${m || '00'}`);
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
        if (val !== "" && parseInt(val) > 59) return;
        setM(val);
        if (val.length === 2) onChange(`${h || '00'}:${val}`);
    };

    const handleBlur = () => {
        const finalH = h.padStart(2, '0');
        const finalM = m.padStart(2, '0');
        setH(finalH);
        setM(finalM);
        onChange(`${finalH}:${finalM}`);
    };

    return (
        <div className="flex items-center justify-center gap-1 h-10 w-24 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/20 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/5 transition-all outline-none">
            <input
                type="text"
                maxLength={2}
                value={h}
                onChange={handleHourChange}
                onBlur={handleBlur}
                className="w-7 bg-transparent text-sm font-bold text-center outline-none text-slate-900 dark:text-white"
            />
            <span className="text-slate-300 font-bold text-xs opacity-50">:</span>
            <input
                type="text"
                maxLength={2}
                value={m}
                onChange={handleMinuteChange}
                onBlur={handleBlur}
                className="w-7 bg-transparent text-sm font-bold text-center outline-none text-slate-900 dark:text-white"
            />
        </div>
    );
};

// ========== MOCK DATA FOR DEMO ==========
const MOCK_CAMPAIGN = {
    id: 'demo-campaign',
    name: 'Chiến dịch Hiến máu Nhân đạo - Xuân 2026',
    description: 'Chiến dịch hiến máu nhân đạo hưởng ứng Tết Nguyên Đán 2026, góp phần cứu sống nhiều bệnh nhân cần máu.',
    location_name: 'Bệnh viện Chợ Rẫy, Quận 5, TP.HCM',
    start_time: '2026-02-01T08:00:00',
    end_time: '2026-02-28T17:00:00',
    status: 'active',
    target_units: 100,
    blood_group_needed: ['A+', 'B+', 'O+', 'AB+'],
};

const MOCK_REGISTRATIONS = [
    {
        id: 'reg-1',
        user: {
            full_name: 'Nguyễn Văn An',
            email: 'nguyenvanan@gmail.com',
            phone: '0901234567',
            blood_group: 'A+',
            address: 'Quận 1, Hồ Chí Minh'
        },
        status: 'Booked',
        blood_type: 'A+',
        blood_volume: 350,
        created_at: '2026-02-01T10:30:00'
    },
    {
        id: 'reg-2',
        user: {
            full_name: 'Trần Thị Bình',
            email: 'tranthib@gmail.com',
            phone: '0908888999',
            blood_group: 'B+',
            address: 'Quận 3, Hồ Chí Minh'
        },
        status: 'Booked',
        blood_type: 'B+',
        blood_volume: 350,
        created_at: '2026-02-01T11:00:00'
    },
    {
        id: 'reg-3',
        user: {
            full_name: 'Lê Văn Cường',
            email: 'levanc@gmail.com',
            phone: '0912333444',
            blood_group: 'O+',
            address: 'Quận 10, Hồ Chí Minh'
        },
        status: 'Completed',
        blood_type: 'O+',
        blood_volume: 450,
        created_at: '2026-02-01T09:00:00'
    },
    {
        id: 'reg-4',
        user: {
            full_name: 'Phạm Thị Dung',
            email: 'phamthid@gmail.com',
            phone: '0977123456',
            blood_group: 'AB+',
            address: 'Quận 7, Hồ Chí Minh'
        },
        status: 'Deferred',
        blood_type: 'AB+',
        blood_volume: 250,
        created_at: '2026-02-01T14:00:00'
    },
    {
        id: 'reg-5',
        user: {
            full_name: 'Hoàng Minh Tuấn',
            email: 'hoangminhtuan@gmail.com',
            phone: '0933555777',
            blood_group: 'A-',
            address: 'Quận Bình Thạnh, Hồ Chí Minh'
        },
        status: 'Completed',
        blood_type: 'A-',
        blood_volume: 350,
        created_at: '2026-02-02T08:30:00'
    },
];
// ========== END MOCK DATA ==========

export default function CampaignDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const fromTab = searchParams.get('fromTab') || 'active';

    const [campaign, setCampaign] = useState<any>(null);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
    const [isSending, setIsSending] = useState(false);
    const [announcementMsg, setAnnouncementMsg] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [emailType, setEmailType] = useState<'announcement' | 'registration_success' | 'reminder_8h' | 'reminder_4h'>('announcement');

    // Edit Campaign states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        location_name: '',
        date: '',
        start_time: '',
        end_time: '',
        target_units: 0,
        status: 'active',
        description: '',
        target_blood_group: [] as string[],
        image: ''
    });

    // Dropdown states
    const [openBloodTypeDropdown, setOpenBloodTypeDropdown] = useState<string | null>(null);
    const [openVolumeDropdown, setOpenVolumeDropdown] = useState<string | null>(null);
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

    const campaignId = params.id as string;

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Don't close if clicking inside a dropdown or button
            if (target.closest('[data-dropdown]') || target.closest('[data-dropdown-trigger]')) {
                return;
            }
            setOpenBloodTypeDropdown(null);
            setOpenVolumeDropdown(null);
            setOpenActionMenu(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Fetch campaign details OR use mock data
    useEffect(() => {
        if (!campaignId) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch campaign details
                const foundCampaign = await campaignService.getById(campaignId);

                if (!foundCampaign) {
                    toast.error('Không tìm thấy chiến dịch này');
                    router.push('/hospital-campaign');
                    return;
                }

                setCampaign(foundCampaign);

                // Fetch registrations
                const regs = await campaignService.getCampaignRegistrations(campaignId);
                setRegistrations(regs || []);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [campaignId, user?.id, router]);

    if (loading) {
        return (
            <main className="p-8 max-w-7xl w-full mx-auto">
                <Skeleton className="h-12 w-64 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
                <Skeleton className="h-96 rounded-3xl" />
            </main>
        );
    }

    if (!campaign) {
        return null;
    }

    // Calculate stats
    const totalRegistered = registrations.length;
    const totalCompleted = registrations.filter(r => r.status?.toLowerCase() === 'completed').length;
    const totalCancelled = registrations.filter(r => r.status?.toLowerCase() === 'cancelled').length;
    const totalDeferred = registrations.filter(r => r.status?.toLowerCase() === 'deferred').length;
    const totalBloodMl = registrations
        .filter(r => r.status?.toLowerCase() === 'completed')
        .reduce((sum, r) => sum + (r.blood_volume || 350), 0);
    const targetMl = (campaign.target_units || 10) * 350; // Assuming 350ml per unit
    const progress = targetMl > 0 ? (totalBloodMl / targetMl) * 100 : 0;

    // Filter registrations
    const filteredRegistrations = registrations.filter(r => {
        const fullName = r.user?.full_name || "";
        const email = r.user?.email || "";
        const phone = r.user?.phone || "";
        const query = searchQuery.toLowerCase();

        const matchesSearch = fullName.toLowerCase().includes(query) ||
            email.toLowerCase().includes(query) ||
            phone.includes(query);
        const matchesStatus = statusFilter === 'all' || r.status?.toLowerCase() === statusFilter.toLowerCase();
        const matchesBloodType = bloodTypeFilter === 'all' || (r.blood_type || r.user?.blood_group) === bloodTypeFilter;
        return matchesSearch && matchesStatus && matchesBloodType;
    });

    // Export to CSV
    const handleExport = () => {
        const csv = [
            ['STT', 'Họ tên', 'Email', 'Số điện thoại', 'Nhóm máu', 'Lượng máu (ml)', 'Trạng thái', 'Thời gian đăng ký'],
            ...filteredRegistrations.map((r, i) => [
                i + 1,
                r.user?.full_name || '',
                r.user?.email || '',
                r.user?.phone || '',
                r.blood_type || r.user?.blood_group || '',
                r.blood_volume || '',
                r.status || '',
                new Date(r.created_at).toLocaleString('vi-VN')
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `danh-sach-dang-ky-${campaign.name}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success('Đã xuất file CSV');
    };

    const handleSendAnnouncement = async () => {
        if (!announcementMsg.trim()) {
            toast.error("Vui lòng nhập nội dung thông báo");
            return;
        }

        setIsSending(true);
        try {
            const result = await campaignService.sendAnnouncement(campaignId, announcementMsg, emailType);

            if (result.summary?.failed > 0) {
                const firstError = result.details?.find((d: any) => !d.success)?.error;
                const errorMessage = typeof firstError === 'object' ? (firstError.message || JSON.stringify(firstError)) : firstError;

                toast.warning(`Thất bại: ${result.summary.failed}/${result.summary.total} người`, {
                    description: `Lỗi: ${errorMessage || 'Hết hạn hoặc sai API Key'}. \n(Tài khoản Resend mới chỉ gửi được đến email của bạn).`
                });
            } else {
                toast.success("Đã gửi thông báo thành công!", {
                    description: `Đã gửi đến ${result.summary?.success || 0} người hiến máu.`
                });
            }
            setIsDialogOpen(false);
            setAnnouncementMsg('');
            setEmailType('announcement'); // Reset về default
        } catch (error: any) {
            toast.error("Gửi thông báo thất bại", {
                description: error.message
            });
        } finally {
            setIsSending(false);
        }
    };

    // Handle confirm donation
    const handleConfirmDonation = async (regId: string) => {
        try {
            // In demo mode, only update local state
            await campaignService.updateRegistrationStatus(regId, 'Completed');
            setRegistrations(prev => prev.map(r =>
                r.id === regId ? { ...r, status: 'Completed' } : r
            ));
            toast.success('Đã xác nhận hiến máu thành công!');
        } catch (error: any) {
            toast.error('Lỗi xác nhận: ' + error.message);
        }
    };

    // Handle defer donation
    const handleDeferDonation = async (regId: string) => {
        try {
            // In demo mode, only update local state
            await campaignService.updateRegistrationStatus(regId, 'Deferred');
            setRegistrations(prev => prev.map(r =>
                r.id === regId ? { ...r, status: 'Deferred' } : r
            ));
            toast.success('Đã hủy hồ sơ hiến máu');
        } catch (error: any) {
            toast.error('Lỗi: ' + error.message);
        }
    };

    // Handle edit - reset to Booked
    const handleEditRegistration = async (regId: string) => {
        try {
            // In demo mode, only update local state
            await campaignService.updateRegistrationStatus(regId, 'Booked');
            setRegistrations(prev => prev.map(r =>
                r.id === regId ? { ...r, status: 'Booked' } : r
            ));
            setOpenActionMenu(null);
            toast.success('Đã mở lại để chỉnh sửa');
        } catch (error: any) {
            toast.error('Lỗi: ' + error.message);
        }
    };

    // Handle update blood type
    const handleUpdateBloodType = async (regId: string, bloodType: string) => {
        try {
            // In demo mode, only update local state
            await campaignService.updateRegistration(regId, { blood_type: bloodType });
            setRegistrations(prev => prev.map(r =>
                r.id === regId ? { ...r, blood_type: bloodType } : r
            ));
            setOpenBloodTypeDropdown(null);
            toast.success('Đã cập nhật nhóm máu');
        } catch (error: any) {
            toast.error('Lỗi cập nhật: ' + error.message);
        }
    };

    // Handle update blood volume
    const handleUpdateVolume = async (regId: string, volume: number) => {
        try {
            // In demo mode, only update local state
            await campaignService.updateRegistration(regId, { blood_volume: volume });
            setRegistrations(prev => prev.map(r =>
                r.id === regId ? { ...r, blood_volume: volume } : r
            ));
            setOpenVolumeDropdown(null);
            toast.success('Đã cập nhật lượng máu');
        } catch (error: any) {
            toast.error('Lỗi cập nhật: ' + error.message);
        }
    };

    // Handle image upload logic
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước ảnh quá lớn (tối đa 5MB)");
            return;
        }

        const loadingToast = toast.loading("Đang tải ảnh lên...");
        try {
            const url = await userService.uploadImage(file, 'avatars');
            setEditFormData(prev => ({ ...prev, image: url }));
            toast.success("Tải ảnh thành công", { id: loadingToast });
        } catch (error: any) {
            console.error("Upload failed:", error);
            toast.error("Lỗi tải ảnh: " + (error.message || "Lỗi"), { id: loadingToast });
        }
    };

    // --- EDIT CAMPAIGN HANDLERS ---
    const openEditModal = () => {
        if (!campaign) return;

        const initialBloodGroups = parseBloodGroups(campaign.target_blood_group);

        // Extract image from description if embedded
        let desc = campaign.description || '';
        let img = campaign.image || campaign.image_url || '';

        const imgMatch = desc.match(/<div data-cover="([^"]+)"[^>]*><\/div>/);
        if (imgMatch) {
            img = imgMatch[1];
            desc = desc.replace(imgMatch[0], '');
        }

        // Check for Paused metadata in description
        let status = campaign.status || 'active';
        if (status === 'active' && desc.includes('data-status="paused"')) {
            status = 'paused';
            const pauseMatch = desc.match(/<div data-status="paused"[^>]*><\/div>/);
            if (pauseMatch) {
                desc = desc.replace(pauseMatch[0], '');
            }
        }

        // Strip HTML from desc for text area but keep line breaks if possible?
        // Assuming desc is mostly plain text or stripped.
        desc = stripHtml(desc);

        setEditFormData({
            name: campaign.name || '',
            location_name: campaign.location_name || '',
            date: campaign.start_time ? format(new Date(campaign.start_time), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            start_time: campaign.start_time ? format(new Date(campaign.start_time), 'HH:mm') : '08:00',
            end_time: campaign.end_time ? format(new Date(campaign.end_time), 'HH:mm') : '17:00',
            target_units: campaign.target_units || 0,
            status: status, // Use calculated status
            description: desc,
            target_blood_group: initialBloodGroups,
            image: img
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateCampaign = async () => {
        try {
            setIsSubmitting(true);
            const startStr = `${editFormData.date}T${editFormData.start_time}:00`;
            const endStr = `${editFormData.date}T${editFormData.end_time}:00`;

            if (new Date(startStr) >= new Date(endStr)) {
                toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
                setIsSubmitting(false);
                return;
            }

            // Embed image logic and Status logic
            let finalDesc = editFormData.description;
            // 1. Add Paused Marker if status is paused
            if (editFormData.status === 'paused') {
                finalDesc = `<div data-status="paused" style="display:none"></div>` + finalDesc;
            }
            // 2. Add Image Marker if image exists
            if (editFormData.image) {
                finalDesc = `<div data-cover="${editFormData.image}" style="display:none"></div>` + finalDesc;
            }

            const dbStatus = (editFormData.status === 'paused') ? 'active' : editFormData.status;

            const updateData = {
                name: editFormData.name,
                location_name: editFormData.location_name,
                start_time: startStr,
                end_time: endStr,
                target_units: editFormData.target_units,
                status: dbStatus, // Send active instead of paused to satisfy constraint
                description: finalDesc,
                target_blood_group: editFormData.target_blood_group
            };

            await campaignService.updateCampaign(campaignId, updateData);
            const updated = await campaignService.getById(campaignId as string);
            setCampaign(updated);
            toast.success('Cập nhật chiến dịch thành công');
            setIsEditModalOpen(false);
        } catch (error: any) {
            toast.error('Lỗi khi cập nhật: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEndCampaign = async () => {
        if (!confirm('Bạn có chắc chắn muốn kết thúc chiến dịch này sớm? Tất cả các lịch hẹn "Đã đặt lịch" sẽ bị hủy.')) return;
        try {
            setIsSubmitting(true);

            // 1. Update campaign status. Use 'cancelled' as it is a standard valid status likely allowed by constraint.
            // 'completed', 'closed', 'paused' seem to be invalid based on user reports.
            await campaignService.updateCampaign(campaignId, { status: 'cancelled' });

            // 2. Fetch latest registrations to be sure
            const currentRegs = await campaignService.getCampaignRegistrations(campaignId);

            // 3. Filter Booked ones
            const bookedRegs = currentRegs.filter((r: any) => r.status === 'Booked');

            // 4. Cancel each one
            await Promise.all(bookedRegs.map((r: any) =>
                campaignService.updateRegistrationStatus(r.id, 'Cancelled')
            ));

            const updated = await campaignService.getById(campaignId as string);
            setCampaign(updated);

            // Refresh local registrations state
            const newRegs = await campaignService.getCampaignRegistrations(campaignId);
            setRegistrations(newRegs || []);

            toast.success('Đã kết thúc chiến dịch và hủy các lịch hẹn chưa hoàn thành');
            setIsEditModalOpen(false);

            // Redirect to history tab optionally
            // router.push('/hospital-campaign?tab=history');
        } catch (error: any) {
            toast.error('Lỗi khi kết thúc chiến dịch: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleBloodGroup = (group: string) => {
        setEditFormData(prev => {
            const isExist = prev.target_blood_group.includes(group);
            return {
                ...prev,
                target_blood_group: isExist
                    ? prev.target_blood_group.filter(g => g !== group)
                    : [...prev.target_blood_group, group]
            };
        });
    };

    // Get avatar color based on name
    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600',
            'bg-blue-50 dark:bg-blue-900/30 text-blue-600',
            'bg-purple-50 dark:bg-purple-900/30 text-purple-600',
            'bg-pink-50 dark:bg-pink-900/30 text-pink-600',
            'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600',
            'bg-amber-50 dark:bg-amber-900/30 text-amber-600',
        ];
        const index = name?.charCodeAt(0) % colors.length || 0;
        return colors[index];
    };

    // Get status display
    const getStatusDisplay = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return {
                    label: 'Hoàn thành',
                    className: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                };
            case 'cancelled':
                return {
                    label: 'Đã hủy',
                    className: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800'
                };
            case 'deferred':
                return {
                    label: 'Hủy hồ sơ',
                    className: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                };
            default:
                return {
                    label: 'Đã đặt lịch',
                    className: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800'
                };
        }
    };

    const isCampaignEnded = campaign.status?.toLowerCase() === 'completed' || campaign.status?.toLowerCase() === 'cancelled';

    return (
        <main className="flex-1 overflow-y-auto">
            {/* Header */}
            <header className="h-20 px-8 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/hospital-campaign?tab=${fromTab}`}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </Link>
                    <nav className="flex items-center text-sm text-slate-500 gap-2">
                        <span>Chiến dịch</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-slate-900 dark:text-white font-medium">Chi tiết</span>
                    </nav>
                </div>
            </header>



            <div className="p-8 max-w-7xl mx-auto">
                {/* Title Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
                            {campaign.name}
                        </h1>
                        <div className="flex items-center gap-6 text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">{campaign.location_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {new Date(campaign.start_time).toLocaleDateString('vi-VN')} - {new Date(campaign.end_time).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsDialogOpen(true)}
                            className="flex items-center gap-2.5 px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[11px] font-black rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all active:scale-95 uppercase tracking-wider"
                        >
                            <Megaphone className="w-4 h-4" />
                            Gửi Email Thông Báo
                        </button>
                        <button
                            onClick={openEditModal}
                            className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            {/* Blood Type Badge */}
                            <span className="px-3 py-1.5 text-xs font-bold rounded-lg border bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800 flex items-center gap-1.5">
                                <Droplet className="w-3.5 h-3.5" />
                                {(() => {
                                    const groups = parseBloodGroups(campaign.target_blood_group);
                                    if (groups.length === 0 || groups.length === 8) return "Tất cả các nhóm";
                                    if (groups.length >= 5) return "Hỗn hợp (" + groups.length + ")";
                                    return groups.join(", ");
                                })()}
                            </span>
                            <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${campaign.status === 'active'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                                : (['completed', 'cancelled', 'ended', 'closed'].includes(campaign.status))
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                    : (campaign.status === 'active' && campaign.description?.includes('data-status="paused"')) // Check metadata
                                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800'
                                        : campaign.status === 'draft' // Check for real draft
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200'
                                            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                                }`}>
                                {campaign.status === 'active'
                                    ? (campaign.description?.includes('data-status="paused"') ? 'Tạm dừng' : 'Đang hoạt động')
                                    : (campaign.status === 'cancelled' || campaign.status === 'completed' || campaign.status === 'ended') ? 'Đã kết thúc' :
                                        campaign.status === 'draft' ? 'Bản nháp' : 'Đã kết thúc'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 mb-3">
                            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                <Users className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đăng ký</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalRegistered}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 mb-3">
                            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hoàn thành</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalCompleted}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 mb-3">
                            <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                                <Clock className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hoãn hiến</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalDeferred}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 mb-3">
                            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                <Droplet className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tiến độ</span>
                        </div>
                        <div className="flex items-end justify-between mb-2">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(progress)}%</div>
                            <span className="text-[10px] text-slate-400 mb-1">Mục tiêu: {targetMl}ml</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="bg-indigo-600 h-full transition-all duration-500"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {/* Filters */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-xs transition-all outline-none"
                                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                            />
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 min-w-[170px] outline-none"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="Booked">Đã đặt lịch</option>
                                <option value="Completed">Hoàn thành</option>
                                <option value="Deferred">Hoãn hiến</option>
                                <option value="Cancelled">Đã hủy</option>
                            </select>
                            <select
                                value={bloodTypeFilter}
                                onChange={(e) => setBloodTypeFilter(e.target.value)}
                                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 min-w-[150px] outline-none"
                            >
                                <option value="all">Tất cả nhóm máu</option>
                                {BLOOD_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-100 dark:shadow-none whitespace-nowrap"
                            >
                                <Download className="w-4 h-4" />
                                XUẤT CSV
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-visible min-h-[400px]">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">STT</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">NGƯỜI HIẾN MÁU</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">LIÊN HỆ</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">NHÓM MÁU</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">LƯỢNG (ML)</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">TRẠNG THÁI</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            Chưa có người đăng ký
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRegistrations.map((reg, index) => {
                                        const statusLower = reg.status?.toLowerCase();
                                        const statusInfo = getStatusDisplay(reg.status);
                                        const isBooked = statusLower === 'booked' || !reg.status;
                                        const isCompleted = statusLower === 'completed';
                                        const isDeferred = statusLower === 'deferred';
                                        const bloodType = reg.blood_type || reg.user?.blood_group || 'N/A';
                                        const bloodVolume = reg.blood_volume || 350;
                                        const initial = reg.user?.full_name?.charAt(0)?.toUpperCase() || 'U';
                                        const isDropdownOpen = openBloodTypeDropdown === reg.id || openVolumeDropdown === reg.id || openActionMenu === reg.id;

                                        // Status colors for individual columns
                                        const bloodTypeStyle = isBooked
                                            ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30 text-rose-600'
                                            : 'bg-rose-50/50 dark:bg-rose-900/5 border-rose-100/50 dark:border-rose-900/20 text-rose-400';

                                        const volumeStyle = isBooked
                                            ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30 text-indigo-600'
                                            : 'bg-indigo-50/50 dark:bg-indigo-900/5 border-indigo-100/50 dark:border-indigo-900/20 text-indigo-400';

                                        return (
                                            <tr key={reg.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group ${isDropdownOpen ? 'relative z-[50]' : ''}`}>
                                                <td className="px-6 py-3.5 text-xs font-bold text-slate-400">
                                                    {String(index + 1).padStart(2, '0')}
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(reg.user?.full_name)}`}>
                                                            {initial}
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-bold text-slate-900 dark:text-white uppercase">
                                                                {reg.user?.full_name || 'N/A'}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500">{reg.user?.email || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                        <div>
                                                            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                                                                {reg.user?.phone || 'N/A'}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400">
                                                                {reg.user?.address || 'Chưa có địa chỉ'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {/* Blood Type Dropdown */}
                                                    <div className={`relative ${openBloodTypeDropdown === reg.id ? 'z-[60]' : ''}`} data-dropdown-trigger>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!isCampaignEnded && isBooked) {
                                                                    setOpenBloodTypeDropdown(openBloodTypeDropdown === reg.id ? null : reg.id);
                                                                    setOpenVolumeDropdown(null);
                                                                    setOpenActionMenu(null);
                                                                }
                                                            }}
                                                            className={`flex items-center justify-between px-2.5 py-1.5 border rounded-lg w-20 transition-all ${bloodTypeStyle} ${!isCampaignEnded && isBooked ? 'cursor-pointer hover:shadow-md hover:border-rose-300 active:scale-95' : 'cursor-default opacity-80'}`}
                                                        >
                                                            <span className="text-xs font-bold">{bloodType}</span>
                                                            {!isCampaignEnded && isBooked && (
                                                                <ChevronDown className="w-3.5 h-3.5 opacity-40" />
                                                            )}
                                                        </button>
                                                        {openBloodTypeDropdown === reg.id && (
                                                            <div
                                                                className="absolute top-full left-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 py-1.5 min-w-[90px] animate-in fade-in zoom-in-95 duration-200"
                                                                data-dropdown
                                                            >
                                                                {BLOOD_TYPES.map(type => (
                                                                    <button
                                                                        key={type}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleUpdateBloodType(reg.id, type);
                                                                        }}
                                                                        className={`w-full px-4 py-2 text-left text-[13px] font-bold transition-all ${bloodType === type
                                                                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                                                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <span>{type}</span>
                                                                            {bloodType === type && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {/* Blood Volume Dropdown */}
                                                    <div className={`relative ${openVolumeDropdown === reg.id ? 'z-[60]' : ''}`} data-dropdown-trigger>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!isCampaignEnded && isBooked) {
                                                                    setOpenVolumeDropdown(openVolumeDropdown === reg.id ? null : reg.id);
                                                                    setOpenBloodTypeDropdown(null);
                                                                    setOpenActionMenu(null);
                                                                }
                                                            }}
                                                            className={`flex items-center justify-between px-2.5 py-1.5 border rounded-lg w-24 transition-all ${volumeStyle} ${!isCampaignEnded && isBooked ? 'cursor-pointer hover:shadow-md hover:border-indigo-300 active:scale-95' : 'cursor-default opacity-80'}`}
                                                        >
                                                            <span className="text-xs font-bold">{bloodVolume} ml</span>
                                                            {!isCampaignEnded && isBooked && (
                                                                <ChevronDown className="w-3.5 h-3.5 opacity-40" />
                                                            )}
                                                        </button>
                                                        {openVolumeDropdown === reg.id && (
                                                            <div
                                                                className="absolute top-full left-0 mt-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 py-2 min-w-[120px] animate-in fade-in zoom-in-95 duration-200"
                                                                data-dropdown
                                                            >
                                                                <div className="px-3 py-1 mb-1 border-b border-slate-100 dark:border-slate-700">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lượng máu (ml)</p>
                                                                </div>
                                                                {BLOOD_VOLUMES.map(vol => (
                                                                    <button
                                                                        key={vol}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleUpdateVolume(reg.id, vol);
                                                                        }}
                                                                        className={`w-full px-4 py-2 text-left text-sm font-bold transition-all ${bloodVolume === vol
                                                                            ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <span>{vol} ml</span>
                                                                            {bloodVolume === vol && <CheckCircle2 className="w-3 h-3" />}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 text-center">
                                                    <span className={`px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded border ${statusInfo.className}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center justify-end gap-2.5">
                                                        {isCampaignEnded ? (
                                                            <span className="text-[10px] text-slate-400 font-medium">
                                                                Kết thúc hồ sơ
                                                            </span>
                                                        ) : isBooked ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleConfirmDonation(reg.id)}
                                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-200 dark:shadow-none transition-all active:scale-95"
                                                                >
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    XÁC NHẬN
                                                                </button>
                                                                {/* Action Menu */}
                                                                <div className={`relative ${openActionMenu === reg.id ? 'z-[60]' : ''}`} data-dropdown-trigger>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setOpenActionMenu(openActionMenu === reg.id ? null : reg.id);
                                                                            setOpenBloodTypeDropdown(null);
                                                                            setOpenVolumeDropdown(null);
                                                                        }}
                                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                                    >
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </button>
                                                                    {openActionMenu === reg.id && (
                                                                        <div className="absolute top-full right-0 mt-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 py-1.5 min-w-[130px] animate-in fade-in zoom-in-95 duration-200" data-dropdown>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeferDonation(reg.id);
                                                                                    setOpenActionMenu(null);
                                                                                }}
                                                                                className="w-full px-3 py-1.5 text-left text-[13px] font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-2"
                                                                            >
                                                                                <Clock className="w-3.5 h-3.5" />
                                                                                Hủy hồ sơ
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            /* Just the action menu for Completed/Deferred */
                                                            <div className={`relative ${openActionMenu === reg.id ? 'z-[60]' : ''}`} data-dropdown-trigger>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenActionMenu(openActionMenu === reg.id ? null : reg.id);
                                                                        setOpenBloodTypeDropdown(null);
                                                                        setOpenVolumeDropdown(null);
                                                                    }}
                                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                                >
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </button>
                                                                {openActionMenu === reg.id && (
                                                                    <div className="absolute top-full right-0 mt-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 py-1.5 min-w-[150px] animate-in fade-in zoom-in-95 duration-200" data-dropdown>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleEditRegistration(reg.id);
                                                                            }}
                                                                            className="w-full px-3 py-1.5 text-left text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                                                                        >
                                                                            <Edit2 className="w-3.5 h-3.5" />
                                                                            Chỉnh sửa
                                                                        </button>
                                                                        {isCompleted && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeferDonation(reg.id);
                                                                                    setOpenActionMenu(null);
                                                                                }}
                                                                                className="w-full px-3 py-1.5 text-left text-[13px] font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-2 border-t border-slate-50 dark:border-slate-800 mt-1 pt-1"
                                                                            >
                                                                                <Clock className="w-3.5 h-3.5" />
                                                                                Hủy hồ sơ
                                                                            </button>
                                                                        )}
                                                                        {isDeferred && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleConfirmDonation(reg.id);
                                                                                    setOpenActionMenu(null);
                                                                                }}
                                                                                className="w-full px-3 py-1.5 text-left text-[13px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-2 border-t border-slate-50 dark:border-slate-800 mt-1 pt-1"
                                                                            >
                                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                                Xác nhận hiến
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-500">
                            Hiển thị 1 - {filteredRegistrations.length} trên tổng số {filteredRegistrations.length} người hiến máu
                        </p>
                        <div className="flex items-center gap-2">
                            <button className="p-2 disabled:opacity-30 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" disabled>
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold">1</button>
                            <button className="p-2 disabled:opacity-30 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" disabled>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Edit Campaign Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-[600px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800">
                        {/* Header */}
                        <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <CalendarDays className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-slate-900 dark:text-white text-lg font-extrabold tracking-tight">Chỉnh sửa Chiến dịch</h2>
                                    <p className="text-slate-400 text-[11px] font-medium">Cập nhật thông tin yêu cầu hiến máu</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="size-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="px-10 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-4">
                                {/* Image Upload */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Ảnh bìa chiến dịch</label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative size-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 flex-shrink-0">
                                            {editFormData.image ? (
                                                <img src={editFormData.image} alt="Campaign Cover" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-slate-400">
                                                    <LayoutGrid className="w-8 h-8 opacity-50" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="edit-campaign-image-detail"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                            <label
                                                htmlFor="edit-campaign-image-detail"
                                                className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all"
                                            >
                                                <Edit2 className="w-3 h-3 mr-2" />
                                                Thay đổi ảnh
                                            </label>
                                            <p className="text-[10px] text-slate-400 mt-1 max-w-xs">Hỗ trợ PNG, JPG (Max 5MB).</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Tên chiến dịch</label>
                                    <input
                                        type="text"
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        className="w-full h-11 px-5 rounded-full border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 text-sm transition-all duration-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 outline-none text-slate-900 dark:text-white"
                                        placeholder="Nhập tên chiến dịch..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Ngày diễn ra</label>
                                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                            <PopoverTrigger asChild>
                                                <button className={cn(
                                                    "flex w-full items-center justify-between rounded-full h-11 px-5 text-sm border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 hover:border-indigo-400 transition-all outline-none shadow-sm",
                                                    !editFormData.date && "text-slate-400"
                                                )}>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                                        {editFormData.date ? format(new Date(editFormData.date), "dd/MM/yyyy", { locale: vi }) : "Chọn ngày..."}
                                                    </span>
                                                    <CalendarDays className="text-slate-400 w-4 h-4" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-slate-200 dark:border-slate-800 z-[110]" align="start">
                                                <ShCalendar
                                                    mode="single"
                                                    selected={editFormData.date ? new Date(editFormData.date + 'T00:00:00') : undefined}
                                                    onSelect={(date: Date | undefined) => {
                                                        if (date) {
                                                            setEditFormData({ ...editFormData, date: format(date, 'yyyy-MM-dd') });
                                                            setIsCalendarOpen(false);
                                                        }
                                                    }}
                                                    initialFocus
                                                    locale={vi}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Thời gian tổ chức</label>
                                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 p-1 rounded-2xl w-fit border border-slate-100 dark:border-white/5">
                                            <TimeInput
                                                value={editFormData.start_time}
                                                onChange={(val: string) => setEditFormData({ ...editFormData, start_time: val })}
                                            />
                                            <span className="text-slate-300 font-bold opacity-30 select-none px-1">~</span>
                                            <TimeInput
                                                value={editFormData.end_time}
                                                onChange={(val: string) => setEditFormData({ ...editFormData, end_time: val })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Địa điểm</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={editFormData.location_name}
                                            onChange={(e) => setEditFormData({ ...editFormData, location_name: e.target.value })}
                                            className="w-full h-11 px-5 rounded-full border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 text-sm focus:ring-4 focus:ring-indigo-500/5 outline-none text-slate-900 dark:text-white"
                                            placeholder="Địa chỉ tổ chức..."
                                        />
                                        <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Mô tả chiến dịch</label>
                                    <textarea
                                        value={editFormData.description}
                                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                        className="w-full h-24 px-5 py-3 rounded-2xl border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 text-sm focus:ring-4 focus:ring-indigo-500/5 outline-none text-slate-900 dark:text-white resize-none"
                                        placeholder="Nhập nội dung giới thiệu chiến dịch..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Nhóm máu yêu cầu</label>
                                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                        {BLOOD_TYPES.map(group => (
                                            <button
                                                key={group}
                                                onClick={() => toggleBloodGroup(group)}
                                                className={`h-9 flex items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300 border ${editFormData.target_blood_group.includes(group)
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 scale-105'
                                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {group}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Mục tiêu (Đơn vị)</label>
                                        <input
                                            type="number"
                                            value={editFormData.target_units}
                                            onChange={(e) => setEditFormData({ ...editFormData, target_units: parseInt(e.target.value) || 0 })}
                                            className="w-full h-11 px-5 rounded-full border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 text-sm focus:ring-4 focus:ring-indigo-500/5 outline-none text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-slate-700 dark:text-slate-300 text-[12px] font-bold ml-1">Trạng thái HĐ</label>
                                        <div className="relative">
                                            <select
                                                value={editFormData.status}
                                                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                                className="w-full h-11 px-5 rounded-full border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/50 text-sm appearance-none focus:ring-4 focus:ring-indigo-500/5 outline-none text-slate-900 dark:text-white"
                                            >
                                                <option value="active">Đang hoạt động</option>
                                                <option value="paused">Tạm dừng</option>
                                            </select>
                                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                            <button
                                onClick={handleEndCampaign}
                                disabled={isSubmitting}
                                className="px-5 h-10 rounded-full border-2 border-rose-500 text-rose-500 text-[11px] font-extrabold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all active:scale-95 disabled:opacity-50"
                            >
                                KẾT THÚC CHIẾN DỊCH
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-5 h-10 text-slate-400 text-xs font-bold hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleUpdateCampaign}
                                    disabled={isSubmitting}
                                    className="px-6 h-10 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full text-xs font-extrabold shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <Clock className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Check className="w-3.5 h-3.5" />
                                    )}
                                    LƯU THAY ĐỔI
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Announcement Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-3xl border-slate-200 dark:border-slate-800 p-0 overflow-hidden bg-white dark:bg-slate-900">
                    <DialogHeader className="p-8 pb-0 space-y-4">
                        <div className="size-14 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Megaphone className="w-7 h-7" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Gửi Thông Báo Chiến Dịch</DialogTitle>
                            <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
                                Nội dung này sẽ được gửi qua Email đến tất cả {registrations.length} người hiến máu trong danh sách.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="p-8 py-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-700/50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tới người hiến máu</p>
                            <div className="flex -space-x-2">
                                {registrations.slice(0, 5).map((reg, i) => (
                                    <div key={i} className={`size-8 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold ${getAvatarColor(reg.user?.full_name)}`}>
                                        {reg.user?.full_name?.charAt(0) || 'U'}
                                    </div>
                                ))}
                                {registrations.length > 5 && (
                                    <div className="size-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                        +{registrations.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Loại thông báo</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEmailType('announcement')}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${emailType === 'announcement'
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">Thông báo chung</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500">Gửi thông tin chiến dịch</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEmailType('registration_success')}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${emailType === 'registration_success'
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">Xác nhận đăng ký</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500">Email cảm ơn & xác nhận</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEmailType('reminder_8h')}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${emailType === 'reminder_8h'
                                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">Nhắc nhở 8 giờ</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500">Nhắc trước 8 tiếng</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEmailType('reminder_4h')}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${emailType === 'reminder_4h'
                                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">Nhắc nhở 4 giờ</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500">Nhắc trước 4 tiếng</p>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nội dung thông điệp</label>
                            <textarea
                                value={announcementMsg}
                                onChange={(e) => setAnnouncementMsg(e.target.value)}
                                placeholder="Ví dụ: Cảm ơn các bạn đã đăng ký! Chiến dịch sẽ diễn ra vào lúc 8:00 sáng mai tại sảnh chính bệnh viện..."
                                className="w-full h-40 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 text-sm font-medium transition-all outline-none text-slate-900 dark:text-white resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0 flex-row gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            HỦY BỎ
                        </Button>
                        <Button
                            onClick={handleSendAnnouncement}
                            disabled={isSending || !announcementMsg.trim()}
                            className="flex-[2] h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ĐANG GỬI...
                                </>
                            ) : (
                                <>
                                    <Megaphone className="w-4 h-4 mr-2" />
                                    GỬI MAIL NGAY
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
