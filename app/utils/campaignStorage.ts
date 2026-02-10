
export interface Appointment {
    id: number;
    name: string;
    type: string;
    code: string;
    blood: string;
    bloodClass: string;
    time: string;
    status: string;
    statusClass: string;
    donated?: number;
}

export interface Campaign {
    id: number;
    name: string;
    desc: string;
    location: string;
    bloodType: string;
    bloodClass: string;
    status: string; // Used for Badge Text (e.g. Khẩn cấp, Sắp hết)
    statusClass: string;
    operationalStatus?: string; // New field for Active/Paused state
    isUrgent: boolean;
    timeLeft: string;
    progress: number;
    target: number;
    current: number;
    image: string;
    date?: string;
    staffCount?: number;
    bloodTypes?: string[];
    // New fields for extended stats
    completedCount?: number;
    deferredCount?: number;
    registeredCount?: number;
    startTime?: string;
    endTime?: string;
    appointments?: Appointment[];
    organization?: string; // New field for Organization Name
    radius?: string; // New field for Notification Radius
}

export const INITIAL_CAMPAIGNS: Campaign[] = [
    {
        id: 1,
        name: "Ngày hội Hiến máu Nhân đạo",
        desc: "Đợt khẩn cấp hỗ trợ ngân hàng máu TP.HCM phục vụ các ca cấp cứu cuối năm.",
        location: "Nhà văn hóa Thanh niên",
        bloodType: "O+",
        bloodClass: "text-red-600 bg-red-50 dark:bg-red-900/20",
        status: "KHẨN CẤP",
        statusClass: "bg-red-600 text-white",
        operationalStatus: "Đang hoạt động",
        isUrgent: true,
        timeLeft: "4h nữa",
        progress: 84,
        target: 500,
        current: 420,
        image: "https://images.unsplash.com/photo-1615461066870-fb0dca3f048a?q=80&w=800&auto=format&fit=crop",
        date: "12/10 - 15/10/2024",
        startTime: "07:30",
        endTime: "16:30",
        staffCount: 12,
        bloodTypes: ["O+"],
        completedCount: 120,
        registeredCount: 145
    },
    {
        id: 2,
        name: "Chương trình Giọt máu hồng",
        desc: "Hưởng ứng chiến dịch quốc gia, tìm kiếm người hiến nhóm máu hiếm cho kho dự trữ khu vực.",
        location: "Công viên Thống Nhất",
        bloodType: "B-",
        bloodClass: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
        status: "TIÊU CHUẨN",
        statusClass: "bg-blue-500 text-white",
        operationalStatus: "Đang hoạt động",
        isUrgent: false,
        timeLeft: "12h nữa",
        progress: 90,
        target: 300,
        current: 270,
        image: "https://images.unsplash.com/photo-1579152276503-455b5d8f615f?q=80&w=800&auto=format&fit=crop",
        date: "20/10/2024",
        startTime: "08:00",
        endTime: "11:30",
        staffCount: 8,
        bloodTypes: ["B-"],
        completedCount: 85,
        registeredCount: 92
    },
    {
        id: 3,
        name: "Hiến máu tại Đại học Quốc gia",
        desc: "Sự kiện hiến máu thường niên của sinh viên kèm khám sức khỏe miễn phí.",
        location: "Ký túc xá Khu B",
        bloodType: "A+",
        bloodClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
        status: "TIÊU CHUẨN",
        statusClass: "bg-blue-500 text-white",
        operationalStatus: "Đang hoạt động",
        isUrgent: false,
        timeLeft: "2 ngày nữa",
        progress: 15,
        target: 1000,
        current: 150,
        image: "https://images.unsplash.com/photo-1536856789440-ce723945bc50?q=80&w=800&auto=format&fit=crop",
        date: "25/10/2024",
        startTime: "18:00",
        endTime: "21:00",
        staffCount: 15,
        bloodTypes: ["A+"],
        completedCount: 45,
        registeredCount: 200
    },
    {
        id: 4,
        name: "Ngày hội Công nghệ & Sự sống",
        desc: "Sự kiện đối tác doanh nghiệp tại Khu Công nghệ cao nhằm hỗ trợ ngân hàng máu thành phố.",
        location: "Khu Công nghệ cao (SHTP)",
        bloodType: "Tất cả",
        bloodClass: "text-slate-600 bg-slate-100 dark:bg-slate-800",
        status: "TIÊU CHUẨN",
        statusClass: "bg-blue-500 text-white",
        operationalStatus: "Tạm dừng",
        isUrgent: false,
        timeLeft: "Tuần tới",
        progress: 0,
        target: 200,
        current: 0,
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
        date: "01/11/2024",
        startTime: "09:00",
        endTime: "17:00",
        staffCount: 5,
        bloodTypes: ["A+", "B+", "O+", "AB+"],
        completedCount: 0,
        registeredCount: 50
    }
];

