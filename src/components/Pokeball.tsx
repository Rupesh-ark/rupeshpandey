import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { setBodyCursor } from '../utils/bodyCursor';

interface PokeballProps {
  opened: boolean;
  charging: boolean;
  onCenterClick: () => void;
}

const RADIUS = 1.22;
const SHELL_PANEL_ANGLES = Array.from({ length: 10 }, (_, index) => (index / 10) * Math.PI * 2);
const ACCENT_ANGLES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
const ACCENT_OFFSETS = [-0.035, 0, 0.035];
const LOWER_VENT_OFFSETS = [-0.05, 0, 0.05];
const UNIT_SCALE = new THREE.Vector3(1, 1, 1);
const Y_AXIS = new THREE.Vector3(0, 1, 0);

function createInstanceMatrix(position: THREE.Vector3, rotationY: number) {
  return new THREE.Matrix4().compose(
    position,
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotationY, 0)),
    UNIT_SCALE,
  );
}

function createOffsetRadialMatrix(radius: number, y: number, angle: number, offset: number) {
  const base = new THREE.Vector3(Math.sin(angle) * radius, y, Math.cos(angle) * radius);
  const position = base.add(new THREE.Vector3(offset, 0, 0).applyAxisAngle(Y_AXIS, angle));
  return createInstanceMatrix(position, angle);
}

function StaticInstances({ matrices, material, children }: { matrices: THREE.Matrix4[]; material: THREE.Material; children: ReactNode }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, matrices.length]} material={material}>
      {children}
    </instancedMesh>
  );
}

