import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Send, Mic, MicOff, X, Bot, Phone, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { getStoredComplaints, createComplaint } from '../../api/complaints.api';
import { queryAssistantChat } from '../../api/ml.api';
import { MUMBAI_WARDS, MOCK_OFFICERS } from '../../utils/mockData';
import { findClosestWard, analyzeComplaintDynamic } from '../../utils/geoUtils';
import toast from 'react-hot-toast';

const createMessage = (sender, data = {}) => ({
  id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  sender,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  ...data,
});

const getWelcomeMessage = (language, user) => {
  const welcomeByLang = {
    en: {
      text: `Namaste${user?.name ? `, ${user.name}` : ''}! I am **Kaiser Sahayak**, your 24/7 AI Civic Assistant for Mumbai. How can I help you today? You can report an issue, track an existing complaint, check your ward details, or ask for municipal emergency helplines.`,
      chips: [
        '🚨 Report a Pothole',
        '🔍 Track Complaint #cmp-001',
        '📍 Find My Ward Officer',
        '📞 BMC Emergency Helplines',
      ],
    },
    hi: {
      text: `नमस्ते${user?.name ? `, ${user.name}` : ''}! मैं **कैसर सहायक** हूँ, मुंबई के लिए आपका AI नागरिक सहायक। मैं आपकी क्या मदद कर सकता हूँ? आप कोई शिकायत दर्ज कर सकते हैं, स्थिति जान सकते हैं या आपातकालीन सहायता नंबर ले सकते हैं।`,
      chips: [
        '🚨 गड्ढे की शिकायत करें',
        '🔍 शिकायत की स्थिति देखें',
        '📍 वार्ड अधिकारी खोजें',
        '📞 बीएमसी हेल्पलाइन नंबर',
      ],
    },
    mr: {
      text: `नमस्कार${user?.name ? `, ${user.name}` : ''}! मी **कैसर सहाय्यक** आहे, मुंबईसाठी तुमचा AI नागरी सहाय्यक. मी आज आपल्याला कशी मदत करू शकतो? तुम्ही तक्रार नोंदवू शकता, तक्रारीची सद्यस्थिती तपासू शकता किंवा आपत्कालीन मदत मागू शकता.`,
      chips: [
        '🚨 खड्ड्याची तक्रार करा',
        '🔍 तक्रार ट्रॅक करा',
        '📍 प्रभाग अधिकारी शोधा',
        '📞 आपत्कालीन संपर्क क्रमांक',
      ],
    },
  };

  const welcome = welcomeByLang[language] || welcomeByLang.en;
  return createMessage('ai', {
    id: 'msg-welcome',
    text: welcome.text,
    chips: welcome.chips,
  });
};

