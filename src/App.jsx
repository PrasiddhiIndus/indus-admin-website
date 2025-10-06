import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import HomeSlider from './pages/HomeSlider';
import HomeServices from './pages/HomeServices';
import ServicesManpower from './pages/ServicesManpower';
import ServicesTrucks from './pages/ServicesTrucks';
import ServicesProjects from './pages/ServicesProjects';
import ServicesProducts from './pages/ServicesProducts';
import ServicesTraining from './pages/ServicesTraining';
import ServicesRepair from './pages/ServicesRepair';
import NFPACourses from './pages/NFPACourses';
import NFPABatches from './pages/NFPABatches';
import NFPANews from './pages/NFPANews';
import Careers from './pages/Careers';
import BlogsWelcome from './pages/BlogsWelcome';
import BlogsVentures from './pages/BlogsVentures';
import BlogsEvents from './pages/BlogsEvents';
import BlogsLatest from './pages/BlogsLatest';
import BlogsInfo from './pages/BlogsInfo';
import ServiceContact from './pages/ServiceContact';
import ContactMessages from './pages/ContactMessages';
import Dashboard from './components/Dashboard';
import ProtectedLayout from './components/ProtectedLayout';

export const routeConfig = {
  '/home': { title: 'Dashboard', subtitle: 'Welcome to INDUS Admin Panel' },
  '/home/slider': { title: 'Home Slider', subtitle: 'Manage homepage slider content' },
  '/home/services': { title: 'Services Overview', subtitle: 'Manage homepage services section' },
  '/services/manpower': { title: 'Manpower Services', subtitle: 'Manage manpower service offerings' },
  '/services/trucks': { title: 'Truck Services', subtitle: 'Manage truck service offerings' },
  '/services/projects': { title: 'Project Services', subtitle: 'Manage project service offerings' },
  '/services/products': { title: 'Product Services', subtitle: 'Manage product service offerings' },
  '/services/training': { title: 'Training Services', subtitle: 'Manage training service offerings' },
  '/services/repair': { title: 'Repair & Maintenance', subtitle: 'Manage repair service offerings' },
  '/nfpa/courses': { title: 'NFPA Courses', subtitle: 'Manage NFPA course catalog' },
  '/nfpa/batches': { title: 'NFPA Batches', subtitle: 'Manage NFPA training batches' },
  '/nfpa/news': { title: 'NFPA News', subtitle: 'Manage NFPA news and updates' },
  '/careers': { title: 'Career Openings', subtitle: 'Manage job postings and opportunities' },
  '/blogs/welcome': { title: 'Welcome Images', subtitle: 'Manage welcome section images' },
  '/blogs/ventures': { title: 'Venture Blogs', subtitle: 'Manage venture-related blog posts' },
  '/blogs/events': { title: 'Event Blogs', subtitle: 'Manage event-related blog posts' },
  '/blogs/latest': { title: 'Latest Blogs', subtitle: 'Manage latest blog posts' },
  '/blogs/info': { title: 'General Information', subtitle: 'Manage general information content' },
  '/service_contact': { title: 'Service Contact Form List', subtitle: 'Manage service inquiries' },
  '/contact_messages': { title: 'Contact Messages List', subtitle: 'Manage contact inquiries' },
};

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#363636', color: '#fff' },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Dashboard />} />
          <Route path="/home/slider" element={<HomeSlider />} />
          <Route path="/home/services" element={<HomeServices />} />
          <Route path="/services/manpower" element={<ServicesManpower />} />
          <Route path="/services/trucks" element={<ServicesTrucks />} />
          <Route path="/services/projects" element={<ServicesProjects />} />
          <Route path="/services/products" element={<ServicesProducts />} />
          <Route path="/services/training" element={<ServicesTraining />} />
          <Route path="/services/repair" element={<ServicesRepair />} />
          <Route path="/nfpa/courses" element={<NFPACourses />} />
          <Route path="/nfpa/batches" element={<NFPABatches />} />
          <Route path="/nfpa/news" element={<NFPANews />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blogs/welcome" element={<BlogsWelcome />} />
          <Route path="/blogs/ventures" element={<BlogsVentures />} />
          <Route path="/blogs/events" element={<BlogsEvents />} />
          <Route path="/blogs/latest" element={<BlogsLatest />} />
          <Route path="/blogs/info" element={<BlogsInfo />} />
          <Route path="/service_contact" element={<ServiceContact />} />
          <Route path="/contact_messages" element={<ContactMessages />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
        
      </Routes>
    </Router>
  );
}

export default App;
