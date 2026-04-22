// src/layouts/EmployeeLayout.jsx

import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";

const EmployeeLayout = () => {
  return (
    <div className="employee-layout">
      <Sidebar role="employee" />
      <main className="employee-content">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeLayout;