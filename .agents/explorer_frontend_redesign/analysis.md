# PBBET Frontend Redesign Analysis & Overhaul Plan

This report outlines the findings, design specifications, and implementation steps required to transition the PBBET platform from a dark/charcoal/purple theme ("Liquid Glass") to a light, bright, and vibrant aesthetic. It also addresses critical backend-frontend integration mismatches and supplies a complete design for the missing Banner CMS UI.

---

## Executive Summary

1. **Theme Overhaul**: The current platform employs a dark scheme using near-black backgrounds (`#0c0a09`, `#1C1917`), dark slates (`bg-slate-900`, `bg-slate-950`), and indigo/purple accents. We propose a **"Golden Sunlit" Light Theme** using a clean off-white background (`#F8FAFC`), warm slate borders, gold/amber primary accents (`#CA8A04` / `#EAB308`), and high-contrast slate text (`#0F172A`).
2. **Critical Integration Mismatches**: 
   - The RTP setting endpoint is mismatched (`/admin/set-rtp` vs `/admin/game/set-rtp`).
   - The RTP payload fields are mismatched (`userCode` vs `username`).
   - The KYC status patch payload fields are mismatched (`status` vs `kycStatus`).
   - The financial requests list is broken due to incorrect array parsing (`transData.requests` vs direct array return).
   - Dynamic game lists are hardcoded as "slots" with a fixed `4.5` rating.
3. **Missing Features**: The admin dashboard lacks an interface for Banner CMS. We have designed a complete modular component configuration to be added to `app/admin/page.tsx` that links to the existing backend `/api/admin/banners` CRUD routes.

---

## 1. Light Theme Design Specification

To replace the dark, black, and purple/indigo styling, we establish the following design parameters:

| Variable / Element | Current Value (Dark/Purple) | Recommended Value (Light/Vibrant) | Rationale |
|---|---|---|---|
| `--casino-primary` | `28 25 23` (`#1C1917`) | `255 255 255` (`#FFFFFF`) | Primary card/container background |
| `--casino-secondary`| `68 64 60` (`#44403C`) | `241 245 249` (`#F1F5F9`) | Secondary container/divider background |
| `--text-primary` | `250 250 249` (`#FAFAF9`) | `15 23 42` (`#0F172A`) | High-contrast body text for readability |
| `--text-secondary` | `168 162 158` (`#A8A29E`) | `71 85 105` (`#475569`) | Subtitles, labels, and secondary text |
| `body` background | `#0c0a09` | `bg-slate-50` (`#F8FAFC`) | Clean, bright overall backdrop |
| `body` gradients | Subtle yellow/white opacity glows | Warm sunlit yellow/amber glows | Maintains "Liquid Glass" premium styling |
| `.liquid-glass` card| Dark translucent glass | Light frosted glass (`rgba(255, 255, 255, 0.7)`) | Sophisticated modern look |
| Primary Accent | Purple/Indigo accents | Gold/Amber (`#CA8A04` / `#EAB308`) | Bright, vibrant premium casino look |
| Slots Gradient | Indigo/Purple gradient | Amber to Warm Orange gradient | Replaces purple glows with vibrant slots look |

---

## 2. Precise List of Code Changes

Here is the precise list of files, line ranges, and the recommended code modifications.

### A. Globals & Layout

#### 1. `Frontend/src/app/globals.css` (Lines 4-11, 18-23, 33-35, 42-48, 50-55, 90-105)
*   **Target lines 4-11**: Redesign core variables.
```postcss
/* Before */
  :root {
    --casino-gold: 202 138 4; /* #CA8A04 */
    --casino-gold-light: 234 179 8; /* #EAB308 */
    --casino-primary: 28 25 23; /* #1C1917 */
    --casino-secondary: 68 64 60; /* #44403C */
    --text-primary: 250 250 249; /* #FAFAF9 */
    --text-secondary: 168 162 158; /* #A8A29E */
  }

/* After */
  :root {
    --casino-gold: 202 138 4; /* #CA8A04 */
    --casino-gold-light: 234 179 8; /* #EAB308 */
    --casino-primary: 255 255 255; /* #FFFFFF */
    --casino-secondary: 241 245 249; /* #F1F5F9 */
    --text-primary: 15 23 42; /* #0F172A */
    --text-secondary: 71 85 105; /* #475569 */
  }
```

