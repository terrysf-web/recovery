import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, RotateCcw, ShieldAlert, ChevronRight } from "lucide-react";

const SURGERY_TYPES = [
  { id: "flap", icon: "🔬", name: "Periodontal Flap Surgery", recoveryDays: 21 },
  { id: "gingivectomy", icon: "✂️", name: "Gingivectomy", recoveryDays: 14 },
  { id: "bonegraft", icon: "🦴", name: "Bone Graft", recoveryDays: 28 },
  { id: "implant", icon: "🔩", name: "Dental Implant", recoveryDays: 21 },
  { id: "extraction", icon: "🦷", name: "Tooth Extraction", recoveryDays: 14 },
  { id: "scaling", icon: "🪥", name: "Scaling & Root Planing", recoveryDays: 10 },
];

const TEXT = {
  title: "Dental Recovery Guide",
  subtitle: "Check what to avoid and what is okay today.",
  selectSurgery: "Select Surgery Type",
  selectDate: "Select Surgery Date",
  start: "Start Recovery Guide",
  back: "Back",
  today: "Today",
  timeline: "Full Timeline",
  restricted: "Restricted / Caution",
  allowed: "Allowed / Recommended",
  emergency: "Contact your dentist immediately if:",
  reset: "Start Over",
  recoveryDone: "Recovery Complete",
  daysAfter: "Day",
  day: "after surgery",
  emergencyItems: [
    "Sudden severe pain starting on Day 4+",
    "Heavy bleeding lasting more than 2 days",
    "Fever above 101°F / 38.5°C",
    "Swelling that worsens after Day 3",
  ],
};

const BASE_RULES = {
  day0: {
    label: "Day of Surgery",
    warning: "Blood clot formation is important today. Rest and avoid disturbing the area.",
    no: ["No brushing / rinsing / spitting", "No straws", "No hot food or drinks", "No exercise / smoking / alcohol"],
    yes: ["Bite gauze for 30 minutes", "Ice pack 10 min ON / 5 min OFF", "Cold soft foods", "Take prescribed medications"],
  },
  day1: {
    label: "Days 1–2",
    warning: "Swelling and soreness may peak during this period.",
    no: ["No direct brushing at surgical site", "No straws or spitting", "No strenuous exercise", "No smoking or alcohol"],
    yes: ["Saltwater rinse after 24 hours", "Gentle brushing away from site", "Soft foods", "Continue prescribed medications"],
  },
  day3: {
    label: "Days 3–6",
    warning: "Call your dentist if pain suddenly gets worse.",
    no: ["No aggressive brushing at site", "Avoid hard or chewy foods", "No strenuous exercise", "No smoking or alcohol"],
    yes: ["Very gentle brushing around site", "Continue saltwater rinses", "Warm soft foods", "Light walking"],
  },
  day7: {
    label: "Days 7–14",
    warning: "Confirm your suture removal or follow-up visit.",
    no: ["Still avoid hard foods", "Avoid chewing on surgical site", "Avoid smoking if possible"],
    yes: ["Slowly resume normal brushing", "Light exercise OK", "Mostly normal soft diet", "Confirm dental appointment"],
  },
  done: {
    label: "Recovery Complete Stage",
    warning: "Check with your dentist if discomfort continues.",
    no: ["Do not ignore ongoing pain, bleeding, or swelling"],
    yes: ["Return to normal routine", "Normal oral hygiene", "Keep regular check-ups"],
  },
};

function getDaysSince(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const surgery = new Date(dateString);
  surgery.setHours(0, 0, 0, 0);
  return Math.floor((today - surgery) / 86400000);
}

