import React from 'react';
import CRUDTable from '../components/CRUDTable';

const Careers = () => {
  const fields = [
    { name: 'position', label: 'Position', type: 'text', required: true },
    { name: 'department', label: 'Department', type: 'text', required: true },
    { name: 'description', label: 'Job Description', type: 'textarea' },

    {
      name: 'work_type',
      label: 'Work Type',
      type: 'select',
      options: [
        { value: 'full-time', label: 'Full Time' },
        { value: 'part-time', label: 'Part Time' },
        { value: 'contract', label: 'Contract' },
        { value: 'internship', label: 'Internship' }
      ]
    },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'experience', label: 'Required Experience', type: 'text' },
    { name: 'created_at', label: 'Created At', type: 'date' }
  ];

  return (
    <CRUDTable
      table="careers"
      fields={fields}
      title="Career Openings Management"
    />
  );
};

export default Careers;