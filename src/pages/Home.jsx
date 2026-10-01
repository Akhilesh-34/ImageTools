import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <h2>Free Browser-Based Image Tools</h2>
        <p>Process your images locally in your browser. Fast, private, and secure.</p>
      </section>
      
      <section className="tools-grid">
        <div className="tool-card">
          <h3>Image Compressor</h3>
          <p>Compress JPG, PNG, and WebP images without losing quality.</p>
          <Link to="/compress" className="primary-btn" style={{textDecoration: 'none', display: 'inline-block', textAlign: 'center'}}>Open Tool</Link>
        </div>
        <div className="tool-card">
          <h3>Image Resizer</h3>
          <p>Resize images for social media, web, and print.</p>
          <Link to="/resize" className="primary-btn" style={{textDecoration: 'none', display: 'inline-block', textAlign: 'center'}}>Open Tool</Link>
        </div>
        <div className="tool-card">
          <h3>Image Cropper</h3>
          <p>Crop images visually to any aspect ratio or shape.</p>
          <Link to="/crop" className="primary-btn" style={{textDecoration: 'none', display: 'inline-block', textAlign: 'center'}}>Open Tool</Link>
        </div>
         <div className="tool-card">
          <h3>Format Converter</h3>
          <p>Convert between JPG, PNG, WebP, BMP, and GIF formats.</p>
          <Link to="/format" className="primary-btn" style={{textDecoration: 'none', display: 'inline-block', textAlign: 'center'}}>Open Tool</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
