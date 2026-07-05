import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LIFE_PROPS, getLifeProp, type LifeProp, type LifePropId } from '../data/lifeProps';

interface StudioProps {
  visible: boolean;
  activePropId: LifePropId;
  onSelectProp: (id: LifePropId) => void;
}

const FLOOR_RADIUS = 1.03;
const EMBLEM_Y = 0.39;
const PANEL_ANGLES = Array.from({ length: 8 }, (_, index) => (index / 8) * Math.PI * 2);
const VENT_ANGLES = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];

function setBodyCursor(cursor: 'auto' | 'pointer') {
  document.body.style.cursor = cursor;
}

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

function drawBlogMark(context: CanvasRenderingContext2D, prop: LifeProp) {
  context.strokeStyle = prop.accent;
  context.fillStyle = prop.color;
  context.lineWidth = 5;

  context.beginPath();
  context.moveTo(82, 68);
  context.lineTo(154, 68);
  context.lineTo(188, 102);
  context.lineTo(188, 174);
  context.lineTo(82, 174);
  context.closePath();
  context.stroke();

  context.beginPath();
  context.moveTo(154, 68);
  context.lineTo(154, 104);
  context.lineTo(188, 104);
  context.stroke();

  [112, 132, 152].forEach((y, index) => {
    context.globalAlpha = 0.9 - index * 0.18;
    context.fillRect(104, y, 62 + index * 10, 6);
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
    if (prop.id === 'blogs') drawBlogMark(context, prop);

    context.fillStyle = '#f4fbff';
    context.font = prop.shortLabel.length > 6 ? '700 20px Inter, sans-serif' : '800 26px Inter, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(prop.shortLabel, 128, 202);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function useLogoTexture(prop: LifeProp) {
  const texture = useMemo(() => createLogoTexture(prop), [prop]);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  return texture;
}

function LogoBillboard({ prop, active, size, onClick }: { prop: LifeProp; active: boolean; size: number; onClick?: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const hovering = useRef(false);
  const texture = useLogoTexture(prop);
  const { camera } = useThree();

  useEffect(() => {
    return () => {
      setBodyCursor('auto');
    };
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.quaternion.copy(camera.quaternion);
    const targetScale = onClick && hovering.current ? 1.14 : 1;
    const scale = groupRef.current.scale.x + (targetScale - groupRef.current.scale.x) * Math.min(1, delta * 9);
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onPointerUp={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      onPointerOver={() => {
        hovering.current = true;
        if (onClick) setBodyCursor('pointer');
      }}
      onPointerOut={() => {
        hovering.current = false;
        if (onClick) setBodyCursor('auto');
      }}
    >
      <mesh>
        <circleGeometry args={[size, 80]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -0.006]}>
        <ringGeometry args={[size * 1.08, size * 1.2, 80]} />
        <meshBasicMaterial color={active ? prop.color : '#43515e'} transparent opacity={active ? 0.78 : 0.34} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function OrbitLogo({ prop, active, index, total, onSelect }: { prop: LifeProp; active: boolean; index: number; total: number; onSelect: (id: LifePropId) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const baseAngle = (index / total) * Math.PI * 2 + Math.PI / 4;

  useFrame((state) => {
    if (!groupRef.current) return;
    const angle = baseAngle + state.clock.elapsedTime * 0.38;
    const radius = active ? 0.57 : 0.66;
    groupRef.current.position.set(
      Math.sin(angle) * radius,
      0.32 + Math.sin(state.clock.elapsedTime * 1.7 + index) * 0.035,
      Math.cos(angle) * radius,
    );
  });

  return (
    <group ref={groupRef} position={[Math.sin(baseAngle) * 0.66, 0.32, Math.cos(baseAngle) * 0.66]}>
      <LogoBillboard prop={prop} active={active} size={active ? 0.098 : 0.08} onClick={() => onSelect(prop.id)} />
      <mesh position={[0, 0, -0.018]}>
        <ringGeometry args={[active ? 0.12 : 0.095, active ? 0.15 : 0.12, 80]} />
        <meshBasicMaterial color={prop.color} transparent opacity={active ? 0.46 : 0.22} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function CircularFloor() {
  const rings = [0.38, 0.68, 0.92];

  return (
    <group>
      <mesh position={[0, -0.018, 0]}>
        <cylinderGeometry args={[FLOOR_RADIUS, FLOOR_RADIUS, 0.075, 96]} />
        <meshStandardMaterial color="#15181d" roughness={0.46} metalness={0.86} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <circleGeometry args={[FLOOR_RADIUS, 96]} />
        <meshStandardMaterial color="#22272e" roughness={0.4} metalness={0.8} />
      </mesh>
      {PANEL_ANGLES.map((angle) => (
        <mesh key={`floor-panel-${angle}`} position={[Math.sin(angle) * 0.55, 0.046, Math.cos(angle) * 0.55]} rotation={[0, angle, 0]}>
          <boxGeometry args={[0.28, 0.018, 0.48]} />
          <meshStandardMaterial color="#0b0d10" roughness={0.5} metalness={0.72} />
        </mesh>
      ))}
      {rings.map((radius) => (
        <mesh key={radius} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.052, 0]}>
          <torusGeometry args={[radius, 0.006, 8, 96]} />
          <meshStandardMaterial color="#c8d0d8" roughness={0.22} metalness={1} />
        </mesh>
      ))}
      {VENT_ANGLES.map((angle) => (
        <group key={`vent-${angle}`} position={[Math.sin(angle) * 0.74, 0.064, Math.cos(angle) * 0.74]} rotation={[0, angle, 0]}>
          {[-0.055, 0, 0.055].map((offset) => (
            <mesh key={offset} position={[offset, 0, 0]}>
              <boxGeometry args={[0.012, 0.012, 0.12]} />
              <meshBasicMaterial color="#d5691f" />
            </mesh>
          ))}
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.058, 0]}>
        <circleGeometry args={[0.22, 48]} />
        <meshBasicMaterial color="#0bbf74" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.28, 0.3, 0.055, 64]} />
        <meshStandardMaterial color="#0b0d10" roughness={0.38} metalness={0.86} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.105, 0]}>
        <torusGeometry args={[0.25, 0.014, 10, 64]} />
        <meshStandardMaterial color="#848d98" roughness={0.24} metalness={1} />
      </mesh>
      {Array.from({ length: 6 }, (_, index) => (index / 6) * Math.PI * 2).map((angle) => (
        <mesh key={`fan-blade-${angle}`} position={[Math.sin(angle) * 0.11, 0.108, Math.cos(angle) * 0.11]} rotation={[0, angle + 0.45, 0]}>
          <boxGeometry args={[0.065, 0.012, 0.24]} />
          <meshStandardMaterial color="#1d252d" roughness={0.28} metalness={0.92} />
        </mesh>
      ))}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.105, 0.105, 0.035, 40]} />
        <meshStandardMaterial color="#272e36" roughness={0.22} metalness={0.95} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <torusGeometry args={[FLOOR_RADIUS, 0.018, 8, 96]} />
        <meshStandardMaterial color="#e7e0d4" roughness={0.18} metalness={0.82} />
      </mesh>
    </group>
  );
}

function FeaturedChamber({ activeProp }: { activeProp: LifeProp }) {
  const emblemRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const activeRingRef = useRef<THREE.Mesh>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const activation = useRef(0);
  const materials = useMemo(
    () => ({
      darkMetal: new THREE.MeshStandardMaterial({ color: '#11161c', roughness: 0.32, metalness: 0.88 }),
      brushedMetal: new THREE.MeshStandardMaterial({ color: '#8e99a5', roughness: 0.18, metalness: 0.92 }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#9edaff', roughness: 0.04, metalness: 0.02, transparent: true, opacity: 0.16, transmission: 0.34, thickness: 0.035, side: THREE.DoubleSide, depthWrite: false }),
      blueGlow: new THREE.MeshBasicMaterial({ color: '#24d8ff', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    }),
    [],
  );

  useEffect(() => {
    activation.current = Math.max(activation.current, 0.42);
  }, [activeProp.id]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const idle = (Math.sin(state.clock.elapsedTime * 1.4) + 1) * 0.5;
    activation.current += (0 - activation.current) * Math.min(1, dt * 2.6);
    const charge = activation.current;

    if (emblemRef.current) {
      emblemRef.current.position.y = EMBLEM_Y + Math.sin(state.clock.elapsedTime * 1.8) * 0.018;
      const targetScale = 1 + idle * 0.025 + charge * 0.24;
      const scale = emblemRef.current.scale.x + (targetScale - emblemRef.current.scale.x) * Math.min(1, dt * 7);
      emblemRef.current.scale.setScalar(scale);
    }

    if (glowRef.current && glowRef.current.material instanceof THREE.MeshBasicMaterial) {
      glowRef.current.material.opacity = 0.2 + idle * 0.08 + charge * 0.38;
    }

    if (activeRingRef.current && activeRingRef.current.material instanceof THREE.MeshBasicMaterial) {
      activeRingRef.current.material.color.set(activeProp.color);
      activeRingRef.current.material.opacity = 0.16 + idle * 0.1 + charge * 0.42;
      const ringScale = 1 + idle * 0.08 + charge * 0.65;
      activeRingRef.current.scale.set(ringScale, ringScale, ringScale);
    }

    if (glassRef.current && glassRef.current.material instanceof THREE.MeshPhysicalMaterial) {
      glassRef.current.material.opacity = 0.18 + charge * 0.12;
    }

    if (lightRef.current) {
      lightRef.current.color.set(activeProp.color);
      lightRef.current.intensity = 0.32 + idle * 0.06 + charge * 0.95;
    }
  });

  return (
    <group position={[0, 0.08, 0]}>
      <pointLight ref={lightRef} position={[0, 0.38, 0]} intensity={0.38} color="#24d8ff" distance={0.9} />
      <mesh position={[0, 0.02, 0]} material={materials.darkMetal}>
        <cylinderGeometry args={[0.28, 0.31, 0.09, 96]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.075, 0]} material={materials.brushedMetal}>
        <torusGeometry args={[0.25, 0.012, 10, 96]} />
      </mesh>
      <mesh position={[0, 0.13, 0]} material={materials.darkMetal}>
        <cylinderGeometry args={[0.14, 0.16, 0.065, 64]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.18, 0]} material={materials.blueGlow}>
        <ringGeometry args={[0.08, 0.14, 96]} />
      </mesh>
      <mesh ref={activeRingRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.185, 0]}>
        <ringGeometry args={[0.14, 0.18, 96]} />
        <meshBasicMaterial color={activeProp.color} transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={glassRef} position={[0, 0.39, 0]} material={materials.glass}>
        <cylinderGeometry args={[0.24, 0.24, 0.46, 96, 1, true]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.16, 0]} material={materials.brushedMetal}>
        <torusGeometry args={[0.24, 0.009, 8, 96]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.62, 0]} material={materials.brushedMetal}>
        <torusGeometry args={[0.24, 0.009, 8, 96]} />
      </mesh>
      {PANEL_ANGLES.map((angle) => (
        <mesh key={`chamber-rib-${angle}`} position={[Math.sin(angle) * 0.245, 0.39, Math.cos(angle) * 0.245]} material={materials.brushedMetal}>
          <boxGeometry args={[0.008, 0.44, 0.008]} />
        </mesh>
      ))}
      <mesh position={[0, 0.68, 0]} material={materials.darkMetal}>
        <cylinderGeometry args={[0.28, 0.25, 0.07, 96]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.725, 0]} material={materials.brushedMetal}>
        <torusGeometry args={[0.19, 0.016, 12, 96]} />
      </mesh>
      <group ref={emblemRef} position={[0, EMBLEM_Y, 0]}>
        <LogoBillboard
          prop={activeProp}
          active
          size={0.108}
          onClick={() => {
            activation.current = 1;
          }}
        />
        <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]} material={materials.blueGlow}>
          <ringGeometry args={[0.09, 0.145, 96]} />
        </mesh>
      </group>
    </group>
  );
}

export function Studio({ visible, activePropId, onSelectProp }: StudioProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetScale = useRef(new THREE.Vector3());
  const activeProp = getLifeProp(activePropId);
  const orbitProps = LIFE_PROPS.filter((prop) => prop.id !== activePropId);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = visible ? 1 : 0;
    groupRef.current.scale.lerp(targetScale.current.setScalar(target), Math.min(1, delta * 5));
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]} scale={0}>
      <CircularFloor />
      <FeaturedChamber activeProp={activeProp} />
      {orbitProps.map((prop, index) => (
        <OrbitLogo key={prop.id} prop={prop} active={false} index={index} total={orbitProps.length} onSelect={onSelectProp} />
      ))}
    </group>
  );
}
