export type LifePropId = 'profile' | 'career' | 'projects' | 'education' | 'contact';

export interface LifeProp {
  id: LifePropId;
  label: string;
  code: string;
  color: string;
  accent: string;
  readout: {
    catalog: string;
    role: string;
    portrait?: {
      src: string;
      alt: string;
    };
    records: Array<{
      label: string;
      value: string;
      detail?: string;
      href?: string;
    }>;
  };
}

export const LIFE_PROPS: LifeProp[] = [
  {
    id: 'profile',
    label: 'Profile',
    code: 'R',
    color: '#a32e22',
    accent: '#d9a441',
    readout: {
      catalog: 'R-00 · ID',
      role: 'Product engineer. MSc graduate. Builder of systems, scenes, and useful weird ideas.',
      portrait: {
        src: '/images/Rupesh_Pandey-480.webp',
        alt: 'Rupesh Pandey',
      },
      records: [
        { label: 'ROLE', value: 'Product engineer' },
        { label: 'STUDY', value: 'MSc Software Engineering', detail: 'Heriot-Watt University · graduated 2026' },
        { label: 'FOCUS', value: 'Systems, scenes, and practical tools' },
        { label: 'BASE', value: 'Edinburgh, UK' },
      ],
    },
  },
  {
    id: 'career',
    label: 'Career',
    code: 'C',
    color: '#d9a441',
    accent: '#a32e22',
    readout: {
      catalog: 'R-01 · EXP',
      role: 'Open source maintenance, product engineering, data science, and internal systems',
      records: [
        { label: 'OSS', value: 'boardgame.io', detail: 'Active maintainer · TypeScript game-state framework', href: 'https://boardgame.io/' },
        { label: '2023 - 2024', value: 'Engineer & Catalyst · CEO Office', detail: 'Bizom, Bengaluru · BNPL integration, business reviews, suggested-order ownership' },
        { label: '2022', value: 'Data Scientist · CEO Office', detail: 'Bizom, Bengaluru · churn analysis, Catalog as a Service, DAU and efficiency prototypes' },
        { label: '2021 - 2022', value: 'Software Engineer · Platform', detail: 'Bizom, Bengaluru · alert infrastructure, legacy rewrites, cron operations' },
        { label: '2021 - 2022', value: 'Software Engineer Intern · Analytics', detail: 'Bizom, Bengaluru · client reports, dashboards, alerts, and report migration tooling' },
      ],
    },
  },
  {
    id: 'projects',
    label: 'Projects',
    code: 'P',
    color: '#b06a2c',
    accent: '#d9a441',
    readout: {
      catalog: 'R-02 · PROTO',
      role: 'Playable prototypes, systems, and engineering experiments',
      records: [
        { label: '2026', value: 'Empires of the Skies', detail: 'React, JavaScript, boardgame.io', href: 'https://empires-of-the-skies-tan.vercel.app/' },
        { label: '2025 · RHYTHM', value: "Nimina's Rhythm", detail: 'Unity, C#', href: 'https://cw2-gp5.itch.io/niminas-rhythm' },
        { label: '2025 · SIM', value: 'Coffee Shop Simulation', detail: 'Java, JavaFX', href: 'https://github.com/Saverio976/CoffeeShop' },
        { label: '2022', value: 'Inverted List Indexing', detail: 'C++', href: 'https://github.com/Rupesh-ark/StudentManagementSystem' },
      ],
    },
  },
  {
    id: 'education',
    label: 'Education',
    code: 'E',
    color: '#6f8e5a',
    accent: '#a8bf7e',
    readout: {
      catalog: 'R-03 · EDU',
      role: 'Software engineering, information science, and game-development foundations',
      records: [
        { label: '2026', value: 'MSc Software Engineering', detail: 'Heriot-Watt University · Edinburgh, UK' },
        { label: '2022', value: 'B.E. Information Science & Engineering', detail: 'Visvesvaraya Technological University · Bengaluru, India' },
        { label: '2021', value: 'Diploma in Game Development', detail: 'Backstage Pass Institute · systems, gameplay, and production fundamentals' },
      ],
    },
  },
  {
    id: 'contact',
    label: 'Contact',
    code: '@',
    color: '#7d5a9e',
    accent: '#d9a441',
    readout: {
      catalog: 'R-04 · LINK',
      role: 'Email, GitHub, LinkedIn, and location',
      records: [
        { label: 'EMAIL', value: 'pandeyrupesh00@gmail.com', href: 'mailto:pandeyrupesh00@gmail.com' },
        { label: 'GITHUB', value: '@Rupesh-ark', href: 'https://github.com/Rupesh-ark' },
        { label: 'LINKEDIN', value: '/in/ssh-rupesh', href: 'https://www.linkedin.com/in/ssh-rupesh/' },
        { label: 'BASE', value: 'Edinburgh, UK' },
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
