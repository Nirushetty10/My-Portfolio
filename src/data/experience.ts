export interface ExperienceItem {
  year: string;
  role: string;
  description: string;
  technologies: string[];
}

// NEEDS_CONFIRMATION: Confirm exact role titles/employer names if any should be added.
export const experience: ExperienceItem[] = [
  {
    year: '2023',
    role: 'Entered Software Development',
    description:
      'Started building web applications, focused on learning core JavaScript, DOM fundamentals and the foundations of the MERN stack.',
    technologies: ['JavaScript', 'HTML/CSS', 'Git'],
  },
  {
    year: '2024',
    role: 'React / Frontend Development',
    description:
      'Moved into dedicated frontend engineering, building component-driven React applications with a focus on state management and UI architecture.',
    technologies: ['React', 'Redux', 'MUI'],
  },
  {
    year: '2025',
    role: 'Full-Stack Development',
    description:
      'Extended into full-stack MERN development, shipping features across Node.js, Express and MongoDB alongside the React frontend.',
    technologies: ['Node.js', 'Express', 'MongoDB', 'WebSockets'],
  },
  {
    year: '2026',
    role: 'AI / Product Engineering',
    description:
      'Built AI-assisted product features and real-time collaborative systems, including a rich-text editor with live multi-user sync.',
    technologies: ['React', 'Lexical', 'AI', 'PostgreSQL'],
  },
];
