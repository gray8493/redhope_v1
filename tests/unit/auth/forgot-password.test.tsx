import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';
import { authService } from '@/services/auth.service';

// Mock dependencies
jest.mock('@/services/auth.service', () => ({
    authService: {
        resetPassword: jest.fn(),
    },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
    Loader2: () => <div data-testid="loader" />,
    ArrowLeft: () => <div data-testid="arrow-left" />,
    Mail: () => <div data-testid="mail" />,
    CheckCircle2: () => <div data-testid="check-circle" />,
}));

describe('ForgotPasswordPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('nên render trang quên mật khẩu thành công', () => {
        render(<ForgotPasswordPage />);
        expect(screen.getByText(/Quên mật khẩu\?/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
    });

    it('nên hiển thị thông báo thành công khi gửi link khôi phục thành công', async () => {
        (authService.resetPassword as jest.Mock).mockResolvedValue(undefined);

        render(<ForgotPasswordPage />);

        fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
            target: { value: 'test@example.com' },
        });

        fireEvent.click(screen.getByRole('button', { name: /Gửi link khôi phục/i }));

        await waitFor(() => {
            expect(authService.resetPassword).toHaveBeenCalledWith('test@example.com');
            expect(screen.getByText(/Kiểm tra email của bạn/i)).toBeInTheDocument();
            expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
        });
    });

    it('nên hiển thị thông báo lỗi khi gửi link khôi phục thất bại', async () => {
        const errorMessage = 'Email không tồn tại';
        (authService.resetPassword as jest.Mock).mockRejectedValue(new Error(errorMessage));

        render(<ForgotPasswordPage />);

        fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
            target: { value: 'wrong@example.com' },
        });

        fireEvent.click(screen.getByRole('button', { name: /Gửi link khôi phục/i }));

        await waitFor(() => {
            expect(authService.resetPassword).toHaveBeenCalledWith('wrong@example.com');
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('nên quay lại form nhập email khi nhấn "Thử lại với email khác"', async () => {
        (authService.resetPassword as jest.Mock).mockResolvedValue(undefined);

        render(<ForgotPasswordPage />);

        // Gửi thành công trước
        fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Gửi link khôi phục/i }));

        await waitFor(() => {
            expect(screen.getByText(/Kiểm tra email của bạn/i)).toBeInTheDocument();
        });

        // Nhấn nút thử lại
        fireEvent.click(screen.getByRole('button', { name: /Thử lại với email khác/i }));

        expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
        expect(screen.queryByText(/Kiểm tra email của bạn/i)).not.toBeInTheDocument();
    });
});
