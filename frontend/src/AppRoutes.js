import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import Dashboard from "./pages/Dashboard";

import UserList from "./pages/Users/UserList";
import CreateUser from "./pages/Users/CreateUser";

import VesselList from "./pages/Vessels/VesselList";
import AddVessel from "./pages/Vessels/AddVessel";

import ProtectedRoute from "./components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-user"
          element={
            <ProtectedRoute>
              <CreateUser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vessels"
          element={
            <ProtectedRoute>
              <VesselList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-vessel"
          element={
            <ProtectedRoute>
              <AddVessel />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
};

export default AppRoutes;