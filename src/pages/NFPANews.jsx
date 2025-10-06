import React from 'react';
import CRUDTable from '../components/CRUDTable';

const NFPANews = () => {
  const fields = [
    { name: 'title', label: 'News Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'news_date', label: 'News Date', type: 'date' },
    { name: 'created_at', label: 'Created At', type: 'date' }
  ];

  return (
    <CRUDTable 
      table="nfpa_news" 
      fields={fields} 
      title="NFPA News Management"
    />
  );
};

export default NFPANews;