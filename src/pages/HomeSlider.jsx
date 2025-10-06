import React from 'react';
import CRUDTable from '../components/CRUDTable';

const HomeSlider = () => {
  const fields = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'video_url', label: 'Video URL', type: 'url' },
    { name: 'created_at', label: 'Created At', type: 'date' }
  ];

  return (
    <CRUDTable
      table="slider_section"
      fields={fields}
      title="Home Slider Management"
    />
  );
};

export default HomeSlider;