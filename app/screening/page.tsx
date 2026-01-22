"use client";

import { useState } from "react";
import {
    ClipboardCheck,
    Upload,
    BrainCircuit,
    CheckCircle,
    XCircle,
    CloudUpload,
    ArrowLeft,
    ArrowRight,
    Shield,
    Zap,
    Scan,
    FileText,
    Brain
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import MiniFooter from "@/components/MiniFooter";
import { useRouter } from "next/navigation";

export default function ScreeningPage() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const router = useRouter();

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        // Simulate analysis delay
        setTimeout(() => {
            // Ideally navigate to a result or success page
            alert("Phân tích hoàn tất! Bạn đủ điều kiện hiến máu.");
            router.push("/requests");
        }, 3000);
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#161121] font-sans text-[#120e1b] dark:text-white">
            <div className="flex h-full grow flex-row">
                {/* Sidebar Navigation */}
                <Sidebar />
                {/* Main Content & Footer Wrapper */}
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNav title="" />
                    <main className="flex flex-1 justify-center py-8">
                        <div className="flex flex-col max-w-[960px] flex-1 px-4 md:px-10">

                            {/* Breadcrumbs */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <a href="/requests" className="text-[#6324eb] text-sm font-medium leading-normal hover:underline">Quy trình hiến máu</a>
                                <span className="text-[#654d99] dark:text-gray-400 text-sm font-medium leading-normal">/</span>
                                <span className="text-[#120e1b] dark:text-white text-sm font-medium leading-normal">Sàng lọc sức khỏe AI</span>
                            </div>

                            {/* Page Heading */}
                            <div className="flex flex-wrap justify-between gap-3 mb-8">
                                <div className="flex min-w-72 flex-col gap-2">
                                    <h1 className="text-[#120e1b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Sàng lọc sức khỏe AI</h1>
                                    <p className="text-[#654d99] dark:text-[#a594c9] text-base font-normal leading-normal max-w-2xl">
                                        Đánh giá y tế từng bước để xác định đủ điều kiện hiến máu.
                                    </p>
                                </div>
                            </div>

                            {/* Tabs / Stepper */}
                            <div className="mb-10">
                                <div className="flex border-b border-[#d7d0e7] dark:border-[#2d263d] justify-between">
                                    <div className="flex flex-col items-center justify-center border-b-[3px] border-b-[#6324eb] text-[#120e1b] dark:text-white flex-1 pb-3">
                                        <ClipboardCheck className="mb-1 w-6 h-6 text-[#6324eb]" />
                                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">Khảo sát sức khỏe</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#654d99] dark:text-gray-500 flex-1 pb-3">
                                        <Upload className="mb-1 w-6 h-6 text-gray-400" />
                                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">Tải lên hồ sơ</p>
                                    </div>
                                    <div className={`flex flex-col items-center justify-center border-b-[3px] ${isAnalyzing ? 'border-b-[#6324eb] text-[#120e1b] dark:text-white' : 'border-b-transparent text-[#654d99] dark:text-gray-500'} flex-1 pb-3 transition-colors`}>
                                        <BrainCircuit className={`mb-1 w-6 h-6 ${isAnalyzing ? 'text-[#6324eb]' : 'text-gray-400'}`} />
                                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">Phân tích AI</p>
                                    </div>
                                </div>
                            </div>

                            {!isAnalyzing ? (
                                /* Survey Section */
                                <div className="bg-white dark:bg-[#1c162e] rounded-xl shadow-sm border border-[#ebe7f3] dark:border-[#2d263d] p-8 mb-8">
                                    <div className="mb-8">
                                        <h2 className="text-[#120e1b] dark:text-white text-[24px] font-bold leading-tight mb-2">Bước 1: Khảo sát Sức khỏe & Thể chất</h2>
                                        <p className="text-[#654d99] dark:text-[#a594c9] text-sm">Vui lòng trả lời chính xác. Thông tin này được AI y tế xử lý để đảm bảo an toàn cho bạn và người nhận.</p>
                                    </div>
                                    <div className="space-y-8">
                                        {/* Question Group */}
                                        <div className="space-y-4">
                                            <p className="text-lg font-semibold text-[#120e1b] dark:text-white">1. Hôm nay bạn có cảm thấy khỏe không?</p>
                                            <div className="flex gap-4 flex-col sm:flex-row">
                                                <label className="flex-1 cursor-pointer group">
                                                    <input className="hidden peer" name="well_today" type="radio" defaultChecked />
                                                    <div className="p-4 border-2 border-[#ebe7f3] dark:border-[#3d335a] rounded-lg peer-checked:border-[#6324eb] peer-checked:bg-[#6324eb]/5 transition-all flex items-center gap-3">
                                                        <CheckCircle className="text-gray-400 peer-checked:text-[#6324eb] w-6 h-6" />
                                                        <span className="font-medium text-[#120e1b] dark:text-white">Có, tôi cảm thấy rất khỏe</span>
                                                    </div>
                                                </label>
                                                <label className="flex-1 cursor-pointer group">
                                                    <input className="hidden peer" name="well_today" type="radio" />
                                                    <div className="p-4 border-2 border-[#ebe7f3] dark:border-[#3d335a] rounded-lg peer-checked:border-[#6324eb] peer-checked:bg-[#6324eb]/5 transition-all flex items-center gap-3">
                                                        <XCircle className="text-gray-400 peer-checked:text-[#6324eb] w-6 h-6" />
                                                        <span className="font-medium text-[#120e1b] dark:text-white">Không, tôi thấy mệt</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-lg font-semibold text-[#120e1b] dark:text-white">2. Trong 48 giờ qua, bạn có dùng loại thuốc nào không?</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <label className="flex items-center gap-3 p-3 bg-[#f6f6f8] dark:bg-[#251e36] rounded-lg cursor-pointer hover:bg-[#ebe7f3] dark:hover:bg-[#3d335a] transition-colors">
                                                    <input className="w-5 h-5 text-[#6324eb] border-gray-300 rounded focus:ring-[#6324eb]" type="checkbox" />
                                                    <span className="text-[#120e1b] dark:text-white font-medium">Aspirin / Thuốc giảm đau</span>
                                                </label>
                                                <label className="flex items-center gap-3 p-3 bg-[#f6f6f8] dark:bg-[#251e36] rounded-lg cursor-pointer hover:bg-[#ebe7f3] dark:hover:bg-[#3d335a] transition-colors">
                                                    <input className="w-5 h-5 text-[#6324eb] border-gray-300 rounded focus:ring-[#6324eb]" type="checkbox" />
                                                    <span className="text-[#120e1b] dark:text-white font-medium">Kháng sinh</span>
                                                </label>
                                                <label className="flex items-center gap-3 p-3 bg-[#f6f6f8] dark:bg-[#251e36] rounded-lg cursor-pointer hover:bg-[#ebe7f3] dark:hover:bg-[#3d335a] transition-colors">
                                                    <input className="w-5 h-5 text-[#6324eb] border-gray-300 rounded focus:ring-[#6324eb]" type="checkbox" />
                                                    <span className="text-[#120e1b] dark:text-white font-medium">Thuốc huyết áp</span>
                                                </label>
                                                <label className="flex items-center gap-3 p-3 bg-[#f6f6f8] dark:bg-[#251e36] rounded-lg cursor-pointer hover:bg-[#ebe7f3] dark:hover:bg-[#3d335a] transition-colors">
                                                    <input className="w-5 h-5 text-[#6324eb] border-gray-300 rounded focus:ring-[#6324eb]" type="checkbox" />
                                                    <span className="text-[#120e1b] dark:text-white font-medium">Insulin</span>
                                                </label>
                                            </div>
                                        </div>
                                        {/* Report Upload Section */}
                                        <div className="space-y-4 pt-4">
                                            <p className="text-lg font-semibold text-[#120e1b] dark:text-white">3. Tải lên Báo cáo y tế gần đây (Tùy chọn)</p>
                                            <p className="text-sm text-[#654d99] dark:text-[#a594c9]">Việc tải lên kết quả xét nghiệm máu hoặc kiểm tra sức khỏe gần nhất giúp AI phân tích sâu hơn.</p>
                                            <div className="border-2 border-dashed border-[#d7d0e7] dark:border-[#3d335a] rounded-xl p-10 flex flex-col items-center justify-center bg-[#f6f6f8]/30 dark:bg-[#251e36]/30 hover:border-[#6324eb]/50 transition-colors cursor-pointer group">
                                                <CloudUpload className="text-[#6324eb] w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                                                <p className="text-[#120e1b] dark:text-white font-semibold">Nhấn để tải lên hoặc kéo thả vào đây</p>
                                                <p className="text-sm text-[#654d99] dark:text-[#a594c9]">PDF, PNG, hoặc JPG (tối đa 10MB)</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-12 flex items-center justify-between border-t border-[#ebe7f3] dark:border-[#2d263d] pt-8">
                                        <button
                                            onClick={() => router.back()}
                                            className="px-6 py-3 rounded-lg border border-[#d7d0e7] dark:border-[#3d335a] font-bold text-[#120e1b] dark:text-white hover:bg-gray-50 dark:hover:bg-[#251e36] transition-colors flex items-center gap-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Hủy bỏ
                                        </button>
                                        <button
                                            onClick={handleAnalyze}
                                            className="bg-[#6324eb] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#501ac2] transition-all flex items-center gap-2 shadow-lg shadow-[#6324eb]/20"
                                        >
                                            Phân tích Sức khỏe
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Processing State */
                                <div className="bg-white dark:bg-[#1c162e] rounded-xl shadow-sm border border-[#ebe7f3] dark:border-[#2d263d] p-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                                    <div className="relative flex items-center justify-center mb-8">
                                        {/* Circular Loader */}
                                        <div className="size-24 rounded-full border-4 border-[#6324eb]/20 border-t-[#6324eb] animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Brain className="text-[#6324eb] w-8 h-8" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 text-[#120e1b] dark:text-white">AI đang phân tích dữ liệu...</h3>
                                    <p className="text-[#654d99] dark:text-[#a594c9] max-w-md mx-auto mb-8">
                                        Mạng nơ-ron y tế của chúng tôi đang quét câu trả lời và báo cáo của bạn để đảm bảo an toàn tuyệt đối. Quá trình này mất khoảng 10-15 giây.
                                    </p>
                                    {/* Progress Bar */}
                                    <div className="w-full max-w-md">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-xs font-bold text-[#6324eb]">ĐANG QUÉT HỒ SƠ</span>
                                            <span className="text-xs font-bold text-[#6324eb]">65%</span>
                                        </div>
                                        <div className="h-3 w-full bg-[#6324eb]/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#6324eb] rounded-full w-[65%] animate-pulse"></div>
                                        </div>
                                        <p className="mt-4 text-xs italic text-[#654d99] dark:text-gray-400 flex items-center justify-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            Bảo mật & Tuân thủ HIPAA
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Extra Info Footer */}
                            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-[#6324eb]/5 border border-[#6324eb]/10">
                                    <Shield className="text-[#6324eb] w-6 h-6 mt-1" />
                                    <div>
                                        <p className="font-bold text-sm text-[#120e1b] dark:text-white">An toàn & Riêng tư</p>
                                        <p className="text-xs text-[#654d99] dark:text-[#a594c9]">Dữ liệu của bạn được mã hóa và chỉ dùng để sàng lọc.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-[#6324eb]/5 border border-[#6324eb]/10">
                                    <Zap className="text-[#6324eb] w-6 h-6 mt-1" />
                                    <div>
                                        <p className="font-bold text-sm text-[#120e1b] dark:text-white">Kết quả Tức thì</p>
                                        <p className="text-xs text-[#654d99] dark:text-[#a594c9]">Nhận phê duyệt trước chỉ trong vài giây thay vì chờ đợi.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-[#6324eb]/5 border border-[#6324eb]/10">
                                    <Scan className="text-[#6324eb] w-6 h-6 mt-1" />
                                    <div>
                                        <p className="font-bold text-sm text-[#120e1b] dark:text-white">Độ chính xác cao</p>
                                        <p className="text-xs text-[#654d99] dark:text-[#a594c9]">AI đối chiếu với hàng nghìn hướng dẫn y tế.</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </main>

                    <MiniFooter />
                </div>
            </div>
        </div>
    );
}
