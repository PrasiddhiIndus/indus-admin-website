import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight, Home, Settings, Users, Mail, MessageSquare, Truck, BookOpen, Briefcase, FileText, Award, Calendar, Newspaper as News, Image, MapPin, Wrench, Package } from 'lucide-react';

const Sidebar = () => {
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/home',
      icon: Home,
      single: true
    },
    {
      title: 'Home',
      icon: Home,
      key: 'home',
      children: [
        { title: 'Slider Section', path: '/home/slider', icon: Image },
        { title: 'Services Overview', path: '/home/services', icon: Settings }
      ]
    },
    {
      title: 'Services',
      icon: Settings,
      key: 'services',
      children: [
        { title: 'Manpower', path: '/services/manpower', icon: Users },
        { title: 'Trucks', path: '/services/trucks', icon: Truck },
        { title: 'Projects', path: '/services/projects', icon: MapPin },
        { title: 'Products', path: '/services/products', icon: Package },
        { title: 'Training', path: '/services/training', icon: BookOpen },
        { title: 'Repair & Maintenance', path: '/services/repair', icon: Wrench }
      ]
    },
    {
      title: 'NFPA',
      icon: Award,
      key: 'nfpa',
      children: [
        { title: 'Courses', path: '/nfpa/courses', icon: BookOpen },
        { title: 'Batches', path: '/nfpa/batches', icon: Calendar },
        { title: 'News', path: '/nfpa/news', icon: News }
      ]
    },
    {
      title: 'Careers',
      path: '/careers',
      icon: Briefcase,
      single: true
    },
    {
      title: 'Blogs',
      icon: FileText,
      key: 'blogs',
      children: [
        { title: 'Welcome', path: '/blogs/welcome', icon: Image },
        { title: 'Ventures', path: '/blogs/ventures', icon: FileText },
        { title: 'Events', path: '/blogs/events', icon: Calendar },
        { title: 'Latest Blogs', path: '/blogs/latest', icon: News },
        { title: 'General Info', path: '/blogs/info', icon: FileText }
      ]
    },
    {
      title: 'Services Contacts ',
      path: '/service_contact',
      icon: Mail,
      single: true
    },
    {
      title: 'Contact Messages ',
      path: '/contact_messages',
      icon: MessageSquare,
      single: true
    },

  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">INDUS Admin</h1>
        <p className="text-sm text-gray-400 mt-1">Content Management</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => (
          <div key={item.key || item.path} className="mb-1">
            {item.single ? (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 text-sm transition-colors duration-200 ${isActive
                    ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.title}
              </NavLink>
            ) : (
              <>
                <button
                  onClick={() => toggleMenu(item.key)}
                  className="flex items-center justify-between w-full px-6 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.title}
                  </div>
                  {expandedMenus[item.key] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {expandedMenus[item.key] && (
                  <div className="bg-gray-800">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `flex items-center px-12 py-2 text-sm transition-colors duration-200 ${isActive
                            ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                          }`
                        }
                      >
                        <child.icon className="w-4 h-4 mr-3" />
                        {child.title}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;