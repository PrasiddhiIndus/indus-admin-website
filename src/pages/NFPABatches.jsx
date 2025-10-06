// import React from 'react';
// import CRUDTable from '../components/CRUDTable';

// const NFPABatches = () => {
//   const fields = [
//     { name: 'start_date', label: 'Start Date', type: 'date', required: true },
//     { name: 'end_date', label: 'End Date', type: 'date', required: true },
//     { name: 'location', label: 'Location', type: 'text', required: true },
//     { name: 'seats', label: 'Available Seats', type: 'number' },
//     { name: 'instructor', label: 'Instructor', type: 'text' },
//     { 
//       name: 'status', 
//       label: 'Status', 
//       type: 'select',
//       options: [
//         { value: 'upcoming', label: 'Upcoming' },
//         { value: 'ongoing', label: 'Ongoing' },
//         { value: 'completed', label: 'Completed' },
//         { value: 'cancelled', label: 'Cancelled' }
//       ]
//     },
//     { name: 'created_at', label: 'Created At', type: 'date' }
//   ];

//   return (
//     <CRUDTable 
//       table="nfpa_batches" 
//       fields={fields} 
//       title="NFPA Batches Management"
//     />
//   );
// };

// export default NFPABatches;

import React, { useEffect, useState } from 'react';
import CRUDTable from '../components/CRUDTable';
import { supabase } from '../utils/supabaseClient'; // Make sure this exists

const NFPABatches = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from('nfpa_courses').select('id, title');
      if (!error) {
        setCourses(data.map(c => ({ value: c.id, label: c.title })));
      }
    };
    fetchCourses();
  }, []);

  const fields = [
    {
      name: 'course_id',
      label: 'Course Title', 
      type: 'select',
      options: courses,
      required: true,
    },
    { name: 'start_date', label: 'Start Date', type: 'date', required: true },
    { name: 'end_date', label: 'End Date', type: 'date', required: true },
    { name: 'location', label: 'Location', type: 'text', required: true },
    { name: 'seats', label: 'Available Seats', type: 'number' },
    { name: 'instructor', label: 'Instructor', type: 'text' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'register', label: 'Register' },
        { value: 'closed', label: 'Closed' },
      ],
    },
    { name: 'created_at', label: 'Created At', type: 'date' },
  ];

  return (
    <CRUDTable
      table="nfpa_batches"
      fields={fields}
      title="NFPA Batches Management"
    />
  );
};

export default NFPABatches;
