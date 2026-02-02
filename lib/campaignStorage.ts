
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
        name: "Đợt hiến máu Sảnh chính",
        desc: "Đợt khẩn cấp để bổ sung kho dự trữ chấn thương tại Cánh Trung tâm.",
        location: "Cố định địa điểm",
        bloodType: "O+",
        bloodClass: "text-red-600 bg-red-50 dark:bg-red-900/20",
        status: "KHẨN CẤP",
        statusClass: "bg-red-600 text-white",
        operationalStatus: "Đang hoạt động",
        isUrgent: true,
        timeLeft: "4h nữa",
        progress: 84,
        target: 50000,
        current: 42000,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkwqmAqLI6RRbjwFBWAQepU9EHp2QwQrSXSpz2egp-_MAoQKAp2b_mINCI3B3qDzgMx-O-doNpPCosqmbxPw9v6DNohOs_zJ2vn3RcizDE7GkgblK-BRih8n9qkG4WMG-5qm8ZkrBY-ZDvufrqAFdozTbQvyq0g1NhXAhav-Op6honeKgmN_OJYTk8GUgcbNU3uiqkTT2ej2gqadiIxfU3NZHY9WYeTbSf5FTEZeiM4Jq6ZpgPp3dPSAI-93yojBe68-TkJEZb548a",
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
        name: "Trạm lưu động B",
        desc: "Tìm kiếm người hiến máu cho kho dự trữ máu khu vực. Đợt định kỳ.",
        location: "Cố định địa điểm",
        bloodType: "B-",
        bloodClass: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
        status: "TIÊU CHUẨN",
        statusClass: "bg-blue-500 text-white",
        operationalStatus: "Đang hoạt động",
        isUrgent: false,
        timeLeft: "12h nữa",
        progress: 90,
        target: 100000,
        current: 90000,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAot4xPAMUp5lUIPsSJJyccROrnkYYprQzv7ryqFHlteSunaA__adl4furC22nAiULqkv6sVxlSnwmMJdJ5H4N3kx8XXtIJAUK37egDeP42nbmQtlcqiPPC3HNdzxRfJFTW2S3tCC8tDt5wTl5Jp_riORSErmlLpzNJ53S5gvuSIqk4riLTHBMiLq-tTtC7p0Kiy0gSoBx6CJ1gCakYwK8CRA6_wF46IumEs03BqwY5lnBtZLEHOjRsF1tVBHRqt1le6I1IkOdV10e8",
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
        name: "Dạ tiệc Tại Phòng khiêu vũ",
        desc: "Dạ tiệc hiến máu thường niên tại Phòng khiêu vũ lớn kèm khám sức khỏe.",
        location: "Cố định địa điểm",
        bloodType: "A+",
        bloodClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
        status: "TIÊU CHUẨN",
        statusClass: "bg-blue-500 text-white",
        operationalStatus: "Đang hoạt động",
        isUrgent: false,
        timeLeft: "2 ngày nữa",
        progress: 15,
        target: 200000,
        current: 30000,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZiNSYWEy5ZAjxyaFcmn3iOyddBWPAo-t4t2XsfTJGxeJi9pEE3PcQvHukQOiZiZfZKJ_NqFXxSTeco2-MSerQKRL5_r53tmMnHyXvtxhRQzJ-vzOaZ2giorfxNjOUDLlGVHBskP1VPCvzakxwSAOsMZr4J8ReKbJJN6CCOy0gM-ah-B09uje6IwWuV197aU3UNyQYOKs0zvUVmjFBEd3wBkFq6J8WRnVolp_edDc9AwGCPjvU6M1HOqDmErPtLflVEa6odlYKvEr2",
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
        name: "Đợt hiến máu Khu công nghệ",
        desc: "Sự kiện đối tác doanh nghiệp sắp tới tại Khu Thương mại phía Bắc.",
        location: "Cố định địa điểm",
        bloodType: "Tất cả",
        bloodClass: "text-slate-600 bg-slate-100 dark:bg-slate-800",
        status: "TIÊU CHUẨN",
        statusClass: "bg-blue-500 text-white",
        operationalStatus: "Tạm dừng",
        isUrgent: false,
        timeLeft: "Tuần tới",
        progress: 0,
        target: 150000,
        current: 0,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZiNSYWEy5ZAjxyaFcmn3iOyddBWPAo-t4t2XsfTJGxeJi9pEE3PcQvHukQOiZiZfZKJ_NqFXxSTeco2-MSerQKRL5_r53tmMnHyXvtxhRQzJ-vzOaZ2giorfxNjOUDLlGVHBskP1VPCvzakxwSAOsMZr4J8ReKbJJN6CCOy0gM-ah-B09uje6IwWuV197aU3UNyQYOKs0zvUVmjFBEd3wBkFq6J8WRnVolp_edDc9AwGCPjvU6M1HOqDmErPtLflVEa6odlYKvEr2",
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
