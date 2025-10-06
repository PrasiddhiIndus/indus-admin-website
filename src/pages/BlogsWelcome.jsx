import React from 'react';
import CRUDTable from '../components/CRUDTable';

const BlogsWelcome = () => {
  const fields = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text', required: true },
    { name: 'image_url', label: 'Welcome Image', type: 'image', required: true },
    { name: 'created_at', label: 'Created At', type: 'date' }
  ];

  return (
    <CRUDTable 
      table="blogs_welcome" 
      fields={fields} 
      title="Welcome Blog Images"
    />
  );
};

export default BlogsWelcome;