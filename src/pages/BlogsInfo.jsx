import React from 'react';
import CRUDTable from '../components/CRUDTable';

const BlogsInfo = () => {

  const fields = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'author', label: 'Author', type: 'text' },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
    { name: 'image', label: 'Image', type: 'image' },
    { name: 'category', label: 'Category', type: 'text' }
  ];

  return (
    <CRUDTable 
      table="blogs_info" 
      fields={fields} 
      title="General Information Management"
    />
  );
};

export default BlogsInfo;