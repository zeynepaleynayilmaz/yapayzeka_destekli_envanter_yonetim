import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Envanter } from "./Envanter.jsx";

import { Login } from "./login.jsx";
import { Signup } from "./signup.jsx";
import Profilim from './profilim.jsx';  
import { Ayarlar } from './ayarlar.jsx';
import YapayZekaPage from "./yapayzeka.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/profilim",
    element: <Profilim />,
  },
  {
    path: "/envanter",
    element: <Envanter />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/ayarlar",
    element: <Ayarlar />,
  },
  {
    path: "/chatbox",
    element: <YapayZekaPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
