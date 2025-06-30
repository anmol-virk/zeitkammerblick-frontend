import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ImageGallery = () => {

  const {albumId} = useParams()
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [viewingFavorites, setViewingFavorites] = useState(false);
  const [tagFilter, setTagFilter] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const token = localStorage.getItem('authToken');

  const api = axios.create({
    baseURL: 'https://zeitkammerblick.vercel.app',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });
  
  useEffect(() => {
    fetchImages();
  }, [albumId]);

  const fetchImages = async () => {
    try {
      const response = await api.get(`/albums/${albumId}/images/all`);
      setImages(response.data.data || []);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch images');
    }
  };

  const fetchFavoriteImages = async () => {
    try {
      const response = await api.get(`/albums/${albumId}/images/favorites`);
      setImages(response.data.images || []);
      console.log(response.data)
    } catch (error) {
      console.error("error", error)
      setError(error.response?.data?.error || 'Failed to fetch favorite images');
    }
  };
  useEffect(() => {
    if (viewingFavorites) {
      fetchFavoriteImages();
    } else {
      fetchImages();
    }
  }, [albumId, viewingFavorites]);

  const fetchImagesByTag = async (albumId, tag) => {
    try {
      const response = await api.get(`/albums/${albumId}/images`, { 
        params: { tags: tag.trim() }
      });
      setImages(response.data.data || []);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch images by tag');
    }
  };
 useEffect(() => {
  if (tagFilter.trim() === '') {
    fetchImages();
  } else {
    fetchImagesByTag(albumId, tagFilter.trim());
  }
}, [tagFilter, albumId]);


  const handleImageUpload = async (event) => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
  
    const tagsArray = tagsInput
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag !== '');

  formData.append('tags', JSON.stringify(tagsArray));

    setUploading(true);
    try {
      const response = await api.post(`/albums/${albumId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setImages(prevImages => [...prevImages, response.data.image]);
      setTagsInput("")
      setSelectedFile(null)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const toggleFavorite = async (imageId) => {
    try {
      const image = images.find(img => img.imageId === imageId);
      const response = await api.put(`/albums/${albumId}/images/${imageId}/favorite`, {
        isFavorite: !image.isFavorite
      });

      setImages(prevImages => 
        prevImages.map(img =>
          img.imageId === imageId
            ? { ...img, isFavorite: !img.isFavorite }
            : img
        )
      );
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update favorite status');
    }
  };

  const addComment = async (imageId, comment) => {
    try {
      const response = await api.post(`/albums/${albumId}/images/${imageId}/comments`, {
        comment
      });

      const updatedCmnts = response.data.comments
      setImages(prevImages =>
        prevImages.map(img =>
          img.imageId === imageId
            ? { ...img, comments: updatedCmnts }
            : img
        )
      );  
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add comment');
    }
  };

  const deleteImage = async (imageId) => {
    try {
      await api.delete(`/albums/${albumId}/images/${imageId}`);
      setImages(prevImages => prevImages.filter(img => img.imageId !== imageId));
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete image');
    }
  };

  return (
    <div className="container py-4">
    <div className="mb-4 text-center">
      <h2 className="text-primary">📷 Images</h2>
      <div className='col-md-4'>
      <label className="d-block">
        <h5 className="text-secondary mb-2">{uploading ? 'Uploading...' : '📤 Upload Image'}</h5>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          disabled={uploading}
        />
      </label>
         <input
          type="text"
          className="form-control mt-2"
          placeholder="Add tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          disabled={uploading}
         />
        <button 
        className='btn btn-primary' 
        onClick={handleImageUpload}
        disabled={uploading || !selectedFile}
        >Upload</button>
        </div>
    </div>
  
    {error && (
      <div className="alert alert-danger d-flex justify-content-between align-items-center">
        <span>{error}</span>
        <button onClick={() => setError('')} className="btn-close" />
      </div>
    )}
  
    <div className="row align-items-center mb-3">
      <div className="col-md-4">
        <input
          type="text"
          className="form-control"
          placeholder="Filter by tag"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        />
      </div>
      <div className="col-md-4">
        <button
          className="btn btn-outline-primary"
          onClick={() => setViewingFavorites(!viewingFavorites)}
        >
          {viewingFavorites ? 'View All Images' : 'View Favorites'}
        </button>
      </div>
    </div>
  
    <div className="row">
      {images.map((image) => (
        <div className="col-md-6 col-lg-4 mb-4" key={image.imageId}>
          <div className="card shadow-sm image-card h-100">
            <img
              src={image.imageUrl}
              alt={image.name}
              className="card-img-top img-fluid rounded-top"
            />
            <div className="card-body">
              {image.tags && image.tags.length > 0 && (
                <div className="mb-2 d-flex flex-wrap gap-1">
                  {image.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="badge bg-info text-dark tag-click"
                      onClick={() => {
                        setTagFilter(tag.trim());
                        fetchImagesByTag(albumId, tag.trim());
                      }}
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
              <div className="d-flex justify-content-between">
                <button
                  onClick={() => toggleFavorite(image.imageId)}
                  className={`btn btn-sm ${
                    image.isFavorite ? 'btn-danger' : 'btn-outline-secondary'
                  }`}
                >
                  {image.isFavorite ? '❤️ Favorite' : '🤍 Like'}
                </button>
                <button
                  onClick={() => {
                    const comment = prompt('Add a comment:');
                    if (comment) addComment(image.imageId, comment);
                  }}
                  className="btn btn-sm btn-outline-dark"
                >
                   Comment
                </button>
                <button
                  onClick={() => deleteImage(image.imageId)}
                  className="btn btn-sm btn-outline-danger"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
            {image.comments && image.comments.length > 0 && (
              <div className="card-footer bg-dark text-white">
                <small>💬 Comments:</small>
                <ul className="mb-0 ps-3">
                  {image.comments.map((comment, index) => (
                    <li key={index}>{comment}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  
    {images.length === 0 && (
      <div className="text-center text-muted mt-4">No images in this album yet. Upload some!</div>
    )}
  </div>
  
  );
};

export default ImageGallery;