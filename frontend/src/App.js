import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Reviews from "./pages/Reviews";
import AdminPanel from "./pages/AdminPanel";
import Home from "./pages/Home";
import RedirectIfLoggedIn from "./components/RedirectIfLoggedIn";
import AlbumDetails from "./pages/AlbumDetails";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/reviews"
              element={
                <ProtectedRoute>
                  <Reviews />
                </ProtectedRoute>
              }
            />

            <Route
              path="/albums/:id"
              element={
                <ProtectedRoute>
                  <AlbumDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/login"
              element={
                <RedirectIfLoggedIn>
                  <Login />
                </RedirectIfLoggedIn>
              }
            />

            <Route
              path="/register"
              element={
                <RedirectIfLoggedIn>
                  <Register />
                </RedirectIfLoggedIn>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
