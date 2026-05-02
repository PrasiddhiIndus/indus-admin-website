import React from 'react';
import EnquiryBoard from '../components/EnquiryBoard';

const NFPAEnquiries = () => {
  return (
    <EnquiryBoard
      title="NFPA Enquiries"
      subtitle="All enquiries coming from NFPA-related pages and requests are grouped here."
      tables={['nfpa_enquiry_hits', 'contact_messages', 'services_contact_form', 'notification_logs']}
      limitToVertical="NFPA"
    />
  );
};

export default NFPAEnquiries;
