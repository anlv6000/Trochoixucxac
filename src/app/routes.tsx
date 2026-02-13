import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { TaiXiu } from "./pages/TaiXiu";
import { LuckyWheel } from "./pages/LuckyWheel";
import { Deposit } from "./pages/Deposit";
import { Withdraw } from "./pages/Withdraw";
import { BlackjackLobby } from "./pages/BlackjackLobby";
import { BlackjackRoom } from "./pages/BlackjackRoom";
import { BaCay } from "./pages/BaCay";
import { BaCayLobby } from "./pages/BaCayLobby";
import { BaCayRoom } from "./pages/BaCayRoom";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "profile", Component: Profile },
      { path: "tai-xiu", Component: TaiXiu },
      { path: "lucky-wheel", Component: LuckyWheel },
      { path: "deposit", Component: Deposit },
      { path: "withdraw", Component: Withdraw },
      { path: "blackjack", Component: BlackjackLobby },
      { path: "blackjack/room/:roomId", Component: BlackjackRoom },
      { path: "ba-cay", Component: BaCayLobby },
      { path: "ba-cay/room/:roomId", Component: BaCayRoom },
      { path: "ba-cay/single", Component: BaCay },
    ],
  },
]);