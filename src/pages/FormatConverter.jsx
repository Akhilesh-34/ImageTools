import React, { useState, useEffect, useRef } from 'react';
import FileUploader from '../components/FileUploader';
import './FormatConverter.css';

function FormatConverter() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [convertedUrl, setConvertedUrl] = useState(null);
  const [targetFormat, setTargetFormat] = useState('image/png');
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      
      const img = new Image();
      img.onload = () => {
        convertImage(img, targetFormat);
      };
      img.src = url;

      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    if (originalUrl) {
      const img = new Image();
      img.onload = () => convertImage(img, targetFormat);
      img.src = originalUrl;
    }
  }, [targetFormat]);

  const convertImage = (img, format) => {
    setIsProcessing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fill white background for transparent to JPG conversions
    if (format === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const cUrl = URL.createObjectURL(blob);
        setConvertedUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return cUrl;
        });
      }
      setIsProcessing(false);
    }, format, 0.9);
  };

  const handleDownload = () => {
    if (!convertedUrl) return;
    const a = document.createElement('a');
    a.href = convertedUrl;
    const nameParts = file.name.split('.');
    nameParts.pop();
    
    let ext = 'png';
    if (targetFormat === 'image/jpeg') ext = 'jpg';
    else if (targetFormat === 'image/webp') ext = 'webp';
    else if (targetFormat === 'image/bmp') ext = 'bmp';
    else if (targetFormat === 'image/gif') ext = 'gif';
    
    a.download = `${nameParts.join('.')}-converted.${ext}`;
    a.click();
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h2>Format Converter</h2>
        <p>Convert images between JPG, PNG, WebP, BMP, and GIF instantly.</p>
      </div>

      {!file ? (
        <div className="upload-section">
          <FileUploader onFileSelect={setFile} />
          <p className="privacy-note">Your files are processed locally in your browser.</p>
        </div>
      ) : (
        <div className="workspace">
          <div className="controls-panel">
            <h3>Conversion Settings</h3>
            
            <div className="control-group">
              <label>Target Format:</label>
              <select 
                value={targetFormat} 
                onChange={(e) => setTargetFormat(e.target.value)}
                className="format-select"
              >
                <option value="image/jpeg">JPG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
                <option value="image/bmp">BMP</option>
                <option value="image/gif">GIF</option>
              </select>
            </div>
            
            <div className="actions" style={{marginTop: '32px'}}>
              <button className="primary-btn download-btn" onClick={handleDownload} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Download Converted'}
              </button>
              <button className="secondary-btn" onClick={() => setFile(null)}>
                Convert Another Image
              </button>
            </div>
          </div>

          <div className="preview-panel">
            <div className="preview-container">
               <img src={convertedUrl || originalUrl} alt="Preview" className="preview-img" />
            </div>
          </div>
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </div>
  );
}

export default FormatConverter;
