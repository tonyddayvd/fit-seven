import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { X, Check } from 'lucide-react';

const ImageCropper = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const handleConfirm = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
      alert('Erro ao cortar imagem');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.9)',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '20px',
        backgroundColor: '#111',
        zIndex: 2
      }}>
        <button onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: 'transparent', border: '1px solid #444', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
          <X size={18} /> Cancelar
        </button>
        <button onClick={handleConfirm} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: 'var(--primary-color)', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          <Check size={18} /> Confirmar Corte
        </button>
      </div>

      <div style={{ position: 'relative', flex: 1 }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={onZoomChange}
        />
      </div>

      <div style={{ padding: '20px', backgroundColor: '#111', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: '#aaa', fontSize: '14px' }}>Ajuste o Zoom</span>
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(e.target.value)}
          style={{ width: '80%' }}
        />
        <span style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>Arraste a imagem para enquadrar perfeitamente no centro.</span>
      </div>
    </div>
  );
};

export default ImageCropper;
