import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar";

const Layout = () => {
  return (
    <>
      <Navbar />
      <div style={{ marginTop: "80px" }}>
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