*   **Target lines 18-23**: Redesign body theme.
```postcss
/* Before */
  body {
    @apply bg-[#0c0a09] text-[#FAFAF9] min-h-screen font-sans antialiased selection:bg-[#CA8A04] selection:text-white;
    background-image: radial-gradient(circle at top right, rgba(202, 138, 4, 0.1), transparent 40%),
                      radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.05), transparent 40%);
    background-attachment: fixed;
  }

/* After */
  body {
    @apply bg-slate-50 text-slate-900 min-h-screen font-sans antialiased selection:bg-[#CA8A04] selection:text-white;
    background-image: radial-gradient(circle at top right, rgba(202, 138, 4, 0.08), transparent 40%),
                      radial-gradient(circle at bottom left, rgba(202, 138, 4, 0.02), transparent 40%);
    background-attachment: fixed;
  }
```

*   **Target lines 33-35**: Scrollbar track.
```postcss
/* Before */
  ::-webkit-scrollbar-track {
    @apply bg-[#1C1917];
  }

/* After */
  ::-webkit-scrollbar-track {
    @apply bg-slate-100;
  }
```

*   **Target lines 42-48**: Frosted glass effect.
```postcss
/* Before */
  .liquid-glass {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

/* After */
  .liquid-glass {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(202, 138, 4, 0.15);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }
```

*   **Target lines 50-55**: Frosted glass hover.
```postcss
/* Before */
  .liquid-glass-hover:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(202, 138, 4, 0.4);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

/* After */
  .liquid-glass-hover:hover {
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(202, 138, 4, 0.5);
    box-shadow: 0 12px 40px rgba(202, 138, 4, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
  }
```

*   **Target lines 90**: Sidebar active menu item text.
```postcss
/* Before */
    @apply border-l-4 border-l-[#CA8A04] text-white;

/* After */
    @apply border-l-4 border-l-[#CA8A04] text-slate-900 font-semibold;
```

*   **Target lines 94-105**: Premium cards style.
```postcss
/* Before */
  .glass-card {
    background: linear-gradient(145deg, rgba(28,25,23,0.8) 0%, rgba(12,10,9,0.9) 100%);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
  }
  
  .glass-card:hover {
    border-color: rgba(202, 138, 4, 0.5);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(202, 138, 4, 0.2);
    transform: translateY(-4px);
  }

/* After */
  .glass-card {
    background: linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%);
    border: 1px solid rgba(202, 138, 4, 0.1);
    transition: all 0.3s ease;
  }
  
  .glass-card:hover {
    border-color: rgba(202, 138, 4, 0.5);
    box-shadow: 0 10px 30px rgba(0,0,0,0.06), 0 0 15px rgba(202, 138, 4, 0.1);
    transform: translateY(-4px);
  }
```

#### 2. `Frontend/src/app/layout.tsx` (Lines 23, 33)
```tsx
/* Before */
23:   themeColor: "#0c0a09",
33:       <body suppressHydrationWarning={true} className="bg-[#0c0a09] text-white">

/* After */
23:   themeColor: "#F8FAFC",
33:       <body suppressHydrationWarning={true} className="bg-slate-50 text-slate-900">
```

---

### B. User Registration & Login Flows

#### 3. `Frontend/src/app/login/page.tsx` (Lines 42-43, 46, 50, 55, 61, 66, 75, 81)
```tsx
/* Before */
42:     <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
43:       <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
46:           <p className="text-slate-400">Welcome back, Player!</p>
50:             <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
55:               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
61:             <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
66:               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
75:             className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 uppercase tracking-widest"
81:           <p className="text-slate-500 text-sm">

/* After */
42:     <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
43:       <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
46:           <p className="text-slate-600">Welcome back, Player!</p>
50:             <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
55:               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
61:             <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
66:               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
75:             className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest"
81:           <p className="text-slate-600 text-sm">
```

