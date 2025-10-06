import React from 'react';
import CRUDTable from '../components/CRUDTable';

const NFPACourses = () => {
  const fields = [
  { name: 'title', label: 'Course Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'duration', label: 'Duration', type: 'text' },
  { name: 'start_date', label: 'Start Date', type: 'date' },
  { name: 'end_date', label: 'End Date', type: 'date' },
  { name: 'points', label: 'Key Points', type: 'jsonb' }, 
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Coming Soon', value: 'coming_soon' },
    ],
  },
  { name: 'created_at', label: 'Created At', type: 'date' }
];


  return (
    <CRUDTable 
      table="nfpa_courses" 
      fields={fields} 
      title="NFPA Courses Management"
    />
  );
};

export default NFPACourses;