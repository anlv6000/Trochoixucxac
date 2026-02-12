import { Outlet } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <Header />
      <main className="min-h-[calc(100vh-140px)]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
