/**
 * VietQR Service
 * Tạo URL QR code động theo chuẩn Napas thông qua VietQR.io API (miễn phí).
 *
 * Cơ chế: Tạo URL ảnh QR chứa số tiền, nội dung chuyển khoản và thông tin
 * tài khoản. Người dùng quét bằng app ngân hàng → xác nhận → chuyển khoản.
 *
 * Tham khảo: https://www.vietqr.io/danh-sach-api/link-tao-qr
 */

// Danh sách ngân hàng phổ biến (BIN code theo chuẩn Napas)
export const BANK_LIST = {
    VCB: { bin: '970436', name: 'Vietcombank', shortName: 'VCB' },
    TCB: { bin: '970407', name: 'Techcombank', shortName: 'TCB' },
    MB: { bin: '970422', name: 'MB Bank', shortName: 'MB' },
    ACB: { bin: '970416', name: 'ACB', shortName: 'ACB' },
    BIDV: { bin: '970418', name: 'BIDV', shortName: 'BIDV' },
    VPB: { bin: '970432', name: 'VPBank', shortName: 'VPB' },
    TPB: { bin: '970423', name: 'TPBank', shortName: 'TPB' },
    STB: { bin: '970403', name: 'Sacombank', shortName: 'STB' },
    VIB: { bin: '970441', name: 'VIB', shortName: 'VIB' },
    MSB: { bin: '970426', name: 'MSB', shortName: 'MSB' },
} as const;

export type BankCode = keyof typeof BANK_LIST;

export interface VietQRConfig {
    bankCode: BankCode;
    accountNumber: string;
    accountName: string;
}

export interface VietQRPayload {
    amount: number;
    description: string;
    template?: 'compact' | 'compact2' | 'qr_only' | 'print';
}

// Cấu hình tài khoản nhận tiền của RedHope (có thể chuyển ra env)
export const REDHOPE_BANK_CONFIG: VietQRConfig = {
    bankCode: 'VCB',
    accountNumber: '123456789012',
    accountName: 'REDHOPE VN',
};

/**
 * Tạo URL ảnh QR VietQR động.
 * URL format: https://img.vietqr.io/image/<BANK_BIN>-<ACC_NUMBER>-<TEMPLATE>.png?amount=X&addInfo=Y&accountName=Z
 */
export function generateVietQRUrl(
    payload: VietQRPayload,
    config: VietQRConfig = REDHOPE_BANK_CONFIG
): string {
    const bank = BANK_LIST[config.bankCode];
    const template = payload.template || 'compact2';

    const params = new URLSearchParams();
    if (payload.amount > 0) {
        params.set('amount', payload.amount.toString());
    }
    if (payload.description) {
        params.set('addInfo', payload.description);
    }
    if (config.accountName) {
        params.set('accountName', config.accountName);
    }

    return `https://img.vietqr.io/image/${bank.bin}-${config.accountNumber}-${template}.png?${params.toString()}`;
}

/**
 * Tạo nội dung chuyển khoản chuẩn cho RedHope.
 * Format: REDHOPE <6 ký tự cuối của donation ID>
 */
export function generateTransferContent(donationId: string): string {
    const suffix = donationId.slice(-6).toUpperCase();
    return `REDHOPE ${suffix}`;
}

/**
 * Format số tài khoản để hiển thị (thêm khoảng trắng).
 * 123456789012 → 1234 5678 9012
 */
export function formatAccountNumber(accountNumber: string): string {
    return accountNumber.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Lấy danh sách ngân hàng hỗ trợ VietQR (fetch từ API).
 * Dùng cho dropdown chọn ngân hàng (nếu cần mở rộng sau này).
 */
export async function fetchSupportedBanks(): Promise<Array<{
    id: number;
    name: string;
    code: string;
    bin: string;
    shortName: string;
    logo: string;
}>> {
    try {
        const res = await fetch('https://api.vietqr.io/v2/banks');
        if (!res.ok) throw new Error('Failed to fetch banks');
        const data = await res.json();
        return data.data || [];
    } catch (error) {
        console.error('[VietQR] Error fetching banks:', error);
        return [];
    }
}
