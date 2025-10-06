// admin/pages/ContactMessages.jsx
import React from 'react';
import CRUDTable from '../components/CRUDTable';

const ContactMessages = () => {
  const fields = [
    { name: 'full_name', label: 'Full Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'message', label: 'Message', type: 'textarea' },
    { name: 'created_at', label: 'Submitted At', type: 'datetime' },
  ];

  return (
    <CRUDTable
      table="contact_messages"
      fields={fields}
      title="Contact Messages Form List"
      readOnly 
    />
  );
};

export default ContactMessages;
