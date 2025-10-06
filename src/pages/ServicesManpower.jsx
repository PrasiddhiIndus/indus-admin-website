import React from 'react';
import CRUDTable from '../components/CRUDTable';

const ServicesManpower = () => {
  const fields = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'image_url', label: 'Image', type: 'image', required: true }, // user pastes the URL
    { name: 'created_at', label: 'Created At', type: 'date' }
  ];

  return (
    <CRUDTable 
      table="services_manpower" 
      fields={fields} 
      title="Manpower Services"
    />
  );
};

export default ServicesManpower;