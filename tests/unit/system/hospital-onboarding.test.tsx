import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LoginPage from '@/app/(auth)/login/page';
import CompleteHospitalProfilePage from '@/app/(auth)/complete-hospital-profile/page';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/user.service';

// Mock dependencies
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: mockPush,
    })),
}));

jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: jest.fn(),
            getUser: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn(),
        })),
    },
}));

jest.mock('@/context/AuthContext', () => ({
    useAuth: jest.fn(),
    AuthProvider: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/services/user.service', () => ({
    userService: {
        upsert: jest.fn(),
    },
}));

jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Loader2: () => <div data-testid="loader" />,
    Hospital: () => <div data-testid="hospital-icon" />,
    MapPin: () => <div data-testid="map-pin-icon" />,
    Phone: () => <div data-testid="phone-icon" />,
    FileText: () => <div data-testid="file-text-icon" />,
    CheckCircle2: () => <div data-testid="check-circle-icon" />,
    ArrowRight: () => <div data-testid="arrow-right-icon" />,
    ChevronLeft: () => <div data-testid="chevron-left-icon" />,
    Mail: () => <div data-testid="mail-icon" />,
    Lock: () => <div data-testid="lock-icon" />,
    Eye: () => <div data-testid="eye-icon" />,
    EyeOff: () => <div data-testid="eye-off-icon" />,
    AlertCircle: () => <div data-testid="alert-circle-icon" />,
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));
jest.mock('@/components/ui/input', () => ({
    Input: (props: any) => <input {...props} />,
}));
jest.mock('@/components/ui/label', () => ({
    Label: ({ children }: any) => <label>{children}</label>,
}));
jest.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <header>{children}</header>,
    CardTitle: ({ children }: any) => <h2>{children}</h2>,
    CardDescription: ({ children }: any) => <p>{children}</p>,
    CardContent: ({ children }: any) => <section>{children}</section>,
}));
jest.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({ checked, id, onCheckedChange, ...props }: any) => (
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onCheckedChange?.(e.target.checked)} {...props} role="checkbox" />
    ),
}));
jest.mock('@/components/ui/alert', () => ({
    Alert: ({ children }: any) => <div role="alert">{children}</div>,
    AlertTitle: ({ children }: any) => <strong>{children}</strong>,
    AlertDescription: ({ children }: any) => <div>{children}</div>,
}));

describe('Luồng Bắt buộc Hoàn thiện Hồ sơ Bệnh viện (Hospital Mandatory Onboarding)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('nên chuyển hướng Bệnh viện chưa hoàn thiện hồ sơ đến trang /complete-hospital-profile sau khi đăng nhập', async () => {
        (useAuth as jest.Mock).mockReturnValue({
            refreshUser: jest.fn().mockResolvedValue(undefined),
        });

        // Mock Login thành công nhưng profile chưa đầy đủ (thiếu phone/address)
        (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
            data: {
                user: { id: 'hosp-123', email: 'vinh@hospital.com', user_metadata: { role: 'hospital' } },
                session: { access_token: 'fake-token' }
            },
            error: null,
        });

        // Mock DB Profile incomplete
        const mockMaybeSingle = jest.fn().mockResolvedValue({
            data: { role: 'hospital', hospital_address: null, phone: null },
            error: null,
        });
        (supabase.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: mockMaybeSingle,
        });

        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText(/hero@redhope.vn/i), { target: { value: 'vinh@hospital.com' } });
        fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], { target: { value: 'password' } });

        fireEvent.click(screen.getByRole('button', { name: /Đăng nhập ngay/i }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/complete-hospital-profile');
        });
    });

    it('nên cho phép Bệnh viện hoàn thiện hồ sơ và chuyển hướng đến Dashboard', async () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 'hosp-123', email: 'vinh@hospital.com', user_metadata: { full_name: 'Bệnh viện Chợ Rẫy' } },
            refreshUser: jest.fn().mockResolvedValue(undefined),
        });

        render(<CompleteHospitalProfilePage />);

        // Điền thông tin còn thiếu
        fireEvent.change(screen.getByPlaceholderText(/028 xxxx xxxx/i), { target: { value: '02838554269' } });
        fireEvent.change(screen.getByPlaceholderText(/Số nhà, đường, phường, quận, thành phố.../i), { target: { value: '201B Nguyễn Chí Thanh, Quận 5' } });

        // Mock API lưu thành công
        (userService.upsert as jest.Mock).mockResolvedValue({ success: true });

        fireEvent.click(screen.getByRole('button', { name: /Xác nhận & Bắt đầu/i }));

        await waitFor(() => {
            expect(userService.upsert).toHaveBeenCalled();
            expect(mockPush).toHaveBeenCalledWith('/hospital-dashboard');
        });
    });
});
