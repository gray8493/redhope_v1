"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, CheckCircle, User, Droplet, MapPin } from "lucide-react";
import { toast } from "sonner";
import { userService } from "@/services/user.service";

interface QRScannerModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (donorId: string) => void;
}

export function QRScannerModal({ isOpen, onOpenChange, onSuccess }: QRScannerModalProps) {
    const [scannedResult, setScannedResult] = useState<string | null>(null);
    const [donorInfo, setDonorInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (isOpen && !scannedResult) {
            // Delay a bit to ensure dialog is rendered
            const timer = setTimeout(() => {
                const scanner = new Html5QrcodeScanner(
                    "qr-reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );

                scanner.render(onScanSuccess, onScanFailure);
                scannerRef.current = scanner;
            }, 500);

            return () => {
                clearTimeout(timer);
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
                }
            };
        }
    }, [isOpen, scannedResult]);

    async function onScanSuccess(decodedText: string) {
        if (decodedText.startsWith("redhope://user/")) {
            const userId = decodedText.replace("redhope://user/", "");
            setScannedResult(userId);

            // Stop scanner
            if (scannerRef.current) {
                await scannerRef.current.clear();
            }

            // Fetch donor info
            fetchDonorInfo(userId);
        } else {
            toast.error("Mã QR không hợp lệ hoặc không thuộc hệ thống REDHOPE");
        }
    }

    function onScanFailure(error: any) {
        // Just ignore failures (quiet)
    }

    async function fetchDonorInfo(id: string) {
        setIsLoading(true);
        try {
            const profile = await userService.getById(id);
            if (profile) {
                setDonorInfo(profile);
            } else {
                toast.error("Không tìm thấy thông tin người hiến");
                setScannedResult(null);
            }
        } catch (error) {
            toast.error("Lỗi khi tải thông tin người hiến");
            setScannedResult(null);
        } finally {
            setIsLoading(false);
        }
    }

    const handleConfirm = () => {
        if (onSuccess && scannedResult) {
            onSuccess(scannedResult);
        }
        toast.success("Xác nhận người hiến thành công!");
        resetScanner();
        onOpenChange(false);
    };

    const resetScanner = () => {
        setScannedResult(null);
        setDonorInfo(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) resetScanner();
            onOpenChange(open);
        }}>
            <DialogContent className="max-w-md rounded-[2.5rem] bg-white dark:bg-[#0f172a] border-none p-0 overflow-hidden">
                <div className="bg-[#0065FF] p-6 text-white">
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                            <Camera className="w-5 h-5 text-blue-200" />
                            Quét mã Người hiến
                        </DialogTitle>
                        <DialogDescription className="text-blue-100/80 text-sm font-medium">
                            Di chuyển mã QR của người hiến vào trung tâm khung hình.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6">
                    {!scannedResult ? (
                        <div className="flex flex-col items-center gap-4">
                            <div id="qr-reader" className="w-full overflow-hidden rounded-2xl border-4 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mt-2">
                                Thiết bị cần quyền truy cập Camera
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {isLoading ? (
                                <div className="py-12 flex flex-col items-center gap-4 text-slate-400">
                                    <div className="w-10 h-10 border-4 border-[#0065FF] border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm font-bold">Đang tải thông tin...</p>
                                </div>
                            ) : donorInfo && (
                                <>
                                    <div className="flex items-center gap-4 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-800">
                                        <div className="size-16 rounded-2xl bg-[#0065FF] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <User className="w-8 h-8" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-[#0065FF] uppercase tracking-widest">NGƯỜI HIẾN MÁU</p>
                                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase leading-tight">{donorInfo.full_name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black rounded uppercase">
                                                    Nhóm {donorInfo.blood_group || "??"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Khu vực</p>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{donorInfo.city || "Chưa cập nhật"}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Trạng thái</p>
                                                <p className="text-xs font-bold text-emerald-600">Đã xác minh</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1 rounded-xl h-12 font-bold text-slate-500"
                                            onClick={resetScanner}
                                        >
                                            Quét lại
                                        </Button>
                                        <Button
                                            className="flex-1 rounded-xl h-12 font-black italic tracking-tight bg-[#0065FF] hover:bg-blue-700 shadow-xl shadow-blue-500/20"
                                            onClick={handleConfirm}
                                        >
                                            XÁC NHẬN ĐÃ ĐẾN
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
