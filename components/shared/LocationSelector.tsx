"use client";

import React, { useEffect, useState, useMemo } from 'react';
// @ts-ignore
import * as vnProvinces from 'vietnam-provinces';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '../ui/label';

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

    // Internal State for Selected CODES
    const [cityCode, setCityCode] = useState<string>("");
    const [districtCode, setDistrictCode] = useState<string>("");
    const [wardCode, setWardCode] = useState<string>("");

    // Initialize from Defaults (Names -> Codes)
    useEffect(() => {
        if (defaultCity) {
            // Find strictly first, then try loose match
            const p = PROVINCES.find(x => x.name === defaultCity || x.name.includes(defaultCity));
            if (p) {
                setCityCode(p.code);
            }
        }
    }, [defaultCity]);

    useEffect(() => {
        if (defaultDistrict && cityCode) {
            const d = DISTRICTS.find(x => x.province_code === cityCode && (x.name === defaultDistrict || x.name.includes(defaultDistrict)));
            if (d) {
                setDistrictCode(d.code);
            }
        } else if (defaultDistrict && !cityCode) {
            // Try to find district globally just in case (risky due to duplicate names)
            // better to wait for city
        }
    }, [defaultDistrict, cityCode]);

    useEffect(() => {
        if (defaultWard && districtCode) {
            const w = WARDS.find(x => x.district_code === districtCode && (x.name === defaultWard || x.name.includes(defaultWard)));
            if (w) setWardCode(w.code);
        }
    }, [defaultWard, districtCode]);


    // Derived Lists
    const availableDistricts = useMemo(() =>
        cityCode ? DISTRICTS.filter(d => d.province_code === cityCode) : [],
        [cityCode]);

    const availableWards = useMemo(() =>
        districtCode ? WARDS.filter(w => w.district_code === districtCode) : [],
        [districtCode]);


    // Handlers
    const handleCityChange = (val: string) => {
        setCityCode(val);
        const p = PROVINCES.find(x => x.code === val);
        if (onCityChange && p) onCityChange(p.name);

        // Reset sub-levels
        setDistrictCode("");
        setWardCode("");
        if (onDistrictChange) onDistrictChange("");
        if (onWardChange) onWardChange("");
    };

    const handleDistrictChange = (val: string) => {
        setDistrictCode(val);
        const d = DISTRICTS.find(x => x.code === val);
        if (onDistrictChange && d) onDistrictChange(d.name);

        // Reset ward
        setWardCode("");
        if (onWardChange) onWardChange("");
    };

    const handleWardChange = (val: string) => {
        setWardCode(val);
        const w = WARDS.find(x => x.code === val);
        if (onWardChange && w) onWardChange(w.name);
    };

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
            <div className="space-y-2">
                <Label>Tỉnh / Thành phố</Label>
                <Select disabled={disabled} value={cityCode} onValueChange={handleCityChange}>
                    <SelectTrigger className="bg-white dark:bg-[#1c162d] border-[#ebe7f3] dark:border-[#2d263d]">
                        <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                    </SelectTrigger>
                    <SelectContent>
                        {PROVINCES.map(p => (
                            <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className={`space-y-2 ${!cityCode ? 'opacity-50 pointer-events-none' : ''}`}>
                <Label>Quận / Huyện</Label>
                <Select disabled={disabled || !cityCode} value={districtCode} onValueChange={handleDistrictChange}>
                    <SelectTrigger className="bg-white dark:bg-[#1c162d] border-[#ebe7f3] dark:border-[#2d263d]">
                        <SelectValue placeholder="Chọn Quận/Huyện" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableDistricts.map(d => (
                            <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {showWard && (
                <div className={`space-y-2 ${!districtCode ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Label>Phường / Xã</Label>
                    <Select disabled={disabled || !districtCode} value={wardCode} onValueChange={handleWardChange}>
                        <SelectTrigger className="bg-white dark:bg-[#1c162d] border-[#ebe7f3] dark:border-[#2d263d]">
                            <SelectValue placeholder="Chọn Phường/Xã" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableWards.map(w => (
                                <SelectItem key={w.code} value={w.code}>{w.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}
