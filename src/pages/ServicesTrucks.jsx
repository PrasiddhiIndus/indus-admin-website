import React from 'react';
import CRUDTable from '../components/CRUDTable';

const ServicesTrucks = () => {
  const fields = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'image_url', label: 'Image', type: 'image' },
    { name: 'created_at', label: 'Created At', type: 'date' }
  ];

  return (
    <CRUDTable 
      table="services_trucks" 
      fields={fields} 
      title="Truck Services"
    />
  );
};

export default ServicesTrucks;