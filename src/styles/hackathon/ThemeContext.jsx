
import React, { createContext, useContext, useState, useMemo } from 'react';


const lightTheme = {
    bg: 'bg-[#232C3A]',              
    text: 'text-white',           
    cardBg: 'bg-white shadow-md',
    cardText: 'text-gray-800',
    summaryCardText:'text-gray-700', 
    summaryBg1: 'bg-[#C8FAD6]',
    summaryBg2: 'bg-[#FFEDD4]',
    summaryBg3: 'bg-[#CAFDF5]',
    summaryText: 'text-black',
    tableBg: 'bg-white border-gray-200',
    tableHeaderBg: 'bg-emerald-50 text-emerald-800',
    tableHeaderText: 'text-gray-700',
    tableRowHover: 'hover:bg-gray-100',
    badgeActiveClasses: 'bg-emerald-600 text-white',
    inputBg: 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500',
    modalBg: 'bg-white',
    modalOverlay: 'bg-black/70',
    modalHeaderBg: 'bg-[#1A212D] border-gray-200',
    modalHeaderSectionText: 'text-White',
    modalHeaderText: 'text-gray-700',
    modalSectionHeader: 'text-emerald-700',
    modalInfoBoxBg: 'bg-gray-50 border-gray-300',
    modalDescriptionBoxBg: 'bg-gray-100 border-gray-200',
    modalDescriptionBoxText: 'text-gray-700',
    modalScoreText: 'text-emerald-600',
    modalTrackHeaderBg: 'bg-emerald-50/80',
    modalTrackHeaderText: 'text-emerald-700',
    modalTableBodyDivide: 'divide-gray-200',
};


const darkTheme = {
    bg: 'bg-gray-900', 
    text: 'text-white',
    cardBg: 'bg-gray-800/80 shadow-lg',
    cardText: 'text-gray-200',
    summaryCardText:'text-white', 
    summaryBg1: 'bg-green-900/40',
    summaryBg2: 'bg-yellow-900/40',
    summaryBg3: 'bg-blue-900/40',
    summaryText: 'text-white',
    tableBg: 'bg-[#1a2332] border-[#2a3544]',
    tableHeaderBg: 'bg-[#2a3544]', 
    tableHeaderText: 'text-gray-300',
    tableRowHover: 'hover:bg-gray-700/50',
    badgeActiveClasses: 'bg-emerald-500/20 text-emerald-400',
    inputBg: 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-400',
    modalBg: 'bg-slate-900', 
    modalOverlay: 'bg-black/80', 
    modalHeaderBg: 'bg-slate-800 border-slate-700',
    modalHeaderSectionText: 'text-White', 
    modalHeaderText: 'text-white', 
    modalSectionHeader: 'text-sky-400', 
    modalInfoBoxBg: 'bg-transparent border-slate-700', 
    modalDescriptionBoxBg: 'bg-slate-800 border-slate-700', 
    modalDescriptionBoxText: 'text-slate-300', 
    modalScoreText: 'text-sky-300', 
    modalTrackHeaderBg: 'bg-slate-700/80', 
    modalTrackHeaderText: 'text-sky-300', 
    modalTableBodyDivide: 'divide-slate-800',
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    
    const [mode, setMode] = useState('dark'); 

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    
    const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

    const value = { mode, theme, toggleTheme };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};