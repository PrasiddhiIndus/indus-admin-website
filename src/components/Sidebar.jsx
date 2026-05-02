import React, { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, Home, Settings, Users, Mail, MessageSquare, Truck, BookOpen, Briefcase, FileText, Award, Calendar, Newspaper as News, Image, MapPin, Wrench, Package, Bell } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
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
        { title: 'News', path: '/nfpa/news', icon: News },
        { title: 'Enquiries', path: '/nfpa/enquiries', icon: MessageSquare }
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
    {
      title: 'Notifications',
      path: '/notifications',
      icon: Bell,
      single: true
    },

  ];

  const autoExpandedMenus = useMemo(() => {
    const expanded = {};
    menuItems.forEach((item) => {
      if (item.children?.some((child) => child.path === location.pathname)) {
        expanded[item.key] = true;
      }
    });
    return expanded;
  }, [location.pathname]);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-white border-r border-slate-800 shadow-xl shadow-slate-900/20">
      <div className="px-6 py-7 border-b border-slate-800">
        <h1 className="text-xl font-semibold tracking-wide text-slate-100">INDUS Admin</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-[0.16em]">Content Management</p>
      </div>

      <nav className="mt-5 px-3 pb-6">
        {menuItems.map((item) => (
          <div key={item.key || item.path} className="mb-1.5">
            {item.single ? (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${isActive
                    ? 'bg-blue-600/90 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.title}
              </NavLink>
            ) : (
              <>
                <button
                  onClick={() => toggleMenu(item.key)}
                  className="flex items-center justify-between w-full rounded-lg px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.title}
                  </div>
                  {(expandedMenus[item.key] ?? autoExpandedMenus[item.key]) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {(expandedMenus[item.key] ?? autoExpandedMenus[item.key]) && (
                  <div className="mt-1 space-y-1 border-l border-slate-700/70 ml-5 pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `flex items-center rounded-md px-3 py-2 text-sm transition-colors duration-200 ${isActive
                            ? 'bg-blue-600/85 text-white'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
    </aside>
  );
};

export default Sidebar;