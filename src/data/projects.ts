export interface ProjectSection {
  heading: string;
  body: string;
}

export interface Project {
  id: string;
  number: string;
  slug: string;
  name: string;
  description: string;
  technologies: string[];
  image: string;
  detail: {
    tagline: string;
    overview: string;
    problem: string;
    solution: string;
    myRole: string;
    technology: string;
    keyFeatures: string[];
    architecture: string;
    result: string;
  };
}

// NEEDS_CONFIRMATION: Replace image paths with real project screenshots/exports.
// Placeholder gradients are used in ProjectCard when no image is supplied.
export const projects: Project[] = [
  {
    id: 'trailhead-ai',
    number: '01',
    slug: 'trailhead-ai',
    name: 'TRAILHEAD AI',
    description: 'AI-powered business intelligence and AI employee platform.',
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AI'],
    image: '',
    detail: {
      tagline: 'An AI employee platform for operational business intelligence.',
      overview:
        'TRAILHEAD AI brings together live business data and conversational AI agents into a single workspace, letting teams query, monitor and act on their own operations without switching tools.',
      problem:
        'Teams had operational data spread across disconnected systems, with no fast way to ask a question and get a grounded, trustworthy answer.',
      solution:
        'Built a unified frontend that surfaces AI-driven agents alongside live dashboards, so a question and its supporting data live in the same view.',
      myRole:
        'Led frontend architecture: component system, data-fetching layer and the interface for agent conversations.',
      technology:
        'React and TypeScript on the frontend, Node.js services backed by PostgreSQL, with AI agents integrated through a dedicated orchestration layer.',
      keyFeatures: [
        'Conversational AI employee interface with grounded, sourced answers',
        'Live operational dashboards driven by the same data layer',
        'Role-based views for different teams within one workspace',
      ],
      architecture:
        'A modular React frontend consumes a Node.js API layer; PostgreSQL holds structured business data while AI orchestration runs as a separate service the frontend talks to over authenticated endpoints.',
      result:
        'NEEDS_CONFIRMATION: Add measured outcome (e.g. adoption, time saved) once available.',
    },
  },
  {
    id: 'contract-management',
    number: '02',
    slug: 'contract-management',
    name: 'CONTRACT MANAGEMENT',
    description: 'AI-assisted contract creation, editing and collaboration platform.',
    technologies: ['React', 'Lexical', 'WebSockets', 'AI', 'Node.js'],
    image: '',
    detail: {
      tagline: 'Real-time collaborative contract editing with section-level control.',
      overview:
        'A contract management application that lets multiple people draft and negotiate a single document at once, with fine-grained control over who can edit which section.',
      problem:
        'Contract collaboration usually means emailing versions back and forth, losing track of who changed what and when.',
      solution:
        'Built a rich-text editor on Lexical with real-time sync over WebSockets, so every collaborator sees live changes, and section-level locking prevents conflicting edits.',
      myRole:
        'Owned the editor architecture end-to-end: the Lexical integration, the real-time sync layer and the section-locking and multi-user presence system.',
      technology:
        'React with a customized Lexical rich-text editor, WebSockets for real-time collaborative sync, and a Node.js backend coordinating document state.',
      keyFeatures: [
        'Real-time collaborative editing with live multi-user presence',
        'Section-level locking to prevent conflicting simultaneous edits',
        'AI-assisted drafting and clause suggestions inside the editor',
      ],
      architecture:
        'Lexical provides the editor core; a WebSocket layer broadcasts operational updates between clients, with the Node.js server acting as the source of truth for document and lock state.',
      result:
        'NEEDS_CONFIRMATION: Add measured outcome once available.',
    },
  },
  {
    id: 'procurement',
    number: '03',
    slug: 'procurement',
    name: 'PROCUREMENT PLATFORM',
    description: 'Procurement, supplier discovery, RFQ and recommendation platform.',
    technologies: ['React', 'Redux', 'Node.js', 'PostgreSQL'],
    image: '',
    detail: {
      tagline: 'Supplier discovery and RFQ management in one workflow.',
      overview:
        'A procurement platform that helps buyers find suppliers, issue RFQs and compare responses, replacing scattered spreadsheets with a structured workflow.',
      problem:
        'Procurement teams managed supplier discovery and quote comparison manually, making it slow to find the right supplier at the right price.',
      solution:
        'Delivered a structured frontend for supplier search, RFQ creation and response comparison, backed by a recommendation layer for supplier matching.',
      myRole:
        'Built the core frontend flows for supplier discovery, RFQ creation and quote comparison, with Redux managing shared state across the workflow.',
      technology:
        'React with Redux for state management, a Node.js API, and PostgreSQL for supplier, RFQ and quote data.',
      keyFeatures: [
        'Supplier discovery with structured filtering',
        'RFQ creation and multi-supplier response comparison',
        'Recommendation logic to surface likely-fit suppliers',
      ],
      architecture:
        'React and Redux drive the client; a Node.js API exposes supplier, RFQ and quote resources backed by PostgreSQL.',
      result:
        'NEEDS_CONFIRMATION: Add measured outcome once available.',
    },
  },
  {
    id: 'pg-management',
    number: '04',
    slug: 'pg-management',
    name: 'PG MANAGEMENT',
    description: 'SaaS platform for PG owners to manage tenants, rooms and payments.',
    technologies: ['React', 'Node.js', 'MongoDB'],
    image: '',
    detail: {
      tagline: 'Multi-property tenant, room and payment management for PG owners.',
      overview:
        'PG Manager gives paying-guest accommodation owners a single place to manage tenants, rooms and rent payments across multiple properties.',
      problem:
        'Owners running multiple PG properties tracked tenants and payments manually, with no shared system across properties or staff.',
      solution:
        'Built a multi-owner SaaS platform covering tenant records, room occupancy and payment tracking in one dashboard.',
      myRole:
        'Built the frontend application: tenant and room management views, payment tracking and the multi-property dashboard.',
      technology: 'React on the frontend, a Node.js API, and MongoDB for tenant, room and payment records.',
      keyFeatures: [
        'Multi-property dashboard for owners managing several PGs',
        'Tenant and room occupancy tracking',
        'Rent and payment tracking per tenant',
      ],
      architecture:
        'A React frontend calls a Node.js REST API backed by MongoDB, with data modeled around owners, properties, rooms and tenants.',
      result: 'NEEDS_CONFIRMATION: Add measured outcome once available.',
    },
  },
  {
    id: 'investment-dashboard',
    number: '05',
    slug: 'investment-dashboard',
    name: 'INVESTMENT DASHBOARD',
    description: 'Financial market intelligence and investment tracking platform.',
    technologies: ['React', 'TypeScript', 'PostgreSQL'],
    image: '',
    detail: {
      tagline: 'Market intelligence and portfolio tracking for the Indian stock market.',
      overview:
        'An investment dashboard built for tracking NSE market data and surfacing intelligence relevant to an investor’s own portfolio.',
      problem:
        'Retail investors lack a consolidated view that connects live market data to their own holdings and watchlists.',
      solution:
        'Built a dashboard-first frontend that pulls structured market data and presents it against a user’s tracked positions.',
      myRole:
        'Built the frontend data-pulling layer and dashboard views for market data visualization.',
      technology: 'React with TypeScript on the frontend, and PostgreSQL for structured market and portfolio data.',
      keyFeatures: [
        'Live NSE market data dashboards',
        'Portfolio and watchlist tracking',
        'Structured data pipeline feeding the dashboard views',
      ],
      architecture:
        'A TypeScript React frontend renders data served from a PostgreSQL-backed API, with a dedicated data-pulling layer keeping market data current.',
      result: 'NEEDS_CONFIRMATION: Add measured outcome once available.',
    },
  },
];

export const getProjectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
