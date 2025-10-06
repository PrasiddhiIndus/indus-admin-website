import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Truck,
  Calendar,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react';
import { fetchData } from '../utils/apiHelpers';

const Dashboard = () => {
  const [stats, setStats] = useState({
    sliders: 0,
    services: 0,
    courses: 0,
    careers: 0,
    blogs: 0,
    services_contact_form: 0

  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [sliders, services, courses, careers, blogs, services_contact_form] = await Promise.all([
        fetchData('slider_section'),
        fetchData('services_manpower'),
        fetchData('nfpa_courses'),
        fetchData('careers'),
        fetchData('blogs_latest'),

      ]);

      setStats({
        sliders: sliders.length,
        services: services.length,
        courses: courses.length,
        careers: careers.length,
        blogs: blogs.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Home Sliders',
      value: stats.sliders,
      icon: FileText,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Services',
      value: stats.services,
      icon: Truck,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'NFPA Courses',
      value: stats.courses,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+15%'
    },
    {
      title: 'Career Openings',
      value: stats.careers,
      icon: Users,
      color: 'bg-amber-500',
      change: '+5%'
    },

  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div id='home' className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-sm text-green-600 mt-1">
                  <span className="inline-flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {card.change}
                  </span>
                </p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">New service added to Manpower section</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">NFPA course updated</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm text-gray-600">New career opening posted</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Blog post published</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-green-500" />
            Content Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Blogs</span>
              <span className="text-sm font-medium text-gray-900">{stats.blogs}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Courses</span>
              <span className="text-sm font-medium text-gray-900">{stats.courses}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Service Categories</span>
              <span className="text-sm font-medium text-gray-900">6</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Entries</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.sliders + stats.services + stats.courses + stats.careers + stats.blogs}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Add Slider</span>
          </button>
          <button className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <Truck className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Add Service</span>
          </button>
          <button className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <Calendar className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Add Course</span>
          </button>
          <button className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors">
            <Users className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Add Career</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;