import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { LifeProp } from '../../data/lifeProps';

function drawGraduationCap(context: CanvasRenderingContext2D, color: string) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(128, 76);
  context.lineTo(202, 112);
  context.lineTo(128, 148);
  context.lineTo(54, 112);
  context.closePath();
  context.fill();
  context.fillRect(88, 142, 80, 28);
  context.beginPath();
  context.moveTo(190, 118);
  context.lineTo(190, 164);
  context.strokeStyle = color;
  context.lineWidth = 8;
  context.lineCap = 'round';
  context.stroke();
  context.beginPath();
  context.arc(190, 170, 8, 0, Math.PI * 2);
  context.fill();
}

function drawAirship(context: CanvasRenderingContext2D, color: string) {
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(128, 116, 72, 30, 0, 0, Math.PI * 2);
  context.fill();
  context.fillRect(96, 138, 64, 18);
  context.beginPath();
  context.moveTo(194, 113);
  context.lineTo(226, 96);
  context.lineTo(216, 126);
  context.closePath();
  context.fill();
  context.strokeStyle = color;
  context.lineWidth = 7;
  context.beginPath();
  context.moveTo(90, 172);
  context.quadraticCurveTo(128, 194, 166, 172);
  context.stroke();
}

function drawBoardgameMark(context: CanvasRenderingContext2D, color: string, centerX = 128, centerY = 112, scale = 1) {
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = 9 * scale;
  context.beginPath();
  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * Math.PI * 2 + Math.PI / 6;
    const x = centerX + Math.cos(angle) * 58 * scale;
    const y = centerY + Math.sin(angle) * 58 * scale;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.stroke();
  [[-20, -16], [20, -16], [0, 12], [-20, 40], [20, 40]].forEach(([x, y]) => {
    context.beginPath();
    context.arc(centerX + x * scale, centerY + y * scale, 7 * scale, 0, Math.PI * 2);
    context.fill();
  });
}

function drawBizomMark(context: CanvasRenderingContext2D, color: string, centerX = 128, centerY = 112, scale = 1) {
  context.fillStyle = color;
  [-42, -14, 14, 42].forEach((x, index) => {
    context.fillRect(centerX + x * scale, centerY - 42 * scale + index * 10 * scale, 18 * scale, (82 - index * 8) * scale);
  });
}

function drawCareerMark(context: CanvasRenderingContext2D, prop: LifeProp) {
  drawBoardgameMark(context, prop.color, 92, 112, 0.56);
  drawBizomMark(context, prop.accent, 164, 112, 0.58);
  context.strokeStyle = '#f4fbff';
  context.globalAlpha = 0.42;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(128, 70);
  context.lineTo(128, 162);
  context.stroke();
  context.globalAlpha = 1;
}

function drawContactMark(context: CanvasRenderingContext2D, prop: LifeProp) {
  context.fillStyle = prop.color;
  context.strokeStyle = prop.color;
  context.lineWidth = 5;

  context.strokeRect(62, 78, 132, 88);
  context.beginPath();
  context.moveTo(64, 82);
  context.lineTo(128, 126);
  context.lineTo(192, 82);
  context.stroke();

  context.fillStyle = prop.accent;
  Array.from({ length: 5 }).forEach((_, row) => {
    Array.from({ length: 7 }).forEach((__, column) => {
      const lit = (row + column) % 3 === 0 || (row === 3 && column > 2);
      context.globalAlpha = lit ? 0.95 : 0.22;
      context.fillRect(72 + column * 12, 176 + row * 8, 7, 5);
    });
  });
  context.globalAlpha = 1;

  context.fillStyle = '#f4fbff';
  context.font = '800 22px Inter, sans-serif';
  context.fillText('in', 176, 188);
}

function drawProfileMark(context: CanvasRenderingContext2D, prop: LifeProp) {
  context.strokeStyle = prop.accent;
  context.fillStyle = prop.color;
  context.lineWidth = 6;

  context.beginPath();
  context.arc(128, 96, 30, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.moveTo(76, 176);
  context.quadraticCurveTo(128, 118, 180, 176);
  context.lineTo(180, 190);
  context.lineTo(76, 190);
  context.closePath();
  context.fill();

  context.globalAlpha = 0.72;
  context.beginPath();
  context.arc(128, 128, 70, 0.14 * Math.PI, 1.86 * Math.PI);
  context.stroke();

  context.strokeStyle = prop.color;
  context.globalAlpha = 0.5;
  [82, 174].forEach((x) => {
    context.beginPath();
    context.moveTo(x, 74);
    context.lineTo(x + (x < 128 ? -22 : 22), 74);
    context.lineTo(x + (x < 128 ? -22 : 22), 96);
    context.stroke();
  });
  context.globalAlpha = 1;
}

function createLogoTexture(prop: LifeProp) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const background = context.createRadialGradient(128, 102, 18, 128, 128, 116);
    background.addColorStop(0, prop.color);
    background.addColorStop(0.45, '#122330');
    background.addColorStop(1, '#030608');
    context.fillStyle = background;
    context.beginPath();
    context.arc(128, 128, 112, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = prop.color;
    context.globalAlpha = 0.86;
    context.lineWidth = 8;
    context.beginPath();
    context.arc(128, 128, 102, 0, Math.PI * 2);
    context.stroke();
    context.globalAlpha = 1;

    if (prop.id === 'career') drawCareerMark(context, prop);
    if (prop.id === 'projects') drawAirship(context, prop.color);
    if (prop.id === 'education') drawGraduationCap(context, prop.color);
    if (prop.id === 'contact') drawContactMark(context, prop);
    if (prop.id === 'profile') drawProfileMark(context, prop);

    context.strokeStyle = prop.accent;
    context.globalAlpha = 0.5;
    context.lineWidth = 3;
    context.beginPath();
    context.arc(128, 196, 22, 0.15 * Math.PI, 0.85 * Math.PI);
    context.stroke();
    context.globalAlpha = 1;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function useLogoTexture(prop: LifeProp) {
  const texture = useMemo(() => createLogoTexture(prop), [prop]);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  return texture;
}
