import React, { useState } from "react";
import { api, ApiError } from "../api.js";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";

/* Clean institutional SVG icons */
function IconKey({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function IconUserPlus({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}

function IconUser({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function IconStethoscope({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.5 4.5v5a4.5 4.5 0 009 0v-5M7 4.5h4M16 4.5h4M9 14v3a4 4 0 004 4h1a4 4 0 004-4v-6.5M18 10.5a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  );
}

function IconAlertTriangle({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function IconCheckCircle({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconArrowRight({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function IconEmblem({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M12 2L4 7v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V7l-8-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M12 8v8M8 12h8" />
    </svg>
  );
}

function isValidAuthUser(user) {
  return (
    user &&
    typeof user.id === "string" &&
    (user.role === "patient" || user.role === "doctor")
  );
}

export default function AuthScreen({ lang, onAuthSuccess, onGuestBypass }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [role, setRole] = useState("patient"); // "patient" | "doctor"

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [fullName, setFullName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [abhaId, setAbhaId] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [department, setDepartment] = useState("general_medicine");
  const [specialization, setSpecialization] = useState("");
  const [hospital, setHospital] = useState("");
  const [cabin, setCabin] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      setError(
        lang === "hi"
          ? "कृपया उपयोगकर्ता नाम और पासवर्ड दर्ज करें।"
          : "Please enter both username and password."
      );
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.login({
        username: loginIdentifier.trim(),
        password: loginPassword,
      });
      if (res.success && isValidAuthUser(res.user)) {
        setSuccessMsg(
          lang === "hi"
            ? "प्रमाणीकरण सफल! आपका स्वागत है।"
            : "Signed in successfully. Redirecting to workstation..."
        );
        setTimeout(() => {
          onAuthSuccess(res.user, res.token);
        }, 500);
      } else {
        setError(
          res.success
            ? lang === "hi"
              ? "सर्वर से अमान्य खाता विवरण मिला। कृपया पुनः प्रयास करें।"
              : "The server returned an invalid account profile. Please try again."
            : res.message || "Authentication failed."
        );
      }
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? lang === "hi"
            ? "अमान्य क्रेडेंशियल्स। कृपया उपयोगकर्ता नाम और पासवर्ड जांचें।"
            : "Invalid credentials. Please verify your username and password."
          : err.message ||
              (lang === "hi"
                ? "लॉगिन विफल रहा।"
                : "Unable to sign in. The local registry service might be offline.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !signupUsername.trim() || !signupPassword) {
      setError(
        lang === "hi"
          ? "कृपया नाम, उपयोगकर्ता नाम और पासवर्ड दर्ज करें।"
          : "Please fill in full name, username, and password."
      );
      return;
    }
    if (signupPassword.length < 4 || signupPassword.length > 128) {
      setError(
        lang === "hi"
          ? "पासवर्ड 4 से 128 अक्षरों का होना चाहिए।"
          : "Password must be between 4 and 128 characters."
      );
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        full_name: fullName.trim(),
        username: signupUsername.trim(),
        password: signupPassword,
        role,
        email: signupEmail.trim() || null,
        phone: signupPhone.trim() || null,
        abha_id: abhaId.trim() || null,
        age: age ? parseInt(age, 10) : null,
        gender: role === "patient" ? gender : null,
        department,
        specialization: role === "doctor" ? specialization.trim() : null,
        hospital: role === "doctor" ? hospital.trim() || null : null,
        cabin: role === "doctor" ? cabin.trim() || null : null,
      };

      const res = await api.signup(payload);
      if (res.success && isValidAuthUser(res.user)) {
        setSuccessMsg(
          lang === "hi"
            ? "खाता सफलतापूर्वक बनाया गया! लॉगिन किया जा रहा है..."
            : "Account registered successfully. Initializing session..."
        );
        setTimeout(() => {
          onAuthSuccess(res.user, res.token);
        }, 700);
      } else {
        setError(
          lang === "hi"
            ? "सर्वर से अमान्य खाता विवरण मिला। कृपया पुनः प्रयास करें।"
            : "The server returned an invalid account profile. Please try again."
        );
      }
    } catch (err) {
      setError(
        err.message ||
          (lang === "hi"
            ? "पंजीकरण विफल रहा।"
            : "Registration failed. Username or health identifier may already exist.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      id="main-content"
      className="kiosk-screen flex-1 w-full bg-[#FAFBF9] dark:bg-[#0E1513] text-[#121C18] dark:text-[#F2F6F4] transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* Asymmetric 2-Column Human-Crafted Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Institutional Dispatch & Walk-in Directive (Col 1-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* National Ayush Header Notice */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs font-semibold text-[#0D5C4E] dark:text-[#15806C]">
              <IconEmblem className="w-4 h-4 text-[#0D5C4E] dark:text-[#15806C]" />
              <span>
                {lang === "hi"
                  ? "राष्ट्रीय आयुष मिशन · भारत सरकार"
                  : "National Ayush Mission · Ministry of Ayush"}
              </span>
            </div>

            {/* Hero Headline: Dramatically larger, tight tracking */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-[#121C18] dark:text-[#F2F6F4] leading-[1.15]">
              {lang === "hi"
                ? "ओपीडी केस-टेकिंग एवं क्लिनिकल वर्कस्टेशन"
                : "OPD Case-Taking & Clinical Workstation"}
            </h1>

            {/* Concrete Body Text (60-75 character lines) */}
            <p className="text-sm sm:text-base text-[#4A5852] dark:text-[#8D9E97] leading-relaxed max-w-xl">
              {lang === "hi"
                ? "आयुष ओपीडी में मरीज का मानकीकृत इतिहास संकलन, दशविध परीक्षा एवं त्वरित टोकन आवंटन। पंजीकृत मरीज अपना पूर्व विवरण देख सकते हैं। आकस्मिक एवं वॉक-इन मरीज बिना खाते के तुरंत प्रवेश कर सकते हैं।"
                : "Standardized clinical history taking, Ayurvedic Dashavidha Pariksha, and token issuance for hospital outpatient departments. Registered users track prior summaries and ABDM records; walk-in patients may proceed directly."}
            </p>

            {/* Walk-in Bypass Card (Asymmetric, intentional hairline border) */}
            <div className="p-5 sm:p-6 rounded-lg border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold font-display text-[#121C18] dark:text-[#F2F6F4]">
                    {lang === "hi" ? "त्वरित वॉक-इन परामर्श" : "Direct Walk-in Intake"}
                  </h2>
                  <p className="text-xs text-[#4A5852] dark:text-[#8D9E97] mt-1 leading-normal">
                    {lang === "hi"
                      ? "यदि आपके पास पूर्व खाता या पासवर्ड नहीं है, तो सीधे पंजीकरण शुरू करें।"
                      : "No login credentials required. Enter demographic details and chief complaints at the next step."}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] font-mono font-semibold uppercase px-2 py-0.5 rounded border border-[#D3DDD8] dark:border-[#24352F] text-[#4A5852] dark:text-[#8D9E97]">
                  Instant
                </span>
              </div>

              <button
                type="button"
                onClick={onGuestBypass}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-md bg-[#FAFBF9] dark:bg-[#0E1513] hover:bg-[#EAF3F0] dark:hover:bg-[#1A2622] text-[#0D5C4E] dark:text-[#15806C] border border-[#0D5C4E] dark:border-[#15806C] font-semibold text-xs sm:text-sm transition-colors"
              >
                <span>
                  {lang === "hi"
                    ? "वॉक-इन मरीज के रूप में आगे बढ़ें"
                    : "Continue as Walk-in Patient"}
                </span>
                <IconArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Official OPD Notice & Standards Strip */}
            <div className="pt-2 border-t border-[#D3DDD8] dark:border-[#24352F] text-xs text-[#4A5852] dark:text-[#8D9E97] space-y-1.5">
              <p className="font-semibold text-[#121C18] dark:text-[#F2F6F4]">
                {lang === "hi"
                  ? "क्लिनिकल प्रोटोकॉल एवं सुरक्षा मानक"
                  : "Clinical Protocols & Interoperability"}
              </p>
              <p className="leading-normal">
                {lang === "hi"
                  ? "यह प्रणाली राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA) के ABDM FHIR R4 विनिर्देशों एवं आयुष मानकीकृत नैदानिक शब्दावली के अनुरूप कार्य करती है।"
                  : "FHIR R4 sample output and standardized Ayush terminology are shown for demonstration; this prototype is not certified for clinical or regulatory use."}
              </p>
            </div>

          </div>

          {/* Right Column: Authentication & Registration Form (Col 8-12) */}
          <div className="lg:col-span-5">
            <div className="rounded-lg border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] overflow-hidden">
              
              {/* Form Tab Header: Clean 1px segmented bar */}
              <div className="grid grid-cols-2 border-b border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513]">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className={`py-3.5 px-4 text-xs font-bold transition-colors flex items-center justify-center gap-2 border-b-2 ${
                    mode === "login"
                      ? "border-[#0D5C4E] bg-white dark:bg-[#15201C] text-[#0D5C4E] dark:text-[#15806C]"
                      : "border-transparent text-[#4A5852] dark:text-[#8D9E97] hover:text-[#121C18] dark:hover:text-[#F2F6F4]"
                  }`}
                >
                  <IconKey className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "लॉग इन" : "Sign In"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className={`py-3.5 px-4 text-xs font-bold transition-colors flex items-center justify-center gap-2 border-b-2 ${
                    mode === "signup"
                      ? "border-[#0D5C4E] bg-white dark:bg-[#15201C] text-[#0D5C4E] dark:text-[#15806C]"
                      : "border-transparent text-[#4A5852] dark:text-[#8D9E97] hover:text-[#121C18] dark:hover:text-[#F2F6F4]"
                  }`}
                >
                  <IconUserPlus className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "नया खाता" : "Create Account"}</span>
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6 sm:p-7 space-y-5">
                
                {/* Error Banner: Strict #B91C1C alert border, no fuzzy gradient */}
                {error && (
                  <div
                    role="alert"
                    className="p-3.5 rounded border border-[#B91C1C] bg-[#FEF2F2] dark:bg-[#2A1212] text-[#B91C1C] dark:text-[#FCA5A5] text-xs flex items-start gap-2.5"
                  >
                    <IconAlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-snug">
                      <p className="font-semibold">{error}</p>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        {lang === "hi"
                          ? "कृपया क्रेडेंशियल्स की जांच करें अथवा वॉक-इन विकल्प चुनें।"
                          : "Verify your entered credentials or continue as a walk-in patient."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Success Banner: Strict #0D5C4E border */}
                {successMsg && (
                  <div
                    role="status"
                    className="p-3.5 rounded border border-[#0D5C4E] bg-[#EAF3F0] dark:bg-[#12241F] text-[#0D5C4E] dark:text-[#8BE3D2] text-xs flex items-center gap-2.5"
                  >
                    <IconCheckCircle className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">{successMsg}</span>
                  </div>
                )}

                {/* TAB 1: LOGIN FORM */}
                {mode === "login" && (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1.5">
                        {lang === "hi" ? "उपयोगकर्ता नाम / ईमेल" : "Username or Email"}
                      </label>
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        aria-label={lang === "hi" ? "उपयोगकर्ता नाम या ईमेल" : "Username or email"}
                        placeholder="e.g. physician_sharma"
                        autoComplete="username"
                        maxLength={254}
                        className="w-full px-3 py-2.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#0E1513] text-sm text-[#121C18] dark:text-[#F2F6F4] focus:outline-none focus:border-[#0D5C4E] focus:ring-1 focus:ring-[#0D5C4E] transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider">
                          {lang === "hi" ? "पासवर्ड" : "Password"}
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          aria-label={lang === "hi" ? "पासवर्ड" : "Password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          maxLength={128}
                          className="w-full pl-3 pr-10 py-2.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#0E1513] text-sm text-[#121C18] dark:text-[#F2F6F4] focus:outline-none focus:border-[#0D5C4E] focus:ring-1 focus:ring-[#0D5C4E] transition-colors"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          aria-label={showLoginPassword ? "Hide password" : "Show password"}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#4A5852] dark:text-[#8D9E97] hover:text-[#121C18] dark:hover:text-[#F2F6F4]"
                        >
                          {showLoginPassword ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full min-h-[44px] py-2.5 px-4 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <LoadingSpinner
                          size="sm"
                          text={lang === "hi" ? "प्रमाणित किया जा रहा है..." : "Authenticating credentials..."}
                          className="text-white"
                        />
                      ) : (
                        <>
                          <IconKey className="w-4 h-4 text-white" />
                          <span>{lang === "hi" ? "लॉग इन करें" : "Sign In to Registry"}</span>
                        </>
                      )}
                    </button>

                    {/* Quick Demo Credentials */}
                    <div className="pt-3 border-t border-[#D3DDD8] dark:border-[#24352F]">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#4A5852] dark:text-[#8D9E97] mb-2 flex items-center justify-between">
                        <span>{lang === "hi" ? "त्वरित डेमो लॉगिन" : "Instant Demo Logins"}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">1-Click</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setLoginIdentifier("patient");
                            setLoginPassword("patient123");
                          }}
                          className="text-left px-2.5 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] hover:border-[#0D5C4E] text-[11px] transition-colors"
                        >
                          <div className="font-semibold text-[#121C18] dark:text-[#F2F6F4]">Patient (Ramesh Kumar)</div>
                          <div className="text-[10px] text-[#4A5852] dark:text-[#8D9E97]">username: patient</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLoginIdentifier("dr_kulkarni");
                            setLoginPassword("doctor123");
                          }}
                          className="text-left px-2.5 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] hover:border-[#0D5C4E] text-[11px] transition-colors"
                        >
                          <div className="font-semibold text-[#121C18] dark:text-[#F2F6F4]">Dr. Rajesh Kulkarni</div>
                          <div className="text-[10px] text-[#4A5852] dark:text-[#8D9E97]">Orthopedics · Cabin 108</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLoginIdentifier("dr_mehta");
                            setLoginPassword("doctor123");
                          }}
                          className="text-left px-2.5 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] hover:border-[#0D5C4E] text-[11px] transition-colors"
                        >
                          <div className="font-semibold text-[#121C18] dark:text-[#F2F6F4]">Dr. Arvind Mehta</div>
                          <div className="text-[10px] text-[#4A5852] dark:text-[#8D9E97]">Cardiology · Room 204</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLoginIdentifier("dr_sen");
                            setLoginPassword("doctor123");
                          }}
                          className="text-left px-2.5 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] hover:border-[#0D5C4E] text-[11px] transition-colors"
                        >
                          <div className="font-semibold text-[#121C18] dark:text-[#F2F6F4]">Dr. Ananya Sen</div>
                          <div className="text-[10px] text-[#4A5852] dark:text-[#8D9E97]">General Med · Room 102</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLoginIdentifier("doctor");
                            setLoginPassword("doctor123");
                          }}
                          className="text-left col-span-2 px-2.5 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] hover:border-[#0D5C4E] text-[11px] transition-colors"
                        >
                          <div className="font-semibold text-[#121C18] dark:text-[#F2F6F4]">Dr. Sunita Sharma</div>
                          <div className="text-[10px] text-[#4A5852] dark:text-[#8D9E97]">Ayush Panchakarma & Integrative · Cabin 101</div>
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* TAB 2: SIGNUP FORM */}
                {mode === "signup" && (
                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    {/* Role Selection: Sharp flat toggle */}
                    <div>
                      <label className="block text-xs font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1.5">
                        {lang === "hi" ? "उपयोगकर्ता प्रकार" : "Registry Role"}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRole("patient")}
                          aria-pressed={role === "patient"}
                          className={`py-2 px-3 rounded border text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                            role === "patient"
                              ? "border-[#0D5C4E] bg-[#EAF3F0] dark:bg-[#12241F] text-[#0D5C4E] dark:text-[#15806C]"
                              : "border-[#D3DDD8] dark:border-[#24352F] text-[#4A5852] dark:text-[#8D9E97] hover:border-[#121C18]"
                          }`}
                        >
                          <IconUser className="w-4 h-4" />
                          <span>{lang === "hi" ? "रोगी (Patient)" : "Patient"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRole("doctor")}
                          aria-pressed={role === "doctor"}
                          className={`py-2 px-3 rounded border text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                            role === "doctor"
                              ? "border-[#0D5C4E] bg-[#EAF3F0] dark:bg-[#12241F] text-[#0D5C4E] dark:text-[#15806C]"
                              : "border-[#D3DDD8] dark:border-[#24352F] text-[#4A5852] dark:text-[#8D9E97] hover:border-[#121C18]"
                          }`}
                        >
                          <IconStethoscope className="w-4 h-4" />
                          <span>{lang === "hi" ? "चिकित्सक (Doctor)" : "Physician"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1">
                        {lang === "hi" ? "पूरा नाम *" : "Full Legal Name *"}
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        aria-label={lang === "hi" ? "पूरा नाम" : "Full legal name"}
                        placeholder="e.g. Dr. Suresh Sharma"
                        autoComplete="name"
                        maxLength={120}
                        className="w-full px-3 py-2 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#0E1513] text-xs text-[#121C18] dark:text-[#F2F6F4] focus:outline-none focus:border-[#0D5C4E]"
                        required
                      />
                    </div>

                    {/* Username & Email Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1">
                          {lang === "hi" ? "उपयोगकर्ता नाम *" : "Username *"}
                        </label>
                        <input
                          type="text"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                          aria-label={lang === "hi" ? "उपयोगकर्ता नाम" : "Username"}
                          placeholder="e.g. suresh_opd"
                          autoComplete="username"
                          maxLength={64}
                          className="w-full px-3 py-2 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#0E1513] text-xs text-[#121C18] dark:text-[#F2F6F4] focus:outline-none focus:border-[#0D5C4E]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1">
                          {lang === "hi" ? "ईमेल" : "Official Email"}
                        </label>
                        <input
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          aria-label={lang === "hi" ? "ईमेल" : "Official email"}
                          placeholder="user@hospital.gov.in"
                          autoComplete="email"
                          maxLength={254}
                          className="w-full px-3 py-2 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#0E1513] text-xs text-[#121C18] dark:text-[#F2F6F4] focus:outline-none focus:border-[#0D5C4E]"
                        />
                      </div>
                    </div>

                    {/* Phone & Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1">
                          {lang === "hi" ? "मोबाइल नंबर" : "Phone Number"}
                        </label>
                        <input
                          type="tel"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          aria-label={lang === "hi" ? "मोबाइल नंबर" : "Phone number"}
                          placeholder="10-digit mobile"
                          autoComplete="tel"
                          maxLength={20}
                          className="w-full px-3 py-2 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#0E1513] text-xs text-[#121C18] dark:text-[#F2F6F4] focus:outline-none focus:border-[#0D5C4E]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1">
                          {lang === "hi" ? "पासवर्ड (न्यूनतम 4 अक्षर) *" : "Password (Min 4 chars) *"}
                        </label>
                        <div className="relative">
                          <input
                            type={showSignupPassword ? "text" : "password"}
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            aria-label={lang === "hi" ? "पासवर्ड" : "Password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            minLength={4}
                            maxLength={128}
                            className="w-full pl-3 pr-8 py-2 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#0E1513] text-xs text-[#121C18] dark:text-[#F2F6F4] focus:outline-none focus:border-[#0D5C4E]"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword((prev) => !prev)}
                            aria-label={showSignupPassword ? "Hide password" : "Show password"}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#4A5852] dark:text-[#8D9E97]"
                          >
                            {showSignupPassword ? (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Patient fields: ABHA ID, Age, Gender */}
                    {role === "patient" && (
                      <div className="p-3.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1">
                            {lang === "hi" ? "आभा (ABHA) आईडी" : "ABHA Health ID (Optional)"}
                          </label>
                          <input
                            type="text"
                            value={abhaId}
                            onChange={(e) => setAbhaId(e.target.value)}
                            aria-label={lang === "hi" ? "आभा स्वास्थ्य आईडी" : "ABHA health ID"}
                            placeholder="14-digit ABHA number (e.g. 91-1234-5678-9012)"
                            maxLength={20}
                            className="w-full px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs font-mono text-[#121C18] dark:text-[#F2F6F4]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1">
                              {lang === "hi" ? "उम्र (वर्ष)" : "Age (Years)"}
                            </label>
                            <input
                              type="number"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                              aria-label={lang === "hi" ? "उम्र वर्ष में" : "Age in years"}
                              placeholder="e.g. 42"
                              min={0}
                              max={130}
                              step={1}
                              className="w-full px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs text-[#121C18] dark:text-[#F2F6F4]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1">
                              {lang === "hi" ? "लिंग" : "Gender"}
                            </label>
                            <select
                              value={gender}
                              onChange={(e) => setGender(e.target.value)}
                              aria-label={lang === "hi" ? "लिंग" : "Gender"}
                              className="w-full px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs text-[#121C18] dark:text-[#F2F6F4]"
                            >
                              <option value="male">{lang === "hi" ? "पुरुष (Male)" : "Male"}</option>
                              <option value="female">{lang === "hi" ? "महिला (Female)" : "Female"}</option>
                              <option value="other">{lang === "hi" ? "अन्य (Other)" : "Other"}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Doctor fields: Specialization & Department & Hospital/Cabin */}
                    {role === "doctor" && (
                      <div className="p-3.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-[#FAFBF9] dark:bg-[#0E1513] space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1">
                            {lang === "hi" ? "क्लिनिकल विशेषज्ञता" : "Clinical Specialization"}
                          </label>
                          <input
                            type="text"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            aria-label={lang === "hi" ? "क्लिनिकल विशेषज्ञता" : "Clinical specialization"}
                            placeholder="e.g. Orthopedic Surgery, Interventional Cardiology, Kayachikitsa"
                            maxLength={160}
                            className="w-full px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs text-[#121C18] dark:text-[#F2F6F4]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1">
                            {lang === "hi" ? "ओपीडी विभाग (All Specialties)" : "OPD Clinical Wing (All Specialties)"}
                          </label>
                          <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            aria-label={lang === "hi" ? "ओपीडी विभाग" : "OPD clinical specialty"}
                            className="w-full px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs text-[#121C18] dark:text-[#F2F6F4]"
                          >
                            <option value="general_medicine">General Medicine</option>
                            <option value="internal_medicine">Internal Medicine</option>
                            <option value="orthopedics">Orthopedics & Joint Care</option>
                            <option value="cardiology">Cardiology</option>
                            <option value="ayush">Ayush & Holistic Health</option>
                            <option value="ayurveda">Ayurveda Central Clinic</option>
                            <option value="pediatrics">Pediatrics & Child Care</option>
                            <option value="dermatology">Dermatology</option>
                            <option value="neurology">Neurology</option>
                            <option value="pulmonology">Pulmonology & Chest Medicine</option>
                            <option value="ent">ENT / Otorhinolaryngology</option>
                            <option value="integrated">Integrated Modern + Ayush</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1">
                              {lang === "hi" ? "अस्पताल / क्लिनिक" : "Hospital / Clinic"}
                            </label>
                            <input
                              type="text"
                              value={hospital}
                              onChange={(e) => setHospital(e.target.value)}
                              aria-label={lang === "hi" ? "अस्पताल या क्लिनिक" : "Hospital or clinic"}
                              placeholder="e.g. City Care Hospital"
                              maxLength={160}
                              className="w-full px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs text-[#121C18] dark:text-[#F2F6F4]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#121C18] dark:text-[#F2F6F4] uppercase tracking-wider mb-1">
                              {lang === "hi" ? "केबिन / कमरा" : "Cabin / Room #"}
                            </label>
                            <input
                              type="text"
                              value={cabin}
                              onChange={(e) => setCabin(e.target.value)}
                              aria-label={lang === "hi" ? "केबिन या कमरा" : "Cabin or room"}
                              placeholder="e.g. Cabin 104"
                              maxLength={80}
                              className="w-full px-3 py-1.5 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs text-[#121C18] dark:text-[#F2F6F4]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full min-h-[44px] py-2.5 px-4 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <LoadingSpinner
                          size="sm"
                          text={lang === "hi" ? "पंजीकरण किया जा रहा है..." : "Creating account..."}
                          className="text-white"
                        />
                      ) : (
                        <>
                          <IconUserPlus className="w-4 h-4 text-white" />
                          <span>{lang === "hi" ? "खाता बनाएं एवं जारी रखें" : "Register OPD Account"}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
