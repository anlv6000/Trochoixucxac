import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { TaiXiu } from "./pages/TaiXiu";
import { LuckyWheel } from "./pages/LuckyWheel";
import { Deposit } from "./pages/Deposit";
import { Withdraw } from "./pages/Withdraw";
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
    ],
  },
]);
