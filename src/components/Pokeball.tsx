import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface PokeballProps {
  opened: boolean;
  onCenterClick: () => void;
}

const RADIUS = 1.22;
const SHELL_PANEL_ANGLES = Array.from({ length: 10 }, (_, index) => (index / 10) * Math.PI * 2);
const ACCENT_ANGLES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

export function Pokeball({ opened, onCenterClick }: PokeballProps) {
  const reducedMotion = useReducedMotion();
  const lidPivotRef = useRef<THREE.Group>(null);
  const buttonRef = useRef<THREE.Group>(null);
  const seamGlowRef = useRef<THREE.Mesh>(null);
  const buttonGlowRef = useRef<THREE.Mesh>(null);
  const openAmount = useRef(0);
  const pressAmount = useRef(0);
  const pulseAmount = useRef(0);
  const pressTimer = useRef<number | null>(null);

  const materials = useMemo(
    () => ({
      red: new THREE.MeshStandardMaterial({ color: '#a91c15', roughness: 0.42, metalness: 0.48, side: THREE.DoubleSide, transparent: true }),
      white: new THREE.MeshStandardMaterial({ color: '#d8d1c8', roughness: 0.34, metalness: 0.58, side: THREE.DoubleSide }),
      black: new THREE.MeshStandardMaterial({ color: '#07090c', roughness: 0.52, metalness: 0.72 }),
      inner: new THREE.MeshStandardMaterial({ color: '#080a0d', roughness: 0.48, metalness: 0.78 }),
      button: new THREE.MeshStandardMaterial({ color: '#9fa9b4', roughness: 0.18, metalness: 0.9 }),
      buttonCore: new THREE.MeshStandardMaterial({ color: '#8d1115', emissive: '#3a0000', emissiveIntensity: 0.12, roughness: 0.18, metalness: 0.62 }),
      trim: new THREE.MeshStandardMaterial({ color: '#d8d3ca', roughness: 0.22, metalness: 0.92 }),
      copper: new THREE.MeshStandardMaterial({ color: '#b95625', roughness: 0.32, metalness: 0.72 }),
      glow: new THREE.MeshBasicMaterial({ color: '#ee1515', transparent: true, opacity: 0 }),
      buttonGlow: new THREE.MeshBasicMaterial({ color: '#ff2a2a', transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
      lidLine: new THREE.MeshBasicMaterial({ color: '#2a0508', transparent: true, opacity: 0.42, side: THREE.DoubleSide }),
    }),
    [],
  );

  useEffect(() => {
    if (!opened) return;
    pressAmount.current = 1;
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => {
      pressAmount.current = 0;
    }, reducedMotion ? 50 : 180);

    return () => {
      if (pressTimer.current) {
        window.clearTimeout(pressTimer.current);
        pressTimer.current = null;
      }
    };
  }, [opened, reducedMotion]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const targetOpen = opened ? 1 : 0;
    openAmount.current += (targetOpen - openAmount.current) * (reducedMotion ? 1 : dt * 4.2);
    pressAmount.current += (0 - pressAmount.current) * (reducedMotion ? 1 : dt * 10);
    pulseAmount.current += (0 - pulseAmount.current) * (reducedMotion ? 1 : dt * 5.5);

    const open = openAmount.current;
    const press = pressAmount.current;
    const pulse = pulseAmount.current;
    const idlePulse = opened || reducedMotion ? 0 : (Math.sin(state.clock.elapsedTime * 2.6) + 1) * 0.5;
    const idleBeat = opened || reducedMotion ? 0 : Math.pow(idlePulse, 3);

    if (lidPivotRef.current) {
      lidPivotRef.current.rotation.x = -1.92 * open;
      lidPivotRef.current.rotation.z = 0.08 * open;
    }

    materials.red.opacity = 1 - open * 0.28;

    if (buttonRef.current) {
      buttonRef.current.position.z = RADIUS + 0.045 - 0.065 * press;
      const scale = 1 - 0.08 * press;
      buttonRef.current.scale.set(scale, scale, scale);
    }

    if (seamGlowRef.current && seamGlowRef.current.material instanceof THREE.MeshBasicMaterial) {
      seamGlowRef.current.material.opacity = Math.max(0, Math.sin(open * Math.PI)) * 0.5;
    }

    materials.buttonCore.emissiveIntensity = 0.18 + idleBeat * 0.72 + press * 1.2 + pulse * 1.6;

    if (buttonGlowRef.current && buttonGlowRef.current.material instanceof THREE.MeshBasicMaterial) {
      buttonGlowRef.current.material.opacity = Math.min(0.82, idleBeat * 0.34 + press * 0.45 + pulse * 0.62);
      const glowScale = 1 + idleBeat * 0.35 + pulse * 0.8;
      buttonGlowRef.current.scale.set(glowScale, glowScale, glowScale);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <group ref={lidPivotRef} position={[0, 0, -RADIUS]}>
        <mesh position={[0, 0, RADIUS]} material={materials.red}>
          <sphereGeometry args={[RADIUS, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <group position={[0, 0, RADIUS]}>
          {SHELL_PANEL_ANGLES.map((angle) => (
            <mesh key={`upper-inner-${angle}`} position={[Math.sin(angle) * 0.78, 0.2, Math.cos(angle) * 0.78]} rotation={[0, angle, 0]} material={materials.inner}>
              <boxGeometry args={[0.28, 0.24, 0.045]} />
            </mesh>
          ))}
          {ACCENT_ANGLES.map((angle) => (
            <group key={`upper-coil-${angle}`} position={[Math.sin(angle) * 0.88, 0.08, Math.cos(angle) * 0.88]} rotation={[0, angle, 0]}>
              {[-0.035, 0, 0.035].map((offset) => (
                <mesh key={offset} position={[offset, 0, 0]} material={materials.copper}>
                  <boxGeometry args={[0.012, 0.09, 0.08]} />
                </mesh>
              ))}
            </group>
          ))}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} material={materials.trim}>
            <torusGeometry args={[1.01, 0.011, 8, 128]} />
          </mesh>
        </group>
        <mesh position={[0, 0.015, RADIUS]} rotation={[Math.PI / 2, 0, 0]} material={materials.lidLine}>
          <torusGeometry args={[0.72, 0.01, 8, 96]} />
        </mesh>
        <mesh position={[0, 0.018, RADIUS]} rotation={[Math.PI / 2, 0, 0]} material={materials.lidLine}>
          <torusGeometry args={[0.46, 0.008, 8, 96]} />
        </mesh>
        <mesh position={[0, 0.02, RADIUS]} rotation={[Math.PI / 2, 0, Math.PI / 4]} material={materials.lidLine}>
          <ringGeometry args={[0.18, 0.19, 48, 1, 0, Math.PI]} />
        </mesh>
      </group>

      <mesh material={materials.white}>
        <sphereGeometry args={[RADIUS, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      </mesh>
      <group>
        {SHELL_PANEL_ANGLES.map((angle) => (
          <mesh key={`lower-inner-${angle}`} position={[Math.sin(angle) * 0.88, -0.2, Math.cos(angle) * 0.88]} rotation={[0, angle, 0]} material={materials.inner}>
            <boxGeometry args={[0.3, 0.36, 0.05]} />
          </mesh>
        ))}
        {ACCENT_ANGLES.map((angle) => (
          <group key={`lower-vent-${angle}`} position={[Math.sin(angle) * 0.92, -0.05, Math.cos(angle) * 0.92]} rotation={[0, angle, 0]}>
            {[-0.05, 0, 0.05].map((offset) => (
              <mesh key={offset} position={[offset, 0, 0]} material={materials.copper}>
                <boxGeometry args={[0.014, 0.11, 0.055]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.black}>
        <torusGeometry args={[RADIUS, 0.065, 16, 128]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.trim}>
        <torusGeometry args={[RADIUS + 0.055, 0.014, 8, 128]} />
      </mesh>
      <mesh ref={seamGlowRef} rotation={[Math.PI / 2, 0, 0]} material={materials.glow}>
        <torusGeometry args={[RADIUS + 0.008, 0.018, 8, 128]} />
      </mesh>

      <group
        ref={buttonRef}
        position={[0, 0, RADIUS + 0.045]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerDown={(event) => {
          event.stopPropagation();
          pressAmount.current = 1;
          pulseAmount.current = 1;
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
        }}
        onClick={(event) => {
          event.stopPropagation();
          document.body.style.cursor = 'auto';
          pressAmount.current = 1;
          pulseAmount.current = 1;
          onCenterClick();
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh material={materials.black}>
          <cylinderGeometry args={[0.26, 0.26, 0.08, 96]} />
        </mesh>
        <mesh position={[0, 0.045, 0]} material={materials.trim}>
          <cylinderGeometry args={[0.21, 0.21, 0.045, 96]} />
        </mesh>
        <mesh position={[0, 0.073, 0]} material={materials.button}>
          <cylinderGeometry args={[0.16, 0.18, 0.04, 96]} />
        </mesh>
        <mesh position={[0, 0.1, 0]} material={materials.black}>
          <cylinderGeometry args={[0.106, 0.112, 0.024, 96]} />
        </mesh>
        <mesh position={[0, 0.119, 0]} material={materials.buttonCore}>
          <cylinderGeometry args={[0.066, 0.076, 0.022, 96]} />
        </mesh>
        <mesh position={[0, 0.133, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.trim}>
          <torusGeometry args={[0.071, 0.005, 8, 96]} />
        </mesh>
        <mesh ref={buttonGlowRef} position={[0, 0.139, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.buttonGlow}>
          <ringGeometry args={[0.05, 0.095, 96]} />
        </mesh>
      </group>
    </group>
  );
}
