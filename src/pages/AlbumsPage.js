import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const token = localStorage.getItem('authToken');

const api = axios.create({
  baseURL: 'https://zeitkammerblick.vercel.app',
  headers: {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
});

const AlbumsPage = () => {
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newAlbum, setNewAlbum] = useState({ name: '', description: '', sharedUsers: '' });
  const [editingAlbum, setEditingAlbum] = useState(null);  
  const [sharingAlbumId, setSharingAlbumId] = useState(null); 
  const [shareEmails, setShareEmails] = useState('');

  const fetchAlbums = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/albums');
      setAlbums(response.data.albums);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createAlbum = async (albumData) => {
    setIsLoading(true);
    const serverAlbumData = {
      albumId: uuidv4(),
      name: albumData.name,
      description: albumData.description || '',
    };
    try {
      const response = await api.post('/albums', serverAlbumData);
      setAlbums([...albums, response.data.album]);
      setNewAlbum({ name: '', description: '' });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAlbum = async (id, albumData) => {
    setIsLoading(true);
    try {
      const response = await api.put(`/albums/${id}`, albumData);
      setAlbums(albums.map(album => album._id === id ? response.data.album : album));
      setEditingAlbum(null);
      setError(null);
    } catch (err) {
      setError("You are not authorized to do so");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAlbum = async (albumId) => {
    setIsLoading(true);
    try {
      await api.delete(`/albums/${albumId}`);
      setAlbums(albums.filter(album => album._id !== albumId));
      setError(null);
    } catch (error) {
      setError(error.response?.data?.error || "You are not authorized to do so");
    } finally {
      setIsLoading(false);
    }
  };

  const shareAlbum = async (albumId, emails) => {
    setIsLoading(true);
    try {
      const emailList = emails
      .split(',')
      .map(email => email.trim())
      .filter(email => email !== '');
    
      const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const invalidEmails = emailList.filter(email => !isValidEmail(email));
      
      if (invalidEmails.length > 0) {
        alert(`Invalid email(s): ${invalidEmails.join(', ')}`);
        return;
      }

      const response = await api.post(`/albums/${albumId}/share`, { sharedUsers: emailList });
      alert('Album shared successfully!');
      setShareEmails('');
      setSharingAlbumId(null)
      fetchAlbums();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong while sharing the album');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAlbum = (e) => {
    e.preventDefault();
    createAlbum({
      ...newAlbum,
      sharedUsers: newAlbum.sharedUsers.split(',').map(email => email.trim())
    });
  };

  const handleUpdateAlbum = (e) => {
    e.preventDefault();
    const updatedSharedUsers = editingAlbum.sharedUsers
    .split(',') 
    .map(email => email.trim());

  updateAlbum(editingAlbum._id, {
    ...editingAlbum,
    sharedUsers: updatedSharedUsers
  });
  };

  const handleEditClick = (album) => {
    setEditingAlbum({
      ...album,
      sharedUsers: album.sharedUsers.join(', ') 
    });
  };

  const handleShareClick = (albumId) => {
    setSharingAlbumId(albumId);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
  
    if (token) {
      localStorage.setItem('authToken', token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      fetchAlbums();
    } else {
      setError("You must log in");
    }
  }, []);
  
  

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary">Create New Album</h2>

      <form className="row g-3 mb-5" onSubmit={handleCreateAlbum}>
        <div className="col-md-4">
          <input
            className="form-control"
            type="text"
            placeholder="Album name"
            value={newAlbum.name}
            onChange={(e) => setNewAlbum({ ...newAlbum, name: e.target.value })}
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            type="text"
            placeholder="Description"
            value={newAlbum.description}
            onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
          />
        </div>
        <div className="col-12 d-flex">
          <button className="btn btn-success" type="submit">Add Album</button>
        </div>
      </form>

      {isLoading && <div>Loading...</div>}
      {error && <div className="alert alert-danger d-flex justify-content-between align-items-center">
        <span>{error}</span>
        <button onClick={() => setError('')} className="btn-close" />
        </div>}

      <div className="row">
        {albums.map((album) => (
          <div className="col-md-4 mb-4" key={album._id}>
            {editingAlbum && editingAlbum?._id === album._id ? (
              <form className="card p-3" onSubmit={handleUpdateAlbum}>
                <input
                  className="form-control mb-2"
                  type="text"
                  placeholder="Album name"
                  value={editingAlbum.name}
                  onChange={(e) => setEditingAlbum({ ...editingAlbum, name: e.target.value })}
                />
                <input
                  className="form-control mb-2"
                  type="text"
                  placeholder="Description"
                  value={editingAlbum.description}
                  onChange={(e) => setEditingAlbum({ ...editingAlbum, description: e.target.value })}
                />
                <div className="d-flex gap-2">
                  <button className="btn btn-primary" type="submit">Save</button>
                  <button className="btn btn-secondary" type="button" onClick={() => setEditingAlbum(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                {sharingAlbumId === album._id ? (
                  <div className="card p-3">
                    <input
                      className="form-control mb-2"
                      type="text"
                      placeholder="Enter email to share"
                      value={shareEmails}
                      onChange={(e) => setShareEmails(e.target.value)}
                    />
                    <div className="d-flex gap-2">
                      <button className="btn btn-primary" onClick={() => shareAlbum(album._id, shareEmails)}>
                        Share
                      </button>
                      <button className="btn btn-secondary" onClick={() => setSharingAlbumId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card h-100 shadow-sm">
                    <div className="card-body d-flex flex-column">
                      <p className="small text-muted"><strong>Owner:</strong> {album?.ownerId?.email}</p>
                      <h5 className="card-title text-primary">{album.name}</h5>
                      <p className="card-text">{album.description}</p>
                      <p className="small text-muted"><strong>Shared With:</strong> {album.sharedUsers.join(", ")}</p>
                      <div className="mt-auto d-flex justify-content-between">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleEditClick(album)}
                        >
                          Edit
                        </button>
                        <Link className="btn btn-outline-success btn-sm" to={`/albums/${album._id}/images`}>
                          Details
                        </Link>
                        <button
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => handleShareClick(album._id)}
                        >
                          Share
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => deleteAlbum(album._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumsPage;


