import React, { useState, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import FileUploader from '../components/FileUploader';
import './ImageCropper.css';

function ImageCropper() {
  const [file, setFile] = useState(null);
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [crop, setCrop] = useState({
    unit: '%', // Can be 'px' or '%'
    x: 25,
    y: 25,
    width: 50,
    height: 50
  });
  
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspect, setAspect] = useState(undefined); // undefined means free crop
  const [croppedUrl, setCroppedUrl] = useState('');

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImgSrc(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const onImageLoad = (e) => {
    imgRef.current = e.currentTarget;
    setCrop({
      unit: '%',
      x: 25,
      y: 25,
      width: 50,
      height: 50
    });
  };

  const handleApplyCrop = () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      if (croppedUrl) URL.revokeObjectURL(croppedUrl);
      setCroppedUrl(URL.createObjectURL(blob));
    }, file.type, 1);
  };

  const handleDownload = () => {
    if (!croppedUrl) return;
    const a = document.createElement('a');
    a.href = croppedUrl;
    const nameParts = file.name.split('.');
    const ext = nameParts.pop();
    a.download = `${nameParts.join('.')}-cropped.${ext}`;
    a.click();
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h2>Image Cropper</h2>
        <p>Crop images visually to any aspect ratio.</p>
      </div>

      {!file ? (
        <div className="upload-section">
          <FileUploader onFileSelect={setFile} />
        </div>
      ) : (
        <div className="workspace">
          <div className="controls-panel">
            <h3>Crop Settings</h3>
            
            <div className="control-group">
              <label>Aspect Ratio:</label>
              <select 
                value={aspect === undefined ? "free" : aspect.toString()} 
                onChange={(e) => {
                  const val = e.target.value;
                  setAspect(val === "free" ? undefined : parseFloat(val));
                }}
                className="format-select"
                style={{marginBottom: '16px'}}
              >
                <option value="free">Free Crop</option>
                <option value="1">1:1 (Square)</option>
                <option value="0.8">4:5 (Instagram Post)</option>
                <option value="1.7777777777777777">16:9 (YouTube Thumbnail)</option>
                <option value="0.5625">9:16 (Story/Reel)</option>
                <option value="1.3333333333333333">4:3</option>
              </select>
            </div>

            <button className="primary-btn apply-btn" onClick={handleApplyCrop} style={{marginBottom: '32px'}}>
              Apply Crop
            </button>
            
            {croppedUrl && (
              <div className="actions">
                <button className="primary-btn download-btn" onClick={handleDownload}>
                  Download Cropped
                </button>
              </div>
            )}
            
            <button className="secondary-btn" onClick={() => setFile(null)} style={{width: '100%', marginTop: '12px'}}>
              Crop Another Image
            </button>
          </div>

          <div className="preview-panel crop-panel">
            <div className="crop-container" style={{backgroundColor: '#e0e0e0', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center'}}>
              <ReactCrop 
                crop={crop} 
                onChange={(_, percentCrop) => setCrop(percentCrop)} 
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
              >
                <img 
                  src={imgSrc} 
                  onLoad={onImageLoad} 
                  alt="Crop preview" 
                  style={{ maxHeight: '60vh', objectFit: 'contain' }}
                />
              </ReactCrop>
            </div>
            {croppedUrl && (
              <div style={{marginTop: '24px', textAlign: 'center'}}>
                <h4>Preview</h4>
                <img src={croppedUrl} alt="Final Crop" style={{maxHeight: '200px', border: '1px solid #ccc', marginTop: '8px'}} />
              </div>
            )}
          </div>
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </div>
  );
}

export default ImageCropper;
