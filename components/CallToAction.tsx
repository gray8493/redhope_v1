import React from 'react';

const CallToAction = () => {
    return (
        <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-primary rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-900/20">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <svg width="200" height="200" viewBox="0 0 24 24" fill="white">
                            <rect x="2" y="2" width="20" height="20" rx="5" />
                        </svg>
                    </div>
                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            Sẵn sàng cứu người tiếp theo?
                        </h2>
                        <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                            Tham gia cùng hàng ngàn người hiến máu và hàng trăm bệnh viện ngay hôm nay. Chỉ mất chưa đầy 2 phút để bắt đầu.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="w-full sm:w-auto bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg">
                                Trở thành Người hiến máu
                            </button>
                            <button className="w-full sm:w-auto bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors">
                                Đăng ký Bệnh viện
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CallToAction;
