import React, { useState, useEffect } from "react";
import { Route, Routes, Link, useLocation, useNavigate } from "react-router-dom";
import AuthScreen from "./screens/AuthScreen.jsx";
import Identify from "./screens/Identify.jsx";
import Converse from "./screens/Converse.jsx";
import Scan from "./screens/Scan.jsx";
import SummaryReview from "./screens/SummaryReview.jsx";
import Sent from "./screens/Sent.jsx";
import DoctorDashboard from "./screens/DoctorDashboard.jsx";
import NotFound from "./screens/NotFound.jsx";

// 20 Enhancement Components & Utilities
import DarkModeToggle from "./components/DarkModeToggle.jsx";
import ScrollProgressBar from "./components/ScrollProgressBar.jsx";
import BackToTop from "./components/BackToTop.jsx";
import CookieBanner from "./components/CookieBanner.jsx";
import SiteSearch from "./components/SiteSearch.jsx";
import FaqSection from "./components/FaqSection.jsx";
import FloatingContact from "./components/FloatingContact.jsx";
import ConfirmationModal from "./components/ConfirmationModal.jsx";
import { initUtmTracking } from "./utils/utm.js";

function PatientKiosk() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("medikiosk_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isGuest, setIsGuest] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [token, setToken] = useState("");
  const [department, setDepartment] = useState("ayush");
  const [consultingDoctor, setConsultingDoctor] = useState(null);
  const [step, setStep] = useState("identify"); // identify -> converse -> scan -> summary -> sent

  // UI state for search, mobile menu, FAQ, and confirmation dialogs
  const [searchOpen, setSearchOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Initialize UTM Tracking (Item 14)
  useEffect(() => {
    initUtmTracking();
  }, []);

  useEffect(() => {
    const titles = {
      auth: "MediKiosk | Sign In & User Registration",
      identify: "MediKiosk | Patient Registration & Clinic Selection",
      converse: "MediKiosk | Clinical Intake Doctor Interview",
      scan: "MediKiosk | Scan Prior Prescriptions & Lab Reports",
      summary: "MediKiosk | Review Clinical Summary Draft",
      sent: "MediKiosk | Case Sheet Submitted to OPD Doctor",
    };
    if (!currentUser && !isGuest) {
      document.title = titles.auth;
    } else {
      document.title = titles[step] || "MediKiosk | Ayush Case-Taking Kiosk";
    }
  }, [step, currentUser, isGuest]);

  const handleSearchAction = (type, val) => {
    if (type === "dept") {
      setDepartment(val);
      if (step === "identify") {
        // updated
      }
    } else if (type === "step") {
      setStep(val);
    } else if (type === "faq") {
      setFaqOpen(true);
    } else if (type === "open_search") {
      setSearchOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("medikiosk_user");
    setCurrentUser(null);
    setIsGuest(false);
    setConsultingDoctor(null);
    setStep("identify");
    setShowLogoutConfirm(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-x-hidden transition-colors">
      {/* Skip to Content Link (Item 12: Accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-700 focus:text-white focus:rounded-xl focus:shadow-xl focus:ring-2 focus:ring-emerald-400 font-bold text-xs"
      >
        Skip to main content
      </a>

      {/* Scroll Progress Bar (Item 8) */}
      <ScrollProgressBar />

      {/* Institutional Top Header & Navigation */}
      <header className="sticky top-0 z-40 bg-[#0D5C4E] dark:bg-[#121C18] text-[#EAF3F0] dark:text-[#D3DDD8] text-xs px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-[#09453A] dark:border-[#24352F] shrink-0 print:hidden">
        {/* Left Branding */}
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-[#15806C] bg-[#09453A] dark:bg-[#15201C] text-[10px] font-bold text-white tracking-wider">
            GOI
          </span>
          <span className="font-bold tracking-wide text-white">Ministry of Ayush</span>
          <span className="opacity-40">|</span>
          <span className="hidden md:inline text-[#A7F3D0] dark:text-[#8D9E97]">National Ayush Mission OPD Kiosk</span>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Site Search Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            id="site-search-btn"
            title="Search Kiosk (Ctrl+K)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#09453A] hover:bg-[#07362E] dark:bg-[#1A2622] dark:hover:bg-[#24352F] text-white border border-[#15806C] dark:border-[#2E423A] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline text-[11px] font-semibold">{lang === "hi" ? "खोजें" : "Search"}</span>
            <kbd className="hidden lg:inline px-1 py-0.2 text-[9px] font-mono bg-[#07362E] dark:bg-[#121C18] rounded border border-[#15806C]/60 text-white/90">
              Ctrl+K
            </kbd>
          </button>

          {/* Active User Badge & Logout */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-2 bg-[#09453A] dark:bg-[#1A2622] border border-[#15806C] dark:border-[#2E423A] px-2.5 py-1 rounded">
              <span className="text-white">
                {currentUser.role === "doctor" ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.5 4.5v5a4.5 4.5 0 009 0v-5M7 4.5h4M16 4.5h4M9 14v3a4 4 0 004 4h1a4 4 0 004-4v-6.5M18 10.5a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </span>
              <div className="leading-tight hidden md:block">
                <p className="font-bold text-white text-[11px] truncate max-w-[120px]">
                  {currentUser.full_name}
                </p>
                <p className="text-[9px] text-[#A7F3D0] dark:text-[#8D9E97] uppercase tracking-wider font-semibold">
                  {currentUser.role}
                </p>
              </div>
              {currentUser.role === "doctor" && (
                <Link
                  to="/doctor"
                  className="text-[10px] bg-[#15806C] hover:bg-[#106A59] text-white px-2 py-0.5 rounded font-bold transition-colors"
                >
                  OPD Console →
                </Link>
              )}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                title="Sign out of current account"
                className="text-[10px] text-[#A7F3D0] dark:text-[#8D9E97] hover:text-white underline font-semibold ml-0.5"
              >
                {lang === "hi" ? "लॉगआउट" : "Logout"}
              </button>
            </div>
          ) : isGuest ? (
            <div className="hidden sm:flex items-center gap-1.5 bg-[#09453A] dark:bg-[#1A2622] px-2 py-1 rounded border border-[#15806C] dark:border-[#2E423A] text-[11px] text-white">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Walk-in Patient</span>
              <button
                type="button"
                onClick={() => setIsGuest(false)}
                className="text-[10px] text-[#A7F3D0] hover:text-white underline font-bold ml-1"
              >
                Sign In
              </button>
            </div>
          ) : null}

          {/* Start Over Button when in middle of intake (Item 17 confirmation modal) */}
          {(currentUser || isGuest) && step !== "identify" && step !== "sent" && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-emerald-300 hover:text-white underline flex items-center gap-1 font-medium hidden sm:flex"
            >
              <span>←</span>
              <span>{lang === "hi" ? "पुनः प्रारंभ करें" : "Start Over"}</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="flex items-center rounded-lg bg-emerald-900 dark:bg-slate-800 border border-emerald-700/60 dark:border-slate-700 p-0.5">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                lang === "en" ? "bg-emerald-700 text-white shadow-xs" : "text-emerald-200 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("hi")}
              className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                lang === "hi" ? "bg-emerald-700 text-white shadow-xs" : "text-emerald-200 hover:text-white"
              }`}
            >
              हिं
            </button>
          </div>

          {/* Dark Mode Toggle (Item 1) */}
          <DarkModeToggle />

          {/* Mobile Menu Toggle Button (Item 5) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="sm:hidden p-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700/60 text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu (Item 5) */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-emerald-950 text-white border-b border-emerald-800 p-4 space-y-3 z-30 animate-in slide-in-from-top duration-200 print:hidden">
          {currentUser ? (
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/80">
              <div>
                <p className="font-bold text-xs">{currentUser.full_name}</p>
                <p className="text-[10px] text-emerald-300 uppercase">{currentUser.role}</p>
              </div>
              <div className="flex items-center gap-2">
                {currentUser.role === "doctor" && (
                  <Link
                    to="/doctor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs bg-emerald-600 px-2.5 py-1 rounded-lg font-bold"
                  >
                    OPD Console
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="text-xs text-rose-300 underline font-semibold"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : isGuest ? (
            <div className="flex items-center justify-between pb-3 border-b border-[#09453A] text-xs">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Walk-in Patient
              </span>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsGuest(false);
                }}
                className="text-[#A7F3D0] underline font-bold"
              >
                Sign In
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setFaqOpen(true);
              }}
              className="p-2.5 rounded bg-[#09453A] border border-[#15806C] text-left font-semibold flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>FAQ Guide</span>
            </button>
            <Link
              to="/doctor"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded bg-[#09453A] border border-[#15806C] text-left font-semibold flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.5 4.5v5a4.5 4.5 0 009 0v-5M7 4.5h4M16 4.5h4M9 14v3a4 4 0 004 4h1a4 4 0 004-4v-6.5M18 10.5a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
              <span>Doctor OPD</span>
            </Link>
          </div>

          {(currentUser || isGuest) && step !== "identify" && step !== "sent" && (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setShowResetConfirm(true);
              }}
              className="w-full py-2 rounded-lg bg-emerald-900/60 border border-emerald-800 text-xs text-emerald-200 font-bold text-center"
            >
              ← Start Over Registration
            </button>
          )}
        </div>
      )}

      {/* Main Screen Content Area */}
      <main id="main-content" tabIndex="-1" className="flex-1 flex flex-col overflow-x-hidden outline-none">
        {/* Step 0: Auth Workflow */}
        {!currentUser && !isGuest ? (
          <AuthScreen
            lang={lang}
            onAuthSuccess={(user) => {
              setCurrentUser(user);
              localStorage.setItem("medikiosk_user", JSON.stringify(user));
              if (user.role === "doctor") {
                navigate("/doctor");
              } else {
                if (user.department) setDepartment(user.department);
                setStep("identify");
              }
            }}
            onGuestBypass={() => {
              setIsGuest(true);
              setStep("identify");
            }}
          />
        ) : (
          <>
            {step === "identify" && (
              <Identify
                lang={lang}
                setLang={setLang}
                currentUser={currentUser}
                onSessionStart={(id, tokenNumber, dept, doc) => {
                  setSessionId(id);
                  setToken(tokenNumber);
                  if (dept) setDepartment(dept);
                  if (doc) setConsultingDoctor(doc);
                  setStep("converse");
                }}
              />
            )}

            {step === "converse" && (
              <Converse
                lang={lang}
                sessionId={sessionId}
                department={department}
                consultingDoctor={consultingDoctor}
                onComplete={() => setStep("scan")}
                onBack={() => setStep("identify")}
              />
            )}

            {step === "scan" && (
              <Scan
                lang={lang}
                sessionId={sessionId}
                onComplete={() => setStep("summary")}
                onBack={() => setStep("converse")}
              />
            )}

            {step === "summary" && (
              <SummaryReview
                lang={lang}
                sessionId={sessionId}
                consultingDoctor={consultingDoctor}
                onSent={() => setStep("sent")}
                onEditAnswers={() => setStep("converse")}
                onBack={() => setStep("scan")}
              />
            )}

            {step === "sent" && (
              <Sent
                lang={lang}
                sessionId={sessionId}
                token={token}
                consultingDoctor={consultingDoctor}
              />
            )}
          </>
        )}
      </main>

      {/* Hospital Help & Compliance Footer (Item 18: Last updated date) */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-3.5 px-4 text-center text-xs text-slate-500 dark:text-slate-400 print:hidden space-y-1.5 transition-colors">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            MediKiosk OPD Case-Taking Platform • ABDM & DPDP Act 2023 Compliant
          </p>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <button
            type="button"
            onClick={() => setFaqOpen(true)}
            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
          >
            {lang === "hi" ? "अक्सर पूछे जाने वाले प्रश्न (FAQ)" : "Patient FAQ Guide"}
          </button>
        </div>

        <p className="text-[11px]">
          Patient Helpdesk:{" "}
          <a
            href="mailto:support.opd@ayush.gov.in"
            className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
          >
            support.opd@ayush.gov.in
          </a>{" "}
          • National Ayush Helpline:{" "}
          <a
            href="tel:1800112233"
            className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
          >
            1800-11-2233
          </a>
        </p>

        {/* Last updated date badge (Item 18) */}
        <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
          Clinical protocols last verified: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} • MediKiosk v4.5.2 (Impeccable Certified)
        </p>
      </footer>

      {/* Interactive Global Widgets */}
      {/* 1. Cookie & Privacy Banner (Item 2) */}
      <CookieBanner lang={lang} />

      {/* 2. Back to Top Button (Item 4) */}
      <BackToTop />

      {/* 3. Floating Contact & SOS Button (Item 20) */}
      <FloatingContact lang={lang} />

      {/* 4. Site Search Command Palette (Item 3) */}
      <SiteSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectAction={handleSearchAction}
        lang={lang}
      />

      {/* 5. Expandable FAQ Modal (Item 19) */}
      <FaqSection
        isOpen={faqOpen}
        onClose={() => setFaqOpen(false)}
        lang={lang}
      />

      {/* 6. Confirmation Modal: Reset / Start Over (Item 17) */}
      <ConfirmationModal
        isOpen={showResetConfirm}
        title={lang === "hi" ? "पंजीकरण पुनः प्रारंभ करें?" : "Start Over Registration?"}
        message={
          lang === "hi"
            ? "क्या आप निश्चित रूप से पंजीकरण पर वापस जाना चाहते हैं? वर्तमान प्रगति रीसेट हो जाएगी।"
            : "Are you sure you want to return to patient intake? Current answers in this session will be cleared."
        }
        confirmText={lang === "hi" ? "हाँ, पुनः प्रारंभ करें" : "Yes, Reset Intake"}
        cancelText={lang === "hi" ? "रद्द करें" : "Cancel"}
        isDanger={true}
        onConfirm={() => {
          setStep("identify");
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* 7. Confirmation Modal: Logout (Item 17) */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        title={lang === "hi" ? "लॉगआउट की पुष्टि करें" : "Confirm Sign Out"}
        message={
          lang === "hi"
            ? "क्या आप निश्चित रूप से अपने खाते से लॉगआउट करना चाहते हैं?"
            : "Are you sure you want to sign out of this account?"
        }
        confirmText={lang === "hi" ? "लॉगआउट करें" : "Sign Out"}
        cancelText={lang === "hi" ? "रद्द करें" : "Cancel"}
        isDanger={false}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/doctor")) {
      document.title = "MediKiosk | Ayush & Hospital Doctor OPD Workstation";
    }
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<PatientKiosk />} />
      <Route path="/doctor" element={<DoctorDashboard lang="en" />} />
      <Route path="/doctor/:sessionId" element={<DoctorDashboard lang="en" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
