import React from 'react';
import EnquiryBoard from '../components/EnquiryBoard';

const ServiceContact = () => {
  return (
    <EnquiryBoard
      title="Service Enquiries"
      subtitle="Service enquiries are automatically grouped by vertical such as Manpower, Trucks, Projects, Products, Training, and Repair."
      tables={['services_contact_form']}
      limitToVertical="Services"
    />
  );
};

export default ServiceContact;
