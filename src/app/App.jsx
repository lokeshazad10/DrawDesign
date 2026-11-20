import { lazy, Suspense } from "react";

const BoardApp = lazy(() => import("./BoardApp.jsx"));
const WebsiteApp = lazy(() => import("../features/website/WebsiteApp.jsx"));

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const RoutedApp =
    path === "/website" || path.startsWith("/website/")
      ? WebsiteApp
      : BoardApp;

  return (
    <Suspense fallback={null}>
      <RoutedApp />
    </Suspense>
  );
}
