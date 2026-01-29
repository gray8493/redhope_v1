import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { PlayIcon, HeartPulse, Users, Hospital, Droplet, ArrowRight, Quote } from '@/components/shared/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
                <Badge variant="outline" className="px-3 py-1 bg-blue-50 border-blue-100 text-primary uppercase mb-6 gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Mạng lưới hoạt động thời gian thực
                </Badge>

                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] mb-6">
                  Công nghệ thông minh cho <br className="hidden md:block" />
                  <span className="text-accent-red">Món quà Sự sống</span>
                </h1>

                <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                  Kết nối người hiến máu và bệnh viện trong thời gian thực. Tham gia mạng lưới hiến máu thông minh nhất thế giới và cứu sống nhiều người hơn.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="rounded-xl px-8 h-14 font-bold text-lg shadow-xl shadow-blue-500/20">
                    <Link href="/login">Hiến máu ngay</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-xl px-8 h-14 font-bold text-lg bg-white border-gray-200">
                    <Link href="*">
                      <PlayIcon className="w-5 h-5 fill-current" />
                      <span>Video giới thiệu</span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Hero Image Area */}
              <div className="relative mt-12 lg:mt-0">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50">
                  <div className="bg-slate-200 aspect-[4/3] w-full object-cover relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-transparent"></div>
                    <img
                      src="/homepage.jpg"
                      alt="Đội ngũ y tế"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
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
              <Card className="p-2 border-gray-50 shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
                <CardContent className="flex items-start gap-5 pt-6">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <HeartPulse className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Người được cứu</p>
                    <h3 className="text-3xl font-extrabold text-gray-900">50,000+</h3>
                  </div>
                </CardContent>
              </Card>
              {/* Stat 2 */}
              <Card className="p-2 border-gray-50 shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
                <CardContent className="flex items-start gap-5 pt-6">
                  <div className="bg-red-50 p-3 rounded-xl">
                    <Users className="w-8 h-8 text-accent-red" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Người hiến hoạt động</p>
                    <h3 className="text-3xl font-extrabold text-gray-900">12,000+</h3>
                  </div>
                </CardContent>
              </Card>
              {/* Stat 3 */}
              <Card className="p-2 border-gray-50 shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
                <CardContent className="flex items-start gap-5 pt-6">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <Hospital className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Bệnh viện đối tác</p>
                    <h3 className="text-3xl font-extrabold text-gray-900">200+</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trusted By Strip */}
            <div className="mt-16 border-t border-gray-100 pt-10">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="text-xs font-extrabold text-gray-400 tracking-widest uppercase">Tin dùng bởi</span>
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
              {/* Feature Cards */}
              {[
                {
                  title: "Cho Người hiến máu",
                  desc: "Tìm điểm hiến máu gần bạn, đặt lịch trong vài giây và theo dõi chính xác bao nhiêu mạng sống bạn đã cứu.",
                  icon: Droplet,
                  color: "blue",
                  link: "/login",
                  cta: "Đăng ký Hiến ngay",
                  accent: "text-primary"
                },
                {
                  title: "Cho Bệnh viện",
                  desc: "Yêu cầu nhóm máu khẩn cấp ngay lập tức với cảnh báo tự động. Quản lý kho máu với cập nhật thời gian thực.",
                  icon: Hospital,
                  color: "red",
                  link: "/login",
                  cta: "Đăng ký Cơ sở",
                  accent: "text-accent-red"
                },
                {
                  title: "Cho Người đóng góp",
                  desc: "Chung tay tổ chức các sự kiện hiến máu, hỗ trợ hậu cần và lan tỏa giá trị nhân văn đến cộng đồng.",
                  icon: Users,
                  color: "indigo",
                  link: "/login",
                  cta: "Tham gia Ngay",
                  accent: "text-indigo-600"
                }
              ].map((feat, i) => (
                <Card key={i} className="hover:shadow-card-hover transition-all duration-300 border-gray-100 group rounded-[2rem] overflow-hidden">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 bg-${feat.color}-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <feat.icon className={`w-7 h-7 ${feat.accent}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      <Link href={feat.link}>{feat.title}</Link>
                    </h3>
                    <p className="text-gray-500 leading-relaxed mb-8">
                      {feat.desc}
                    </p>
                    <Button asChild variant="link" className={`p-0 h-auto font-bold ${feat.accent} group-hover:gap-2 transition-all`}>
                      <Link href={feat.link}>
                        {feat.cta} <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
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
              {[
                {
                  quote: "Nền tảng REDHOPE đã giảm thời gian đáp ứng yêu cầu máu khẩn cấp tới 60%. Nó thực sự là vị cứu tinh cho đơn vị chấn thương của chúng tôi.",
                  author: "Bs. Sarah Jenkins",
                  role: "Giám đốc Y khoa, Bệnh viện Metro General",
                  initials: "BS",
                  color: "blue"
                },
                {
                  quote: "Đặt lịch hiến máu chỉ mất chưa đầy 30 giây. Tôi thích việc nhận thông báo khi máu của mình đến được với người bệnh. Cảm giác thật gắn kết.",
                  author: "Marcus Thorne",
                  role: "Người hiến máu tích cực, 24 lần hiến",
                  initials: "MT",
                  color: "green"
                }
              ].map((t, i) => (
                <Card key={i} className="bg-white p-2 border-gray-100 relative rounded-[2rem] overflow-hidden">
                  <CardContent className="p-8">
                    <Quote className="absolute top-8 right-8 w-12 h-12 text-blue-100 rotate-180" />
                    <p className="text-lg text-gray-700 italic mb-8 relative z-10 font-medium leading-relaxed">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full bg-${t.color}-100 flex items-center justify-center text-${t.color}-600 font-bold`}>
                        {t.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{t.author}</h4>
                        <p className="text-sm text-gray-500">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ========== CALL TO ACTION SECTION ========== */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-primary rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-900/20">
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
                  <Button asChild size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-50 h-14 px-8 rounded-xl font-bold">
                    <Link href="/register">Trở thành Người hiến máu</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-white/30 text-white hover:bg-white/10 h-14 px-8 rounded-xl font-bold">
                    <Link href="/register">Đăng ký Bệnh viện</Link>
                  </Button>
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
