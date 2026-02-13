import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import api from "../api";
import { Users, Plus, Home, Lock, Unlock, Search } from "lucide-react";

interface Room {
  _id: string;
  name: string;
  players: Array<any>;
  maxPlayers: number;
  minBet: number;
  isPrivate: boolean;
  status: "waiting" | "playing";
}

export function BlackjackLobby() {
  const navigate = useNavigate();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock rooms data
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  const [newRoom, setNewRoom] = useState({
    name: "",
    maxPlayers: 6,
    minBet: 5000,
    isPrivate: false,
  });

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRoom = () => {
    if (!newRoom.name.trim()) {
      alert("Vui lòng nhập tên phòng!");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await api.blackjackrooms.create({
          name: newRoom.name,
          maxPlayers: newRoom.maxPlayers,
          minBet: newRoom.minBet,
          isPrivate: newRoom.isPrivate,
        });
        setRooms((s) => [res, ...s]);
        setShowCreateRoom(false);
        setNewRoom({ name: "", maxPlayers: 6, minBet: 5000, isPrivate: false });
        navigate(`/blackjack/room/${res._id}`);
      } catch (e: any) {
        alert(e.message || 'Failed to create room');
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleJoinRoom = (roomId: string) => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.blackjackrooms.join(roomId);
        navigate(`/blackjack/room/${res._id}`);
      } catch (e: any) {
        alert(e.message || 'Không thể vào phòng');
      } finally {
        setLoading(false);
      }
    })();
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const list = await api.blackjackrooms.list();
        if (!mounted) return;
        setRooms(list);
      } catch (e: any) {
        console.error('Failed to load rooms', e);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Blackjack - Tìm phòng
            </h1>
            <p className="text-gray-300">Tham gia hoặc tạo phòng để chơi với nhiều người</p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-all"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setShowCreateRoom(true)}
            className="flex items-center justify-center gap-3 px-8 py-6 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/50 font-bold text-xl"
          >
            <Plus className="w-6 h-6" />
            Tạo phòng mới
          </button>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white text-lg"
            />
          </div>
        </div>

        {/* Room List */}
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-yellow-400" />
            Danh sách phòng ({filteredRooms.length})
          </h2>

          {filteredRooms.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Không tìm thấy phòng nào. Hãy tạo phòng mới!
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRooms.map((room) => (
                <div
                  key={room._id}
                  className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border-2 transition-all ${
                    room.status === "waiting"
                      ? "border-green-500/30 hover:border-green-500/60 hover:bg-white/10"
                      : "border-orange-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{room.name}</h3>
                        {room.isPrivate && (
                          <div className="flex items-center gap-1 bg-purple-500/20 px-3 py-1 rounded-full text-sm">
                            <Lock className="w-4 h-4" />
                            <span>Riêng tư</span>
                          </div>
                        )}
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            room.status === "waiting"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-orange-500/20 text-orange-400"
                          }`}
                        >
                          {room.status === "waiting" ? "Đang chờ" : "Đang chơi"}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span>
                            {room.players.length}/{room.maxPlayers} người
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">💰</span>
                          <span>Cược tối thiểu: {room.minBet.toLocaleString('vi-VN')} VNĐ</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoinRoom(room._id)}
                      disabled={room.players.length >= room.maxPlayers || room.status === "playing"}
                      className={`px-8 py-3 rounded-xl font-bold transition-all ${
                        room.players.length >= room.maxPlayers || room.status === "playing"
                          ? "bg-gray-600 cursor-not-allowed opacity-50"
                          : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg shadow-blue-500/50"
                      }`}
                    >
                      {room.players.length >= room.maxPlayers
                        ? "Đầy"
                        : room.status === "playing"
                        ? "Đang chơi"
                        : "Vào phòng"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateRoom(false)}
        >
          <div
            className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl rounded-3xl p-8 border-2 border-green-400 shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold mb-6 text-center">Tạo phòng mới</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên phòng</label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="Nhập tên phòng..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 text-white"
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Số người chơi tối đa ({newRoom.maxPlayers})
                </label>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={newRoom.maxPlayers}
                  onChange={(e) => setNewRoom({ ...newRoom, maxPlayers: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>2 người</span>
                  <span>6 người</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cược tối thiểu</label>
                <select
                  value={newRoom.minBet}
                  onChange={(e) => setNewRoom({ ...newRoom, minBet: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 text-white"
                >
                  <option value={1000}>1.000 VNĐ</option>
                  <option value={5000}>5.000 VNĐ</option>
                  <option value={10000}>10.000 VNĐ</option>
                  <option value={50000}>50.000 VNĐ</option>
                  <option value={100000}>100.000 VNĐ</option>
                </select>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl">
                <input
                  type="checkbox"
                  id="private"
                  checked={newRoom.isPrivate}
                  onChange={(e) => setNewRoom({ ...newRoom, isPrivate: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                  {newRoom.isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  <span>Phòng riêng tư</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowCreateRoom(false)}
                className="px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-all font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateRoom}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/50 font-bold"
              >
                Tạo phòng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
