import { useState } from "react";
import { Link, useNavigate } from "react-router";
import api, { setAuthToken } from "../api";
import { useUser } from "../contexts/UserContext";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { setUser, setBalance } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock registration - in real app, would call API
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }
    (async () => {
      try {
        const res = await api.auth.register(formData.username, formData.password);
        if (res.token) {
          setAuthToken(res.token);
          try { setUser(res.user); setBalance(res.user?.balance || 0); } catch (e) { localStorage.setItem('user', JSON.stringify(res.user)); }
          navigate('/profile');
        }
      } catch (err: any) {
        alert(err.message || 'Register failed');
      }
    })();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border-2 border-blue-500/50 shadow-2xl shadow-blue-500/30">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4 shadow-lg shadow-yellow-500/50">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Đăng ký</h1>
            <p className="text-gray-300">Tạo tài khoản mới ngay!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-gray-400 transition-all"
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-gray-400 transition-all"
                placeholder="Nhập email"
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
                  minLength={6}
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

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder-gray-400 transition-all"
                  placeholder="Nhập lại mật khẩu"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 mt-1 rounded border-gray-400 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-white/10"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-300">
                Tôi đồng ý với{" "}
                <Link to="/" className="text-blue-400 hover:text-blue-300">
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link to="/" className="text-blue-400 hover:text-blue-300">
                  Chính sách bảo mật
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70 font-bold text-lg text-black transform hover:scale-105"
            >
              Đăng ký ngay
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                Đăng nhập
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
