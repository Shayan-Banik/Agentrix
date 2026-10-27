// import { FiArrowUpRight, FiShare2 } from "react-icons/fi";

// function EmptyState({ suggestions, onPick }) {
//   return (
//     <div className="relative flex min-h-full flex-col items-center justify-start overflow-hidden px-4 py-8 text-center sm:justify-center sm:py-6">
//       <style>{`
//         @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
//         @keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
//         .fade-up { opacity: 0; animation: fadeUp .6s ease-out forwards; }
//         .floaty { animation: floaty 5s ease-in-out infinite; }
//       `}</style>

//       {/* ambient background glow */}
//       <div className="pointer-events-none absolute left-1/2 top-1/4 h-105 w-105 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />
//       <div className="pointer-events-none absolute right-1/4 top-1/2 h-65 w-65 rounded-full bg-fuchsia-500/10 blur-[100px]" />

//       {/* orb */}
//       <div className="floaty relative mb-2 grid h-20 w-20 shrink-0 place-items-center sm:h-28 sm:w-28">
//         <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400/10 [animation-duration:3s]" />
//         <span className="absolute inset-2 rounded-full border border-indigo-300/20" />
//         <span className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-indigo-400/70 [animation-duration:6s]" />
//         <span className="grid h-16 w-16 place-items-center rounded-full bg-linear-to-br from-indigo-500/30 to-fuchsia-500/20 text-indigo-100 shadow-[0_0_50px_rgba(129,140,248,0.55)] ring-1 ring-white/10 backdrop-blur sm:h-20 sm:w-20">
//           <FiShare2 className="h-8 w-8 drop-shadow-[0_0_12px_rgba(165,180,252,0.9)] sm:h-10 sm:w-10" strokeWidth={1.5} />
//         </span>
//       </div>

//       <p
//         className="fade-up max-w-sm text-sm text-slate-400 sm:text-[15px]"
//         style={{ animationDelay: "100ms" }}
//       >
//         Hello! I&apos;m here to help you. What can your agents do for you today?
//       </p>

//       <h1
//         className="fade-up mt-4 max-w-2xl text-2xl font-bold tracking-tight text-white sm:mt-5 sm:text-3xl md:text-5xl"
//         style={{ animationDelay: "200ms" }}
//       >
//         What can your agents help with?
//       </h1>

//       <div className="mt-7 grid w-full max-w-4xl grid-cols-1 gap-2.5 sm:mt-10 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
//         {suggestions.map((s, i) => (
//           <div
//             key={s}
//             className="fade-up group rounded-2xl bg-linear-to-br from-white/10 to-white/0 p-px transition duration-300 hover:-translate-y-1 hover:from-indigo-400/70 hover:to-fuchsia-500/50 hover:shadow-[0_10px_40px_-10px_rgba(129,140,248,0.5)]"
//             style={{ animationDelay: `${350 + i * 80}ms` }}
//           >
//             <button
//               type="button"
//               onClick={() => onPick(s)}
//               className="relative flex h-full w-full items-start justify-between gap-3 rounded-[15px] bg-[#101624] px-4 py-3.5 text-left text-sm leading-relaxed text-slate-400 transition group-hover:bg-[#141b2d] group-hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:px-5 sm:py-4 sm:text-[15px]"
//             >
//               <span>{s}</span>
//               <FiArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-600 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-300" />
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default EmptyState;

import { FiArrowUpRight, FiShare2 } from "react-icons/fi";

function EmptyState({ suggestions, onPick }) {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden px-4 py-8 text-center">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .fade-up { opacity: 0; animation: fadeUp .6s ease-out forwards; }
        .floaty { animation: floaty 5s ease-in-out infinite; }
      `}</style>

      {/* ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-[22%] h-105 w-105 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/25 blur-[110px]" />
      <div className="pointer-events-none absolute -right-10 top-1/2 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-[90px]" />
      <div className="pointer-events-none absolute -left-10 bottom-10 h-56 w-56 rounded-full bg-sky-500/10 blur-[90px] sm:hidden" />

      {/* orb */}
      <div className="floaty relative mb-7 grid h-24 w-24 shrink-0 place-items-center sm:mb-10 sm:h-28 sm:w-28">
        <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400/10 [animation-duration:3s]" />
        <span className="absolute inset-2 rounded-full border border-indigo-300/20" />
        <span className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-indigo-400/70 [animation-duration:6s]" />
        <span className="grid h-18 w-18 place-items-center rounded-full bg-linear-to-br from-indigo-500/30 to-fuchsia-500/20 text-indigo-100 shadow-[0_0_50px_rgba(129,140,248,0.55)] ring-1 ring-white/10 backdrop-blur sm:h-20 sm:w-20">
          <FiShare2
            className="h-9 w-9 drop-shadow-[0_0_12px_rgba(165,180,252,0.9)] sm:h-10 sm:w-10"
            strokeWidth={1.5}
          />
        </span>
      </div>

      <p
        className="fade-up max-w-[18rem] text-balance text-sm leading-relaxed text-slate-400 sm:max-w-none sm:whitespace-nowrap sm:text-[15px]"
        style={{ animationDelay: "100ms" }}>
        Hello! I&apos;m here to help you. What can your agents do for you today?
      </p>

      <h1
        className="fade-up mt-4 bg-linear-to-r text-white  pb-1 text-[26px] font-bold leading-[1.15] tracking-tight sm:mt-5 sm:whitespace-nowrap sm:text-4xl md:text-5xl"
        style={{ animationDelay: "200ms" }}>
        <span className="block sm:inline">What can your agents</span>{" "}
        <span className="block sm:inline">help with?</span>
      </h1>

      <p
        className="fade-up mt-8 text-[11px] font-medium uppercase tracking-[0.25em] text-slate-500 sm:hidden"
        style={{ animationDelay: "300ms" }}>
        Try asking
      </p>

      {/* mobile: swipeable carousel · sm+: grid */}
      <div
        className="
          -mx-4 mt-3 flex w-[calc(100%+2rem)] snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto px-4 py-3
          scrollbar-none [&::-webkit-scrollbar]:hidden
          mask-[linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]
          sm:mx-0 sm:mt-10 sm:grid sm:w-full sm:max-w-4xl sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:py-0 sm:mask-none
          lg:grid-cols-3
        ">
        {suggestions.map((s, i) => (
          <div
            key={s}
            className="fade-up group shrink-0 basis-[78%] snap-center rounded-2xl bg-linear-to-br from-white/15 to-white/0 p-px transition duration-300 active:scale-[0.98] sm:basis-auto sm:hover:-translate-y-1 sm:hover:from-indigo-400/70 sm:hover:to-fuchsia-500/50 sm:hover:shadow-[0_10px_40px_-10px_rgba(129,140,248,0.5)]"
            style={{ animationDelay: `${350 + i * 80}ms` }}>
            <button
              type="button"
              onClick={() => onPick(s)}
              className="relative flex h-full min-h-28 w-full flex-col justify-between gap-4 rounded-[15px] bg-[#101624] px-4 py-4 text-left transition group-hover:bg-[#141b2d] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:min-h-0 sm:px-5">
              <span className="flex w-full items-center justify-between">
                <span className="bg-linear-to-r from-indigo-300 to-fuchsia-300 bg-clip-text font-mono text-xs font-semibold tracking-widest text-transparent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <FiArrowUpRight className="h-4 w-4 shrink-0 text-slate-600 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-300" />
              </span>
              <span className="line-clamp-3 text-sm leading-relaxed text-slate-300 transition group-hover:text-slate-100 sm:line-clamp-none sm:text-[15px] sm:text-slate-400">
                {s}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmptyState;
