import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Users, Plus, Home, Lock, Unlock, Search } from "lucide-react";

interface Room {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  minBet: number;
  isPrivate: boolean;
  status: "waiting" | "playing";
}

export function BaCayLobby() {
  const navigate = useNavigate();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState<Room[]>([
    { id: "1", name: "Phòng Ba Cây VIP", players: 2, maxPlayers: 4, minBet: 50000, isPrivate: false, status: "waiting" },
    { id: "2", name: "Phòng Ba Cây Nhanh", players: 4, maxPlayers: 6, minBet: 5000, isPrivate: false, status: "waiting" },
  ]);

  const [newRoom, setNewRoom] = useState({ name: "", maxPlayers: 4, minBet: 5000, isPrivate: false });

  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreateRoom = () => {
    if (!newRoom.name.trim()) { alert('Vui lòng nhập tên phòng!'); return; }
    const room: Room = { id: Date.now().toString(), name: newRoom.name, players: 1, maxPlayers: newRoom.maxPlayers, minBet: newRoom.minBet, isPrivate: newRoom.isPrivate, status: 'waiting' };
    setRooms([room, ...rooms]); setShowCreateRoom(false); setNewRoom({ name: '', maxPlayers: 4, minBet: 5000, isPrivate: false });
    navigate(`/ba-cay/room/${room.id}`);
  };

  const handleJoinRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId); if (!room) return;
    if (room.status === 'playing') { alert('Phòng đang chơi, vui lòng đợi!'); return; }
    if (room.players >= room.maxPlayers) { alert('Phòng đã đầy!'); return; }
    navigate(`/ba-cay/room/${roomId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Ba Cây - Tìm phòng</h1>
            <p className="text-gray-300">Tham gia hoặc tạo phòng Ba Cây</p>
          </div>
          <Link to="/" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-all"><Home className="w-5 h-5"/>Về trang chủ</Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button onClick={() => setShowCreateRoom(true)} className="flex items-center justify-center gap-3 px-8 py-6 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 font-bold text-xl"><Plus className="w-6 h-6"/>Tạo phòng mới</button>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Tìm kiếm phòng..." className="w-full pl-12 pr-4 py-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-white text-lg" />
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users className="w-6 h-6 text-yellow-400"/> Danh sách phòng ({filteredRooms.length})</h2>
          {filteredRooms.length===0 ? (<div className="text-center py-12 text-gray-400">Không tìm thấy phòng</div>) : (
            <div className="grid gap-4">{filteredRooms.map(room => (
              <div key={room.id} className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border-2 ${room.status==='waiting' ? 'border-green-500/30' : 'border-orange-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{room.name}</h3>
                    <div className="text-sm text-gray-300">{room.players}/{room.maxPlayers} người • Cược tối thiểu {room.minBet.toLocaleString('vi-VN')} VNĐ</div>
                  </div>
                  <button onClick={()=>handleJoinRoom(room.id)} className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 font-bold">Vào phòng</button>
                </div>
              </div>
            ))}</div>
          )}
        </div>
      </div>

      {showCreateRoom && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=>setShowCreateRoom(false)}>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border-2 border-green-400 shadow-2xl max-w-md w-full" onClick={(e)=>e.stopPropagation()}>
            <h2 className="text-3xl font-bold mb-6">Tạo phòng mới</h2>
            <div className="space-y-4">
              <input value={newRoom.name} onChange={(e)=>setNewRoom({...newRoom, name: e.target.value})} placeholder="Tên phòng" className="w-full px-4 py-3 rounded-xl bg-white/10 text-white" />
              <div>
                <label className="block text-sm mb-2">Số người tối đa ({newRoom.maxPlayers})</label>
                <input type="range" min={2} max={6} value={newRoom.maxPlayers} onChange={(e)=>setNewRoom({...newRoom, maxPlayers: Number(e.target.value)})} className="w-full" />
              </div>
              <div>
                <label className="block text-sm mb-2">Cược tối thiểu</label>
                <select value={newRoom.minBet} onChange={(e)=>setNewRoom({...newRoom, minBet: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-white/10 text-white">
                  <option value={1000}>1.000 VNĐ</option>
                  <option value={5000}>5.000 VNĐ</option>
                  <option value={10000}>10.000 VNĐ</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={()=>setShowCreateRoom(false)} className="px-6 py-3 rounded-xl bg-gray-700">Hủy</button>
              <button onClick={handleCreateRoom} className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600">Tạo phòng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
