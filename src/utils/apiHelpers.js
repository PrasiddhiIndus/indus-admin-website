import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';

// Generic CRUD operations
export const fetchData = async (table) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    toast.error(`Error fetching ${table}: ${error.message}`);
    return [];
  }
};

export const createRecord = async (table, record) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .insert([record])
      .select();
    
    if (error) throw error;
    toast.success('Record created successfully!');
    return data[0];
  } catch (error) {
    toast.error(`Error creating record: ${error.message}`);
    throw error;
  }
};

export const updateRecord = async (table, id, updates) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    toast.success('Record updated successfully!');
    return data[0];
  } catch (error) {
    toast.error(`Error updating record: ${error.message}`);
    throw error;
  }
};

export const deleteRecord = async (table, id) => {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    toast.success('Record deleted successfully!');
    return true;
  } catch (error) {
    toast.error(`Error deleting record: ${error.message}`);
    throw error;
  }
};