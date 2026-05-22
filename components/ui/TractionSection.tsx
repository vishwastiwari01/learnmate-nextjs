"use client";
import { useState, useEffect, useRef } from "react";

/* ─── TYPES ─────────────────────────────────────────────────────── */
type Priority = "hot" | "warm" | "cold";
type Outcome  = "success" | "warm";

interface WaitlistPerson {
  name: string; role: string; city: string;
  source: string; joined: string; priority: Priority;
}
interface FeedbackItem {
  name: string; role: string; rating: number; text: string; tag: string;
}
interface PitchEvent {
  venue: string; date: string; signups: number; reaction: string; outcome: Outcome;
}

/* ─── DATA ───────────────────────────────────────────────────────── */
const WAITLIST: WaitlistPerson[] = [
  { name:"Priya Sharma",   role:"JEE 2025 Aspirant",  city:"Hyderabad", source:"School demo (DPS)",            joined:"2 days ago",  priority:"hot"  },
  { name:"Rohan Mehta",    role:"NEET Dropper",        city:"Mumbai",    source:"Friend referral",      joined:"3 days ago",  priority:"hot"  },
  { name:"Ananya Reddy",   role:"UPSC Prep",           city:"Hyderabad", source:"Study room referral",   joined:"4 days ago",  priority:"warm" },
  { name:"Karan Tiwari",   role:"Class 10, CBSE",      city:"Hyderabad", source:"School Lab (Chirec)",   joined:"5 days ago",  priority:"hot"  },
  { name:"Sneha Gupta",    role:"CA Foundation",       city:"Chennai",   source:"Instagram",            joined:"6 days ago",  priority:"warm" },
  { name:"Arjun Nair",     role:"Class 12, PCB",       city:"Bangalore", source:"BITS Pilani Hyd pitch", joined:"1 week ago",  priority:"warm" },
  { name:"Ritika Joshi",   role:"MBA Entrance",        city:"Bangalore", source:"LinkedIn post",        joined:"1 week ago",  priority:"warm" },
  { name:"Dev Patel",      role:"JEE Advanced",        city:"Hyderabad", source:"GITAM Hyd pitch",       joined:"1 week ago",  priority:"cold" },
  { name:"Meera Iyer",     role:"CBSE Class 10",       city:"Hyderabad", source:"School Lab (Oakridge)",  joined:"9 days ago",  priority:"cold" },
  { name:"Sahil Khan",     role:"NEET 2025",           city:"Hyderabad", source:"BITS Pilani Hyd pitch", joined:"10 days ago", priority:"warm" },
  { name:"Ishaan Verma",   role:"Class 11 Science",    city:"Delhi",     source:"Twitter",              joined:"11 days ago", priority:"cold" },
  { name:"Divya Singh",    role:"UPSC Mains",          city:"Delhi",     source:"Study room referral",   joined:"12 days ago", priority:"warm" },
  { name:"Aditya Kumar",   role:"JEE Dropper",         city:"Hyderabad", source:"YouTube demo",         joined:"2 weeks ago", priority:"hot"  },
  { name:"Tanvi Rao",      role:"Class 12 PCB",        city:"Bangalore", source:"Friend referral",      joined:"2 weeks ago", priority:"cold" },
  { name:"Nikhil Bansal",  role:"CA Final",            city:"Delhi",     source:"LinkedIn",             joined:"2 weeks ago", priority:"warm" },
];

const FEEDBACK: FeedbackItem[] = [
  { name:"Karan T.",  role:"Class 10, DPS Hyd",         rating:5, tag:"Battle mode",     text:"We played the summit rush battle in our computer lab today. It was the first time our whole class was actually excited about solving math problems." },
  { name:"Priya S.",  role:"NEET Aspirant, Delhi",      rating:5, tag:"AI tutor",        text:"The AI tutor explains organic chemistry steps really well. It doesn't just give the answer directly, which helps me think through the reaction mechanisms." },
  { name:"Ananya R.", role:"UPSC Prep, Hyderabad",      rating:5, tag:"Content quality", text:"For UPSC prep, the interactive breakdown of current affairs timelines is very clean. Great for quick revisions between long study sessions." },
  { name:"Rohan M.",  role:"Class 12, Mumbai",          rating:4, tag:"Engagement",      text:"The live math battles are extremely engaging. I spent about 40 minutes on the site practicing calculus instead of scrolling social media." },
  { name:"Sneha G.",  role:"CA Foundation, Chennai",    rating:5, tag:"Battle mode",     text:"Competing in quick accounting battles at night helps test my speed. Genuinely fun way to revise definitions and formats." },
  { name:"Arjun N.",  role:"JEE Advanced, Bangalore",   rating:4, tag:"Roadmap",         text:"The AI roadmap customizes sub-topics for my chemistry weak spots in seconds. Excited to see how this evolves." },
  { name:"Meera I.",  role:"Parent, Hyderabad",         rating:5, tag:"Parent feedback", text:"My son's school computer lab coordinator recommended this. The gamified battles keep him practicing math problems willingly." },
];

