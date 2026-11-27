import { Menu, Star, X } from "lucide-react";
import { useState } from "react";
import { FaSquareGithub } from "react-icons/fa6";
import { useGitHubStars } from "../hooks/useGitHubStars";
import Button from "../components/Button";

function formatStars(count) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count);
}

const navigationLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#use-cases", label: "Use cases" },
];

const Navbar = () => {
  const stars = useGitHubStars();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex min-h-16 items-center justify-between gap-4 bg-(--bg)/95 px-6 py-3 text-(--accent) shadow-sm backdrop-blur-sm max-[560px]:px-3">
      <a href="/website" className="flex shrink-0 items-center">
        <img
          src="/DrawDesign.svg"
          alt="DrawDesign"
          className="size-12 object-contain max-[560px]:size-9"
        />
        <p className="ml-2 text-[clamp(18px,2.4vw,28px)] font-bold tracking-[-1px]">
          DrawDesign
        </p>
      </a>
      <nav
        className="flex items-center gap-6 text-[14px] font-semibold text-(--muted) max-[850px]:hidden"
        aria-label="Main navigation"
      >
        {navigationLinks.map(({ href, label }) => (
          <a
            key={href}
            className="no-underline transition-colors hover:text-(--accent)"
            href={href}
          >
            {label}
          </a>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-4 text-md max-[560px]:gap-1">
        <button
          type="button"
          className="hidden size-10 items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-(--text) max-[850px]:inline-flex"
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          {isMenuOpen ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <Menu size={20} aria-hidden="true" />
          )}
        </button>
        <div className="max-[560px]:hidden">
          <Button
            href="https://github.com/lokeshazad10/DrawDesign"
            target="_blank"
            rel="noreferrer"
            title={
              <span className="inline-flex items-center gap-2">
                <FaSquareGithub size={18} />
                <span>Star</span>
              </span>
            }
            icon={
              <span className="inline-flex items-center gap-2">
                <Star size={14} />
                <span className="tabular-nums">
                  {stars === null ? "—" : formatStars(stars)}
                </span>
              </span>
            }
          />
        </div>
        <div className="max-[360px]:hidden">
          <Button
            href="/"
            title={
              <span>
                <span className="max-[560px]:hidden">Open Sketchboard</span>
                <span className="min-[561px]:hidden">Open board</span>
              </span>
            }
          />
        </div>
      </div>
      <nav
        id="mobile-navigation"
        className={`${isMenuOpen ? "grid" : "hidden"} absolute top-full right-0 left-0 gap-1 border-t border-(--border) bg-(--bg) px-6 py-3 shadow-lg min-[851px]:hidden max-[560px]:px-3`}
        aria-label="Mobile navigation"
      >
        {navigationLinks.map(({ href, label }) => (
          <a
            key={href}
            className="rounded-lg px-3 py-3 text-[15px] font-semibold text-(--text) no-underline transition-colors hover:bg-(--surface-2) hover:text-(--accent)"
            href={href}
            onClick={() => setIsMenuOpen(false)}
          >
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
};

export default Navbar;
