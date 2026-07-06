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
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'rgba(4, 8, 11, 0.92)');
    gradient.addColorStop(0.72, 'rgba(4, 8, 11, 0.6)');
    gradient.addColorStop(1, 'rgba(4, 8, 11, 0.2)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = color;
    context.globalAlpha = 0.72;
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(24, 18);
    context.lineTo(484, 18);
    context.stroke();
    context.globalAlpha = 1;

    context.fillStyle = color;
    context.shadowColor = color;
    context.shadowBlur = 16;
    context.fillRect(35, 58, 20, 20);
    context.shadowBlur = 0;

    context.fillStyle = '#f4efe6';
    context.font = label.length > 8 ? '900 28px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' : '900 32px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    context.letterSpacing = '2px';
    context.fillText(label.toUpperCase(), 72, 80);

    context.fillStyle = accent;
    context.font = '800 22px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    context.fillText(`LIVE · ${code}`, 72, 114);

    context.strokeStyle = accent;
    context.globalAlpha = 0.58;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(24, 136);
    context.lineTo(484, 136);
    context.stroke();
    context.globalAlpha = 1;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}
