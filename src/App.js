import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.css";
import LoginPage from './pages/LoginPage';
import ImageGallery from './pages/ImageGallery';
import AlbumsPage from './pages/AlbumsPage';
function App() {
  return (
    <Router>
    <Routes>
      <Route
       path="/login"
        element={
        <LoginPage />
        } />

      <Route
        path="/albums"
        element={
        <AlbumsPage />
        }
      />
      <Route
       path='/albums/:albumId/images'
       element={
       <ImageGallery />
       } />

      <Route
       path="/"
        element={
        <Navigate to="/login" />
        } />
    </Routes>
  </Router>
)
}

export default App;
