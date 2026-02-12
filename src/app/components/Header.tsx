import { Link, useNavigate } from "react-router";
import { Dices, User, Wallet, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";

export function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Real authentication state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState<any>(null);

  const { user: ctxUser, balance: ctxBalance, logout } = useUser();
  useEffect(() => {
    if (ctxUser) {
      setIsAuthenticated(true);
      setUser(ctxUser);
      setBalance(ctxBalance || 0);
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setBalance(0);
    }
  }, [ctxUser, ctxBalance]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-black/40 backdrop-blur-md border-b border-purple-500/30 shadow-lg shadow-purple-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/50 group-hover:shadow-yellow-500/70 transition-all">
              <Dices className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-xl bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                CASINO TÀI XỈU
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {isAuthenticated && (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full shadow-lg shadow-green-500/50">
                    <Wallet className="w-4 h-4" />
                    <span className="font-bold">{balance.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <Link to="/lucky-wheel" className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70">Vòng quay may mắn</Link>
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-all">
                    <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.username || 'player')}`} alt="avatar" className="w-6 h-6 rounded-full" />
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-500/50 hover:shadow-red-500/70">
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </>
              )}
            {!isAuthenticated && (
              <>
                <Link to="/login" className="px-6 py-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-all">Đăng nhập</Link>
                <Link to="/register" className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70 font-bold text-black">Đăng ký</Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
            {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 flex flex-col gap-3 border-t border-purple-500/30 pt-4">
            {isAuthenticated && (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full shadow-lg shadow-green-500/50">
                  <Wallet className="w-4 h-4" />
                  <span className="font-bold">{balance.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <Link to="/lucky-wheel" className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/50 text-center" onClick={() => setMobileMenuOpen(false)}>Vòng quay may mắn</Link>
                <Link to="/profile" className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-all" onClick={() => setMobileMenuOpen(false)}>
                  <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.username || 'player')}`} alt="avatar" className="w-6 h-6 rounded-full" />
                </Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-500/50">
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login" className="px-6 py-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-all text-center" onClick={() => setMobileMenuOpen(false)}>Đăng nhập</Link>
                <Link to="/register" className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg shadow-yellow-500/50 font-bold text-black text-center" onClick={() => setMobileMenuOpen(false)}>Đăng ký</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
