import React from 'react';
import CRUDTable from '../components/CRUDTable';

const BlogsEvents = () => {
  const fields = [
    { name: 'image_url', label: 'Image', type: 'image' },
    { name: 'title', label: 'Event Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'date', label: 'Event Date', type: 'date' },
    { name: 'posted_by', label: 'Posted By', type: 'text' },
    { name: 'created_at', label: 'Created At', type: 'date' }
  ];

  return (
    <CRUDTable 
      table="blogs_events" 
      fields={fields} 
      title="Event Blogs Management"
    />
  );
};

export default BlogsEvents;