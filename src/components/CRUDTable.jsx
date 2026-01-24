import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Upload, Eye } from 'lucide-react';
import { fetchData, createRecord, updateRecord, deleteRecord } from '../utils/apiHelpers';
import { uploadFile, supabase } from '../utils/supabaseClient';
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
  const [fileInputs, setFileInputs] = useState({});


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
    setFileInputs({});
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setFileInputs({});
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm('Are you sure you want to delete this item? This will also delete the associated video file.')) {
      try {
        // Delete file from storage if it exists (video, image, or file)
        for (const field of fields) {
          if ((field.type === 'video' || field.type === 'image' || field.type === 'file') && item[field.name]) {
            const fileUrl = item[field.name];
            // Check if it's a Supabase storage URL
            if (fileUrl && fileUrl.includes('supabase.co/storage')) {
              try {
                // Extract bucket and file path from URL
                const urlParts = fileUrl.split('/storage/v1/object/public/');
                if (urlParts.length > 1) {
                  const pathParts = urlParts[1].split('/');
                  const bucket = pathParts[0];
                  const filePath = pathParts.slice(1).join('/');
                  
                  const { error: deleteError } = await supabase.storage
                    .from(bucket)
                    .remove([filePath]);
                  
                  if (deleteError) {
                    console.warn('Failed to delete file from storage:', deleteError);
                    // Continue with record deletion even if file deletion fails
                  }
                }
              } catch (storageError) {
                console.warn('Error deleting file from storage:', storageError);
                // Continue with record deletion
              }
            }
          }
        }
        
        await deleteRecord(table, item.id);
        loadData();
      } catch (error) {
        toast.error(`Error deleting item: ${error.message}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const submitData = { ...formData };
      
      // Handle file uploads for video, image and file types
      for (const field of fields) {
        if ((field.type === 'video' || field.type === 'image' || field.type === 'file') && fileInputs[field.name]) {
          const file = fileInputs[field.name];
          const fileName = `${Date.now()}_${file.name}`;
          // Use a more generic bucket name that's likely to exist
          const bucket = field.bucket || 'uploads'; // Default bucket name
          
          try {
            // Upload file to Supabase storage
            await uploadFile(bucket, fileName, file);
            
            // Get public URL
            const filePath = `uploads/${fileName}`;
            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            submitData[field.name] = data.publicUrl;
            
            toast.success('File uploaded successfully!');
          } catch (uploadError) {
            toast.error(`Failed to upload file: ${uploadError.message}`);
            setUploading(false);
            return;
          }
        }
      }
      
      if (editingItem) {
        await updateRecord(table, editingItem.id, submitData);
      } else {
        await createRecord(table, submitData);
      }
      setIsModalOpen(false);
      setFileInputs({});
      loadData();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const renderField = (field, value) => {
    if (field.type === 'image' && value) {
      return (
        <div className="flex items-center space-x-3">
          <img
            src={value}
            alt="Preview"
            className="w-20 h-20 object-cover rounded border border-gray-300 shadow-sm"
          />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-700">Image</span>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline truncate max-w-[150px]"
              title={value}
            >
              View Full
            </a>
          </div>
        </div>
      );
    }

    if (field.type === 'video' && value) {
      return (
        <div className="flex items-center space-x-3">
          <video
            src={value}
            className="w-24 h-16 object-cover rounded border border-gray-300 shadow-sm"
            muted
            playsInline
            onMouseEnter={(e) => e.target.play()}
            onMouseLeave={(e) => {
              e.target.pause();
              e.target.currentTime = 0;
            }}
          />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-700">Video</span>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline truncate max-w-[150px]"
              title={value}
            >
              View Full
            </a>
          </div>
        </div>
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

    if (field.type === 'video') {
      const selectedFile = fileInputs[field.name];
      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <label className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-md">
              <Upload className="w-5 h-5 mr-2" />
              {selectedFile ? 'Change Video File' : 'Upload Video File'}
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    // Validate file size (max 100MB)
                    if (file.size > 100 * 1024 * 1024) {
                      toast.error('File size must be less than 100MB');
                      e.target.value = ''; // Reset input
                      return;
                    }
                    // Validate file type
                    if (!file.type.startsWith('video/')) {
                      toast.error('Please select a valid video file');
                      e.target.value = ''; // Reset input
                      return;
                    }
                    setFileInputs(prev => ({ ...prev, [field.name]: file }));
                    // Clear the existing URL when new file is selected
                    setFormData(prev => ({ ...prev, [field.name]: '' }));
                    toast.success('Video file selected. Click Save to upload.');
                  }
                }}
              />
            </label>
            {selectedFile && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
          
          {/* Preview of newly selected file */}
          {selectedFile && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Preview (New Upload):</p>
              <video
                src={URL.createObjectURL(selectedFile)}
                controls
                className="w-full max-w-lg h-64 rounded-lg border-2 border-blue-300 shadow-md"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          
          {/* Show existing video if editing and no new file selected */}
          {value && !selectedFile && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Current Video:</p>
              <video
                src={value}
                controls
                className="w-full max-w-lg h-64 rounded-lg border-2 border-gray-300 shadow-md"
              >
                Your browser does not support the video tag.
              </video>
              <p className="text-xs text-gray-500 mt-1 break-all">{value}</p>
            </div>
          )}
          
          {!selectedFile && !value && (
            <p className="text-sm text-gray-500 italic">No video uploaded yet. Click "Upload Video File" to select a video.</p>
          )}
        </div>
      );
    }

    if (field.type === 'image') {
      const selectedFile = fileInputs[field.name];
      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <label className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-md">
              <Upload className="w-5 h-5 mr-2" />
              {selectedFile ? 'Change Image' : 'Upload Image'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    // Validate file size (max 10MB for images)
                    if (file.size > 10 * 1024 * 1024) {
                      toast.error('Image size must be less than 10MB');
                      e.target.value = ''; // Reset input
                      return;
                    }
                    // Validate file type
                    if (!file.type.startsWith('image/')) {
                      toast.error('Please select a valid image file');
                      e.target.value = ''; // Reset input
                      return;
                    }
                    setFileInputs(prev => ({ ...prev, [field.name]: file }));
                    // Clear the existing URL when new file is selected
                    setFormData(prev => ({ ...prev, [field.name]: '' }));
                    toast.success('Image selected. Click Save to upload.');
                  }
                }}
              />
            </label>
            {selectedFile && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
          
          {/* Preview of newly selected file */}
          {selectedFile && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Preview (New Upload):</p>
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="w-full max-w-lg h-auto max-h-96 rounded-lg border-2 border-blue-300 shadow-md object-contain"
              />
            </div>
          )}
          
          {/* Show existing image if editing and no new file selected */}
          {value && !selectedFile && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">Current Image:</p>
              <img
                src={value}
                alt="Current"
                className="w-full max-w-lg h-auto max-h-96 rounded-lg border-2 border-gray-300 shadow-md object-contain"
              />
              <p className="text-xs text-gray-500 mt-1 break-all">{value}</p>
            </div>
          )}
          
          {!selectedFile && !value && (
            <p className="text-sm text-gray-500 italic">No image uploaded yet. Click "Upload Image" to select an image.</p>
          )}
        </div>
      );
    }

    if (field.type === 'file') {
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
                      onClick={() => setViewingItem(item)}
                      className="text-green-600 hover:text-green-700 p-1 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {!readOnly && (
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-700 p-1 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {!readOnly && (
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingItem ? 'Uploading & Updating...' : 'Uploading...'}
                  </span>
                ) : (
                  editingItem ? 'Update' : 'Create'
                )}
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
                  <div className="space-y-2">
                    <img 
                      src={value} 
                      alt="Preview" 
                      className="w-full max-w-2xl h-auto rounded-lg shadow-lg border border-gray-300 object-contain"
                    />
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Image URL:</p>
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline break-all"
                      >
                        {value}
                      </a>
                    </div>
                  </div>
                )}

                {(field.type === 'file' || field.type === 'video') && value && (
                  <div className="space-y-2">
                    <video 
                      controls
                      className="w-full max-w-2xl h-auto rounded-lg shadow-lg border border-gray-300"
                    >
                      <source src={value} type="video/mp4" />
                      <source src={value} type="video/webm" />
                      <source src={value} type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Video URL:</p>
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline break-all"
                      >
                        {value}
                      </a>
                    </div>
                  </div>
                )}

                {field.type !== 'image' && field.type !== 'file' && field.type !== 'video' && (
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