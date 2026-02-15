"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Droplet, User, MapPin, Calendar } from "lucide-react";

interface QRCodeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    userData: {
        id: string;
        fullName: string;
        bloodGroup: string;
        city: string;
        dob: string;
    } | null;
}

export function QRCodeModal({ isOpen, onOpenChange, userData }: QRCodeModalProps) {
    if (!userData) return null;

    // QR Data format: encrypted-like string or just a deep link
    const qrValue = `redhope://user/${userData.id}`;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-[95vw] sm:w-full rounded-3xl sm:rounded-[2.5rem] p-0 max-h-[90vh] overflow-y-auto border-none bg-white dark:bg-[#1c162d]">
                <div className="bg-gradient-to-br from-red-600 to-red-900 p-6 sm:p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Droplet className="w-24 h-24 fill-current" />
                    </div>
                    <DialogHeader className="relative z-10 text-left">
                        <DialogTitle className="text-xl sm:text-2xl font-black italic tracking-tight">THẺ ĐỊNH DANH SỐ</DialogTitle>
                        <DialogDescription className="text-red-100 font-medium text-xs sm:text-sm">
                            Dùng để check-in nhanh tại các cơ sở y tế.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-5 sm:p-8 flex flex-col items-center gap-5 sm:gap-8">
                    {/* QR Code Section */}
                    <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-2xl shadow-red-500/10 border-4 border-red-50 dark:border-slate-800">
                        <QRCodeSVG
                            value={qrValue}
                            size={180}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "/logo.png", // Fallback to a placeholder if logo doesn't exist
                                x: undefined,
                                y: undefined,
                                height: 36,
                                width: 36,
                                excavate: true,
                            }}
                            className="dark:p-2 dark:bg-white dark:rounded-xl"
                        />
                    </div>

                    {/* User Info Strip */}
                    <div className="w-full space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="size-10 sm:size-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 flex-shrink-0">
                                <User className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Họ và tên</p>
                                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase truncate">{userData.fullName}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-[9px] sm:text-[10px] font-black text-red-400 uppercase tracking-widest">Nhóm máu</p>
                                <p className="text-lg sm:text-xl font-black text-red-600">{userData.bloodGroup || "??"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 sm:gap-3">
                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase">Ngày sinh</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{userData.dob || "--/--/----"}</p>
                                </div>
                            </div>
                            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 sm:gap-3">
                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase">Khu vực</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{userData.city || "Việt Nam"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-[9px] sm:text-[10px] text-slate-400 text-center uppercase font-black tracking-[0.2em] leading-relaxed">
                        Mã định danh được bảo mật bởi <br /> Smart Blood Donation Network (REDHOPE)
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
