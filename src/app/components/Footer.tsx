import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-black/60 backdrop-blur-md border-t border-purple-500/30 py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
          <Link to="/" className="text-gray-300 hover:text-yellow-400 transition-colors">
            Luật chơi
          </Link>
          <span className="text-gray-600">|</span>
          <Link to="/" className="text-gray-300 hover:text-yellow-400 transition-colors">
            Chính sách bảo mật
          </Link>
          <span className="text-gray-600">|</span>
          <Link to="/" className="text-gray-300 hover:text-yellow-400 transition-colors">
            Hỗ trợ 24/7
          </Link>
        </div>
        <div className="text-center mt-4 text-gray-400 text-sm">
          © 2026 Casino Tài Xỉu. Chơi có trách nhiệm.
        </div>
      </div>
    </footer>
  );
}
