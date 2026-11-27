import boardPreview from "../../../../docs/images/screenshot.png";
import { Shapes } from "lucide-react";
import { forwardRef } from "react";

const Sketchboard = forwardRef(function Sketchboard(props, ref) {
  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center ${props.className ?? ""}`}
    >
      <div className="relative mx-auto mt-4 mb-8 w-[min(1000px,calc(100%-64px))] px-4 pt-7.5 pb-2.5 max-[850px]:w-[calc(100%-48px)] max-[560px]:mb-6 max-[560px]:w-[calc(100%-36px)] max-[560px]:px-2">
        <div
          className="absolute -top-0.75 right-[12%] z-1 grid justify-items-center text-[16px] text-(--text) italic rotate-[7deg] max-[560px]:right-[7%] max-[560px]:text-[13px]"
          aria-hidden="true"
        >
          <span>ideas welcome</span>
          <svg
            className="-ml-11.25 h-9 w-16.5"
            viewBox="0 0 100 48"
            fill="none"
          >
            <path
              d="M4 8c27 2 45 -4 68 31m0 0-12-4m13 4-5-13"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#e4e5dc] bg-white shadow-[0_25px_65px_rgba(46,49,36,0.12)]">
          <div className="flex h-10.5 items-center gap-3 border-b border-[#efefe9] px-3.5 text-[11px] text-[#797b73]">
            <span className="inline-flex gap-1" aria-hidden="true">
              <i className="size-1.75 rounded-full bg-[#e2e3dc]" />
              <i className="size-1.75 rounded-full bg-[#e2e3dc]" />
              <i className="size-1.75 rounded-full bg-[#e2e3dc]" />
            </span>
            <span>Untitled board</span>
            <span className="ml-auto text-[9px] font-bold tracking-[1px] text-[#85877e]">
              SKETCHBOARD
            </span>
          </div>
          <img
            className="block h-auto w-full"
            src={boardPreview}
            alt="Sketchboard canvas with colorful hand-drawn shapes and notes"
          />
        </div>
        <div
          className="absolute -right-3.75 -bottom-0.75 flex items-center gap-2.25 rounded-[9px] border border-[#e2e4d8] bg-[#fffef9] px-3.75 py-3 text-[13px] font-semibold shadow-lg -rotate-3 max-[560px]:-right-2.25 max-[560px]:px-2.75 max-[560px]:py-2.75 max-[560px]:text-[11px]"
          aria-hidden="true"
        >
          <Shapes className="text-(--accent)" size={22} strokeWidth={1.7} />
          <span className="text-(--text)">Start anywhere.</span>
        </div>
      </div>
    </div>
  );
});

export default Sketchboard;
