import React from 'react';
import { RedHopeLogo } from './icons';

const Footer = () => {
    return (
        <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <RedHopeLogo className="w-14 h-14" />
                            <span className="font-bold text-xl text-gray-900">REDHOPE</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Sáng kiến toàn cầu nhằm hiện đại hóa cơ sở hạ tầng hiến máu thông qua kết nối thông minh và logistics vận hành bằng AI.
                        </p>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-6">Nền tảng</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary transition-colors">Tìm điểm hiến máu</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Cổng bệnh viện</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Ứng dụng di động</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">API cho nhà phát triển</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-6">Tài nguyên</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary transition-colors">Điều kiện hiến máu</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Quy trình an toàn</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Câu chuyện thành công</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Trung tâm hỗ trợ</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-6">Pháp lý</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary transition-colors">Chính sách bảo mật</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Điều khoản dịch vụ</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Quy định Bảo mật Y tế</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
                    <p>© 2026 Mạng lưới Hiến máu Thông minh REDHOPE. Bảo lưu mọi quyền.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-gray-600">Twitter</a>
                        <a href="#" className="hover:text-gray-600">LinkedIn</a>
                        <a href="#" className="hover:text-gray-600">Instagram</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