#### 4. `Frontend/src/app/register/page.tsx` (Lines 47-48, 51, 55, 60, 66, 71, 77, 82, 91, 97)
```tsx
/* Before */
47:     <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
48:       <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
51:           <p className="text-slate-400">Join the next-gen gaming ecosystem</p>
55:             <label className="block text-sm font-medium text-slate-300 mb-2">Choose Username</label>
60:               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
66:             <label className="block text-sm font-medium text-slate-300 mb-2">Create Password</label>
71:               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
77:             <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
82:               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
91:             className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 uppercase tracking-widest mt-4"
97:           <p className="text-slate-500 text-sm">

/* After */
47:     <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
48:       <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
51:           <p className="text-slate-600">Join the next-gen gaming ecosystem</p>
55:             <label className="block text-sm font-medium text-slate-700 mb-2">Choose Username</label>
60:               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
66:             <label className="block text-sm font-medium text-slate-700 mb-2">Create Password</label>
71:               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
77:             <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
82:               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
91:             className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 uppercase tracking-widest mt-4"
97:           <p className="text-slate-600 text-sm">
```

#### 5. `Frontend/src/app/admin/login/page.tsx` (Lines 47-48, 51, 55, 60, 66, 71, 84)
```tsx
/* Before */
47:     <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-['Inter',sans-serif]">
48:       <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[32px] p-10 shadow-2xl shadow-emerald-900/10">
51:           <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Management Gateway</p>
55:             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Identity</label>
60:               className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-bold placeholder:text-slate-800"
66:             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Secret Key</label>
71:               className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all font-bold placeholder:text-slate-800"
84:             className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-900/20 uppercase tracking-[0.2em] text-xs"

/* After */
47:     <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-['Inter',sans-serif]">
48:       <div className="max-w-md w-full bg-white border border-slate-200 rounded-[32px] p-10 shadow-xl shadow-slate-200/50">
51:           <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-black">Management Gateway</p>
55:             <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 ml-1">Identity</label>
60:               className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:border-emerald-500 transition-all font-bold placeholder:text-slate-400"
66:             <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 ml-1">Secret Key</label>
71:               className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:border-emerald-500 transition-all font-bold placeholder:text-slate-400"
84:             className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-[0.2em] text-xs"
```

---

### C. Main Landing Lobby

#### 6. `Frontend/src/components/features/games/CasinoGameLobby.tsx` (Lines 152, 158, 172-176, 178, 191-195, 202, 205, 213, 217, 232, 255)
```tsx
/* Before */
152:     <div className="flex min-h-screen bg-[#0c0a09] text-white overflow-hidden relative">
158:       <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 bg-[#0c0a09]/50 backdrop-blur-3xl z-10">
172:               className={`w-full flex items-center space-x-4 px-4 py-3 rounded-lg transition-all duration-300 ${
173:                 item.active 
174:                   ? "bg-gradient-to-r from-[#CA8A04]/20 to-transparent border-l-2 border-[#CA8A04] text-white" 
175:                   : "text-[#A8A29E] hover:text-white hover:bg-white/5"
176:               }`}
178:               <span className={item.active ? "text-[#CA8A04]" : "text-[#A8A29E]"}>{item.icon}</span>
191:             <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-[#A8A29E]">
192:               <button className="hover:text-white transition-colors" onClick={() => setCategory("live" as import("@/types/game").Category)}>Live Casino</button>
193:               <button className="hover:text-white transition-colors" onClick={() => setCategory("slots" as import("@/types/game").Category)}>Slots</button>
202:                 <div className="flex items-center space-x-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5">
205:                     <span className="text-[10px] text-[#A8A29E] uppercase tracking-wider">Seamless Wallet</span>
213:                 <button onClick={handleLogout} className="text-[#A8A29E] hover:text-red-400 p-2"><LogOut size={18} /></button>
217:                 <button onClick={() => router.push("/login")} className="text-sm font-medium text-[#A8A29E] hover:text-white">Log in</button>
232:           <p className="text-[#A8A29E] max-w-2xl text-sm md:text-base leading-relaxed">
255:             <h3 className="text-2xl font-playfair font-semibold uppercase tracking-wider text-white">

/* After */
152:     <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden relative">
158:       <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white/80 backdrop-blur-3xl z-10">
172:               className={`w-full flex items-center space-x-4 px-4 py-3 rounded-lg transition-all duration-300 ${
173:                 item.active 
174:                   ? "bg-gradient-to-r from-[#CA8A04]/10 to-transparent border-l-2 border-[#CA8A04] text-[#CA8A04] font-bold" 
175:                   : "text-slate-500 hover:text-slate-950 hover:bg-slate-100"
176:               }`}
178:               <span className={item.active ? "text-[#CA8A04]" : "text-slate-400"}>{item.icon}</span>
191:             <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-500">
192:               <button className="hover:text-slate-950 transition-colors" onClick={() => setCategory("live" as import("@/types/game").Category)}>Live Casino</button>
193:               <button className="hover:text-slate-950 transition-colors" onClick={() => setCategory("slots" as import("@/types/game").Category)}>Slots</button>
202:                 <div className="flex items-center space-x-3 px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm">
205:                     <span className="text-[10px] text-slate-500 uppercase tracking-wider">Seamless Wallet</span>
213:                 <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 p-2"><LogOut size={18} /></button>
217:                 <button onClick={() => router.push("/login")} className="text-sm font-medium text-slate-500 hover:text-slate-950">Log in</button>
232:           <p className="text-slate-600 max-w-2xl text-sm md:text-base leading-relaxed">
255:             <h3 className="text-2xl font-playfair font-semibold uppercase tracking-wider text-slate-800">
```

