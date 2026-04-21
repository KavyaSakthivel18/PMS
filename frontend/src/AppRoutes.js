import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import Dashboard from "./pages/Dashboard";

import UserList from "./pages/Users/UserList";
import CreateUser from "./pages/Users/CreateUser";

import VesselList from "./pages/Vessels/VesselList";
import AddVessel from "./pages/Vessels/AddVessel";

import BookingList from "./pages/Bookings/BookingList";
import CreateBooking from "./pages/Bookings/CreateBooking";

import ContainerList from "./pages/Containers/ContainerList";
import AddContainer from "./pages/Containers/AddContainer";
import ContainerDetails from "./pages/Containers/ContainerDetails";

import DeclarationList from "./pages/Customs/DeclarationList";
import FileDeclaration from "./pages/Customs/FileDeclaration";

import FeeDetails from "./pages/Fees/FeeDetails";
import Invoice from "./pages/Fees/Invoice";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Wraps a page in both auth guard + layout shell
const ProtectedPage = ({ children }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected — all wrapped in Layout */}
        <Route path="/dashboard"        element={<ProtectedPage><Dashboard /></ProtectedPage>} />

        {/* Users */}
        <Route path="/users"            element={<ProtectedPage><UserList /></ProtectedPage>} />
        <Route path="/create-user"      element={<ProtectedPage><CreateUser /></ProtectedPage>} />

        {/* Vessels */}
        <Route path="/vessels"          element={<ProtectedPage><VesselList /></ProtectedPage>} />
        <Route path="/add-vessel"       element={<ProtectedPage><AddVessel /></ProtectedPage>} />

        {/* Bookings */}
        <Route path="/bookings"         element={<ProtectedPage><BookingList /></ProtectedPage>} />
        <Route path="/create-booking"   element={<ProtectedPage><CreateBooking /></ProtectedPage>} />

        {/* Containers */}
        <Route path="/containers"       element={<ProtectedPage><ContainerList /></ProtectedPage>} />
        <Route path="/add-container"    element={<ProtectedPage><AddContainer /></ProtectedPage>} />
        <Route path="/containers/:id"   element={<ProtectedPage><ContainerDetails /></ProtectedPage>} />

        {/* Customs */}
        <Route path="/customs"          element={<ProtectedPage><DeclarationList /></ProtectedPage>} />
        <Route path="/file-declaration" element={<ProtectedPage><FileDeclaration /></ProtectedPage>} />

        {/* Fees */}
        <Route path="/fees/:containerId"     element={<ProtectedPage><FeeDetails /></ProtectedPage>} />
        <Route path="/invoice/:containerId"  element={<ProtectedPage><Invoice /></ProtectedPage>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;