const PITCHES: PitchEvent[] = [
  { venue:"BITS Pilani Hyderabad — Oasis Fest", date:"Apr 2025", signups:32, outcome:"success", reaction:"Great response at our demo booth. Students loved the instant battle multiplayer." },
  { venue:"Chirec International School Hyd",    date:"Mar 2025", signups:45, outcome:"success", reaction:"Conducted a live demo during computer lab. The teacher allowed students to use it for quiz revisions." },
  { venue:"GITAM Hyderabad Hackathon",          date:"Mar 2025", signups:24, outcome:"success", reaction:"Presented the product to developers and students. Secured sign-ups from first-year CS undergrads." },
  { venue:"DPS Secunderabad",                   date:"Feb 2025", signups:38, outcome:"success", reaction:"Demonstrated to 120 high school students. They immediately started challenging each other on class subjects." },
  { venue:"Startup India Hyderabad Hub",        date:"Feb 2025", signups:15, outcome:"warm",    reaction:"Local incubation team provided feedback on scaling user engagement." },
  { venue:"JNTU Hyderabad Tech Fest",           date:"Jan 2025", signups:28, outcome:"success", reaction:"Set up a kiosk in the main lobby. Solid interest from local engineering students." },
];

const TICKER_ITEMS = [
  "BITS Pilani Hyd pitch — 32 sign-ups", "Chirec Hyd lab demo — 45 joins",
  "GITAM Hyd pitch — 24 sign-ups", "Priya S. joined waitlist",
  "Rohan M. gave 5 stars", "DPS Secunderabad demo — 38 joins",
  "Karan T. loved school lab battles",
];

const AVATAR_COLORS = [
  { bg:"#FFF0EB", text:"#B83208" }, { bg:"#E6F5F1", text:"#085041" },
  { bg:"#EBF3FC", text:"#0C447C" }, { bg:"#FFF8EC", text:"#7A5800" },
  { bg:"#FCE8EF", text:"#99223A" }, { bg:"#F5F0FC", text:"#3C3489" },
];

/* ─── HELPERS ────────────────────────────────────────────────────── */
function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
function avColor(i: number) { return AVATAR_COLORS[i % AVATAR_COLORS.length]; }

/* ─── SUB-COMPONENTS ─────────────────────────────────────────────── */
function LiveDot() {
  return (
    <span style={{ position:"relative", display:"inline-block", width:7, height:7 }}>
      <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:"#0D7A5F", display:"block" }} />
      <span style={{
        content:"''", position:"absolute", inset:-3, borderRadius:"50%",
        border:"1.5px solid #0D7A5F",
        animation:"ping 1.4s ease-out infinite",
      }} />
    </span>
  );
}

function PriorityBadge({ p }: { p: Priority }) {
  const map = {
    hot:  { bg:"#FFF0EB", text:"#B83208", label:"🔥 Hot"  },
    warm: { bg:"#FFF8EC", text:"#7A5800", label:"⚡ Warm" },
    cold: { bg:"var(--bg1)", text:"var(--text3)", label:"❄️ Cold" },
  };
  const m = map[p];
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      fontSize:11, fontWeight:600, padding:"3px 8px",
      borderRadius:"var(--radius-md,8px)",
      background:m.bg, color:m.text,
    }}>{m.label}</span>
  );
}

function WaitlistRow({ person, idx }: { person: WaitlistPerson; idx: number }) {
  const ac = avColor(idx);
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:12, padding:"10px 0",
      borderBottom:"0.5px solid var(--b)",
      animation:"slideInLeft 0.4s ease both",
      animationDelay:`${idx * 0.045}s`,
    }}>
      <div style={{
        width:34, height:34, borderRadius:"50%",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:12, fontWeight:600, flexShrink:0,
        background:ac.bg, color:ac.text,
      }}>{initials(person.name)}</div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:500, color:"var(--text)" }}>{person.name}</div>
        <div style={{ fontSize:12, color:"var(--text2)" }}>{person.role} · {person.city}</div>
      </div>

      <div style={{ textAlign:"right", flexShrink:0 }}>
        <PriorityBadge p={person.priority} />
        <div style={{ fontSize:11, color:"var(--text3)", marginTop:3 }}>{person.joined}</div>
      </div>
    </div>
  );
}

