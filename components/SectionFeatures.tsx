import React from 'react';
import { HeartPulse, Users, Hospital, Droplet, ArrowRight } from './icons';

const SectionStats = () => {
    return (
        <section className="py-8 bg-white md:-mt-16 md:relative md:z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat 1 */}
                    <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-shadow border border-gray-50 flex items-start gap-5">
                        <div className="bg-blue-50 p-3 rounded-xl">
                            <HeartPulse className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 mb-1">Người được cứu</p>
                            <h3 className="text-3xl font-extrabold text-gray-900">50,000+</h3>
                        </div>
                    </div>
                    {/* Stat 2 */}
                    <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-shadow border border-gray-50 flex items-start gap-5">
                        <div className="bg-red-50 p-3 rounded-xl">
                            <Users className="w-8 h-8 text-accent-red" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 mb-1">Người hiến hoạt động</p>
                            <h3 className="text-3xl font-extrabold text-gray-900">12,000+</h3>
                        </div>
                    </div>
                    {/* Stat 3 */}
                    <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-shadow border border-gray-50 flex items-start gap-5">
                        <div className="bg-blue-50 p-3 rounded-xl">
                            <Hospital className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 mb-1">Bệnh viện đối tác</p>
                            <h3 className="text-3xl font-extrabold text-gray-900">200+</h3>
                        </div>
                    </div>
                </div>

                {/* Trusted By Strip */}
                <div className="mt-16 border-t border-gray-100 pt-10">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Tin dùng bởi</span>
                        {/* Mock Logos */}
                        <div className="flex items-center gap-2 text-lg font-bold text-gray-700">
                            <div className="w-6 h-6 bg-gray-300 rounded-full"></div> GlobalHealth
                        </div>
                        <div className="flex items-center gap-2 text-lg font-bold text-gray-700">
                            <div className="w-6 h-6 bg-gray-300 rounded-md"></div> CityClinics
                        </div>
                        <div className="flex items-center gap-2 text-lg font-bold text-gray-700">
                            <div className="w-6 h-6 bg-gray-300 rotate-45"></div> RedCross Int.
                        </div>
                        <div className="flex items-center gap-2 text-lg font-bold text-gray-700">
                            <div className="w-6 h-6 bg-gray-300 rounded-full"></div> MedTech
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const SectionFeatures = () => {
    return (
        <section className="py-24 bg-bg-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Một nền tảng, Ba giải pháp</h2>
                    <p className="text-lg text-gray-600">Mạng lưới thông minh của chúng tôi tối ưu hóa quy trình cho mọi người, từ người hiến máu cá nhân đến quản trị viên y tế.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Droplet className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Cho Người hiến máu</h3>
                        <p className="text-gray-500 leading-relaxed mb-8">
                            Tìm điểm hiến máu gần bạn, đặt lịch trong vài giây và theo dõi chính xác bao nhiêu mạng sống bạn đã cứu.
                        </p>
                        <a href="#" className="inline-flex items-center font-bold text-primary group-hover:gap-2 transition-all">
                            Đăng ký Hiến ngay <ArrowRight className="w-4 h-4 ml-1" />
                        </a>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Hospital className="w-7 h-7 text-accent-red" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Cho Bệnh viện</h3>
                        <p className="text-gray-500 leading-relaxed mb-8">
                            Yêu cầu nhóm máu khẩn cấp ngay lập tức với cảnh báo tự động. Quản lý kho máu với cập nhật thời gian thực.
                        </p>
                        <a href="#" className="inline-flex items-center font-bold text-accent-red group-hover:gap-2 transition-all">
                            Đăng ký Cơ sở <ArrowRight className="w-4 h-4 ml-1" />
                        </a>
                    </div>

                    {/* Card 3 - Modified as requested */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users className="w-7 h-7 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Cho Người đóng góp</h3>
                        <p className="text-gray-500 leading-relaxed mb-8">
                            Chung tay tổ chức các sự kiện hiến máu, hỗ trợ hậu cần và lan tỏa giá trị nhân văn đến cộng đồng.
                        </p>
                        <a href="#" className="inline-flex items-center font-bold text-indigo-600 group-hover:gap-2 transition-all">
                            Tham gia Ngay <ArrowRight className="w-4 h-4 ml-1" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export { SectionStats, SectionFeatures };
