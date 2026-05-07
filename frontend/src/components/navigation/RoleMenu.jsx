// src/components/navigation/RoleMenu.jsx

import { NavLink } from "react-router-dom";

const RoleMenu = ({ menuItems }) => {
  return (
    <nav className="role-menu">
      <ul>
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default RoleMenu;