import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  MousePointer2,
  Pencil,
  Shapes,
} from "lucide-react";
import { useEffect } from "react";
import boardPreview from "../../../docs/images/screenshot.png";

const features = [
  {
    icon: Pencil,
    title: "Keep it loose",
    description:
      "A warm, hand-drawn feel makes it easy to start before everything is figured out.",
  },
  {
    icon: MousePointer2,
    title: "Think on an open canvas",
    description:
      "Move freely between rough sketches, diagrams, notes, and the ideas connecting them.",
  },
  {
    icon: Download,
    title: "Take your ideas with you",
    description:
      "Save boards locally and export a crisp PNG or SVG whenever you are ready to share.",
  },
];

const containerClass =
  "mx-auto w-[min(1180px,calc(100%-64px))] max-[560px]:w-[calc(100%-36px)]";
const eyebrowClass =
  "m-0 text-[12px] leading-[1.4] font-bold tracking-[1.6px] text-[#6f7d45] uppercase";
const linkClass = "no-underline transition-colors duration-150";

export default function WebsiteApp() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "DrawDesign — Make room for ideas";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="min-h-screen min-w-[320px] bg-[#f8f8f4] font-(family-name:--font-ui) text-[#292b25] antialiased">
      <header
        className={`${containerClass} flex h-22 items-center justify-between border-b border-[#e8e9e1] max-[560px]:h-18`}
      >
        <a
          className={`${linkClass} inline-flex items-center gap-2.5 text-[19px] font-bold tracking-[-0.8px] text-[#292b25] max-[560px]:gap-2 max-[560px]:text-[17px]`}
          href="/website"
          aria-label="DrawDesign home"
        >
          <img
            className="size-7.75 object-contain"
            src="/DrawDesign.svg"
            alt=""
            aria-hidden="true"
          />
          <span>drawdesign</span>
        </a>
        <nav
          className="flex items-center gap-8.75 text-[14px] font-medium text-[#55574f] max-[560px]:gap-0"
          aria-label="Main navigation"
        >
          <a
            className={`${linkClass} text-[#55574f] hover:text-[#6a811f] max-[560px]:hidden`}
            href="#features"
          >
            Why DrawDesign
          </a>
          <a
            className={`${linkClass} inline-flex items-center gap-1.75 font-bold text-[#292b25] hover:text-[#6a811f] max-[560px]:text-[12px]`}
            href="/"
          >
            Open Sketchboard <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </nav>
      </header>

      <section
        className={`${containerClass} grid min-h-155 grid-cols-[0.88fr_1.12fr] items-center gap-7.5 pt-17.5 pb-23.75 max-[850px]:grid-cols-1 max-[850px]:gap-15 max-[850px]:pt-18 max-[850px]:pb-22.5 max-[560px]:min-h-0 max-[560px]:gap-12 max-[560px]:pt-16.25 max-[560px]:pb-19`}
      >
        <div className="relative z-1 max-[850px]:max-w-150">
          <p className={`${eyebrowClass} mb-0 flex items-center gap-2.25`}>
            <span
              className="size-2 rounded-full bg-[#9ab64d]"
              aria-hidden="true"
            />
            A little space to think
          </p>
          <h1 className="mt-0 mb-5.5 text-[clamp(62px,7.3vw,94px)] leading-[0.91] font-semibold tracking-[-7px] max-[560px]:text-[58px] max-[560px]:tracking-[-5px]">
            Make room
            <br />
            for{" "}
            <span className="font-medium text-[#819943] italic">ideas.</span>
          </h1>
          <p className="mt-0 mb-7.5 max-w-110 text-[17px] leading-[1.65] text-[#66685f] max-[560px]:text-[15px]">
            The best ideas rarely arrive fully formed. Sketch them out, move
            things around, and see where your thinking takes you.
          </p>
          <div className="flex flex-wrap items-center gap-5.75 max-[560px]:items-start max-[560px]:flex-col max-[560px]:gap-4">
            <a
              className={`${linkClass} inline-flex min-h-12.5 items-center justify-center gap-3 rounded-lg bg-[#292b25] px-4.75 text-[14px] font-bold text-white hover:-translate-y-0.5 hover:bg-[#42453b]`}
              href="/"
            >
              Start sketching <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a
              className={`${linkClass} inline-flex items-center gap-1.25 text-[13px] font-semibold text-[#55574f] hover:text-[#6a811f]`}
              href="#features"
            >
              Get to know the canvas{" "}
              <ArrowDownRight size={16} aria-hidden="true" />
            </a>
          </div>
          <p className="mt-4.5 mb-0 text-[12px] text-[#888a80]">
            Free to use · Your boards stay in your browser
          </p>
        </div>

        <div className="relative py-7.5 pr-0 pb-2.5 pl-6 max-[850px]:mx-auto max-[850px]:w-[min(680px,calc(100%-30px))] max-[560px]:w-[calc(100%-10px)] max-[560px]:pl-2">
          <div
            className="absolute -top-0.75 right-[12%] z-1 grid justify-items-center text-[16px] text-[#809443] italic rotate-[7deg] max-[560px]:right-[7%] max-[560px]:text-[13px]"
            aria-hidden="true"
          >
            <span>ideas welcome</span>
            <svg
              className="-ml-11.25 h-9 w-16.5"
              viewBox="0 0 100 48"
              fill="none"
            >
              <path
                d="M4 8c27 2 45 14 67 31m0 0-3-15m3 15 15-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="overflow-hidden rounded-xl border border-[#e4e5dc] bg-white shadow-[0_25px_65px_rgba(46,49,36,0.12)] rotate-[1.2deg]">
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
            <Shapes className="text-[#809443]" size={22} strokeWidth={1.7} />
            <span>Start anywhere.</span>
          </div>
        </div>
      </section>

      <section
        className={`${containerClass} pt-11 pb-26.5 max-[560px]:pt-2.5 max-[560px]:pb-19`}
        id="features"
      >
        <div className="mb-9.5 text-center max-[560px]:text-left">
          <p className={eyebrowClass}>Less polish. More possibility.</p>
          <h2 className="mt-3 mb-0 text-[clamp(30px,4vw,43px)] leading-tight font-medium tracking-[-2px] max-[560px]:text-[34px]">
            A canvas that gets out of your way.
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-3.75 max-[850px]:grid-cols-1">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article
              className="relative min-h-51.25 rounded-[10px] border border-[#e7e8df] bg-[#fbfbf8] p-6 max-[850px]:min-h-0"
              key={title}
            >
              <div className="grid size-10 place-items-center rounded-[11px] bg-[#eff2e3] text-[#6f813b]">
                <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <span className="absolute top-7 right-6 text-[11px] font-bold tracking-[1px] text-[#a3a59b]">
                0{index + 1}
              </span>
              <h3 className="mt-6 mb-1.75 text-[19px] font-semibold tracking-[-0.5px]">
                {title}
              </h3>
              <p className="mb-0 max-w-75 text-[14px] leading-[1.55] text-[#77796f] max-[850px]:max-w-135">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-15 flex min-h-51.25 w-[min(1180px,calc(100%-64px))] items-center justify-between gap-6 rounded-xl bg-[#30332b] px-14 py-9 text-white max-[560px]:mb-10 max-[560px]:w-[calc(100%-36px)] max-[560px]:items-start max-[560px]:flex-col max-[560px]:px-6.25 max-[560px]:py-7.5">
        <div>
          <p className={`${eyebrowClass} text-[#d9f27e]`}>
            Your next idea is waiting
          </p>
          <h2 className="mt-2.5 mb-0 text-[clamp(30px,4vw,43px)] leading-tight font-medium tracking-[-2px]">
            Start with a scribble.
          </h2>
        </div>
        <a
          className={`${linkClass} inline-flex min-h-12.5 shrink-0 items-center justify-center gap-3 rounded-lg bg-[#d9f27e] px-4.75 text-[14px] font-bold text-[#292b25] hover:-translate-y-0.5 hover:bg-[#e4fa9b]`}
          href="/"
        >
          Open Sketchboard <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </section>

      <footer
        className={`${containerClass} flex min-h-19.5 items-center justify-between gap-5 border-t border-[#e8e9e1] text-[12px] text-[#77796f] max-[560px]:min-h-27.5 max-[560px]:flex-wrap max-[560px]:py-4.5`}
      >
        <a
          className={`${linkClass} inline-flex items-center gap-2.5 text-[15px] font-bold tracking-[-0.8px] text-[#292b25]`}
          href="/website"
          aria-label="DrawDesign home"
        >
          <img
            className="size-6.25 object-contain"
            src="/DrawDesign.svg"
            alt=""
            aria-hidden="true"
          />
          <span>drawdesign</span>
        </a>
        <p className="m-0 max-[560px]:order-1 max-[560px]:w-full">
          Made for the ideas still taking shape.
        </p>
        <span>© {new Date().getFullYear()} DrawDesign</span>
      </footer>
    </main>
  );
}
