// src/components/navigation/Sidebar.jsx

import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { adminMenu, employeeMenu } from "../../utils/menuConfig";
import RoleMenu from "./RoleMenu";

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const menuItems = role === "admin" ? adminMenu : employeeMenu;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate(PATHS.home);
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">BarberSoft</h2>
      <RoleMenu menuItems={menuItems} />
      <button className="logout-button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </aside>
  );
};

export default Sidebar;