---

### D. Game Cards & Elements

#### 7. `Frontend/src/components/features/games/card/GameCardHeader.tsx` (Lines 41-45, 60, 102)
*Slots category background gradient is replaced with vibrant gold/orange. Black contrast mask opacity is reduced.*
```tsx
/* Before */
41:           game.category === "slots"
42:             ? "bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800"
43:             : game.category === "table"
44:             ? "bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-800"
45:             : "bg-gradient-to-br from-red-600 via-pink-600 to-red-800"
60:         className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
102:         className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all duration-300 text-xl z-20 touch-manipulation border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${

/* After */
41:           game.category === "slots"
42:             ? "bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400"
43:             : game.category === "table"
44:             ? "bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-500"
45:             : "bg-gradient-to-br from-rose-500 via-pink-400 to-orange-500"
60:         className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
102:         className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all duration-300 text-xl z-20 touch-manipulation border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
```

#### 8. `Frontend/src/components/features/games/card/GameCardContent.tsx` (Lines 27, 29, 32, 52)
```tsx
/* Before */
27:     <div className="p-6 bg-casino-card border-t border-yellow-400/10">
29:         <h3 className="font-bold text-xl text-accessible-primary mb-2 group-hover:text-gradient-casino transition-all duration-500">
32:         <p className="text-accessible-secondary text-sm font-medium group-hover:text-yellow-100 transition-colors duration-300">
52:           className="text-xs text-yellow-400/60 font-medium"

/* After */
27:     <div className="p-6 bg-slate-50/50 border-t border-yellow-400/20">
29:         <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-gradient-casino transition-all duration-500">
32:         <p className="text-slate-500 text-sm font-medium group-hover:text-[#CA8A04] transition-colors duration-300">
52:           className="text-xs text-yellow-600 font-medium"
```

#### 9. `Frontend/src/components/features/games/card/GameCard.tsx` (Line 46)
```tsx
/* Before */
46:               : "text-gray-600"

/* After */
46:               : "text-gray-300"
```

#### 10. `Frontend/src/components/features/games/GameGrid.tsx` (Lines 33, 37, 47)
```tsx
/* Before */
33:         <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
37:               <span className="text-white font-medium">
47:                 className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200"

/* After */
33:         <div className="bg-white backdrop-blur-sm rounded-xl p-4 border border-slate-200 shadow-sm">
37:               <span className="text-slate-700 font-medium">
47:                 className="text-[#CA8A04] hover:text-[#EAB308] text-sm font-medium transition-colors duration-200"
```

---

### E. Common UI & Helpers

#### 11. `Frontend/src/components/ui/FilterButtons.tsx` (Lines 17, 30-31)
```tsx
/* Before */
17:           : "glass border-yellow-400/20 text-yellow-200/80 hover:text-yellow-100 hover:border-yellow-400/40 hover:shadow-lg hover:shadow-yellow-400/20"
30:                 ? "bg-black/30 text-yellow-200 border-yellow-400/50"
31:                 : "bg-yellow-400/10 text-yellow-400 border-yellow-400/30 group-hover:bg-yellow-400/20 group-hover:border-yellow-400/50"

/* After */
17:           : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100"
30:                 ? "bg-yellow-950/20 text-yellow-100 border-yellow-400/40"
31:                 : "bg-amber-50 text-amber-700 border-amber-200 group-hover:bg-amber-100 group-hover:border-amber-300"
```

#### 12. `Frontend/src/components/ui/SearchBar.tsx` (Lines 17-18, 27, 53)
```tsx
/* Before */
17:       <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 via-yellow-400/30 to-yellow-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none"></div>
18:       <div className="relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-lg">
27:           className="w-full pl-16 pr-16 py-6 bg-transparent text-white text-lg font-medium placeholder-yellow-200/60 border-none outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300 relative z-20"
53:       <div className="absolute -bottom-2 right-8 w-3 h-3 bg-purple-400/20 rounded-full blur-sm animate-pulse delay-1000 pointer-events-none"></div>

/* After */
17:       <div className="absolute inset-0 bg-gradient-to-r from-amber-200/40 via-yellow-300/50 to-amber-200/40 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none"></div>
18:       <div className="relative bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl overflow-hidden shadow-md">
27:           className="w-full pl-16 pr-16 py-6 bg-transparent text-slate-900 text-lg font-medium placeholder-slate-400 border-none outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300 relative z-20"
53:       <div className="absolute -bottom-2 right-8 w-3 h-3 bg-amber-400/30 rounded-full blur-sm animate-pulse delay-1000 pointer-events-none"></div>
```

#### 13. `Frontend/src/components/ui/Toast.tsx` (Line 29)
*Replaces the purple/blue gradient with gold/amber.*
```tsx
/* Before */
29:         className="glass bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl shadow-lg transition-all"

/* After */
29:         className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/10 transition-all"
```

#### 14. `Frontend/src/components/ui/EmptyState.tsx` (Lines 13, 27, 34-35)
```tsx
/* Before */
13:           <div className="w-32 h-32 glass rounded-full flex items-center justify-center border-casino-glow relative overflow-hidden mx-auto">
27:           <div className="absolute inset-0 casino-glow-purple rounded-full blur-2xl opacity-30"></div>
34:         <div className="glass rounded-2xl p-6 mb-8 border-casino-glow">
35:           <p className="text-yellow-200/80 text-center leading-relaxed">

/* After */
13:           <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm relative overflow-hidden mx-auto">
27:           <div className="absolute inset-0 bg-yellow-200/50 rounded-full blur-2xl opacity-30"></div>
34:         <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
35:           <p className="text-slate-600 text-center leading-relaxed">
```

#### 15. `Frontend/src/components/ui/LoadingSpinner.tsx` (Lines 12, 15-16, 48-49)
```tsx
/* Before */
12:     <div className="min-h-screen bg-casino-dark flex items-center justify-center relative overflow-hidden">
15:         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
16:         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
48:         <div className="mt-8 glass rounded-2xl px-6 py-3 border-casino-glow">
49:           <p className="text-yellow-200/80 text-sm font-medium">

/* After */
12:     <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden">
15:         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
16:         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-200/5 rounded-full blur-2xl animate-pulse delay-500"></div>
48:         <div className="mt-8 bg-white border border-slate-200 rounded-2xl px-6 py-3 shadow-sm">
49:           <p className="text-slate-600 text-sm font-medium">
```

#### 16. `Frontend/src/utils/helpers.ts` (Lines 7, 12, 17, 22, 29)
*Replaces categories badge colors configurations with light equivalents.*
```typescript
/* Before */
7:     color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
12:     color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
17:     color: "bg-red-500/20 text-red-300 border-red-500/30",
22:     color: "bg-gray-500/20 text-gray-300 border-gray-500/30",
29:   color: "bg-gray-500/20 text-gray-300 border-gray-500/30",

/* After */
7:     color: "bg-amber-100 text-amber-800 border border-amber-200",
12:     color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
17:     color: "bg-red-100 text-red-800 border border-red-200",
22:     color: "bg-slate-100 text-slate-800 border border-slate-200",
29:   color: "bg-slate-100 text-slate-800 border border-slate-200",
```

