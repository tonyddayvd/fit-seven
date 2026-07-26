import React, { useRef, useState, useEffect } from 'react';
import { Download, Camera, Image as ImageIcon, X } from 'lucide-react';

const MedalComposer = ({ isOpen, onClose, percentage, isMonthly, studentName }) => {
  const canvasRef = useRef(null);
  const [photoData, setPhotoData] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPhotoData(null);
      setDownloadUrl(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getTierInfo = () => {
    if (percentage >= 100) return { tier: 'gold', name: 'Ouro', color1: '#FFD700', color2: '#B8860B', msg: 'PERFEIÇÃO ALCANÇADA!' };
    if (percentage >= 80) return { tier: 'silver', name: 'Prata', color1: '#E0E0E0', color2: '#9E9E9E', msg: 'MUITO PERTO DO TOPO!' };
    if (percentage >= 70) return { tier: 'bronze', name: 'Bronze', color1: '#CD7F32', color2: '#8B4513', msg: 'ÓTIMO TRABALHO!' };
    return { tier: 'none', name: 'Iniciante', color1: '#4CAF50', color2: '#2E7D32', msg: 'CONTINUE AVANÇANDO!' };
  };

  const info = getTierInfo();

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoData(event.target.result);
      generateArt(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const generateArt = async (imgBase64) => {
    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = 1080;
      const height = 1920;
      canvas.width = width;
      canvas.height = height;

      // 1. Draw Background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      if (isMonthly) {
        bgGrad.addColorStop(0, '#111');
        bgGrad.addColorStop(0.5, info.color2);
        bgGrad.addColorStop(1, '#000');
      } else {
        bgGrad.addColorStop(0, '#1e1e1e');
        bgGrad.addColorStop(1, '#0a0a0a');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(width/2, height/3, 500, 0, 2 * Math.PI);
      ctx.fillStyle = info.color1;
      ctx.fill();
      ctx.restore();

      // 2. Load User Image
      const userImg = new Image();
      userImg.crossOrigin = 'anonymous';
      userImg.src = imgBase64;
      await new Promise(r => userImg.onload = r);

      const imgSize = 800;
      const imgX = (width - imgSize) / 2;
      const imgY = 400;

      ctx.save();
      ctx.beginPath();
      if (isMonthly) {
        ctx.roundRect(imgX, imgY, imgSize, imgSize, 50);
      } else {
        ctx.arc(width/2, imgY + imgSize/2, imgSize/2, 0, 2 * Math.PI);
      }
      ctx.clip();
      
      const scale = Math.max(imgSize / userImg.width, imgSize / userImg.height);
      const drawW = userImg.width * scale;
      const drawH = userImg.height * scale;
      const dx = imgX + (imgSize - drawW) / 2;
      const dy = imgY + (imgSize - drawH) / 2;
      ctx.drawImage(userImg, dx, dy, drawW, drawH);
      ctx.restore();

      ctx.beginPath();
      if (isMonthly) {
        ctx.roundRect(imgX, imgY, imgSize, imgSize, 50);
      } else {
        ctx.arc(width/2, imgY + imgSize/2, imgSize/2, 0, 2 * Math.PI);
      }
      ctx.lineWidth = 15;
      ctx.strokeStyle = info.color1;
      ctx.stroke();

      // 3. Texts and Medals
      ctx.textAlign = 'center';
      ctx.fillStyle = info.color1;
      ctx.font = 'bold 80px "Montserrat", sans-serif';
      ctx.fillText(isMonthly ? 'DESEMPENHO MENSAL' : 'DESEMPENHO SEMANAL', width/2, 200);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 100px "Montserrat", sans-serif';
      ctx.fillText(studentName.toUpperCase(), width/2, 320);

      const textY = imgY + imgSize + 150;
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(width/2, textY + 80, 120, 0, 2*Math.PI);
      ctx.fillStyle = info.color2;
      ctx.fill();
      ctx.lineWidth = 10;
      ctx.strokeStyle = info.color1;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 90px sans-serif';
      ctx.fillText(`${percentage}%`, width/2, textY + 110);

      ctx.fillStyle = info.color1;
      ctx.font = 'bold 60px sans-serif';
      ctx.fillText(`MEDALHA DE ${info.name.toUpperCase()}`, width/2, textY + 300);

      ctx.fillStyle = '#ddd';
      ctx.font = 'italic 50px sans-serif';
      ctx.fillText(`"${info.msg}"`, width/2, textY + 400);
      
      ctx.fillStyle = '#aaa';
      ctx.font = '40px sans-serif';
      ctx.fillText('FIT SEVEN - Treinamento Inteligente', width/2, height - 80);

      setDownloadUrl(canvas.toDataURL('image/png'));
    } catch (err) {
      console.error('Erro ao gerar moldura:', err);
      alert('Houve um erro ao processar a imagem. Tente uma foto menor.');
    }
    setIsGenerating(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button style={styles.closeBtn} onClick={onClose}><X size={24} color="#fff" /></button>
        
        <h2 style={styles.title}>
          {isMonthly ? '🏅 Fechamento do Mês!' : '🏁 Fechamento da Semana!'}
        </h2>
        <p style={styles.subtitle}>
          Você atingiu <strong>{percentage}%</strong> de aproveitamento.
        </p>

        {!photoData ? (
          <div style={styles.uploadArea}>
            <p style={styles.instruction}>Tire uma foto sua ou escolha da galeria para receber sua moldura personalizada de <strong>{info.name}</strong> e postar nas redes sociais!</p>
            <div style={styles.btnRow}>
              <label style={styles.actionBtn}>
                <Camera size={20} />
                Câmera
                <input type="file" accept="image/*" capture="user" style={{display: 'none'}} onChange={handlePhotoUpload} />
              </label>
              <label style={{...styles.actionBtn, backgroundColor: '#4a4a4a'}}>
                <ImageIcon size={20} />
                Galeria
                <input type="file" accept="image/*" style={{display: 'none'}} onChange={handlePhotoUpload} />
              </label>
            </div>
          </div>
        ) : (
          <div style={styles.previewArea}>
            {isGenerating ? (
              <p style={{color: '#fff'}}>Gerando sua arte incrível...</p>
            ) : (
              <>
                <img src={downloadUrl} alt="Sua arte gerada" style={styles.previewImg} />
                <a href={downloadUrl} download={`FitSeven-${isMonthly ? 'Mes' : 'Semana'}-${studentName}.png`} style={styles.downloadBtn}>
                  <Download size={20} /> Baixar Imagem (Stories)
                </a>
              </>
            )}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 999999, padding: '20px'
  },
  modal: {
    backgroundColor: '#1a1a1a', borderRadius: '20px', padding: '30px',
    width: '100%', maxWidth: '500px', position: 'relative',
    textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
    border: '1px solid #333'
  },
  closeBtn: {
    position: 'absolute', top: '15px', right: '15px',
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '5px'
  },
  title: {
    color: '#fff', fontSize: '1.4rem', marginBottom: '10px', marginTop: 0
  },
  subtitle: {
    color: '#ccc', fontSize: '1rem', marginBottom: '25px'
  },
  uploadArea: {
    display: 'flex', flexDirection: 'column', gap: '20px'
  },
  instruction: {
    color: '#aaa', fontSize: '0.9rem', lineHeight: '1.4'
  },
  btnRow: {
    display: 'flex', gap: '15px', justifyContent: 'center'
  },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: 'var(--primary-color)', color: '#fff',
    padding: '12px 20px', borderRadius: '12px', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '0.95rem',
    border: 'none', transition: 'all 0.2s'
  },
  previewArea: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px'
  },
  previewImg: {
    width: '100%', maxWidth: '280px', borderRadius: '15px',
    boxShadow: '0 5px 25px rgba(0,0,0,0.4)',
    border: '2px solid #333'
  },
  downloadBtn: {
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: '#4CAF50', color: '#fff', textDecoration: 'none',
    padding: '14px 24px', borderRadius: '30px', fontWeight: 'bold',
    fontSize: '1rem', boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
  }
};

export default MedalComposer;
