import {
  ArrowRight,
  ArrowUpRight,
  Download,
  Lightbulb,
  Network,
  Pencil,
  Shapes,
  Star,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { heroSketchboardAnimation } from "./animations/animate";
import Navbar from "./layout/Navbar";
import Sketchboard from "./components/Sketchboard";
import Button from "./components/Button";

const containerClass =
  "mx-auto w-[min(1180px,calc(100%-64px))] max-[560px]:w-[calc(100%-36px)]";
const eyebrowClass =
  "m-0 text-[12px] leading-[1.4] font-bold tracking-[1.6px] text-(--accent) uppercase";
const linkClass = "no-underline transition-colors duration-150";

const features = [
  {
    icon: Pencil,
    title: "Keep it hand-drawn",
    description:
      "Make diagrams feel personal with an organic sketch style that keeps the focus on your ideas.",
  },
  {
    icon: Network,
    title: "Make connections clear",
    description:
      "Arrange shapes, notes, and connectors into diagrams that are easy to follow at a glance.",
  },
  {
    icon: Download,
    title: "Take your work with you",
    description:
      "Export your finished board and bring your ideas into your next conversation or document.",
  },
];

const steps = [
  {
    number: "01",
    title: "Start with a blank canvas",
    description: "Open a board and put the first thought anywhere.",
  },
  {
    number: "02",
    title: "Sketch the big picture",
    description: "Add shapes, labels, and connections as the idea takes form.",
  },
  {
    number: "03",
    title: "Refine and share",
    description: "Tidy up your diagram, then export it when it feels right.",
  },
];

const useCases = [
  {
    icon: Network,
    title: "System diagrams",
    description: "Map services, flows, and the connections between them.",
  },
  {
    icon: Shapes,
    title: "Wireframes",
    description: "Explore page layouts and interface ideas before polishing.",
  },
  {
    icon: Lightbulb,
    title: "Brainstorming",
    description: "Collect thoughts, group them, and find a direction together.",
  },
];

export default function WebsiteApp() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "DrawDesign — Make room for ideas";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  //gsap animation for hero section
  const sectionRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(
    () => {
      return heroSketchboardAnimation({
        section: sectionRef.current,
        card: cardRef.current,
      });
    },
    { scope: sectionRef },
  );

  return (
    <main className="overflow-y-hidden min-h-screen min-w-0 bg-(--bg) bg-[radial-gradient(circle,#d9dde3_1.25px,transparent_1px)] bg-size-[20px_20px] font-(family-name:--font-ui) text-(--text) antialiased">
      {/* Navbar component */}
      <Navbar />
      <div
        ref={sectionRef}
        className="relative z-0 flow-root min-h-[calc(100svh-4rem)] max-[850px]:min-h-0"
      >
        <section
          className={`${containerClass} flex min-h-[calc(100svh-4rem)] items-center justify-center max-[850px]:min-h-0 max-[850px]:py-10`}
        >
          <div className="relative sm:mt-10 z-1 max-[850px]:max-w-150 flex items-center justify-center flex-col">
            <p
              className={`${eyebrowClass} bg-[#3cc0d457] text-center inline-block px-4 py-2 rounded-full`}
            >
              100% Free & Open-Source | No Login Required
            </p>
            <h1 className="mt-0 mb-5.5 py-4 font-handwriting text-center text-[clamp(62px,7.3vw,94px)] leading-[0.91] font-semibold tracking-[-7px] max-[560px]:text-[58px] max-[560px]:tracking-[-5px]">
              Diagrams that feel <br />{" "}
              <span className="text-(--accent)">hand-drawn</span>, crafted in
              seconds.
            </h1>
            <p className="mt-0 mb-7.5 max-w-200 text-center text-[17px] leading-[1.65] text-[#66685f] max-[560px]:text-[15px]">
              DrawDesign is the intuitive virtual whiteboard designed to sketch
              system architecture, wireframes, mind maps, and quick ideas with
              an organic hand-crafted pencil aesthetic.
            </p>
            <div className="flex flex-wrap items-center gap-5.75 max-[560px]:items-start max-[560px]:flex-col max-[560px]:gap-4 text-(--accent)">
              {/* <a
                className={`${linkClass} inline-flex min-h-12.5 items-center justify-center gap-3 rounded-lg bg-(--accent) px-4.75 text-sm font-bold text-white hover:-translate-y-0.5 hover:text-(--accent) hover:bg-[#3cc0d457] transition ease-in-out duration-300`}
                href="/"
              >
                Start sketching <ArrowUpRight size={18} aria-hidden="true" />
              </a> */}
              <Button
                href={"/"}
                title="Start Sketching"
                icon={<ArrowUpRight size={18} aria-hidden="true" />}
                bgColor="bg-(--accent)"
                textColor="text-(--bg)"
              />
              <Button
                href="https://github.com/lokeshazad10/DrawDesign"
                target="_blank"
                rel="noreferrer"
                title="Star on Github"
                icon={<Star size={16} aria-hidden="true" />}
              />
              {/* <a
                className={`${linkClass} inline-flex items-center gap-1.25 font-bold text-(--text) hover:text-(--accent) transition ease-in-out duration-300 text-sm`}
                href="#features"
              >
                <Star size={16} aria-hidden="true" />
                Star on Github
              </a> */}
            </div>
            <p className="mt-4.5 mb-0 text-[12px] text-[#888a80]">
              Free to use · Your boards stay in your browser
            </p>
          </div>
        </section>
        <Sketchboard
          ref={cardRef}
          className="absolute inset-0 z-20 flex items-center justify-center max-[850px]:relative max-[850px]:inset-auto max-[850px]:z-0 max-[850px]:mt-4"
        />
      </div>

      <section
        className={`${containerClass} scroll-mt-20 pt-15 pb-26.5 max-[560px]:pt-2.5 max-[560px]:pb-19`}
        id="features"
        aria-labelledby="features-title"
      >
        <div className="mb-9.5 text-center max-[560px]:text-left">
          <p className={eyebrowClass}>Less polish. More possibility.</p>
          <h2
            id="features-title"
            className="mt-3 mb-0 text-[clamp(30px,4vw,43px)] leading-tight font-medium tracking-[-2px] max-[560px]:text-[34px]"
          >
            A canvas that gets out of your way.
          </h2>
          <p className="mx-auto mt-3 mb-0 max-w-150 text-[16px] leading-[1.65] text-(--muted) max-[560px]:mx-0 max-[560px]:text-[15px]">
            From the first rough line to a diagram worth sharing, keep your
            thinking simple and visual.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-5 max-[760px]:grid-cols-1">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article
              key={title}
              className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-[0_8px_24px_-20px_rgba(20,24,31,0.35)] max-[560px]:p-5"
            >
              <div className="mb-7 flex size-11 items-center justify-center rounded-xl bg-(--accent-soft) text-(--accent)">
                <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <p className={`${eyebrowClass} mb-2`}>0{index + 1}</p>
              <h3 className="mt-0 mb-2 text-[20px] font-semibold tracking-[-0.5px]">
                {title}
              </h3>
              <p className="m-0 text-[14px] leading-[1.7] text-(--muted)">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        aria-labelledby="how-it-works-title"
        className={`${containerClass} scroll-mt-20 mb-24 grid grid-cols-[0.8fr_1.2fr] items-start gap-12 max-[760px]:mb-18 max-[760px]:grid-cols-1 max-[760px]:gap-8`}
      >
        <div>
          <p className={eyebrowClass}>A little goes a long way</p>
          <h2
            id="how-it-works-title"
            className="mt-3 mb-3 text-[clamp(30px,4vw,43px)] leading-tight font-medium tracking-[-2px]"
          >
            From first thought to clear picture.
          </h2>
          <p className="m-0 max-w-110 text-[15px] leading-[1.7] text-(--muted)">
            No complicated setup. Just open your canvas and let the idea lead.
          </p>
        </div>
        <ol className="m-0 grid list-none gap-3 p-0">
          {steps.map(({ number, title, description }) => (
            <li
              key={number}
              className="flex items-start gap-4 rounded-xl border border-(--border) bg-(--surface) p-4.5 max-[560px]:p-4"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-(--accent-soft) text-[12px] font-bold text-(--accent)">
                {number}
              </span>
              <div>
                <h3 className="mt-0 mb-1 text-[16px] font-semibold">{title}</h3>
                <p className="m-0 text-[14px] leading-[1.6] text-(--muted)">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="use-cases"
        aria-labelledby="use-cases-title"
        className={`${containerClass} scroll-mt-20 mb-24 max-[760px]:mb-18`}
      >
        <div className="mb-8 text-center max-[560px]:text-left">
          <p className={eyebrowClass}>Think out loud</p>
          <h2
            id="use-cases-title"
            className="mt-3 mb-0 text-[clamp(30px,4vw,43px)] leading-tight font-medium tracking-[-2px] max-[560px]:text-[34px]"
          >
            One canvas, plenty of possibilities.
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-5 max-[760px]:grid-cols-1">
          {useCases.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="flex items-start gap-4 rounded-2xl bg-(--surface-2) p-5.5 max-[560px]:p-5"
            >
              <Icon
                className="mt-0.5 shrink-0 text-(--accent)"
                size={21}
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <div>
                <h3 className="mt-0 mb-1.5 text-[17px] font-semibold">
                  {title}
                </h3>
                <p className="m-0 text-[14px] leading-[1.65] text-(--muted)">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="cta-title"
        className={`${containerClass} mb-15 flex min-h-51.25 items-center justify-between gap-6 rounded-2xl bg-(--text) px-14 py-9 text-(--bg) max-[560px]:mb-10 max-[560px]:items-start max-[560px]:flex-col max-[560px]:px-6.25 max-[560px]:py-7.5`}
      >
        <div>
          <p className={`${eyebrowClass} text-(--accent)`}>
            Your next idea is waiting
          </p>
          <h2
            id="cta-title"
            className="mt-2.5 mb-0 text-[clamp(30px,4vw,43px)] leading-tight font-medium tracking-[-2px]"
          >
            Start with a scribble.
          </h2>
        </div>
        <a
          className={`${linkClass} inline-flex min-h-12.5 shrink-0 items-center justify-center gap-3 rounded-lg bg-(--accent) px-4.75 text-[14px] font-bold text-(--accent-ink) hover:-translate-y-0.5 hover:brightness-110`}
          href="/"
        >
          Open Sketchboard <ArrowRight size={18} aria-hidden="true" />
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
