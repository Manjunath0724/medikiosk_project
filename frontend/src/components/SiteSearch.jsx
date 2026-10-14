import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function SearchIconItem({ type }) {
  const common = "w-4 h-4 text-[#0D5C4E] dark:text-[#15806C]";
  if (type === "console") {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.5 4.5v5a4.5 4.5 0 009 0v-5M7 4.5h4M16 4.5h4M9 14v3a4 4 0 004 4h1a4 4 0 004-4v-6.5M18 10.5a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    );
  }
  if (type === "intake") {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  if (type === "contact") {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    );
  }
  if (type === "help") {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  // Default department
  return (
    <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

export default function SiteSearch({ isOpen, onClose, onSelectAction, lang = "en" }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const searchItems = [
    {
      id: "ayurveda",
      title: "Ayurveda OPD Clinic",
      subtitle: "Dosha prakriti assessment, Panchakarma, Vata/Pitta/Kapha",
      category: "Department",
      iconType: "dept",
      action: () => onSelectAction && onSelectAction("dept", "ayurveda"),
    },
    {
      id: "yoga",
      title: "Yoga & Naturopathy",
      subtitle: "Asana therapy, Pranayama, dietary rehabilitation",
      category: "Department",
      iconType: "dept",
      action: () => onSelectAction && onSelectAction("dept", "yoga_naturopathy"),
    },
    {
      id: "unani",
      title: "Unani Medicine Clinic",
      subtitle: "Mizaj temperament, Ilaj-bil-Tadbeer regimens",
      category: "Department",
      iconType: "dept",
      action: () => onSelectAction && onSelectAction("dept", "unani"),
    },
    {
      id: "siddha",
      title: "Siddha OPD",
      subtitle: "Mukkuttram balance, Marma therapies, herbal formulations",
      category: "Department",
      iconType: "dept",
      action: () => onSelectAction && onSelectAction("dept", "siddha"),
    },
    {
      id: "homoeopathy",
      title: "Homoeopathy Clinic",
      subtitle: "Similia similibus curentur, miasmatic holistic intake",
      category: "Department",
      iconType: "dept",
      action: () => onSelectAction && onSelectAction("dept", "homoeopathy"),
    },
    {
      id: "doctor",
      title: "Doctor OPD Workstation",
      subtitle: "Clinical queue, prescription writer & red-flag review",
      category: "Console",
      iconType: "console",
      action: () => navigate("/doctor"),
    },
    {
      id: "scan",
      title: "Scan Lab Reports & Prior Prescriptions",
      subtitle: "Ingestion of previous OPD documents & blood panels",
      category: "Intake",
      iconType: "intake",
      action: () => onSelectAction && onSelectAction("step", "scan"),
    },
    {
      id: "faq",
      title: "Frequently Asked Questions (FAQ)",
      subtitle: "ABDM compliance, privacy standards & kiosk help",
      category: "Help",
      iconType: "help",
      action: () => onSelectAction && onSelectAction("faq"),
    },
    {
      id: "contact",
      title: "Kiosk Support & National Ayush Helpline",
      subtitle: "Toll-free 1800-11-2233, attendant helpdesk",
      category: "Help",
      iconType: "contact",
      action: () => onSelectAction && onSelectAction("contact"),
    },
  ];

  const filteredItems = searchItems.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onSelectAction && onSelectAction("open_search");
      }
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        filteredItems[selectedIndex].action();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose, onSelectAction]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#121C18]/60 transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#15201C] rounded-lg shadow-xl border border-[#D3DDD8] dark:border-[#24352F] overflow-hidden text-[#121C18] dark:text-[#F2F6F4]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-[#D3DDD8] dark:border-[#24352F]">
          <svg className="w-4 h-4 text-[#4A5852] dark:text-[#8D9E97] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={lang === "hi" ? "कियोस्क सेवाएं, विभाग या डॉक्टर कंसोल खोजें..." : "Search departments, intake steps, OPD console, or help..."}
            className="w-full py-3.5 bg-transparent outline-none text-sm placeholder:text-[#4A5852] dark:placeholder:text-[#8D9E97]"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#FAFBF9] dark:bg-[#0E1513] text-[#4A5852] dark:text-[#8D9E97] rounded border border-[#D3DDD8] dark:border-[#24352F]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#FAFBF9] dark:divide-[#0E1513]">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#4A5852] dark:text-[#8D9E97]">
              {lang === "hi" ? "कोई परिणाम नहीं मिला।" : "No matching kiosk services found."}
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#EAF3F0] dark:bg-[#1A2622] text-[#0D5C4E] dark:text-[#8BE3D2]"
                      : "hover:bg-[#FAFBF9] dark:hover:bg-[#15201C] text-[#121C18] dark:text-[#F2F6F4]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#0E1513] flex items-center justify-center shrink-0">
                      <SearchIconItem type={item.iconType} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold truncate">{item.title}</p>
                      <p className="text-[11px] text-[#4A5852] dark:text-[#8D9E97] truncate">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[#D3DDD8] dark:border-[#24352F] text-[#4A5852] dark:text-[#8D9E97] shrink-0 ml-2">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#FAFBF9] dark:bg-[#0E1513] border-t border-[#D3DDD8] dark:border-[#24352F] text-[11px] text-[#4A5852] dark:text-[#8D9E97] flex items-center justify-between">
          <span>Navigate with <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd></span>
          <span>Press <kbd className="font-mono">Enter</kbd> to select</span>
        </div>
      </div>
    </div>
  );
}