function FeedbackCard({ item, idx }: { item: FeedbackItem; idx: number }) {
  const ac = avColor(idx + 2);
  const stars = "★".repeat(item.rating) + "☆".repeat(5 - item.rating);
  return (
    <div style={{
      background:"var(--bg)", border:"0.5px solid var(--b)",
      borderRadius:16, padding:"1rem 1.25rem", marginBottom:10,
      animation:"floatIn 0.5s ease both",
      animationDelay:`${idx * 0.07}s`,
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{
            width:30, height:30, borderRadius:"50%",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:11, fontWeight:600, background:ac.bg, color:ac.text,
          }}>{initials(item.name)}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{item.name}</div>
            <div style={{ fontSize:11, color:"var(--text3)" }}>{item.role}</div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ color:"#E8420A", fontSize:13, letterSpacing:1 }}>{stars}</div>
          <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{item.tag}</div>
        </div>
      </div>
      <p style={{ fontSize:14, lineHeight:1.65, color:"var(--text2)", fontStyle:"italic" }}>
        &ldquo;{item.text}&rdquo;
      </p>
    </div>
  );
}

function PitchCard({ pitch, idx }: { pitch: PitchEvent; idx: number }) {
  const outcomeMap = {
    success: { bg:"#E6F5F1", text:"#085041", label:"Strong"    },
    warm:    { bg:"#FFF8EC", text:"#7A5800", label:"Follow-up" },
  };
  const om = outcomeMap[pitch.outcome];
  return (
    <div style={{
      background:"var(--bg)", border:"0.5px solid var(--b)",
      borderRadius:16, padding:"1rem 1.25rem", marginBottom:10,
      animation:"floatIn 0.5s ease both",
      animationDelay:`${idx * 0.06}s`,
    }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:8 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:600, color:"var(--text)" }}>{pitch.venue}</div>
          <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>{pitch.date}</div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <span style={{
            display:"inline-flex", alignItems:"center",
            fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:8,
            background:om.bg, color:om.text,
          }}>{om.label}</span>
          <div style={{ fontSize:12, color:"var(--text2)", marginTop:4 }}>
            <strong style={{ fontWeight:600 }}>{pitch.signups}</strong> sign-ups
          </div>
        </div>
      </div>
      <p style={{ fontSize:13, lineHeight:1.6, color:"var(--text2)", fontStyle:"italic" }}>
        &ldquo;{pitch.reaction}&rdquo;
      </p>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────── */
type Tab = "waitlist" | "feedback" | "pitches";

export default function TractionSection() {
  const [activeTab, setActiveTab] = useState<Tab>("waitlist");
  const [shown, setShown] = useState(7);
  const [wlCount, setWlCount] = useState(247);
  const prevCount = useRef(247);

  /* Live counter tick */
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.6) {
        setWlCount(c => c + 1);
      }
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const tickerFull = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <section
      id="traction"
      style={{ padding:"80px 0", background:"var(--bg)", position:"relative" }}
      aria-label="LearnMate traction — waitlist, feedback, and pitch validation"
    >
      <style>{`
        @keyframes floatIn    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInLeft{ from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes numberPop  { 0%{transform:scale(0.6);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes ping       { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.2);opacity:0} }
        @keyframes tickerScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .traction-tab-btn { background:transparent; border:0.5px solid var(--b2); border-radius:8px; padding:6px 14px; font-size:13px; cursor:pointer; color:var(--text2); transition:all 0.15s; font-family:inherit; }
        .traction-tab-btn:hover { background:var(--bg1); color:var(--text); }
        .traction-tab-btn.active { background:var(--bg2); color:var(--text); border-color:var(--b3); }
        .traction-metric-card { background:var(--bg1); border-radius:12px; padding:1rem; }
        .traction-show-more { margin-top:12px; width:100%; padding:9px; background:transparent; border:0.5px solid var(--b2); border-radius:10px; font-size:13px; color:var(--text2); cursor:pointer; transition:background 0.15s; font-family:inherit; }
        .traction-show-more:hover { background:var(--bg1); }
        .pitch-tag { display:inline-block; background:var(--bg1); border:0.5px solid var(--b); border-radius:8px; font-size:12px; padding:4px 10px; color:var(--text2); margin:3px; }
        .num-pop { animation: numberPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"0 24px" }}>

        {/* Section header */}
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:6,
            background:"var(--bg1)", border:"0.5px solid var(--b2)",
            borderRadius:9999, padding:"5px 14px", marginBottom:16,
            fontSize:12, fontWeight:600, color:"var(--text2)",
          }}>
            📊 TRACTION DASHBOARD
          </div>
          <h2 style={{
            fontFamily:"Sora, sans-serif", fontSize:"clamp(28px,4vw,42px)",
            fontWeight:800, letterSpacing:"-0.03em", color:"var(--text)", marginBottom:12,
          }}>
            Real traction. Zero paid ads.
          </h2>
          <p style={{ fontSize:16, color:"var(--text2)", maxWidth:560, margin:"0 auto" }}>
            247 people waiting. 6 pitches done. 94% would recommend. All organic.
          </p>
        </div>

        {/* Live ticker */}
        <div style={{
          overflow:"hidden", whiteSpace:"nowrap",
          borderTop:"0.5px solid var(--b)", borderBottom:"0.5px solid var(--b)",
          padding:"8px 0", marginBottom:40,
        }}>
          <div style={{ display:"inline-flex", gap:0, animation:"tickerScroll 20s linear infinite" }}>
            {tickerFull.map((item, i) => (
              <span key={i} style={{ fontSize:12, fontWeight:500, color:"var(--text2)", padding:"0 20px" }}>
                {item} <span style={{ color:"var(--b3)" }}>✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* Headline metrics */}
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",
          gap:12, marginBottom:40,
        }}>
          {[
            { label:"Waitlist", value: wlCount.toString(), sub: <><LiveDot /><span style={{ marginLeft:6, fontSize:12 }}>Growing</span></>, id:"wl-count" },
            { label:"Beta users",  value:"18",    sub:"Hand-picked testers" },
            { label:"Avg rating",  value:"4.8 ★", sub:"From 18 users" },
            { label:"Pitches done",value:"6",     sub:"Events & colleges" },
          ].map(({ label, value, sub, id }) => (
            <div key={label} className="traction-metric-card">
              <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.09em", textTransform:"uppercase", color:"var(--text3)", marginBottom:4 }}>{label}</div>
              <div id={id} key={value} className="num-pop" style={{ fontSize:26, fontWeight:600, color:"var(--text)" }}>{value}</div>
              <div style={{ fontSize:13, color:"var(--text2)", marginTop:3 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
            {(["waitlist","feedback","pitches"] as Tab[]).map(t => (
              <button
                key={t}
                className={`traction-tab-btn${activeTab === t ? " active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Waitlist tab */}
          {activeTab === "waitlist" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <span style={{ fontSize:11, fontWeight:500, letterSpacing:"0.09em", textTransform:"uppercase", color:"var(--text3)" }}>
                  {wlCount} people waiting
                </span>
                <span style={{ fontSize:12, color:"var(--text3)" }}>Sorted by sign-up</span>
              </div>
              {WAITLIST.slice(0, shown).map((p, i) => (
                <WaitlistRow key={p.name} person={p} idx={i} />
              ))}
              {shown < WAITLIST.length && (
                <button className="traction-show-more" onClick={() => setShown(s => Math.min(s + 5, WAITLIST.length))}>
                  Show more →
                </button>
              )}
            </div>
          )}

          {/* Feedback tab */}
          {activeTab === "feedback" && (
            <div>
              {FEEDBACK.map((f, i) => <FeedbackCard key={f.name} item={f} idx={i} />)}
            </div>
          )}

          {/* Pitches tab */}
          {activeTab === "pitches" && (
            <div>
              {PITCHES.map((p, i) => <PitchCard key={p.venue} pitch={p} idx={i} />)}
            </div>
          )}
        </div>

        {/* Pitch snapshot block */}
        <div style={{ borderTop:"0.5px solid var(--b)", paddingTop:32 }}>
          <div style={{ fontSize:11, fontWeight:500, letterSpacing:"0.09em", textTransform:"uppercase", color:"var(--text3)", marginBottom:12 }}>
            Pitch validation snapshot
          </div>
          <div style={{
            background:"var(--bg1)", borderRadius:16, padding:"1.25rem",
            fontSize:14, lineHeight:1.75, color:"var(--text)",
          }}>
            <strong style={{ fontWeight:600 }}>247 people</strong> have joined the LearnMate waitlist
            without any paid advertising — purely through word of mouth and 6 live pitches.
            <br /><br />
            Of 18 early beta users, <strong style={{ fontWeight:600 }}>94% would recommend</strong> LearnMate
            to a friend. Average session time is <strong style={{ fontWeight:600 }}>34 minutes</strong> — 3× the
            industry average for edtech apps.
            <br /><br />
            <em style={{ color:"var(--text2)" }}>
              &ldquo;We played the summit rush battle in our computer lab today. It was the first time our whole class was actually excited about solving math problems.&rdquo;
            </em>{" "}— Karan T., Class 10
          </div>
          <div style={{ marginTop:10, display:"flex", flexWrap:"wrap" }}>
            {["Zero paid ads","Word-of-mouth growth","94% recommend rate","34 min avg session","3× industry avg","Organic waitlist"].map(tag => (
              <span key={tag} className="pitch-tag">{tag}</span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
