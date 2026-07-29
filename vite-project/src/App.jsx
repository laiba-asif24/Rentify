
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Loader from './components/Loader';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import SearchResults from './pages/SearchResults';
import ItemDetail from './pages/ItemDetail';
import AddItem from './pages/AddItem';
import Dashboard from './pages/Dashboard';
import Agreement from './pages/Agreement';
import { Box } from '@mui/material';

function AppContent() {
  const location = useLocation();
  const noNavbarPages = ['/login', '/register', '/dashboard'];
  const showNavbar = !noNavbarPages.includes(location.pathname);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      setShowLoader(false);
    }, 2700);
    return () => clearTimeout(loaderTimer);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const hashId = location.hash.replace('#', '');
      const tryScroll = (attempt = 0) => {
        const el = document.getElementById(hashId);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        } else if (attempt < 10) {
          setTimeout(() => tryScroll(attempt + 1), 100);
        }
      };
      tryScroll();
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash, showLoader]);

  return (
    <>
      {showLoader && <Loader />}
      {showNavbar && <Navbar />}
      <Box className="animated-bg" sx={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        padding: 0,
        margin: 0,
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agreement/:bookingId" element={<Agreement />} />
        </Routes>
      </Box>
      {showNavbar && <Footer />}
      {showNavbar && <ScrollToTop />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;