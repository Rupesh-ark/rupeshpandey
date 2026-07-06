import type { LifeProp } from '../../data/lifeProps';
import { FLOOR_RADIUS, PANEL_ANGLES, VENT_ANGLES } from './constants';
import { PulseCracks } from './PulseCracks';

export function CircularFloor({ activeProp, musicEnabled, audioEnergy, reducedMotion }: { activeProp: LifeProp; musicEnabled: boolean; audioEnergy: number; reducedMotion: boolean }) {
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
      <PulseCracks color={activeProp.color} accent={activeProp.accent} musicEnabled={musicEnabled} audioEnergy={audioEnergy} reducedMotion={reducedMotion} />
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
