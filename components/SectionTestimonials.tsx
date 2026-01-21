import React from 'react';
import { Quote } from './icons';

const SectionTestimonials = () => {
    return (
        <section className="py-24 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tiếng nói từ cộng đồng</h2>
                    <p className="text-lg text-gray-600">Lắng nghe chia sẻ từ các bệnh viện và người hiến máu sử dụng REDHOPE mỗi ngày.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Testimonial 1 */}
                    <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 relative">
                        <Quote className="absolute top-8 right-8 w-12 h-12 text-blue-100 rotate-180" />
                        <p className="text-lg text-gray-700 italic mb-8 relative z-10 font-medium leading-relaxed">
                            "Nền tảng REDHOPE đã giảm thời gian đáp ứng yêu cầu máu khẩn cấp tới 60%. Nó thực sự là vị cứu tinh cho đơn vị chấn thương của chúng tôi."
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                {/* Avatar Placeholder */}
                                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">BS</div>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Bs. Sarah Jenkins</h4>
                                <p className="text-sm text-gray-500">Giám đốc Y khoa, Bệnh viện Metro General</p>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 relative">
                        <Quote className="absolute top-8 right-8 w-12 h-12 text-blue-100 rotate-180" />
                        <p className="text-lg text-gray-700 italic mb-8 relative z-10 font-medium leading-relaxed">
                            "Đặt lịch hiến máu chỉ mất chưa đầy 30 giây. Tôi thích việc nhận thông báo khi máu của mình đến được với người bệnh. Cảm giác thật gắn kết."
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                {/* Avatar Placeholder */}
                                <div className="w-full h-full bg-green-100 flex items-center justify-center text-green-600 font-bold">MT</div>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Marcus Thorne</h4>
                                <p className="text-sm text-gray-500">Người hiến máu tích cực, 24 lần hiến</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SectionTestimonials;
