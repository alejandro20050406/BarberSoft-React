// src/layouts/AdminLayout.jsx

import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <Sidebar role="admin" />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;