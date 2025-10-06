import React from 'react';
import CRUDTable from '../components/CRUDTable';

const HomeServices = () => {
  const fields = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'created_at', label: 'Created At', type: 'date' }
  ];

  return (
    <CRUDTable 
      table="services_home" 
      fields={fields} 
      title="Home Services Overview"
    />
  );
};

export default HomeServices;