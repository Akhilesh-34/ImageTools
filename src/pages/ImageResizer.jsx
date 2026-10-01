import React, { useState, useEffect, useRef } from 'react';
import FileUploader from '../components/FileUploader';
import './ImageResizer.css';

function ImageResizer() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [resizedUrl, setResizedUrl] = useState(null);
  
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [maintainRatio, setMaintainRatio] = useState(true);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
        setTargetWidth(img.width);
        setTargetHeight(img.height);
        resizeImage(img, img.width, img.height);
      };
      img.src = url;

      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleWidthChange = (e) => {
    const newWidth = parseInt(e.target.value) || 0;
    setTargetWidth(newWidth);
    
    if (maintainRatio && originalDimensions.width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setTargetHeight(Math.round(newWidth * ratio));
    }
  };

  const handleHeightChange = (e) => {
    const newHeight = parseInt(e.target.value) || 0;
    setTargetHeight(newHeight);
    
    if (maintainRatio && originalDimensions.height > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setTargetWidth(Math.round(newHeight * ratio));
    }
  };

  const applyResize = () => {
    if (originalUrl && targetWidth > 0 && targetHeight > 0) {
      const img = new Image();
      img.onload = () => resizeImage(img, targetWidth, targetHeight);
      img.src = originalUrl;
    }
  };

  const resizeImage = (img, width, height) => {
    setIsProcessing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Smooth image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(img, 0, 0, width, height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const cUrl = URL.createObjectURL(blob);
        setResizedUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return cUrl;
        });
      }
      setIsProcessing(false);
    }, file.type, 0.95);
  };

  const handleDownload = () => {
    if (!resizedUrl) return;
    const a = document.createElement('a');
    a.href = resizedUrl;
    const nameParts = file.name.split('.');
    const ext = nameParts.pop();
    a.download = `${nameParts.join('.')}-${targetWidth}x${targetHeight}.${ext}`;
    a.click();
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h2>Image Resizer</h2>
        <p>Resize images for social media, web, and print. Processed locally.</p>
      </div>

      {!file ? (
        <div className="upload-section">
          <FileUploader onFileSelect={setFile} />
        </div>
      ) : (
        <div className="workspace">
          <div className="controls-panel">
            <h3>Resize Settings</h3>
            
            <div className="dimension-controls">
              <div className="control-group">
                <label>Width (px)</label>
                <input 
                  type="number" 
                  value={targetWidth} 
                  onChange={handleWidthChange}
                  className="dimension-input"
                  min="1"
                />
              </div>
              
              <div className="link-icon">
                {maintainRatio ? '🔗' : '✖'}
              </div>
              
              <div className="control-group">
                <label>Height (px)</label>
                <input 
                  type="number" 
                  value={targetHeight} 
                  onChange={handleHeightChange}
                  className="dimension-input"
                  min="1"
                />
              </div>
            </div>
            
            <div className="checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={maintainRatio} 
                  onChange={(e) => setMaintainRatio(e.target.checked)} 
                />
                Maintain aspect ratio
              </label>
            </div>
            
            <button className="primary-btn apply-btn" onClick={applyResize}>
              Apply Resize
            </button>
            
            <div className="actions" style={{marginTop: '32px'}}>
              <button className="primary-btn download-btn" onClick={handleDownload} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Download Resized'}
              </button>
              <button className="secondary-btn" onClick={() => setFile(null)}>
                Resize Another
              </button>
            </div>
          </div>

          <div className="preview-panel">
            <div className="preview-container">
               <img src={resizedUrl || originalUrl} alt="Preview" className="preview-img" />
            </div>
            <p className="resolution-info">{targetWidth} × {targetHeight}px</p>
          </div>
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </div>
  );
}

export default ImageResizer;
