import React, { useState, useEffect, useRef } from 'react';
import FileUploader from '../components/FileUploader';
import './ImageCompressor.css';

function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function ImageCompressor() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [compressedUrl, setCompressedUrl] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(0.8);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      setOriginalSize(file.size);
      
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
        compressImage(img, quality);
      };
      img.src = url;

      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    if (originalUrl) {
      const img = new Image();
      img.onload = () => compressImage(img, quality);
      img.src = originalUrl;
    }
  }, [quality]);

  const compressImage = (img, q) => {
    setIsProcessing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Use WebP for better compression, fallback to jpeg if unsupported or requested
    const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    
    canvas.toBlob((blob) => {
      if (blob) {
        setCompressedSize(blob.size);
        const cUrl = URL.createObjectURL(blob);
        setCompressedUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return cUrl;
        });
      }
      setIsProcessing(false);
    }, format, q);
  };

  const handleDownload = () => {
    if (!compressedUrl) return;
    const a = document.createElement('a');
    a.href = compressedUrl;
    // Keep original name but add -compressed
    const nameParts = file.name.split('.');
    const ext = nameParts.pop();
    a.download = `${nameParts.join('.')}-compressed.${ext}`;
    a.click();
  };

  const savings = originalSize ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h2>Image Compressor</h2>
        <p>Compress JPG, PNG and WebP images without uploading them to a server.</p>
      </div>

      {!file ? (
        <div className="upload-section">
          <FileUploader onFileSelect={setFile} />
          <p className="privacy-note">Your files are processed locally in your browser.</p>
        </div>
      ) : (
        <div className="workspace">
          <div className="controls-panel">
            <h3>Compression Settings</h3>
            <div className="control-group">
              <label>Quality: {Math.round(quality * 100)}%</label>
              <input 
                type="range" 
                min="0.1" 
                max="1" 
                step="0.05" 
                value={quality} 
                onChange={(e) => setQuality(parseFloat(e.target.value))}
              />
              <div className="quality-labels">
                <span>Small File</span>
                <span>High Quality</span>
              </div>
            </div>
            
            <div className="stats-box">
              <div className="stat">
                <span className="label">Original:</span>
                <span className="value">{formatSize(originalSize)}</span>
              </div>
              <div className="stat">
                <span className="label">Compressed:</span>
                <span className="value">{isProcessing ? 'Processing...' : formatSize(compressedSize)}</span>
              </div>
              {savings > 0 && (
                <div className="stat savings">
                  <span className="label">Saved:</span>
                  <span className="value">{savings}%</span>
                </div>
              )}
            </div>

            <div className="actions">
              <button className="primary-btn download-btn" onClick={handleDownload} disabled={isProcessing}>
                Download Compressed
              </button>
              <button className="secondary-btn" onClick={() => setFile(null)}>
                Compress Another Image
              </button>
            </div>
          </div>

          <div className="preview-panel">
            <div className="preview-container">
               <img src={compressedUrl || originalUrl} alt="Preview" className="preview-img" />
            </div>
            <p className="resolution-info">{dimensions.width} × {dimensions.height}px</p>
          </div>
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </div>
  );
}

export default ImageCompressor;
