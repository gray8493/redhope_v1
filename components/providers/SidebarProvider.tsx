"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type SidebarContextType = {
    isOpen: boolean;
    toggle: () => void;
    setIsOpen: (value: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    // Default open on desktop
    const [isOpen, setIsOpen] = useState(true);

    const toggle = () => setIsOpen(prev => !prev);

    return (
        <SidebarContext.Provider value={{ isOpen, toggle, setIsOpen }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        // Return duplicate context or dummy if used outside provider (e.g. Admin layout for now)
        // Default to OPEN so layout doesn't break
        return { isOpen: true, toggle: () => { }, setIsOpen: () => { } };
    }
    return context;
}
