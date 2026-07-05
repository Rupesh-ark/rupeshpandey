export type ArtifactId = 'boardgame' | 'empires' | 'places' | 'skills' | 'contact';

export interface Artifact {
  id: ArtifactId;
  label: string;
  title: string;
  kicker: string;
  body: string;
  tags: string[];
  link?: {
    href: string;
    label: string;
  };
}

export interface PlaceData {
  id: string;
  title: string;
  description: string;
  caption: string;
  placeholderColor: string;
}

export const ARTIFACTS: Artifact[] = [
  {
    id: 'boardgame',
    label: 'Open source',
    title: 'boardgame.io workbench',
    kicker: 'Active maintainer',
    body:
      'I maintain boardgame.io, an open-source engine for turn-based games. It sits at the center of this room because it is the work I want the portfolio to lead with.',
    tags: ['TypeScript', 'game systems', 'open source', 'developer experience'],
    link: { href: 'https://boardgame.io/', label: 'Visit boardgame.io' },
  },
  {
    id: 'empires',
    label: 'Prototype',
    title: 'Empires of the Skies',
    kicker: 'Featured project',
    body:
      'A competitive airship board-game prototype. Building it pulled me into game-state architecture and eventually into contributing to boardgame.io itself.',
    tags: ['board game', 'state machines', 'multiplayer rules'],
    link: { href: 'https://empires-of-the-skies-tan.vercel.app/', label: 'Open project' },
  },
  {
    id: 'places',
    label: 'Map',
    title: 'Map pins',
    kicker: 'Places and photos',
    body:
      'The wall map is where photos will live. Each pin reveals a place-specific photo card without turning the portfolio into a full photo gallery.',
    tags: ['India', 'Indonesia', 'Edinburgh'],
  },
  {
    id: 'skills',
    label: 'Shelf',
    title: 'Skills shelf',
    kicker: 'Tools I use',
    body:
      'A compact shelf for the technical stack behind the work: React, TypeScript, Node.js, Three.js, accessibility, and the habits needed to maintain shared code.',
    tags: ['React', 'TypeScript', 'Node.js', 'Three.js', 'accessibility'],
  },
  {
    id: 'contact',
    label: 'Signal',
    title: 'Contact signal',
    kicker: 'Reach out',
    body:
      'For boardgame.io, game tools, frontend engineering, or interesting systems work, this is the simplest place to contact me.',
    tags: ['email', 'GitHub', 'LinkedIn'],
  },
];

export const PLACES: PlaceData[] = [
  {
    id: 'india',
    title: 'India',
    description: 'Where my engineering path started and most of my early work took shape.',
    caption: 'Early work, home base, and the start of the archive.',
    placeholderColor: 'linear-gradient(135deg, #6b4a2b, #c8954a)',
  },
  {
    id: 'indonesia',
    title: 'Indonesia',
    description: 'A work chapter that pushed me to think across markets and teams.',
    caption: 'Work context that widened the way I think about systems.',
    placeholderColor: 'linear-gradient(135deg, #3f4d35, #6f8259)',
  },
  {
    id: 'edinburgh',
    title: 'Edinburgh',
    description: 'My MSc chapter and current base for building the next version of my work.',
    caption: 'Current chapter: study, building, and the next version.',
    placeholderColor: 'linear-gradient(135deg, #171a22, #3d4654)',
  },
];

export function getArtifact(id: string): Artifact {
  return ARTIFACTS.find((artifact) => artifact.id === id) ?? ARTIFACTS[0];
}
