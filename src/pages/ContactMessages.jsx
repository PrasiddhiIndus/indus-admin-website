// admin/pages/ContactMessages.jsx
import React from 'react';
import EnquiryBoard from '../components/EnquiryBoard';

const ContactMessages = () => {
  return (
    <EnquiryBoard
      title="All Enquiries by Vertical"
      subtitle="View and filter enquiries by vertical so NFPA, Services, Careers, Blogs, and General enquiries are separated."
      tables={['contact_messages', 'services_contact_form']}
    />
  );
};

export default ContactMessages;
