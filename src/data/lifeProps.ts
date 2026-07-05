export type LifePropId = 'career' | 'projects' | 'education' | 'contact' | 'blogs';

export interface LifeProp {
  id: LifePropId;
  label: string;
  code: string;
  shortLabel: string;
  color: string;
  accent: string;
  readout: {
    catalog: string;
    specimen: string;
    role: string;
    records: Array<{
      label: string;
      value: string;
    }>;
    links?: Array<{
      href: string;
      label: string;
    }>;
  };
}

export const LIFE_PROPS: LifeProp[] = [
  {
    id: 'career',
    label: 'Career',
    code: 'C',
    shortLabel: 'CAREER',
    color: '#24d8ff',
    accent: '#ff6b35',
    readout: {
      catalog: 'R-01 · OSS',
      specimen: 'boardgame.io',
      role: 'Active maintainer · TypeScript game-state framework',
      records: [
        { label: 'OSS', value: 'Active maintainer of boardgame.io' },
        { label: 'BIZOM 01', value: 'Engineer & Catalyst · CEO Office · Apr 2023 - Jul 2024' },
        { label: 'BIZOM 02', value: 'Data Scientist · CEO Office · Jun 2022 - Dec 2022' },
        { label: 'BIZOM 03', value: 'Software Engineer · Platform · May 2022 - Jun 2022' },
        { label: 'BIZOM 04', value: 'SDE Intern · Analytics · Aug 2021 - May 2022' },
      ],
      links: [
        { href: 'https://boardgame.io/', label: 'boardgame.io' },
        { href: 'https://bizom.in', label: 'Bizom' },
      ],
    },
  },
  {
    id: 'projects',
    label: 'Projects',
    code: 'P',
    shortLabel: 'PROJECTS',
    color: '#f0b35a',
    accent: '#d5691f',
    readout: {
      catalog: 'R-02 · PROTO',
      specimen: 'Empires of the Skies',
      role: 'Competitive airship board-game prototype',
      records: [
        { label: '2026', value: 'Empires of the Skies · React, JavaScript, boardgame.io' },
        { label: '2025 · RHYTHM', value: "Nimina's Rhythm · Unity, C#" },
        { label: '2025 · SIM', value: 'Coffee Shop Simulation · Java, JavaFX' },
        { label: '2022', value: 'Inverted List indexing · C++' },
      ],
      links: [
        { href: 'https://empires-of-the-skies-tan.vercel.app/', label: 'Empires' },
        { href: 'https://cw2-gp5.itch.io/niminas-rhythm', label: 'Nimina' },
        { href: 'https://github.com/Saverio976/CoffeeShop', label: 'Coffee Shop' },
        { href: 'https://github.com/Rupesh-ark/StudentManagementSystem', label: 'Indexing' },
      ],
    },
  },
  {
    id: 'education',
    label: 'Education',
    code: 'E',
    shortLabel: 'EDU',
    color: '#9de07b',
    accent: '#35b864',
    readout: {
      catalog: 'R-03 · MSC',
      specimen: 'Edinburgh · MSc',
      role: 'Systems, research, and durable engineering habits',
      records: [
        { label: '2026', value: 'MSc Software Engineering · Heriot-Watt University' },
        { label: '2022', value: 'B.E. Information Science · Visvesvaraya Technological University' },
        { label: '2021', value: 'Diploma, Game Development · Backstage Pass Institute' },
      ],
    },
  },
  {
    id: 'contact',
    label: 'Contact',
    code: '@',
    shortLabel: 'CONTACT',
    color: '#b68cff',
    accent: '#24d8ff',
    readout: {
      catalog: 'R-04 · LINK',
      specimen: 'Contact relay',
      role: 'Email, GitHub, and LinkedIn',
      records: [
        { label: 'EMAIL', value: 'pandeyrupesh00@gmail.com' },
        { label: 'GITHUB', value: '@Rupesh-ark' },
        { label: 'LINKEDIN', value: '/in/ssh-rupesh' },
        { label: 'BASE', value: 'Edinburgh, UK' },
      ],
      links: [
        { href: 'mailto:pandeyrupesh00@gmail.com', label: 'Email' },
        { href: 'https://github.com/Rupesh-ark', label: 'GitHub' },
        { href: 'https://www.linkedin.com/in/ssh-rupesh/', label: 'LinkedIn' },
      ],
    },
  },
  {
    id: 'blogs',
    label: 'Blogs',
    code: 'B',
    shortLabel: 'BLOGS',
    color: '#f4efe6',
    accent: '#9aa8ff',
    readout: {
      catalog: 'R-05 · LOG',
      specimen: 'Blog archive',
      role: 'Writing slot reserved for notes, build logs, and essays',
      records: [
        { label: 'STATUS', value: 'Archive slot created' },
        { label: 'THEMES', value: 'Open source, game systems, engineering notes' },
        { label: 'FORMAT', value: 'Short field notes before long essays' },
      ],
    },
  },
];

export function getLifeProp(id: LifePropId): LifeProp {
  return LIFE_PROPS.find((prop) => prop.id === id) ?? LIFE_PROPS[0];
}

export function getNextLifePropId(current: LifePropId, direction: 1 | -1): LifePropId {
  const currentIndex = LIFE_PROPS.findIndex((prop) => prop.id === current);
  const nextIndex = (currentIndex + direction + LIFE_PROPS.length) % LIFE_PROPS.length;
  return LIFE_PROPS[nextIndex].id;
}
