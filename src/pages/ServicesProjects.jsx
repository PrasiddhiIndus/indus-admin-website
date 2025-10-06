import React from 'react';
import CRUDTable from '../components/CRUDTable';

const ServicesProjects = () => {
  const fields = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'image_url', label: 'Image', type: 'image' },
    { name: 'created_at', label: 'Created At', type: 'date' }
  ];

  return (
    <CRUDTable 
      table="services_projects" 
      fields={fields} 
      title="Project Services"
    />
  );
};

export default ServicesProjects;