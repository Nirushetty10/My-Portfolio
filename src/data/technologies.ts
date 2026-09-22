export interface Technology {
  name: string;
  note: string;
}

export const technologies: Technology[] = [
  { name: 'React', note: 'Component architecture & hooks' },
  { name: 'TypeScript', note: 'Type-safe application code' },
  { name: 'JavaScript', note: 'ES2020+' },
  { name: 'MUI', note: 'Design systems at scale' },
  { name: 'Redux', note: 'Predictable state' },
  { name: 'React Query', note: 'Server state & caching' },
  { name: 'Node.js', note: 'API & service layer' },
  { name: 'Express', note: 'REST APIs' },
  { name: 'PostgreSQL', note: 'Relational data' },
  { name: 'MongoDB', note: 'Document data' },
  { name: 'GSAP', note: 'Motion & scroll-driven UI' },
  { name: 'WebSockets', note: 'Real-time collaboration' },
  { name: 'REST APIs', note: 'Service integration' },
  { name: 'Git', note: 'Version control' },
];
