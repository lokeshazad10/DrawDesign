import { useEffect } from "react";

const FONT_FACES = [
  '400 16px "Bricolage Grotesque Variable"',
  '500 16px "Bricolage Grotesque Variable"',
  '700 26px "Bricolage Grotesque Variable"',
  "26px Caveat",
  '26px "Instrument Sans"',
  '26px "JetBrains Mono"',
];

export function useLoadBoardFonts(onFontsLoaded) {
  useEffect(() => {
    Promise.all(FONT_FACES.map((font) => document.fonts.load(font)))
      .catch(() => {})
      .then(onFontsLoaded);
  }, [onFontsLoaded]);
}
