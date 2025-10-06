import React from 'react';
import CRUDTable from '../components/CRUDTable';

const BlogsLatest = () => {
  const fields = [
    { name: 'image_url', label: 'Image', type: 'image' },
    { name: 'title', label: 'Blog Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'date', label: 'Publish Date', type: 'date' },
    { name: 'posted_by', label: 'Author', type: 'text' },
    { name: 'read_time', label: 'Read Time', type: 'text' },
    { name: 'created_at', label: 'Created At', type: 'date' }
  ];

  return (
    <CRUDTable 
      table="blogs_latest" 
      fields={fields} 
      title="Latest Blogs Management"
    />
  );
};

export default BlogsLatest;