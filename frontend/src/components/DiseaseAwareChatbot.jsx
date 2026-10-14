import React, { useEffect, useState, useRef } from "react";
import { api } from "../api.js";

const OPENROUTER_MODELS = [
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet (OpenRouter)" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B Instruct (Free)" },
  { id: "meta-llama/llama-3.1-8b-instruct:free", name: "Llama 3.1 8B Instruct (Free)" },
];

export default function DiseaseAwareChatbot({ currentSession, onAppendToHpi }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "What symptoms or clinical findings are you investigating?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("anthropic/claude-3.5-sonnet");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("OPENROUTER_API_KEY") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [detectedCondition, setDetectedCondition] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSaveKey = () => {
    localStorage.setItem("OPENROUTER_API_KEY", tempKey.trim());
    setApiKey(tempKey.trim());
    setShowSettings(false);
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.doctorChat({
        messages: newMessages,
        model: selectedModel,
        apiKey: apiKey || null,
        sessionId: currentSession?.session_id || null,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
      if (res.detected_condition) {
        setDetectedCondition(res.detected_condition);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Clinical assistant offline or API limit reached. Add an OpenRouter key in Settings to use advanced models.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "What symptoms or clinical findings are you investigating?",
      },
    ]);
    setDetectedCondition(null);
  };

  const handleImportPatientComplaint = () => {
    const cc = currentSession?.transcript?.chief_complaint;
    if (cc) {
      handleSend(`Patient presents with chief complaint: ${cc}. What targeted diagnostic questions should I ask?`);
    }
  };

  const handleCopyChatToCase = () => {
    if (onAppendToHpi && messages.length > 1) {
      const userAndBotNotes = messages
        .slice(1)
        .map((m) => `${m.role === "user" ? "Physician Probe" : "Diagnostic AI Analysis"}: ${m.content}`)
        .join("\n\n");
      onAppendToHpi(userAndBotNotes);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#15201C] rounded-lg border border-[#D3DDD8] dark:border-[#24352F] overflow-hidden text-[#121C18] dark:text-[#F2F6F4]">
      {/* Top Header */}
      <div className="p-3 bg-[#0D5C4E] dark:bg-[#121C18] text-white flex items-center justify-between border-b border-[#09453A] dark:border-[#24352F]">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#A7F3D0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <div>
            <h3 className="text-xs font-bold leading-tight font-display tracking-tight">
              Disease-Aware Clinical Probe
            </h3>
            <p className="text-[10px] text-[#A7F3D0] dark:text-[#8D9E97] font-mono">
              {selectedModel.split("/")[1] || selectedModel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {detectedCondition && (
            <span className="text-[10px] px-2 py-0.5 rounded border border-[#15806C] bg-[#09453A] text-white font-mono uppercase font-bold">
              {detectedCondition}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowSettings((prev) => !prev)}
            title="Configure OpenRouter API Key and Model"
            className="px-2 py-1 rounded bg-[#09453A] hover:bg-[#07362E] text-white text-[11px] font-semibold border border-[#15806C] transition-colors"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={handleResetChat}
            title="Reset Chat"
            className="p-1.5 rounded bg-[#09453A] hover:bg-[#07362E] text-white text-xs border border-[#15806C] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-3 bg-[#FAFBF9] dark:bg-[#0E1513] border-b border-[#D3DDD8] dark:border-[#24352F] text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#121C18] dark:text-[#F2F6F4]">OpenRouter Engine Configuration</span>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-[#4A5852] hover:text-[#121C18]"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#4A5852] mb-1">
              Select AI Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-xs text-[#121C18] dark:text-[#F2F6F4] outline-none"
            >
              {OPENROUTER_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#4A5852] mb-1">
              OpenRouter API Key (Optional)
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full p-2 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] font-mono text-xs text-[#121C18] dark:text-[#F2F6F4] outline-none"
            />
            <p className="text-[10px] text-[#4A5852] mt-0.5">
              Saved locally. Free fallback models are available without key.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveKey}
            className="w-full py-1.5 rounded bg-[#0D5C4E] hover:bg-[#09453A] text-white font-semibold text-xs transition-colors"
          >
            Save AI Settings
          </button>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 text-xs sm:text-sm">
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div
              key={idx}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded px-3 py-2.5 leading-relaxed ${
                  isUser
                    ? "bg-[#0D5C4E] text-white"
                    : "bg-[#FAFBF9] dark:bg-[#0E1513] text-[#121C18] dark:text-[#F2F6F4] border border-[#D3DDD8] dark:border-[#24352F]"
                }`}
              >
                {!isUser && (
                  <span className="block font-bold text-[10px] text-[#0D5C4E] dark:text-[#15806C] uppercase tracking-wider mb-1">
                    Clinical AI Guidance
                  </span>
                )}
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#FAFBF9] dark:bg-[#0E1513] border border-[#D3DDD8] dark:border-[#24352F] rounded px-3 py-2 text-[#4A5852] text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D5C4E] animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D5C4E] animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D5C4E] animate-pulse [animation-delay:300ms]" />
              <span>Analyzing pathology...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Bar */}
      <div className="px-3 py-2 bg-[#FAFBF9] dark:bg-[#0E1513] border-t border-[#D3DDD8] dark:border-[#24352F] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          {currentSession?.transcript?.chief_complaint && (
            <button
              type="button"
              onClick={handleImportPatientComplaint}
              className="px-2.5 py-1 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#15201C] text-[#121C18] dark:text-[#F2F6F4] font-semibold text-[11px] transition-colors"
            >
              Import Patient Complaint
            </button>
          )}
        </div>

        {messages.length > 1 && (
          <button
            type="button"
            onClick={handleCopyChatToCase}
            className="px-2.5 py-1 rounded bg-[#EAF3F0] dark:bg-[#1A2622] text-[#0D5C4E] dark:text-[#8BE3D2] border border-[#0D5C4E] dark:border-[#15806C] font-semibold text-[11px] transition-colors"
          >
            Append to Case HPI
          </button>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white dark:bg-[#15201C] border-t border-[#D3DDD8] dark:border-[#24352F] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type clinical inquiry or differential query..."
          disabled={loading}
          className="flex-1 h-9 px-3 rounded border border-[#D3DDD8] dark:border-[#24352F] bg-white dark:bg-[#0E1513] text-xs text-[#121C18] dark:text-[#F2F6F4] focus:outline-none focus:border-[#0D5C4E]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-9 px-3.5 rounded bg-[#0D5C4E] hover:bg-[#09453A] disabled:opacity-50 text-white font-semibold text-xs transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
