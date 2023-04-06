import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/home/Home";
import Overview from "./pages/home/HomeOverview";
import Tile from "./pages/home/HomeTile";
import "./styles.css";
import useBackendEvents from "./store/useBackendEvents";
import SettingsPage from "./pages/settings/settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Home>
        <Overview />
      </Home>
    ),
  },
  {
    path: "/tiles/:id",
    element: (
      <Home>
        <Tile />
      </Home>
    ),
  },
  {
    path: "/settings",
    element: <SettingsPage />,
  },
]);

function App() {
  useBackendEvents();
  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
