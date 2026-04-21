import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li>
          <Link to="/users">Users</Link>
        </li>

        <li>
          <Link to="/vessels">Vessels</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;