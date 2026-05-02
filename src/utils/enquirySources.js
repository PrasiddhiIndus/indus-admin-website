export const ENQUIRY_PRIMARY_TABLES = ['contact_messages', 'services_contact_form'];

export const expandEnquiryTables = (tables = ENQUIRY_PRIMARY_TABLES) => {
  const ordered = [];
  const seen = new Set();

  tables.forEach((table) => {
    if (!seen.has(table)) {
      seen.add(table);
      ordered.push(table);
    }
  });

  return ordered;
};