---

### F. Footer Layout

#### 17. `Frontend/src/components/layout/footer/Footer.tsx` (Lines 7-9)
```tsx
/* Before */
7:     <footer className="mt-20 border-t border-yellow-400/20 bg-casino-dark relative overflow-hidden">
8:       <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
9:       <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>

/* After */
7:     <footer className="mt-20 border-t border-slate-200 bg-white relative overflow-hidden">
8:       <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 to-transparent"></div>
9:       <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>
```

#### 18. `Frontend/src/components/layout/footer/FooterMainContent.tsx` (Lines 36, 50, 63, 71, 80, 86, 93, 100, 111)
```tsx
/* Before */
36:     { icon: "📘", label: "Facebook", glow: "hover:casino-glow-purple" },
50:             <p className="text-yellow-400/80 text-sm font-medium">
63:         <h4 className="text-yellow-400 font-bold mb-4 text-lg">
71:               className="block text-yellow-200/70 hover:text-yellow-100 transition-colors duration-300 font-medium hover:scale-105 transform"
80:         <h4 className="text-yellow-400 font-bold mb-4 text-lg">
86:             className="glass p-3 rounded-full text-2xl transition-all duration-300 transform hover:scale-110 border-yellow-400/20 hover:border-yellow-400/50 hover:casino-glow"
93:             className="glass p-3 rounded-full text-2xl transition-all duration-300 transform hover:scale-110 border-yellow-400/20 hover:border-yellow-400/50 hover:casino-glow-purple"
100:             className="glass p-3 rounded-full text-2xl transition-all duration-300 transform hover:scale-110 border-yellow-400/20 hover:border-yellow-400/50 hover:casino-glow-red"
111:               className="block text-yellow-200/70 hover:text-yellow-100 transition-colors duration-300 font-medium text-sm"

/* After */
36:     { icon: "📘", label: "Facebook", glow: "hover:casino-glow" },
50:             <p className="text-slate-600 text-sm font-medium">
63:         <h4 className="text-slate-900 font-bold mb-4 text-lg">
71:               className="block text-slate-500 hover:text-slate-900 transition-colors duration-300 font-medium hover:scale-105 transform"
80:         <h4 className="text-slate-900 font-bold mb-4 text-lg">
86:             className="bg-slate-100 hover:bg-slate-200 p-3 rounded-full text-2xl transition-all duration-300 transform hover:scale-110 border border-slate-200 hover:border-slate-300 hover:shadow-md"
93:             className="bg-slate-100 hover:bg-slate-200 p-3 rounded-full text-2xl transition-all duration-300 transform hover:scale-110 border border-slate-200 hover:border-slate-300 hover:shadow-md"
100:             className="bg-slate-100 hover:bg-slate-200 p-3 rounded-full text-2xl transition-all duration-300 transform hover:scale-110 border border-slate-200 hover:border-slate-300 hover:shadow-md"
111:               className="block text-slate-500 hover:text-slate-900 transition-colors duration-300 font-medium text-sm"
```

#### 19. `Frontend/src/components/layout/footer/FooterBottomSection.tsx` (Lines 20, 23, 27, 37, 45, 48, 53, 58, 61)
```tsx
/* Before */
20:       <div className="border-t border-yellow-400/20 pt-8">
23:             <p className="text-yellow-200/60 font-medium">
27:             <p className="text-yellow-400/40 text-xs mt-1">
37:                 className="text-yellow-300/50 hover:text-yellow-200 transition-colors duration-300 font-medium hover:underline"
45:         <div className="mt-6 glass rounded-2xl p-6 border-yellow-400/20 casino-glow-red bg-gradient-to-r from-red-500/5 to-orange-500/5">
48:             <p className="text-yellow-200/90 text-sm font-medium leading-relaxed">
53:               <span className="text-yellow-400/70">
58:               <span className="text-yellow-400/70">
61:               <span className="text-yellow-400/70">

/* After */
20:       <div className="border-t border-slate-200 pt-8">
23:             <p className="text-slate-500 font-medium">
27:             <p className="text-slate-400 text-xs mt-1">
37:                 className="text-slate-500 hover:text-slate-800 transition-colors duration-300 font-medium hover:underline"
45:         <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-6">
48:             <p className="text-slate-700 text-sm font-medium leading-relaxed">
53:               <span className="text-slate-500">
58:               <span className="text-slate-500">
61:               <span className="text-slate-500">
```

