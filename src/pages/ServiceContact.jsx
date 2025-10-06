import React from 'react';
import CRUDTable from '../components/CRUDTable';

const ServiceContact = () => {
  const fields = [
    { name: 'full_name', label: 'Full Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'company', label: 'Company', type: 'text' },
    { name: 'message', label: 'Message', type: 'textarea' },
    { name: 'created_at', label: 'Submitted At', type: 'datetime' },
  ];

  return (
    <CRUDTable
      table="services_contact_form"
      fields={fields}
      title="Service Contact Form Submissions"
      readOnly 
    />
  );
};

export default ServiceContact;