function getStage(daysSince, totalDays) {
  if (daysSince >= totalDays) return "done";
  if (daysSince >= 7) return "day7";
  if (daysSince >= 3) return "day3";
  if (daysSince >= 1) return "day1";
  return "day0";
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function App() {
  const [screen, setScreen] = useState("surgery");
  const [surgeryId, setSurgeryId] = useState("");
  const [surgeryDate, setSurgeryDate] = useState("");
  const [tab, setTab] = useState("today");

  const selected = SURGERY_TYPES.find((s) => s.id === surgeryId);
  const daysSince = surgeryDate ? getDaysSince(surgeryDate) : 0;
  const totalDays = selected?.recoveryDays || 21;
  const stage = getStage(daysSince, totalDays);
  const current = BASE_RULES[stage];
  const pct = Math.min(100, Math.max(0, (daysSince / totalDays) * 100));
  const today = new Date().toISOString().split("T")[0];

  const timeline = useMemo(() => ["day0", "day1", "day3", "day7", "done"].map((key) => ({ key, ...BASE_RULES[key] })), []);

  const reset = () => {
    setScreen("surgery");
    setSurgeryId("");
    setSurgeryDate("");
    setTab("today");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-slate-50 shadow-2xl relative overflow-hidden">
        <div className="sticky top-0 z-20 bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 text-white px-5 pt-5 pb-4 rounded-b-[2rem] shadow-lg">
          <div>
            <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
              <span>🦷</span>
              <span>{TEXT.title}</span>
            </div>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">{TEXT.subtitle}</p>
          </div>

          {screen === "dashboard" && selected && (
            <div className="mt-4 rounded-2xl bg-white/10 p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-xs text-blue-100">{selected.name}</div>
                  <div className="text-[11px] text-blue-200 mt-0.5">{surgeryDate}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black leading-none">{daysSince >= totalDays ? "✓" : `D+${daysSince}`}</div>
                  <div className="text-[10px] text-blue-100">{daysSince >= totalDays ? TEXT.recoveryDone : `${TEXT.daysAfter} ${daysSince} ${TEXT.day}`}</div>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>

        <main className="px-4 py-4 pb-28">
          {screen === "surgery" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-lg font-black mb-3">{TEXT.selectSurgery}</h2>
              <div className="space-y-2">
                {SURGERY_TYPES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSurgeryId(s.id);
                      setScreen("date");
                    }}
                    className="w-full rounded-2xl bg-white p-4 shadow-sm border border-slate-200 flex items-center gap-3 active:scale-[0.99]"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">{s.icon}</div>
                    <div className="text-left flex-1">
                      <div className="font-extrabold text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{s.recoveryDays} day recovery guide</div>
                    </div>
                    <ChevronRight size={20} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {screen === "date" && selected && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <button onClick={() => setScreen("surgery")} className="mb-3 text-sm font-bold text-blue-700">← {TEXT.back}</button>
              <div className="rounded-3xl bg-white p-5 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">{selected.icon}</div>
                  <div>
                    <div className="font-black">{selected.name}</div>
                    <div className="text-xs text-slate-500">{selected.recoveryDays} days</div>
                  </div>
                </div>
                <label className="text-sm font-extrabold flex items-center gap-2 mb-2">
                  <CalendarDays size={17} /> {TEXT.selectDate}
                </label>
                <input
                  type="date"
                  max={today}
                  value={surgeryDate}
                  onChange={(e) => setSurgeryDate(e.target.value)}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 text-lg font-bold outline-none focus:border-blue-600"
                />
                <button
                  disabled={!surgeryDate}
                  onClick={() => setScreen("dashboard")}
                  className={cx(
                    "mt-4 w-full rounded-2xl py-4 text-base font-black text-white active:scale-[0.99]",
                    surgeryDate ? "bg-blue-900" : "bg-slate-300"
                  )}
                >
                  {TEXT.start}
                </button>
              </div>
            </motion.div>
          )}

          {screen === "dashboard" && selected && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-200 p-1 mb-4">
                <button onClick={() => setTab("today")} className={cx("rounded-xl py-3 text-sm font-black", tab === "today" ? "bg-white shadow-sm" : "text-slate-500")}>{TEXT.today}</button>
                <button onClick={() => setTab("timeline")} className={cx("rounded-xl py-3 text-sm font-black", tab === "timeline" ? "bg-white shadow-sm" : "text-slate-500")}>{TEXT.timeline}</button>
              </div>

              {tab === "today" && (
                <div className="space-y-3">
                  <div className="rounded-3xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
                    <ShieldAlert className="text-amber-700 shrink-0" size={22} />
                    <div className="text-sm leading-relaxed text-amber-900 font-semibold">{current.warning}</div>
                  </div>
                  <RuleCard title={TEXT.restricted} tone="red" items={current.no} />
                  <RuleCard title={TEXT.allowed} tone="green" items={current.yes} />
                  <div className="rounded-3xl bg-white p-4 shadow-sm border border-slate-200">
                    <div className="font-black text-red-700 mb-2">🆘 {TEXT.emergency}</div>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {TEXT.emergencyItems.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {tab === "timeline" && (
                <div className="space-y-3">
                  {timeline.map((item) => (
                    <div key={item.key} className={cx("rounded-3xl bg-white p-4 shadow-sm border", item.key === stage ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200")}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-black">{item.label}</div>
                        {item.key === stage && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">NOW</span>}
                      </div>
                      <div className="text-xs text-slate-500 mb-2">{item.warning}</div>
                      <div className="text-sm text-slate-700">🚫 {item.no[0]}</div>
                      <div className="text-sm text-slate-700 mt-1">✅ {item.yes[0]}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </main>

        {screen === "dashboard" && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur border-t border-slate-200 p-3">
            <button onClick={reset} className="w-full rounded-2xl bg-slate-900 text-white py-4 font-black flex items-center justify-center gap-2 active:scale-[0.99]">
              <RotateCcw size={18} /> {TEXT.reset}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RuleCard({ title, items, tone }) {
  const red = tone === "red";
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm border border-slate-200">
      <div className={cx("font-black mb-3", red ? "text-red-700" : "text-green-700")}>{red ? "🚫" : "✅"} {title}</div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className={cx("rounded-2xl px-3 py-3 text-sm font-semibold leading-relaxed", red ? "bg-red-50 text-red-900" : "bg-green-50 text-green-900")}>{item}</div>
        ))}
      </div>
    </div>
  );
}