---

## 3. Resolution of Frontend-Backend API Contract Mismatches

The original contract review identified four bugs that break admin operations and game lobby features. Here are the recommended fixes:

### 1. Game RTP Setting Endpoint Mismatch
*   **Location**: `Frontend/src/app/admin/page.tsx` line 89
*   **Fix**: Update URL to `/admin/game/set-rtp` to match Express routing.
```typescript
// Before
const res = await fetch(`${BACKEND_URL}/admin/set-rtp`, {

// After
const res = await fetch(`${BACKEND_URL}/admin/game/set-rtp`, {
```

### 2. Game RTP Setting Payload Field Mismatch
*   **Location**: `Frontend/src/app/admin/page.tsx` line 95
*   **Fix**: Map payload field `userCode` to `username` to satisfy Zod validation on the backend.
```typescript
// Before
body: JSON.stringify(rtpData), // Sends { userCode: string, ... }

// After
body: JSON.stringify({
  vendorCode: rtpData.vendorCode,
  username: rtpData.userCode,
  rtp: rtpData.rtp
}),
```

### 3. KYC Status Update Payload Field Mismatch
*   **Location**: `Frontend/src/app/admin/page.tsx` line 113
*   **Fix**: Map payload field `status` to `kycStatus` to satisfy Zod validation on the backend.
```typescript
// Before
body: JSON.stringify({ status }),

// After
body: JSON.stringify({ kycStatus: status }),
```

### 4. Financial Request List Loading Failure
*   **Location**: `Frontend/src/app/admin/page.tsx` line 59
*   **Fix**: The backend router (`adminController.js` line 100) returns the transaction array directly. Change the state setter to parse it correctly instead of expecting it inside a `.requests` field.
```typescript
// Before
setTransactions(transData.requests || []);

// After
setTransactions(Array.isArray(transData) ? transData : transData.requests || []);
```

### 5. Hardcoded Game Categories & Ratings Mappings
*   **Location**: `Frontend/src/contexts/GameStoreContext.tsx` lines 101-102
*   **Fix**: Determine game categories dynamically based on the game name, and generate a deterministic rating to prevent rendering static slots values.
```typescript
// Before
category: "slots", // default
rating: 4.5,

// After
category: (() => {
  const nameLower = g.gameName.toLowerCase();
  if (nameLower.includes("live") || nameLower.includes("lobby") || nameLower.includes("dealer")) {
    return "live";
  }
  if (
    nameLower.includes("blackjack") ||
    nameLower.includes("roulette") ||
    nameLower.includes("baccarat") ||
    nameLower.includes("poker") ||
    nameLower.includes("hold'em") ||
    nameLower.includes("holdem") ||
    nameLower.includes("sic bo") ||
    nameLower.includes("craps")
  ) {
    return "table";
  }
  return "slots";
})(),
rating: (() => {
  const charSum = g.gameName.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return parseFloat((4.0 + (charSum % 10) / 10).toFixed(1));
})(),
```

---

## 4. Proposed Banner CMS Interface Implementation

To connect the admin interface with the backend's `/api/admin/banners` CRUD endpoints, apply the following updates to `Frontend/src/app/admin/page.tsx`:

### 1. State Definition
Add these variables to the `AdminDashboard` component state (near line 33):
```typescript
const [banners, setBanners] = useState<any[]>([]);
const [newBanner, setNewBanner] = useState({
  title: "",
  imageUrl: "",
  linkUrl: "",
  isActive: true,
  order: 0
});
```

