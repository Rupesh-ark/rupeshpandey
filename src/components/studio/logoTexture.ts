import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { LifeProp } from '../../data/lifeProps';

/**
 * Section tokens drawn as aged exhibition medallions: a dark bronze coin
 * with a stamped double-ring rim and the section symbol as engraved line
 * art in the section's pigment. No fills, no glow — candlelit metal.
 */

type Draw = (context: CanvasRenderingContext2D) => void;

/** Draw a groove shadow pass below, then the pigment pass — engraved relief. */
function engrave(context: CanvasRenderingContext2D, color: string, lineWidth: number, draw: Draw) {
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.fillStyle = 'transparent';

  context.save();
  context.translate(0, 2.4);
  context.strokeStyle = 'rgba(8, 4, 1, 0.6)';
  context.lineWidth = lineWidth + 1.5;
  draw(context);
  context.restore();

  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  draw(context);
}

function strokeCameo(context: CanvasRenderingContext2D) {
  context.beginPath();
  context.ellipse(128, 122, 56, 70, 0, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.arc(128, 104, 21, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.moveTo(96, 168);
  context.quadraticCurveTo(128, 132, 160, 168);
  context.stroke();
}

function strokeHexMark(context: CanvasRenderingContext2D) {
  context.beginPath();
  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * Math.PI * 2 + Math.PI / 6;
    const x = 128 + Math.cos(angle) * 56;
    const y = 118 + Math.sin(angle) * 56;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.stroke();
  [[-20, -16], [20, -16], [0, 10], [-20, 36], [20, 36]].forEach(([x, y]) => {
    context.beginPath();
    context.arc(128 + x, 118 + y, 7, 0, Math.PI * 2);
    context.stroke();
  });
}

function strokeAirship(context: CanvasRenderingContext2D) {
  context.beginPath();
  context.ellipse(126, 108, 64, 27, 0, 0, Math.PI * 2);
  context.stroke();
  // ribs
  [[-30, 24], [0, 27], [30, 24]].forEach(([x, ry]) => {
    context.beginPath();
    context.moveTo(126 + x, 108 - ry);
    context.lineTo(126 + x, 108 + ry);
    context.stroke();
  });
  // tail fin
  context.beginPath();
  context.moveTo(186, 102);
  context.lineTo(212, 88);
  context.lineTo(204, 116);
  context.closePath();
  context.stroke();
  // gondola + rigging
  context.beginPath();
  context.moveTo(112, 135);
  context.lineTo(106, 152);
  context.moveTo(140, 135);
  context.lineTo(146, 152);
  context.stroke();
  context.strokeRect(100, 152, 52, 16);
}

function strokeMortarboard(context: CanvasRenderingContext2D) {
  context.beginPath();
  context.moveTo(128, 78);
  context.lineTo(198, 110);
  context.lineTo(128, 142);
  context.lineTo(58, 110);
  context.closePath();
  context.stroke();
  context.beginPath();
  context.moveTo(98, 132);
  context.lineTo(98, 158);
  context.quadraticCurveTo(128, 172, 158, 158);
  context.lineTo(158, 132);
  context.stroke();
  context.beginPath();
  context.moveTo(190, 116);
  context.lineTo(190, 156);
  context.stroke();
  context.beginPath();
  context.arc(190, 164, 7, 0, Math.PI * 2);
  context.stroke();
}

function strokeLetter(context: CanvasRenderingContext2D) {
  context.strokeRect(62, 84, 132, 88);
  context.beginPath();
  context.moveTo(66, 88);
  context.lineTo(128, 134);
  context.lineTo(190, 88);
  context.stroke();
  context.beginPath();
  context.moveTo(66, 168);
  context.lineTo(112, 128);
  context.moveTo(190, 168);
  context.lineTo(144, 128);
  context.stroke();
}

function drawCoinBase(context: CanvasRenderingContext2D) {
  context.clearRect(0, 0, 256, 256);

  // Coin field: warm-centered aged bronze.
  const field = context.createRadialGradient(118, 100, 14, 128, 128, 118);
  field.addColorStop(0, '#3d2c15');
  field.addColorStop(0.55, '#281a0b');
  field.addColorStop(1, '#150d05');
  context.fillStyle = field;
  context.beginPath();
  context.arc(128, 128, 112, 0, Math.PI * 2);
  context.fill();

  // Coin edge and stamped double-ring rim.
  context.strokeStyle = '#0f0a04';
  context.lineWidth = 5;
  context.beginPath();
  context.arc(128, 128, 109, 0, Math.PI * 2);
  context.stroke();

  context.strokeStyle = '#c9a05a';
  context.globalAlpha = 0.6;
  context.lineWidth = 3;
  context.beginPath();
  context.arc(128, 128, 101, 0, Math.PI * 2);
  context.stroke();
  context.globalAlpha = 0.28;
  context.lineWidth = 2;
  context.beginPath();
  context.arc(128, 128, 92, 0, Math.PI * 2);
  context.stroke();
  context.globalAlpha = 1;
}

function toTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function createLogoTexture(prop: LifeProp) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');

  if (context) {
    drawCoinBase(context);

    // Engraved section symbol in the section pigment.
    if (prop.id === 'profile') engrave(context, prop.color, 6, strokeCameo);
    if (prop.id === 'career') engrave(context, prop.color, 6, strokeHexMark);
    if (prop.id === 'projects') engrave(context, prop.color, 6, strokeAirship);
    if (prop.id === 'education') engrave(context, prop.color, 6, strokeMortarboard);
    if (prop.id === 'contact') {
      engrave(context, prop.color, 5.5, strokeLetter);
      // The letter's wax seal — the coin's one solid element.
      context.fillStyle = prop.accent;
      context.beginPath();
      context.arc(128, 134, 12, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = 'rgba(8, 4, 1, 0.55)';
      context.lineWidth = 2;
      context.stroke();
    }

    // Small stamped fleuron at the coin's foot.
    context.strokeStyle = prop.accent;
    context.globalAlpha = 0.55;
    context.lineWidth = 2.5;
    context.beginPath();
    context.moveTo(128, 190);
    context.lineTo(137, 199);
    context.lineTo(128, 208);
    context.lineTo(119, 199);
    context.closePath();
    context.stroke();
    context.globalAlpha = 1;
  }

  return toTexture(canvas);
}

export function useLogoTexture(prop: LifeProp) {
  const texture = useMemo(() => createLogoTexture(prop), [prop]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return texture;
}
