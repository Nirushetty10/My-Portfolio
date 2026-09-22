import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import theme from './theme/theme';
import Navbar from './components/Navbar/Navbar';
import PageTransition from './components/PageTransition/PageTransition';
import ScrollProgress from './components/ScrollProgress/ScrollProgress';
import Home from './pages/Home/Home';
import ProjectDetails from './pages/ProjectDetails/ProjectDetails';
import { useLenis } from './hooks/useLenis';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/work/:slug" element={<PageTransition><ProjectDetails /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  useLenis();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <ScrollProgress />
        <Navbar />
        <AnimatedRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
