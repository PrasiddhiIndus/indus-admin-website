import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Upload, Eye } from 'lucide-react';
import { fetchData, createRecord, updateRecord, deleteRecord } from '../utils/apiHelpers';
import Modal from './Modal';
import toast from 'react-hot-toast';

const CRUDTable = ({ table, fields, title, readOnly = false }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);


  useEffect(() => {
    loadData();
  }, [table]);

  // const loadData = async () => {
  //   setLoading(true);
  //   const result = await fetchData(table);
  //   setData(result);
  //   setLoading(false);
  // };
  const loadData = async () => {
    setLoading(true);

    if (table === 'nfpa_batches') {
      const [batchesRes, coursesRes] = await Promise.all([
        fetchData('nfpa_batches'),
        fetchData('nfpa_courses')
      ]);

      const courseMap = {};
      coursesRes.forEach(course => {
        courseMap[course.id] = course.title;
      });

      const enrichedBatches = batchesRes.map(batch => ({
        ...batch,
        course_id: courseMap[batch.course_id] || batch.course_id
      }));

      setData(enrichedBatches);
    } else {
      const result = await fetchData(table);
      setData(result);
    }

    setLoading(false);
  };


  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteRecord(table, id);
      loadData();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateRecord(table, editingItem.id, formData);
      } else {
        await createRecord(table, formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
    }
  };

  const renderField = (field, value) => {
    if (field.type === 'image' && value) {
      return (
        <img
          src={value}
          alt="Preview"
          className="w-12 h-12 object-cover rounded"
        />
      );
    }

    if (field.type === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }

    if (field.type === 'jsonb' && value) {
      return (

        <ul className="list-disc list-inside text-xs text-gray-700">
          {Array.isArray(value) ? value.map((item, i) => <li key={i}>{item}</li>) : <li>{value}</li>}
        </ul>
      );
    }

    // if (typeof value === 'string' && value.length > 50) {
    //   return value.substring(0, 50) + '...';
    // }
    if (typeof value === 'string') {
      return (
        <div
          className="truncate max-w-[100px] md:max-w-[100px] lg:max-w-[100px]"
          title={value}
        >
          {value}
        </div>
      );
    }


    return value || '-';
  };

  const renderFormField = (field) => {
    const value = formData[field.name] || '';

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          required={field.required}
        />
      );
    }

    if ((field.type === 'file' || field.type === 'image') || field.name === 'video_url') {
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
          placeholder="Paste URL here"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required={field.required}
        />
      );
    }

    if (field.type === 'jsonb') {
      const valueArray = Array.isArray(value) ? value : [];

      const handlePointChange = (index, newValue) => {
        const updated = [...valueArray];
        updated[index] = newValue;
        setFormData((prev) => ({ ...prev, [field.name]: updated }));
      };

      const handleAddPoint = () => {
        setFormData((prev) => ({ ...prev, [field.name]: [...valueArray, ''] }));
      };

      const handleRemovePoint = (index) => {
        const updated = valueArray.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, [field.name]: updated }));
      };

      return (
        <div className="space-y-2">
          {valueArray.map((point, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={point}
                onChange={(e) => handlePointChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
              <button
                type="button"
                onClick={() => handleRemovePoint(index)}
                className="text-red-500 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddPoint}
            className="text-blue-500 hover:underline text-sm"
          >
            + Add Point
          </button>
        </div>
      );
    }




    if (field.type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required={field.required}
        >
          <option value="">Select {field.label}</option>
          {field.options?.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type || 'text'}
        value={value}
        onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required={field.required}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {!readOnly && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </button>
          )}

        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {fields.map((field) => (
                <th
                  key={field.name}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {field.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {fields.map((field) => (
                  <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderField(field, item[field.name])}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setViewingItem(item)} // 👈 Open view modal
                      className="text-green-600 hover:text-green-700 p-1 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>{!readOnly && (
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No data found. Click "Add New" to create your first entry.</p>
          </div>
        )}
      </div>
      {!readOnly && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? 'Edit Item' : 'Create New Item'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderFormField(field)}
              </div>
            ))}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <Modal
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        title="View Item Details"
      >
        <div className="space-y-4">
          {fields.map((field) => {
            const value = viewingItem?.[field.name];

            return (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>

                {field.type === 'image' && value && (
                  <img src={value} alt="Preview" className="w-32 h-32 object-cover rounded" />
                )}

                {field.type === 'file' && value && (
                  <video controls
                    className="w-48 h-32 rounded shadow" // 👈 small size
                  >
                    <source src={value} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}

                {field.type !== 'image' && field.type !== 'file' && (
                  <p className="text-sm text-gray-800">{value || '-'}</p>
                )}
              </div>
            );
          })}
        </div>
      </Modal>

    </div>
  );
};

export default CRUDTable;