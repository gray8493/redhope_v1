import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { PlayIcon, HeartPulse, Users, Hospital, Droplet, ArrowRight, Quote } from '../components/icons';

const Page = () => {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary/20 selection:text-primary-dark">
      <Navbar />
      <main>
        {/* ========== HERO SECTION ========== */}
        <section className="relative bg-bg-light overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
          {/* Background blobs/gradients */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-3xl opacity-60"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Text Content */}
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-primary text-xs font-bold tracking-wide uppercase mb-6">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Mạng lưới hoạt động thời gian thực
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] mb-6">
                  Công nghệ thông minh cho <br className="hidden md:block" />
                  <span className="text-accent-red">Món quà Sự sống</span>
                </h1>

                <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                  Kết nối người hiến máu và bệnh viện trong thời gian thực. Tham gia mạng lưới hiến máu thông minh nhất thế giới và cứu sống nhiều người hơn.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5">
                    Hiến máu ngay
                  </button>
                  <button className="flex items-center justify-center gap-3 bg-white text-gray-700 px-8 py-4 rounded-xl font-bold text-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
                    <PlayIcon className="w-5 h-5 fill-current" />
                    <span>Video giới thiệu</span>
                  </button>
                </div>
              </div>

              {/* Hero Image Area */}
              <div className="relative mt-12 lg:mt-0">
                {/* Main Image Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50">
                  <div className="bg-slate-200 aspect-[4/3] w-full object-cover relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-transparent"></div>
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <img
                        src="/homepage.jpg"
                        alt="Đội ngũ y tế"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                {/* Decorative Background Elements behind image */}
                <div className="absolute -z-10 top-1/2 right-1/2 translate-x-1/2 translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-50 blur-2xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== STATS SECTION ========== */}
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

        {/* ========== FEATURES SECTION ========== */}
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

              {/* Card 3 */}
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

        {/* ========== TESTIMONIALS SECTION ========== */}
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

        {/* ========== CALL TO ACTION SECTION ========== */}
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
      </main>
      <Footer />
    </div>
  );
}

export default Page;