### 2. Fetch Banners in `fetchData`
In `fetchData` callback, fetch admin banners (near line 61):
```typescript
const bannersRes = await fetch(`${BACKEND_URL}/admin/banners`, { headers });
if (bannersRes.ok) {
  const bannersJson = await bannersRes.json();
  if (bannersJson.success) {
    setBanners(bannersJson.data || []);
  }
}
```

### 3. Handler Methods
Add CRUD request actions for creating and deleting banners:
```typescript
const handleCreateBanner = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BACKEND_URL}/admin/banners`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(newBanner),
    });
    if (res.ok) {
      alert("Banner created successfully!");
      setNewBanner({ title: "", imageUrl: "", linkUrl: "", isActive: true, order: 0 });
      fetchData();
    }
  } catch (err) {
    alert("Error creating banner");
  }
};

const handleDeleteBanner = async (id: number) => {
  if (!confirm("Are you sure you want to delete this banner?")) return;
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BACKEND_URL}/admin/banners/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
      alert("Banner deleted successfully!");
      fetchData();
    }
  } catch (err) {
    alert("Error deleting banner");
  }
};
```

### 4. Navigation Tab Trigger
Add a Sidebar item under "Operations" (near line 187):
```typescript
<SidebarItem id="banners" icon="🖼️" label="Banner CMS" active={activeTab === "banners"} onClick={setActiveTab} />
```

### 5. Render Banner Management UI Panel
Add the rendering logic for the `"banners"` tab in the main return statement:
```tsx
{activeTab === "banners" && (
  <div className="space-y-8 animate-fade-in">
    {/* Form Block */}
    <div className="bg-white border border-slate-200 rounded-[32px] p-10 shadow-xl">
      <div className="mb-6">
        <h3 className="text-2xl font-black text-slate-900 uppercase">Add New Slide Banner</h3>
        <div className="h-1 w-12 bg-emerald-500 rounded-full mt-2" />
      </div>
      <form onSubmit={handleCreateBanner} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Banner Title</label>
            <input 
              type="text" 
              placeholder="e.g. Weekly Slot Tournament" 
              value={newBanner.title} 
              onChange={e => setNewBanner({...newBanner, title: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Image URL (Required)</label>
            <input 
              type="text" 
              placeholder="https://example.com/banner.jpg" 
              value={newBanner.imageUrl} 
              onChange={e => setNewBanner({...newBanner, imageUrl: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Link Destination (Optional)</label>
            <input 
              type="text" 
              placeholder="/promos/weekly" 
              value={newBanner.linkUrl} 
              onChange={e => setNewBanner({...newBanner, linkUrl: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Sort Order</label>
            <input 
              type="number" 
              value={newBanner.order} 
              onChange={e => setNewBanner({...newBanner, order: parseInt(e.target.value) || 0})}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        </div>
        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-emerald-500/10 uppercase tracking-wider text-xs">
          Deploy Slider Banner
        </button>
      </form>
    </div>

    {/* Banners Grid list */}
    <div className="bg-white border border-slate-200 rounded-[32px] p-10 shadow-xl">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-900 uppercase">Live Sliders ({banners.length})</h3>
        <div className="h-1 w-12 bg-emerald-500 rounded-full mt-2" />
      </div>
      {banners.length === 0 ? (
        <p className="text-slate-500 italic">No banners currently configured in database.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div key={b.id} className="border border-slate-200 rounded-[24px] p-5 flex gap-5 items-center bg-slate-50 shadow-sm hover:shadow-md transition-shadow">
              <img src={b.imageUrl} alt={b.title || "Banner"} className="w-28 h-16 object-cover rounded-xl border border-slate-200" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">{b.title || "Untitled Banner"}</p>
                <p className="text-xs text-slate-500 truncate mt-1">Link: {b.linkUrl || "None"}</p>
                <p className="text-[10px] font-black uppercase text-emerald-600 mt-2 bg-emerald-50 inline-block px-2.5 py-1 rounded-md">Order: {b.order}</p>
              </div>
              <button 
                onClick={() => handleDeleteBanner(b.id)} 
                className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wider px-3 py-2 border border-red-200 hover:border-red-400 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
```
