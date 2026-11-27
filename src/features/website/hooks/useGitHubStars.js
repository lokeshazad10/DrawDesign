import { useEffect, useState } from "react";

const REPO = "lokeshazad10/DrawDesign";

export function useGitHubStars(repo = REPO) {
  const [stars, setStars] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStars() {
      try {
        const res = await fetch(`https://api.github.com/repos/${repo}`, {
          headers: { Accept: "application/vnd.github+json" },
        });

        if (!res.ok) throw new Error("GitHub API request failed");

        const data = await res.json();
        if (!cancelled) setStars(data.stargazers_count ?? 0);
      } catch {
        if (!cancelled) setStars(null);
      }
    }

    loadStars();
    return () => {
      cancelled = true;
    };
  }, [repo]);

  return stars;
}
