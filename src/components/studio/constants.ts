export const FLOOR_RADIUS = 1.03;
export const EMBLEM_Y = 0.39;
export const PANEL_ANGLES = Array.from({ length: 8 }, (_, index) => (index / 8) * Math.PI * 2);
export const VENT_ANGLES = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
export const CRACK_PATHS = Array.from({ length: 12 }, (_, index) => ({
  angle: (index / 12) * Math.PI * 2 + (index % 2 === 0 ? 0.08 : -0.05),
  phase: index * 0.071,
  segments: [
    { radius: 0.88, length: 0.16, offset: 0 },
    { radius: 0.68, length: 0.14, offset: index % 2 === 0 ? 0.024 : -0.02 },
    { radius: 0.51, length: 0.12, offset: index % 3 === 0 ? -0.02 : 0.016 },
    { radius: 0.37, length: 0.09, offset: index % 2 === 0 ? 0.01 : -0.012 },
  ],
}));
