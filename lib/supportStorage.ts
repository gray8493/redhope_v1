
export interface SupportRequest {
    id: number;
    campaignId: number;
    campaignName: string;
    type: "doctor" | "staff" | "supply" | "emergency";
    message: string;
    timestamp: string;
    status: "pending" | "processing" | "completed";
    eta?: string; // Estimated time of arrival
}

const STORAGE_KEY = 'redhope_support_requests';

export const INITIAL_SUPPORT_REQUESTS: SupportRequest[] = [
    {
        id: 1,
        campaignId: 2,
        campaignName: "Westside Center",
        type: "doctor",
        message: "Lượng người hiến tăng đột biến, cần thêm 2 bác sĩ khám sàng lọc gấp.",
        timestamp: new Date().toISOString(),
        status: "pending"
    },
    {
        id: 2,
        campaignId: 1,
        campaignName: "Đợt hiến máu Sảnh chính",
        type: "supply",
        message: "Sắp hết túi đựng máu loại 350ml. Cần bổ sung thêm 50 túi.",
        timestamp: new Date().toISOString(),
        status: "processing",
        eta: "15 phút"
    }
];

export const getSupportRequests = (): SupportRequest[] => {
    if (typeof window === 'undefined') return INITIAL_SUPPORT_REQUESTS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUPPORT_REQUESTS));
        return INITIAL_SUPPORT_REQUESTS;
    }
    try {
        return JSON.parse(stored);
    } catch {
        return INITIAL_SUPPORT_REQUESTS;
    }
};

export const updateSupportRequest = (updated: SupportRequest) => {
    if (typeof window === 'undefined') return;
    const requests = getSupportRequests();
    const index = requests.findIndex(r => r.id === updated.id);
    if (index !== -1) {
        requests[index] = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
        window.dispatchEvent(new Event('support-storage-update'));
    }
};

export const addSupportRequest = (req: Omit<SupportRequest, "id">) => {
    if (typeof window === 'undefined') return;
    const requests = getSupportRequests();
    const newId = requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1;
    const newReq = { ...req, id: newId };
    requests.unshift(newReq);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    window.dispatchEvent(new Event('support-storage-update'));
};

export const subscribeToSupportUpdates = (callback: () => void) => {
    if (typeof window === 'undefined') return () => { };
    window.addEventListener('support-storage-update', callback);
    window.addEventListener('storage', callback);
    return () => {
        window.removeEventListener('support-storage-update', callback);
        window.removeEventListener('storage', callback);
    };
};
