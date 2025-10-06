import React from 'react';
import CRUDTable from '../components/CRUDTable';

const BlogsVentures = () => {
  const fields = [
    { name: 'image_url', label: 'Image', type: 'image' },
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'posted_by', label: 'Posted By', type: 'text' },
    { name: 'created_at', label: 'Created At', type: 'date' }
  ];

  return (
    <CRUDTable 
      table="blogs_ventures" 
      fields={fields} 
      title="Venture Blogs Management"
    />
  );
};

export default BlogsVentures;