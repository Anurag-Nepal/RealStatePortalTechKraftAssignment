import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext.jsx';

import theme from './styles/theme.js';

import Navbar from './components/layout/Navbar.jsx';
import PrivateRoute from './components/layout/PrivateRoute.jsx';
import AdminRoute from './components/layout/AdminRoute.jsx';

import Home from './pages/Home.jsx';
import Properties from './pages/Properties.jsx';
import PropertyDetail from './components/properties/PropertyDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Favourites from './pages/Favourites.jsx';
import Profile from './pages/Profile.jsx';
import AdminProperties from './pages/admin/AdminProperties.jsx';
import AdminViewings from './pages/admin/AdminViewings.jsx';
import MyViewings from './pages/MyViewings.jsx';
import NotFound from './pages/NotFound.jsx';

import ErrorBoundary from './components/common/ErrorBoundary.jsx';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <div className="App">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/properties/:id" element={<PropertyDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<PrivateRoute />}>
                    <Route index element={<Profile />} />
                  </Route>
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  
                  <Route path="/dashboard" element={<PrivateRoute />}>
                    <Route index element={<Dashboard />} />
                  </Route>
                  <Route path="/favourites" element={<PrivateRoute />}>
                    <Route index element={<Favourites />} />
                  </Route>

                  <Route path="/my-viewings" element={<PrivateRoute />}>
                    <Route index element={<MyViewings />} />
                  </Route>

                  <Route path="/admin/properties" element={<AdminRoute />}>
                    <Route index element={<AdminProperties />} />
                  </Route>

                  <Route path="/admin/viewings" element={<AdminRoute />}>
                    <Route index element={<AdminViewings />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    theme: {
                      primary: '#4caf50',
                    },
                  },
                  error: {
                    duration: 5000,
                    theme: {
                      primary: '#f44336',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