export function Pokeball({ opened, charging, onCenterClick }: PokeballProps) {
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
      upperShell: new THREE.MeshStandardMaterial({ color: '#6e1a14', roughness: 0.45, metalness: 0.15, side: THREE.DoubleSide, transparent: true }),
      lowerShell: new THREE.MeshStandardMaterial({ color: '#c9bb9b', roughness: 0.58, metalness: 0.12, side: THREE.DoubleSide }),
      black: new THREE.MeshStandardMaterial({ color: '#0f0a06', roughness: 0.5, metalness: 0.72 }),
      inner: new THREE.MeshStandardMaterial({ color: '#0c0805', roughness: 0.48, metalness: 0.78 }),
      button: new THREE.MeshStandardMaterial({ color: '#e2d6ba', roughness: 0.32, metalness: 0.25 }),
      buttonCore: new THREE.MeshStandardMaterial({ color: '#a32e22', emissive: '#571510', emissiveIntensity: 0.22, roughness: 0.16, metalness: 0.62 }),
      trim: new THREE.MeshStandardMaterial({ color: '#8c6f3f', roughness: 0.45, metalness: 0.8 }),
      copper: new THREE.MeshStandardMaterial({ color: '#9c5a28', roughness: 0.32, metalness: 0.72 }),
      glow: new THREE.MeshBasicMaterial({ color: '#d9a441', transparent: true, opacity: 0 }),
      buttonGlow: new THREE.MeshBasicMaterial({ color: '#e8a855', transparent: true, opacity: 0, side: THREE.DoubleSide, forceSinglePass: true, blending: THREE.AdditiveBlending, depthWrite: false }),
      lidLine: new THREE.MeshBasicMaterial({ color: '#3d2e1a', transparent: true, opacity: 0.36, side: THREE.DoubleSide, forceSinglePass: true }),
    }),
    [],
  );
  const upperPanelMatrices = useMemo(
    () => SHELL_PANEL_ANGLES.map((angle) => createInstanceMatrix(new THREE.Vector3(Math.sin(angle) * 0.78, 0.2, Math.cos(angle) * 0.78), angle)),
    [],
  );
  const upperCoilMatrices = useMemo(
    () => ACCENT_ANGLES.flatMap((angle) => ACCENT_OFFSETS.map((offset) => createOffsetRadialMatrix(0.88, 0.08, angle, offset))),
    [],
  );
  const lowerPanelMatrices = useMemo(
    () => SHELL_PANEL_ANGLES.map((angle) => createInstanceMatrix(new THREE.Vector3(Math.sin(angle) * 0.88, -0.2, Math.cos(angle) * 0.88), angle)),
    [],
  );
  const lowerVentMatrices = useMemo(
    () => ACCENT_ANGLES.flatMap((angle) => LOWER_VENT_OFFSETS.map((offset) => createOffsetRadialMatrix(0.92, -0.05, angle, offset))),
    [],
  );

  useEffect(() => {
    if (!opened && !charging) return;
    pressAmount.current = 1;
    pulseAmount.current = 1;
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
  }, [charging, opened, reducedMotion]);

  useEffect(() => {
    return () => {
      setBodyCursor('auto');
    };
  }, []);

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
    const chargePulse = charging && !reducedMotion ? (Math.sin(state.clock.elapsedTime * 10) + 1) * 0.5 : 0;
    const chargeGlow = charging ? 1.15 + chargePulse * 0.85 : 0;

    if (lidPivotRef.current) {
      lidPivotRef.current.rotation.x = -1.92 * open;
      lidPivotRef.current.rotation.z = 0.08 * open;
    }

    materials.upperShell.opacity = 1 - open * 0.28;

    // While the lid is fully shut the shell is opaque, so skip the two-pass
    // transparent path (it renders the near-fullscreen shell twice and
    // re-resolves its shader program every frame).
    const lidFading = open > 0.001;
    if (materials.upperShell.transparent !== lidFading) {
      materials.upperShell.transparent = lidFading;
      materials.upperShell.needsUpdate = true;
    }

    if (buttonRef.current) {
      buttonRef.current.position.z = RADIUS + 0.045 - 0.065 * press;
      const scale = 1 - 0.08 * press;
      buttonRef.current.scale.set(scale, scale, scale);
    }

    if (seamGlowRef.current && seamGlowRef.current.material instanceof THREE.MeshBasicMaterial) {
      seamGlowRef.current.material.opacity = Math.max(0, Math.sin(open * Math.PI)) * 0.5 + chargeGlow * 0.18;
    }

    materials.buttonCore.emissiveIntensity = 0.18 + idleBeat * 0.72 + press * 1.2 + pulse * 1.6 + chargeGlow;

    if (buttonGlowRef.current && buttonGlowRef.current.material instanceof THREE.MeshBasicMaterial) {
      buttonGlowRef.current.material.opacity = Math.min(0.9, idleBeat * 0.34 + press * 0.45 + pulse * 0.62 + chargeGlow * 0.36);
      const glowScale = 1 + idleBeat * 0.35 + pulse * 0.8 + chargeGlow * 0.22;
      buttonGlowRef.current.scale.set(glowScale, glowScale, glowScale);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <group ref={lidPivotRef} position={[0, 0, -RADIUS]}>
        <mesh position={[0, 0, RADIUS]} material={materials.upperShell}>
          <sphereGeometry args={[RADIUS, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <group position={[0, 0, RADIUS]}>
          <StaticInstances matrices={upperPanelMatrices} material={materials.inner}>
            <boxGeometry args={[0.28, 0.24, 0.045]} />
          </StaticInstances>
          <StaticInstances matrices={upperCoilMatrices} material={materials.copper}>
            <boxGeometry args={[0.012, 0.09, 0.08]} />
          </StaticInstances>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} material={materials.trim}>
            <torusGeometry args={[1.01, 0.011, 8, 80]} />
          </mesh>
        </group>
        <mesh position={[0, 0.015, RADIUS]} rotation={[Math.PI / 2, 0, 0]} material={materials.lidLine}>
          <torusGeometry args={[0.72, 0.01, 8, 64]} />
        </mesh>
        <mesh position={[0, 0.018, RADIUS]} rotation={[Math.PI / 2, 0, 0]} material={materials.lidLine}>
          <torusGeometry args={[0.46, 0.008, 8, 64]} />
        </mesh>
        <mesh position={[0, 0.02, RADIUS]} rotation={[Math.PI / 2, 0, Math.PI / 4]} material={materials.lidLine}>
          <ringGeometry args={[0.18, 0.19, 48, 1, 0, Math.PI]} />
        </mesh>
      </group>

      <mesh material={materials.lowerShell}>
        <sphereGeometry args={[RADIUS, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      </mesh>
      <group>
        <StaticInstances matrices={lowerPanelMatrices} material={materials.inner}>
          <boxGeometry args={[0.3, 0.36, 0.05]} />
        </StaticInstances>
        <StaticInstances matrices={lowerVentMatrices} material={materials.copper}>
          <boxGeometry args={[0.014, 0.11, 0.055]} />
        </StaticInstances>
      </group>

      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.black}>
        <torusGeometry args={[RADIUS, 0.065, 12, 80]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.trim}>
        <torusGeometry args={[RADIUS + 0.055, 0.014, 8, 80]} />
      </mesh>
      <mesh ref={seamGlowRef} rotation={[Math.PI / 2, 0, 0]} material={materials.glow}>
        <torusGeometry args={[RADIUS + 0.008, 0.018, 8, 80]} />
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
          setBodyCursor('auto');
          pressAmount.current = 1;
          pulseAmount.current = 1;
          onCenterClick();
        }}
        onPointerOver={() => {
          setBodyCursor('pointer');
        }}
        onPointerOut={() => {
          setBodyCursor('auto');
        }}
      >
        <mesh material={materials.black}>
          <cylinderGeometry args={[0.26, 0.26, 0.08, 40]} />
        </mesh>
        <mesh position={[0, 0.045, 0]} material={materials.trim}>
          <cylinderGeometry args={[0.21, 0.21, 0.045, 40]} />
        </mesh>
        <mesh position={[0, 0.073, 0]} material={materials.button}>
          <cylinderGeometry args={[0.16, 0.18, 0.04, 40]} />
        </mesh>
        <mesh position={[0, 0.1, 0]} material={materials.black}>
          <cylinderGeometry args={[0.106, 0.112, 0.024, 32]} />
        </mesh>
        <mesh position={[0, 0.119, 0]} material={materials.buttonCore}>
          <cylinderGeometry args={[0.066, 0.076, 0.022, 32]} />
        </mesh>
        <mesh position={[0, 0.133, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.trim}>
          <torusGeometry args={[0.071, 0.005, 8, 40]} />
        </mesh>
        <mesh ref={buttonGlowRef} position={[0, 0.139, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.buttonGlow}>
          <ringGeometry args={[0.05, 0.095, 40]} />
        </mesh>
      </group>
    </group>
  );
}
