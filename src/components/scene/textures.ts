import * as THREE from 'three';

export function createRadialTexture({ center, edge }: { center: string; edge: string }) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');

  if (context) {
    const gradient = context.createRadialGradient(256, 256, 12, 256, 256, 252);
    gradient.addColorStop(0, center);
    gradient.addColorStop(1, edge);
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export function createConsoleTexture({ code, label, color, accent }: { code: string; label: string; color: string; accent: string }) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const context = canvas.getContext('2d');

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = context.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(56, 40, 19, 0.96)');
    gradient.addColorStop(0.5, 'rgba(40, 28, 13, 0.93)');
    gradient.addColorStop(1, 'rgba(28, 19, 9, 0.96)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = '#c9a05a';
    context.lineWidth = 2;
    context.globalAlpha = 0.75;
    context.beginPath();
    context.moveTo(24, 14);
    context.lineTo(488, 14);
    context.stroke();
    context.globalAlpha = 0.45;
    context.beginPath();
    context.moveTo(24, 20);
    context.lineTo(488, 20);
    context.stroke();
    context.globalAlpha = 0.45;
    context.beginPath();
    context.moveTo(24, 140);
    context.lineTo(488, 140);
    context.stroke();
    context.globalAlpha = 0.7;
    context.beginPath();
    context.moveTo(24, 146);
    context.lineTo(488, 146);
    context.stroke();
    context.globalAlpha = 1;

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(45, 56);
    context.lineTo(58, 70);
    context.lineTo(45, 84);
    context.lineTo(32, 70);
    context.closePath();
    context.fill();
    context.strokeStyle = 'rgba(43, 33, 24, 0.6)';
    context.lineWidth = 1.5;
    context.stroke();

    context.fillStyle = '#ecdfbe';
    context.font = label.length > 8 ? '700 28px Cinzel, Georgia, serif' : '700 32px Cinzel, Georgia, serif';
    context.letterSpacing = '3px';
    context.fillText(label.toUpperCase(), 74, 82);

    context.fillStyle = accent;
    context.font = '600 20px Cinzel, Georgia, serif';
    context.letterSpacing = '2px';
    context.fillText(`EXHIBIT · ${code}`, 74, 118);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}
