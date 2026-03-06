import React, { useState } from 'react';

const AddProject = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        location: '',
        completion_date: '',
        status: 'ongoing'
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const categories = [
        'Residential',
        'Commercial',
        'Renovation',
        'Construction',
        'Interior Design',
        'Exterior Work'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('location', formData.location);
            submitData.append('completion_date', formData.completion_date);
            submitData.append('status', formData.status);
            if (image) {
                submitData.append('image', image);
            }

            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/projects', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: submitData
            });

            const result = await response.json();

            if (response.ok) {
                setMessage('Project added successfully!');
                // Reset form
                setFormData({
                    title: '',
                    description: '',
                    category: '',
                    location: '',
                    completion_date: '',
                    status: 'ongoing'
                });
                setImage(null);
                setImagePreview(null);
            } else {
                setMessage(result.error || 'Failed to add project');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('An error occurred while adding the project');
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setFormData({
            title: '',
            description: '',
            category: '',
            location: '',
            completion_date: '',
            status: 'ongoing'
        });
        setImage(null);
        setImagePreview(null);
        setMessage('');
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ color: '#2c3e50', marginBottom: '30px' }}>Add New Project</h1>
            
            {message && (
                <div style={{
                    padding: '10px',
                    marginBottom: '20px',
                    borderRadius: '4px',
                    backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da',
                    color: message.includes('success') ? '#155724' : '#721c24',
                    border: `1px solid ${message.includes('success') ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Project Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="4"
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Category *
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Status *
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    >
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Project Image
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    />
                    {imagePreview && (
                        <div style={{ marginTop: '10px' }}>
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                style={{ 
                                    maxWidth: '200px', 
                                    maxHeight: '200px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }} 
                            />
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Location
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Completion Date
                    </label>
                    <input
                        type="date"
                        name="completion_date"
                        value={formData.completion_date}
                        onChange={handleInputChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            flex: 1
                        }}
                    >
                        {loading ? 'Adding Project...' : 'Add Project'}
                    </button>
                    <button 
                        type="button" 
                        onClick={clearForm}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#95a5a6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProject;
