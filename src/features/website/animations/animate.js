// src/animations/animate.js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function heroSketchboardAnimation({ section, card }) {
  const media = gsap.matchMedia();

  media.add("(min-width: 851px)", () => {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 5%",
        end: "+=100%",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    timeline.fromTo(
      card,
      {
        y: "35vh",
        opacity: 0,
        scale: 0.8,
      },
      {
        y: "0vh",
        opacity: 1,
        scale: 1,
        ease: "power2.out",
        duration: 1,
      },
    );
  });

  return () => media.revert();
}
