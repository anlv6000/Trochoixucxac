import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, LogIn } from "lucide-react";
import api, { setAuthToken } from "../api";
import { useUser } from "../contexts/UserContext";

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const { setUser, setBalance } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        const res = await api.auth.login(formData.username, formData.password);
        if (res.token) {
          setAuthToken(res.token);
          // update global user context
          try {
            setUser(res.user);
            setBalance(res.user?.balance || 0);
          } catch (e) {
            localStorage.setItem('user', JSON.stringify(res.user));
          }
          navigate('/profile');
        }
      } catch (err: any) {
        alert(err.message || 'Login failed');
      }
    })();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-blue-500/50 shadow-2xl shadow-blue-500/30">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/50">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Đăng nhập</h1>
            <p className="text-gray-300">Chào mừng trở lại!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">
                Tên đăng nhập hoặc Email
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-gray-400 transition-all"
                placeholder="Nhập tên đăng nhập hoặc email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-gray-400 transition-all"
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-400 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-white/10"
                />
                <span className="text-gray-300">Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 font-bold text-lg transform hover:scale-105"
            >
              Đăng nhập
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-gray-400 hover:text-gray-300 text-sm transition-colors">
              ← Trở về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
