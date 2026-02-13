import { useParams, useNavigate } from "react-router";
import { Home } from "lucide-react";
import { BaCay } from "./BaCay";
import { useUser } from "../contexts/UserContext";

export function BaCayRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const userCtx = (() => { try { return useUser(); } catch { return null; } })();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Phòng Ba Cây #{roomId}</h1>
            <p className="text-gray-300">Chơi cùng: {userCtx?.user?.username || 'Bạn'}</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/ba-cay')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600">
              <Home className="w-4 h-4" /> Rời phòng
            </button>
          </div>
        </div>

        <BaCay />
      </div>
    </div>
  );
}
