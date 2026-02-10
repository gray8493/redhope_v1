"use client";

import React, { useEffect, useState, useMemo } from 'react';
// @ts-ignore
import * as vnProvinces from 'vietnam-provinces';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    MapPin,
    Search,
    Check,
    ChevronsUpDown,
    Building2,
    Home,
    Loader2
} from "lucide-react";

// Define types broadly since we ignore ts for the lib
type Province = { code: string; name: string };
type District = { code: string; name: string; province_code: string };
type Ward = { code: string; name: string; district_code: string };

const PROVINCES = (vnProvinces.provinces || []) as Province[];
const DISTRICTS = (vnProvinces.districts || []) as District[];
const WARDS = (vnProvinces.wards || []) as Ward[];

interface LocationSelectorProps {
    defaultCity?: string | null;
    defaultDistrict?: string | null;
    defaultWard?: string | null;
    onCityChange?: (cityName: string) => void;
    onDistrictChange?: (districtName: string) => void;
    onWardChange?: (wardName: string) => void;
    showWard?: boolean;
    disabled?: boolean;
    className?: string; // Container class
}

/**
 * Custom Combobox component for searchable location lists
 */
function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder,
    emptyText = "Không tìm thấy kết quả",
    disabled = false,
    icon: Icon
}: {
    options: { label: string; value: string }[];
    value: string;
    onValueChange: (val: string) => void;
    placeholder: string;
    emptyText?: string;
    disabled?: boolean;
    icon?: any;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filteredOptions = useMemo(() => {
        if (!search) return options;
        const s = search.toLowerCase();
        return options.filter(opt => opt.label.toLowerCase().includes(s));
    }, [options, search]);

    const selectedOption = useMemo(() =>
        options.find(opt => opt.value === value),
        [options, value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    disabled={disabled}
                    className={cn(
                        "flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0065FF]/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1c162d] dark:border-[#2d263d]",
                        value ? "text-slate-900 dark:text-white" : "text-slate-400"
                    )}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        {Icon && <Icon className={cn("size-4 shrink-0", value ? "text-[#0065FF]" : "text-slate-400")} />}
                        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                    </div>
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[--radix-popover-trigger-width] rounded-xl overflow-hidden shadow-2xl border-slate-200 dark:border-slate-800" align="start">
                <div className="flex flex-col h-[300px] bg-white dark:bg-[#1c162d]">
                    <div className="flex items-center border-b p-3 bg-slate-50 dark:bg-slate-800/50">
                        <Search className="size-4 text-slate-400 mr-2" />
                        <Input
                            placeholder="Tìm kiếm..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 border-none focus-visible:ring-0 bg-transparent p-0 text-sm"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">{emptyText}</div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        onValueChange(opt.value);
                                        setOpen(false);
                                        setSearch("");
                                    }}
                                    className={cn(
                                        "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
                                        value === opt.value ? "bg-blue-50 text-[#0065FF] dark:bg-blue-900/20" : "text-slate-600 dark:text-slate-400"
                                    )}
                                >
                                    <div className="size-4 shrink-0 flex items-center justify-center">
                                        {value === opt.value && <Check className="size-4" />}
                                    </div>
                                    <span className="truncate">{opt.label}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function LocationSelector({
    defaultCity,
    defaultDistrict,
    defaultWard,
    onCityChange,
    onDistrictChange,
    onWardChange,
    showWard = false,
    disabled = false,
    className
}: LocationSelectorProps) {

    const [cityCode, setCityCode] = useState<string>("");
    const [districtCode, setDistrictCode] = useState<string>("");
    const [wardCode, setWardCode] = useState<string>("");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Initialize from Defaults
    useEffect(() => {
        if (defaultCity) {
            const p = PROVINCES.find(x => x.name === defaultCity || x.name.includes(defaultCity));
            if (p) setCityCode(p.code);
        }
    }, [defaultCity]);

    useEffect(() => {
        if (defaultDistrict && cityCode) {
            const d = DISTRICTS.find(x => x.province_code === cityCode && (x.name === defaultDistrict || x.name.includes(defaultDistrict)));
            if (d) setDistrictCode(d.code);
        }
    }, [defaultDistrict, cityCode]);

    useEffect(() => {
        if (defaultWard && districtCode) {
            const w = WARDS.find(x => x.district_code === districtCode && (x.name === defaultWard || x.name.includes(defaultWard)));
            if (w) setWardCode(w.code);
        }
    }, [defaultWard, districtCode]);


    // Derived Lists
    const provinceOptions = useMemo(() =>
        PROVINCES.map(p => ({ label: p.name, value: p.code })),
        []);

    const availableDistricts = useMemo(() =>
        cityCode ? DISTRICTS.filter(d => d.province_code === cityCode) : [],
        [cityCode]);

    const districtOptions = useMemo(() =>
        availableDistricts.map(d => ({ label: d.name, value: d.code })),
        [availableDistricts]);

    const availableWards = useMemo(() =>
        districtCode ? WARDS.filter(w => w.district_code === districtCode) : [],
        [districtCode]);

    const wardOptions = useMemo(() =>
        availableWards.map(w => ({ label: w.name, value: w.code })),
        [availableWards]);


    // Handlers
    const handleCityChange = (val: string) => {
        setCityCode(val);
        const p = PROVINCES.find(x => x.code === val);
        if (onCityChange && p) onCityChange(p.name);

        setDistrictCode("");
        setWardCode("");
        if (onDistrictChange) onDistrictChange("");
        if (onWardChange) onWardChange("");
    };

    const handleDistrictChange = (val: string) => {
        setDistrictCode(val);
        const d = DISTRICTS.find(x => x.code === val);
        if (onDistrictChange && d) onDistrictChange(d.name);

        setWardCode("");
        if (onWardChange) onWardChange("");
    };

    const handleWardChange = (val: string) => {
        setWardCode(val);
        const w = WARDS.find(x => x.code === val);
        if (onWardChange && w) onWardChange(w.name);
    };

    if (!isMounted) return <div className="h-24 flex items-center justify-center"><Loader2 className="animate-spin text-[#0065FF]" /></div>;

    return (
        <div className={cn(
            "grid grid-cols-1 gap-4",
            showWard ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2",
            className
        )}>
            {/* Province Selection */}
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-3">Tỉnh / Thành phố</Label>
                <SearchableSelect
                    placeholder="Chọn Tỉnh/Thành phố"
                    options={provinceOptions}
                    value={cityCode}
                    onValueChange={handleCityChange}
                    disabled={disabled}
                    icon={MapPin}
                />
            </div>

            {/* District Selection */}
            <div className={cn(
                "space-y-2 transition-all duration-300",
                !cityCode ? "opacity-50 pointer-events-none" : "opacity-100"
            )}>
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-3">Quận / Huyện</Label>
                <SearchableSelect
                    placeholder={cityCode ? "Chọn Quận/Huyện" : "Hãy chọn Tỉnh trước"}
                    options={districtOptions}
                    value={districtCode}
                    onValueChange={handleDistrictChange}
                    disabled={disabled || !cityCode}
                    icon={Building2}
                />
            </div>

            {/* Ward Selection (Optional) */}
            {showWard && (
                <div className={cn(
                    "space-y-2 transition-all duration-300",
                    !districtCode ? "opacity-50 pointer-events-none" : "opacity-100"
                )}>
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-3">Phường / Xã</Label>
                    <SearchableSelect
                        placeholder={districtCode ? "Chọn Phường/Xã" : "Hãy chọn Huyện trước"}
                        options={wardOptions}
                        value={wardCode}
                        onValueChange={handleWardChange}
                        disabled={disabled || !districtCode}
                        icon={Home}
                    />
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                }
            `}</style>
        </div>
    );
}