export const CivicAiAssistant = () => {
  const { language } = useLanguage();
  const { dispatchNotification } = useNotifications();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [getWelcomeMessage(language, user)]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const hasMounted = useRef(false);

  // Scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Synchronize language change without cascading render on initial mount
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    setMessages([getWelcomeMessage(language, user)]);
  }, [language, user]);

  // Speech Recognition Simulation
  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    // Check Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast('Listening to your voice...', { icon: '🎙️' });
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Voice input error. Please type your message.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      // Simulation for environments without speech recognition
      setIsListening(true);
      toast('Listening simulation active (2s)...', { icon: '🎙️' });
      setTimeout(() => {
        setIsListening(false);
        const sampleQuery = language === 'hi'
          ? 'अंधेरी पूर्व में सड़क पर बड़ा गड्ढा है'
          : 'Large pothole on road near Bandra station';
        setInputValue(sampleQuery);
        handleSend(sampleQuery);
      }, 2200);
    }
  };

  // AI response generator
  const processUserQuery = async (queryText) => {
    const q = queryText.toLowerCase().trim();
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 750));

    // Check 1: Ticket Tracking (e.g., cmp-001, cmp-002, or "track")
    const ticketMatch = q.match(/cmp-\d+/i);
    if (ticketMatch || q.includes('track') || q.includes('status') || q.includes('स्थिति') || q.includes('तक्रार')) {
      const complaints = getStoredComplaints();
      const targetId = ticketMatch ? ticketMatch[0].toLowerCase() : complaints[0]?.id;
      const found = complaints.find((c) => c.id.toLowerCase() === targetId) || complaints[0];

      if (found) {
        setIsTyping(false);
        return createMessage('ai', {
          text: `Here is the real-time municipal status for **Ticket #${found.id}**:`,
          ticketCard: found,
          chips: ['View on Ward Map', 'Report Another Issue'],
        });
      }
    }

    // Check 2: Emergency Helplines
    if (q.includes('emergency') || q.includes('helpline') || q.includes('help') || q.includes('number') || q.includes('आपात') || q.includes('मदत')) {
      setIsTyping(false);
      return createMessage('ai', {
        text: `Here are the official **BMC 24/7 Disaster & Civic Control Room numbers**:`,
        helplines: [
          { name: 'BMC Disaster Control Room', number: '1916 / 022-22694725', desc: 'Central Flood, Tree Fall & Structural Distress' },
          { name: 'Mumbai Police Control', number: '100 / 112', desc: 'Immediate emergency police dispatch' },
          { name: 'Fire Brigade Services', number: '101', desc: 'Fire & Rescue emergencies' },
          { name: 'Ambulance Services', number: '108', desc: 'Government Medical Emergency' },
          { name: 'Pothole & Roads Special Cell', number: '1800-22-1234', desc: 'BMC Asphalt & Pothole rapid response' },
        ],
        chips: ['🚨 Report a Pothole', '📍 Find My Ward Officer'],
      });
    }

    // Check 3: Ward Officer Inquiry
    if (q.includes('officer') || q.includes('ward') || q.includes('अधिकारी') || q.includes('प्रभाग')) {
      const wardId = user?.ward || 8;
      const officer = MOCK_OFFICERS.find((o) => o.ward === wardId) || MOCK_OFFICERS[0];
      const wardObj = MUMBAI_WARDS.find((w) => w.id === wardId) || MUMBAI_WARDS[0];

      setIsTyping(false);
      return createMessage('ai', {
        text: `Your registered ward is **${wardObj.name} (${wardObj.area})**. Here are your designated ward officer details:`,
        officerCard: { officer, ward: wardObj },
        chips: ['🚨 Report Grievance to this Ward', '📞 View All BMC Contacts'],
      });
    }

    // Check 4: Civic Grievance Triage & Instant Filing
    const civicKeywords = ['pothole', 'garbage', 'drain', 'water', 'leak', 'light', 'lamp', 'traffic', 'गड्ढा', 'कचरा', 'पाणी', 'रस्ता'];
    const isCivicReport = civicKeywords.some((k) => q.includes(k));

    if (isCivicReport) {
      const analysis = analyzeComplaintDynamic(queryText, queryText);
      const closest = findClosestWard(19.076, 72.877);

      setIsTyping(false);
      return createMessage('ai', {
        text: `I analyzed your grievance details using **Kaiser AI Triage**:
* **Category:** ${analysis?.category || 'Civic Infrastructure'}
* **Urgency Severity:** ${analysis?.severity || 75}/100
* **Target SLA:** ${analysis?.slaHours || 24} Hours
* **Designated Dept:** ${analysis?.assignedDept || 'Roads & Traffic Department'}

Would you like me to register this ticket immediately for **${closest.ward.name} (${closest.ward.area})**?`,
        pendingAction: {
          title: queryText.slice(0, 50),
          category: analysis?.category || 'Pothole',
          severity: analysis?.severity || 75,
          ward: closest.ward.id,
          wardName: closest.ward.name,
        },
        chips: ['✅ Confirm & Register Ticket', 'Edit Details First', 'Cancel'],
      });
    }

    // Check 5: Query Live Multilingual AI Intelligence Service (Gemini 1.5 Flash / Civic Assistant Engine)
    try {
      const mlChat = await queryAssistantChat(queryText, language, user?.ward || 8);
      if (mlChat && mlChat.reply) {
        setIsTyping(false);
        return createMessage('ai', {
          text: mlChat.reply,
          sourceBadge: mlChat.source || 'Kaiser AI Assistant',
          chips: [
            '🚨 Report an Issue',
            '🔍 Track Complaint #cmp-001',
            '📍 Find My Ward Officer',
            '📞 Emergency Contacts',
          ],
        });
      }
    } catch {
      // Fallback to client response below
    }

    // Default Fallback
    setIsTyping(false);
    return createMessage('ai', {
      text: `I understand you are asking about: *"${queryText}"*. 

As your BMC civic assistant, I can:
1. **Instantly file complaints** with automated AI categorization and SLA assignment.
2. **Track ticket status** (e.g., type your complaint ID like \`cmp-001\`).
3. **Connect you with your Ward Officer** among all 26 Mumbai wards.
4. **Provide municipal bylaws and grievance SLAs**.

Please select an option or provide more details:`,
      chips: [
        '🚨 Report an Issue',
        '🔍 Track Complaint #cmp-001',
        '📍 Find My Ward Officer',
        '📞 Emergency Contacts',
      ],
    });
  };

  const handleSend = async (overrideText) => {
    const text = overrideText || inputValue;
    if (!text.trim()) return;

    const userMsg = createMessage('user', { text });

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    const aiResponse = await processUserQuery(text);
    setMessages((prev) => [...prev, aiResponse]);
  };

  // Instant ticket creation from chat
  const handleConfirmChatTicket = async (pendingAction) => {
    try {
      const payload = {
        title: pendingAction.title || 'Civic Grievance Reported via Kaiser Sahayak AI',
        description: `Conversational report via AI Civic Assistant. Automated category: ${pendingAction.category}.`,
        category: pendingAction.category,
        ward: pendingAction.ward || 8,
        latitude: 19.076,
        longitude: 72.877,
        landmark: 'Auto-detected via Kaiser AI Assistant',
        severity: pendingAction.severity,
      };

      const res = await createComplaint(payload);
      const created = res.data;

      await dispatchNotification({
        title: `Ticket Created via Kaiser AI: #${created.id}`,
        body: `Dispatched to ${pendingAction.wardName} (${pendingAction.category}). SLA target: 24h.`,
        type: 'status_update',
        complaintId: created.id,
      });

      toast.success(`Ticket #${created.id} registered successfully!`);

      setMessages((prev) => [
        ...prev,
        createMessage('ai', {
          text: `🎉 **Success! Your grievance has been registered:**
* **Ticket ID:** \`${created.id}\`
* **Status:** Dispatched to Ward Officer
* **Target SLA:** 24 Hours

You can track its progress anytime here or in the **My Complaints** portal.`,
          ticketCard: created,
          chips: ['View All My Complaints', 'Report Another Issue'],
        }),
      ]);
    } catch {
      toast.error('Failed to register complaint. Please try again.');
    }
  };

  const handleChipClick = (chip) => {
    if (chip === '✅ Confirm & Register Ticket') {
      const lastMsgWithPending = [...messages].reverse().find((m) => m.pendingAction);
      if (lastMsgWithPending?.pendingAction) {
        handleConfirmChatTicket(lastMsgWithPending.pendingAction);
        return;
      }
    }
    handleSend(chip.replace(/^[🚨🔍📍📞✅]\s*/u, ''));
  };

  return (
    <>
      {/* Floating AI Assistant Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-soft-lg border border-brand-200 text-xs font-semibold text-brand-800 animate-bounce">
            <Sparkles size={14} className="text-amber-500" />
            <span>Kaiser Sahayak AI</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Kaiser Civic AI Assistant"
          className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-sky-600 text-white shadow-soft-xl hover:shadow-brand flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-brand-500/30"
        >
          {isOpen ? (
            <X size={24} className="transition-transform group-hover:rotate-90" />
          ) : (
            <>
              <Bot size={26} className="transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            </>
          )}
        </button>
      </div>

      {/* Slide-over / Modal Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[95vw] sm:w-[420px] max-h-[82vh] h-[640px] bg-white rounded-3xl shadow-soft-2xl border border-neutral-200/90 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-brand-900 to-blue-950 p-4 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-brand-300">
                <Bot size={22} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight">Kaiser Sahayak AI</h3>
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-white/70">BMC 24/7 Civic Governance Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setMessages([
                    {
                      id: 'msg-reset',
                      sender: 'ai',
                      text: `Chat restarted. How can I assist your civic inquiry in Mumbai?`,
                      chips: ['🚨 Report Issue', '🔍 Track Complaint', '📍 Ward Officer'],
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                title="Reset conversation"
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <RefreshCw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-xs">
                    <Bot size={15} />
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Message bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-soft-xs whitespace-pre-wrap ${
                      m.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-white text-neutral-800 border border-neutral-200/80 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                    {m.sourceBadge && (
                      <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-center gap-1 text-[10px] text-brand-600 font-semibold font-mono">
                        <Sparkles size={11} className="text-amber-500" />
                        <span>{m.sourceBadge}</span>
                      </div>
                    )}
                  </div>

                  {/* Render Ticket Card if present */}
                  {m.ticketCard && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-3 shadow-soft-sm text-xs space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                        <span className="font-mono font-bold text-brand-700">{m.ticketCard.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                          {m.ticketCard.status}
                        </span>
                      </div>
                      <div className="font-semibold text-neutral-900 truncate">{m.ticketCard.title}</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-500">
                        <div>Category: <strong className="text-neutral-800">{m.ticketCard.category}</strong></div>
                        <div>Ward #{m.ticketCard.ward}</div>
                        <div>Severity: <strong className="text-red-600">{m.ticketCard.severity}/100</strong></div>
                        <div>Assigned: <strong className="text-neutral-800">{m.ticketCard.assignedOfficer?.name || 'Local Ward AE'}</strong></div>
                      </div>
                    </div>
                  )}

                  {/* Render Emergency Helplines if present */}
                  {m.helplines && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-2.5 shadow-soft-sm text-xs space-y-2 divide-y divide-neutral-100">
                      {m.helplines.map((h) => (
                        <div key={h.name} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                          <div>
                            <p className="font-bold text-neutral-900 text-[11px]">{h.name}</p>
                            <p className="text-[10px] text-neutral-400">{h.desc}</p>
                          </div>
                          <a
                            href={`tel:${h.number.split('/')[0].trim()}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-mono font-bold hover:bg-emerald-100 transition-colors shrink-0"
                          >
                            <Phone size={11} /> {h.number.split('/')[0].trim()}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Officer Card if present */}
                  {m.officerCard && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-3 shadow-soft-sm text-xs space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center text-sm shadow">
                          {m.officerCard.officer.avatarInitials}
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900">{m.officerCard.officer.name}</div>
                          <div className="text-[11px] text-neutral-500">{m.officerCard.ward.name} · {m.officerCard.officer.department}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[11px] text-neutral-600">
                        <span>Avg SLA: {m.officerCard.officer.avgResolutionDays} days</span>
                        <span className="text-amber-600 font-bold">★ {m.officerCard.officer.rating} / 5.0</span>
                      </div>
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {m.chips && m.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.chips.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleChipClick(chip)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-neutral-200 text-neutral-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors shadow-soft-xs text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-neutral-400 block px-1">
                    {m.timestamp}
                  </span>
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-neutral-200 text-neutral-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    {user?.name?.[0] || 'U'}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 items-center text-xs text-neutral-400">
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={15} />
                </div>
                <div className="bg-white border border-neutral-200 px-3 py-2 rounded-2xl flex items-center gap-1 shadow-soft-xs">
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-neutral-200/80 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isListening
                    ? 'bg-red-50 text-red-600 border-red-300 animate-pulse'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border-neutral-200'
                }`}
                title="Voice input"
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Type issue, ticket ID, or question...'}
                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />

              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white transition-colors shadow-soft-xs"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