const STORAGE_KEY = 'redhope_campaigns';

// Helper to normalize campaign status
const normalizeStatus = (campaign: Campaign): Campaign => {
    const oldStatuses = ['Định kỳ', 'Sắp hết', 'Đang lên KH', 'Khẩn cấp', 'active', 'draft'];

    if (oldStatuses.includes(campaign.status) || !['KHẨN CẤP', 'TIÊU CHUẨN'].includes(campaign.status)) {
        return {
            ...campaign,
            status: campaign.isUrgent ? 'KHẨN CẤP' : 'TIÊU CHUẨN',
            statusClass: campaign.isUrgent ? 'bg-red-600 text-white' : 'bg-blue-500 text-white'
        };
    }
    return campaign;
};

export const getCampaigns = (): Campaign[] => {
    if (typeof window === 'undefined') return INITIAL_CAMPAIGNS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CAMPAIGNS));
        return INITIAL_CAMPAIGNS;
    }
    try {
        const campaigns = JSON.parse(stored) as Campaign[];
        // Migrate old statuses to new format
        const normalized = campaigns.map(normalizeStatus);
        // Save normalized data back if any changes
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
    } catch {
        return INITIAL_CAMPAIGNS;
    }
};

export const getCampaignById = (id: number): Campaign | undefined => {
    const campaigns = getCampaigns();
    return campaigns.find(c => c.id === id);
};

export const addCampaign = (newCampaign: Campaign) => {
    if (typeof window === 'undefined') return;
    const campaigns = getCampaigns();

    // Generate new ID (max + 1)
    const maxId = campaigns.reduce((max, c) => Math.max(max, c.id), 0);
    const campaignToAdd = { ...newCampaign, id: maxId + 1 };

    campaigns.push(campaignToAdd);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));

    // Dispatch events
    window.dispatchEvent(new Event('campaign-storage-update'));
};

export const updateCampaign = (updatedCampaign: Campaign) => {
    if (typeof window === 'undefined') return;
    const campaigns = getCampaigns();
    const index = campaigns.findIndex(c => c.id === updatedCampaign.id);
    if (index !== -1) {
        campaigns[index] = updatedCampaign;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
            // Dispatch a custom event to notify other components
            window.dispatchEvent(new Event('campaign-storage-update'));
        } catch (e) {
            console.error("Failed to save to localStorage:", e);
            alert("Lỗi: Không thể lưu dữ liệu. Có thể do hình ảnh quá lớn hoặc bộ nhớ trình duyệt đã đầy. Vui lòng thử lại với ảnh nhỏ hơn.");
        }
    }
};

export const deleteCampaign = (id: number) => {
    if (typeof window === 'undefined') return;
    const campaigns = getCampaigns();
    const updatedCampaigns = campaigns.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCampaigns));

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('campaign-storage-update'));
};

export const subscribeToCampaignUpdates = (callback: () => void) => {
    if (typeof window === 'undefined') return () => { };
    window.addEventListener('campaign-storage-update', callback);
    // Also listen for storage events (cross-tab)
    window.addEventListener('storage', callback);
    return () => {
        window.removeEventListener('campaign-storage-update', callback);
        window.removeEventListener('storage', callback);
    };
};
