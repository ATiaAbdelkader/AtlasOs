import type {
  Mission, Project, Task, Habit, JournalEntry, KnowledgeItem,
  ResearchPaper, WritingProject, BusinessClient, Invoice,
  CalendarEvent, AIRecommendation, ActivityLog, ProductivityScore,
} from '@/types'

export const missions: Mission[] = [
  {
    id: 'm1', title: 'Complete PhD & Publish High-Impact Research',
    description: 'Finish doctoral thesis and publish in top-tier journals',
    category: 'phd', color: '#8B5CF6', icon: 'graduation-cap',
    progress: 35, deadline: '2027-06-30', isActive: true,
    createdAt: '2025-01-01', updatedAt: '2026-07-10',
  },
  {
    id: 'm2', title: 'Build AgriSkills Academy',
    description: 'Leading agricultural training platform',
    category: 'training', color: '#10B981', icon: 'school',
    progress: 45, deadline: '2027-12-31', isActive: true,
    createdAt: '2025-03-15', updatedAt: '2026-07-10',
  },
  {
    id: 'm3', title: 'Launch Veterinary Semen Analysis Software',
    description: 'Animal Semen App for veterinary diagnostics',
    category: 'business', color: '#F59E0B', icon: 'flask',
    progress: 20, deadline: '2027-03-31', isActive: true,
    createdAt: '2025-06-01', updatedAt: '2026-07-10',
  },
  {
    id: 'm4', title: 'Publish Books & Training Materials',
    description: 'Write and publish agricultural and research methodology books',
    category: 'writing', color: '#EC4899', icon: 'book-open',
    progress: 15, deadline: '2028-06-30', isActive: true,
    createdAt: '2025-02-01', updatedAt: '2026-07-10',
  },
  {
    id: 'm5', title: 'Win International Fellowships & Grants',
    description: 'Secure funding for research and business ventures',
    category: 'grants', color: '#3B82F6', icon: 'award',
    progress: 25, deadline: '2027-09-30', isActive: true,
    createdAt: '2025-01-15', updatedAt: '2026-07-10',
  },
  {
    id: 'm6', title: 'Build Sustainable Agribusiness Ventures',
    description: 'Develop profitable and sustainable agribusinesses',
    category: 'business', color: '#14B8A6', icon: 'sprout',
    progress: 30, deadline: '2028-12-31', isActive: true,
    createdAt: '2025-04-01', updatedAt: '2026-07-10',
  },
]

export const projects: Project[] = [
  {
    id: 'p1', title: 'PhD Thesis - AI in Agriculture',
    description: 'Doctoral research on AI applications in agricultural extension services',
    category: 'research', missionIds: ['m1'],
    status: 'in_progress', priority: 'critical', progress: 35,
    deadline: '2027-06-30', startDate: '2025-01-01',
    objectives: ['Complete literature review', 'Design methodology', 'Collect field data', 'Analyze results', 'Write thesis', 'Publish papers'],
    milestones: [
      { id: 'ms1', title: 'Proposal Defense', description: 'Defend research proposal', deadline: '2025-06-30', status: 'completed', completedAt: '2025-06-28' },
      { id: 'ms2', title: 'Literature Review', description: 'Complete comprehensive review', deadline: '2026-03-31', status: 'completed', completedAt: '2026-03-15' },
      { id: 'ms3', title: 'Data Collection', description: 'Complete field data collection', deadline: '2026-09-30', status: 'in_progress' },
      { id: 'ms4', title: 'Data Analysis', description: 'Complete statistical analysis', deadline: '2027-03-31', status: 'not_started' },
      { id: 'ms5', title: 'Thesis Submission', description: 'Submit final thesis', deadline: '2027-06-30', status: 'not_started' },
    ],
    tags: ['phd', 'ai', 'agriculture', 'research'],
    createdAt: '2025-01-01', updatedAt: '2026-07-10',
  },
  {
    id: 'p2', title: 'AgriSkills Academy Platform',
    description: 'Build comprehensive agricultural training platform',
    category: 'training', missionIds: ['m2'],
    status: 'in_progress', priority: 'high', progress: 45,
    deadline: '2027-12-31', startDate: '2025-03-15',
    objectives: ['Design curriculum', 'Build platform', 'Create content', 'Launch MVP', 'Get 1000 users'],
    milestones: [
      { id: 'ms6', title: 'Curriculum Design', description: 'Complete training curriculum', deadline: '2025-09-30', status: 'completed', completedAt: '2025-09-20' },
      { id: 'ms7', title: 'Platform Development', description: 'Build MVP of platform', deadline: '2026-06-30', status: 'in_progress' },
      { id: 'ms8', title: 'Content Creation', description: 'Create initial course content', deadline: '2026-12-31', status: 'not_started' },
    ],
    tags: ['training', 'agriculture', 'platform'],
    createdAt: '2025-03-15', updatedAt: '2026-07-10',
  },
  {
    id: 'p3', title: 'Animal Semen Analysis App',
    description: 'Mobile app for veterinary semen analysis',
    category: 'business', missionIds: ['m3'],
    status: 'in_progress', priority: 'high', progress: 20,
    deadline: '2027-03-31', startDate: '2025-06-01',
    objectives: ['Market research', 'App development', 'Testing', 'Launch', 'Get 500 users'],
    milestones: [
      { id: 'ms9', title: 'Market Research', description: 'Complete market analysis', deadline: '2025-12-31', status: 'completed', completedAt: '2025-12-15' },
      { id: 'ms10', title: 'MVP Development', description: 'Build MVP app', deadline: '2026-09-30', status: 'in_progress' },
    ],
    tags: ['app', 'veterinary', 'semen-analysis'],
    createdAt: '2025-06-01', updatedAt: '2026-07-10',
  },
  {
    id: 'p4', title: 'Book - Modern Agri-Tech',
    description: 'Comprehensive guide on modern agricultural technology',
    category: 'writing', missionIds: ['m4'],
    status: 'in_progress', priority: 'medium', progress: 15,
    deadline: '2027-12-31', startDate: '2025-02-01',
    objectives: ['Outline chapters', 'Write draft', 'Review', 'Publish'],
    milestones: [
      { id: 'ms11', title: 'Chapter Outline', description: 'Complete chapter outline', deadline: '2025-08-31', status: 'completed', completedAt: '2025-08-20' },
      { id: 'ms12', title: 'First Draft', description: 'Complete first draft', deadline: '2027-06-30', status: 'in_progress' },
    ],
    tags: ['book', 'agritech', 'publishing'],
    createdAt: '2025-02-01', updatedAt: '2026-07-10',
  },
  {
    id: 'p5', title: 'Grant Application - Gates Foundation',
    description: 'Research grant for AI in agriculture',
    category: 'research', missionIds: ['m5', 'm1'],
    status: 'in_progress', priority: 'critical', progress: 60,
    deadline: '2026-08-15', startDate: '2026-05-01',
    objectives: ['Write proposal', 'Budget planning', 'Submit application'],
    milestones: [
      { id: 'ms13', title: 'Draft Proposal', description: 'Complete draft', deadline: '2026-07-15', status: 'completed', completedAt: '2026-07-05' },
      { id: 'ms14', title: 'Final Submission', description: 'Submit grant application', deadline: '2026-08-15', status: 'in_progress' },
    ],
    tags: ['grant', 'gates', 'ai', 'agriculture'],
    createdAt: '2026-05-01', updatedAt: '2026-07-10',
  },
]

export const tasks: Task[] = [
  {
    id: 't1', title: 'Write literature review section 3',
    description: 'Complete the methodology section of literature review',
    priority: 'high', importance: 4, urgency: 3,
    estimatedTime: 120, actualTime: 0,
    category: 'research', projectId: 'p1', missionIds: ['m1'],
    deadline: '2026-07-15', dependencies: [], subtasks: [
      { id: 'st1', title: 'Read recent papers', completed: true },
      { id: 'st2', title: 'Outline key findings', completed: false },
      { id: 'st3', title: 'Write section', completed: false },
    ],
    tags: ['phd', 'literature-review'], status: 'in_progress', progress: 30,
    difficulty: 4, energyRequired: 'high', context: 'library',
    scheduledDate: '2026-07-11', scheduledStart: '08:00', scheduledEnd: '10:00',
    isRecurring: false, createdAt: '2026-07-01', updatedAt: '2026-07-10',
  },
  {
    id: 't2', title: 'Review platform UI mockups',
    description: 'Review and provide feedback on AgriSkills Academy UI designs',
    priority: 'medium', importance: 3, urgency: 2,
    estimatedTime: 60, actualTime: 0,
    category: 'training', projectId: 'p2', missionIds: ['m2'],
    deadline: '2026-07-12', dependencies: [], subtasks: [],
    tags: ['agriskills', 'design'], status: 'not_started', progress: 0,
    difficulty: 2, energyRequired: 'medium',
    scheduledDate: '2026-07-11', scheduledStart: '14:00', scheduledEnd: '15:00',
    isRecurring: false, createdAt: '2026-07-05', updatedAt: '2026-07-10',
  },
  {
    id: 't3', title: 'Grant budget spreadsheet',
    description: 'Prepare detailed budget for Gates Foundation grant',
    priority: 'critical', importance: 5, urgency: 5,
    estimatedTime: 180, actualTime: 0,
    category: 'research', projectId: 'p5', missionIds: ['m5', 'm1'],
    deadline: '2026-07-20', dependencies: [], subtasks: [
      { id: 'st4', title: 'List personnel costs', completed: false },
      { id: 'st5', title: 'Equipment costs', completed: false },
      { id: 'st6', title: 'Travel budget', completed: false },
    ],
    tags: ['grant', 'budget'], status: 'not_started', progress: 0,
    difficulty: 3, energyRequired: 'high', context: 'office',
    scheduledDate: '2026-07-12', scheduledStart: '09:00', scheduledEnd: '12:00',
    isRecurring: false, createdAt: '2026-07-02', updatedAt: '2026-07-10',
  },
  {
    id: 't4', title: 'Write book chapter 3',
    description: 'Write chapter on precision agriculture',
    priority: 'medium', importance: 3, urgency: 2,
    estimatedTime: 240, actualTime: 0,
    category: 'writing', projectId: 'p4', missionIds: ['m4'],
    deadline: '2026-07-30', dependencies: [], subtasks: [],
    tags: ['book', 'writing'], status: 'not_started', progress: 0,
    difficulty: 4, energyRequired: 'high', context: 'home-office',
    scheduledDate: '2026-07-13', scheduledStart: '08:00', scheduledEnd: '12:00',
    isRecurring: false, createdAt: '2026-07-01', updatedAt: '2026-07-10',
  },
  {
    id: 't5', title: 'Prepare training module 1',
    description: 'Create first module for AgriSkills Academy course',
    priority: 'high', importance: 4, urgency: 3,
    estimatedTime: 300, actualTime: 0,
    category: 'training', projectId: 'p2', missionIds: ['m2'],
    deadline: '2026-08-01', dependencies: [], subtasks: [
      { id: 'st7', title: 'Write script', completed: false },
      { id: 'st8', title: 'Record video', completed: false },
      { id: 'st9', title: 'Create slides', completed: false },
    ],
    tags: ['course', 'training'], status: 'not_started', progress: 0,
    difficulty: 3, energyRequired: 'medium',
    isRecurring: false, createdAt: '2026-07-03', updatedAt: '2026-07-10',
  },
  {
    id: 't6', title: 'PhD supervisor meeting',
    description: 'Monthly progress review with supervisor',
    priority: 'high', importance: 4, urgency: 4,
    estimatedTime: 60, actualTime: 0,
    category: 'research', projectId: 'p1', missionIds: ['m1'],
    deadline: '2026-07-14', dependencies: [], subtasks: [],
    tags: ['phd', 'meeting'], status: 'not_started', progress: 0,
    difficulty: 1, energyRequired: 'low',
    scheduledDate: '2026-07-14', scheduledStart: '10:00', scheduledEnd: '11:00',
    isRecurring: true, recurringPattern: 'monthly', createdAt: '2026-01-01', updatedAt: '2026-07-10',
  },
  {
    id: 't7', title: 'Review app wireframes',
    description: 'Review semen analysis app wireframes with developer',
    priority: 'high', importance: 4, urgency: 4,
    estimatedTime: 45, actualTime: 0,
    category: 'business', projectId: 'p3', missionIds: ['m3'],
    deadline: '2026-07-11', dependencies: [], subtasks: [],
    tags: ['app', 'development'], status: 'not_started', progress: 0,
    difficulty: 2, energyRequired: 'medium',
    scheduledDate: '2026-07-11', scheduledStart: '11:00', scheduledEnd: '11:45',
    isRecurring: false, createdAt: '2026-07-08', updatedAt: '2026-07-10',
  },
  {
    id: 't8', title: 'Morning exercise',
    description: '30-minute workout',
    priority: 'medium', importance: 3, urgency: 3,
    estimatedTime: 30, actualTime: 30,
    category: 'personal', missionIds: [],
    deadline: undefined, dependencies: [], subtasks: [],
    tags: ['health', 'routine'], status: 'completed', progress: 100,
    difficulty: 2, energyRequired: 'medium',
    scheduledDate: '2026-07-11', scheduledStart: '06:00', scheduledEnd: '06:30',
    isRecurring: true, recurringPattern: 'daily', createdAt: '2026-06-01', updatedAt: '2026-07-10',
  },
  {
    id: 't9', title: 'Meditation',
    description: '15-minute mindfulness meditation',
    priority: 'low', importance: 2, urgency: 1,
    estimatedTime: 15, actualTime: 0,
    category: 'personal', missionIds: [],
    deadline: undefined, dependencies: [], subtasks: [],
    tags: ['health', 'mindfulness'], status: 'not_started', progress: 0,
    difficulty: 1, energyRequired: 'low',
    scheduledDate: '2026-07-11', scheduledStart: '12:00', scheduledEnd: '12:15',
    isRecurring: true, recurringPattern: 'daily', createdAt: '2026-06-01', updatedAt: '2026-07-10',
  },
  {
    id: 't10', title: 'Read research paper',
    description: 'Read latest paper on AI in agriculture',
    priority: 'medium', importance: 3, urgency: 2,
    estimatedTime: 60, actualTime: 0,
    category: 'research', projectId: 'p1', missionIds: ['m1'],
    deadline: undefined, dependencies: [], subtasks: [],
    tags: ['reading', 'research'], status: 'not_started', progress: 0,
    difficulty: 3, energyRequired: 'medium',
    scheduledDate: '2026-07-11', scheduledStart: '20:00', scheduledEnd: '21:00',
    isRecurring: true, recurringPattern: 'daily', createdAt: '2026-06-01', updatedAt: '2026-07-10',
  },
]

export const habits: Habit[] = [
  {
    id: 'h1', title: 'Reading', description: 'Read research papers or books daily',
    category: 'education', frequency: 'daily', targetCount: 1,
    currentStreak: 5, longestStreak: 14,
    logs: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 5, 11 + i).toISOString(),
      count: Math.random() > 0.3 ? 1 : 0,
      completed: Math.random() > 0.3,
    })),
    createdAt: '2026-01-01', updatedAt: '2026-07-10',
  },
  {
    id: 'h2', title: 'Research Writing', description: 'Write at least 500 words of research',
    category: 'research', frequency: 'daily', targetCount: 500,
    currentStreak: 3, longestStreak: 8,
    logs: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 5, 11 + i).toISOString(),
      count: Math.floor(Math.random() * 800),
      completed: Math.random() > 0.4,
    })),
    createdAt: '2026-01-01', updatedAt: '2026-07-10',
  },
  {
    id: 'h3', title: 'Exercise', description: 'Daily physical exercise',
    category: 'health', frequency: 'daily', targetCount: 1,
    currentStreak: 7, longestStreak: 21,
    logs: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 5, 11 + i).toISOString(),
      count: Math.random() > 0.2 ? 1 : 0,
      completed: Math.random() > 0.2,
    })),
    createdAt: '2026-01-01', updatedAt: '2026-07-10',
  },
  {
    id: 'h4', title: 'Meditation', description: 'Mindfulness meditation',
    category: 'health', frequency: 'daily', targetCount: 1,
    currentStreak: 2, longestStreak: 10,
    logs: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 5, 11 + i).toISOString(),
      count: Math.random() > 0.5 ? 1 : 0,
      completed: Math.random() > 0.5,
    })),
    createdAt: '2026-01-01', updatedAt: '2026-07-10',
  },
  {
    id: 'h5', title: 'Deep Work', description: 'At least 3 hours of deep work',
    category: 'personal', frequency: 'daily', targetCount: 180,
    currentStreak: 4, longestStreak: 12,
    logs: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 5, 11 + i).toISOString(),
      count: Math.floor(Math.random() * 240),
      completed: Math.random() > 0.3,
    })),
    createdAt: '2026-01-01', updatedAt: '2026-07-10',
  },
  {
    id: 'h6', title: 'Learning', description: 'Learn something new',
    category: 'education', frequency: 'daily', targetCount: 1,
    currentStreak: 6, longestStreak: 15,
    logs: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 5, 11 + i).toISOString(),
      count: Math.random() > 0.25 ? 1 : 0,
      completed: Math.random() > 0.25,
    })),
    createdAt: '2026-01-01', updatedAt: '2026-07-10',
  },
]

export const journalEntries: JournalEntry[] = [
  {
    id: 'j1', date: '2026-07-10', type: 'morning',
    content: 'Today I need to focus on the grant budget and literature review. Energy is good after a good night sleep.',
    mood: 'good', energy: 'high',
    wins: ['Completed literature review outline'],
    challenges: ['Need to stay focused on grant application'],
    lessonsLearned: ['Morning deep work is most productive'],
    gratitude: ['Grateful for the research opportunity'],
    createdAt: '2026-07-10', updatedAt: '2026-07-10',
  },
  {
    id: 'j2', date: '2026-07-10', type: 'evening',
    content: 'Good day overall. Completed the literature review section and had a productive meeting.',
    mood: 'good', energy: 'medium',
    wins: ['Finished literature review section', 'Reviewed grant requirements'],
    challenges: ['Got distracted by emails in the afternoon'],
    lessonsLearned: ['Block email checking to specific times'],
    gratitude: ['Thankful for supportive supervisor'],
    createdAt: '2026-07-10', updatedAt: '2026-07-10',
  },
  {
    id: 'j3', date: '2026-07-09', type: 'morning',
    content: 'Grant deadline approaching. Must prioritize today.',
    mood: 'neutral', energy: 'medium',
    wins: ['Set up weekly schedule'],
    challenges: ['Grant budget is complex'],
    lessonsLearned: ['Break large tasks into smaller chunks'],
    gratitude: ['Good health'],
    createdAt: '2026-07-09', updatedAt: '2026-07-09',
  },
]

export const knowledgeItems: KnowledgeItem[] = [
  {
    id: 'k1', title: 'AI in Agriculture Research Notes',
    content: 'Key findings from recent papers on AI applications in agricultural extension...',
    type: 'note', tags: ['ai', 'agriculture', 'research'],
    projectId: 'p1', missionIds: ['m1'], isFavorite: true,
    createdAt: '2026-06-15', updatedAt: '2026-07-05',
  },
  {
    id: 'k2', title: 'Training Platform Architecture',
    content: 'Technical architecture for AgriSkills Academy platform...',
    type: 'document', tags: ['architecture', 'platform', 'training'],
    projectId: 'p2', missionIds: ['m2'], isFavorite: false,
    createdAt: '2026-05-20', updatedAt: '2026-06-28',
  },
  {
    id: 'k3', title: 'Grant Writing Tips',
    content: 'Best practices for writing successful grant applications...',
    type: 'article', tags: ['grant', 'writing', 'tips'],
    missionIds: ['m5'], isFavorite: true,
    createdAt: '2026-04-10', updatedAt: '2026-04-10',
  },
]

export const researchPapers: ResearchPaper[] = [
  {
    id: 'r1', title: 'Deep Learning for Crop Disease Detection',
    authors: ['Singh, A.', 'Kumar, R.'], journal: 'Computers and Electronics in Agriculture',
    year: 2025, doi: '10.1016/j.compag.2025.109234',
    abstract: 'This paper presents a novel deep learning approach for early detection of crop diseases...',
    notes: 'Relevant for Chapter 3 of thesis. Good methodology section.',
    tags: ['deep-learning', 'crop-disease'], status: 'reading', rating: 4, citations: 45,
    readingList: false, createdAt: '2026-06-01', updatedAt: '2026-07-08',
  },
  {
    id: 'r2', title: 'Mobile Apps in Veterinary Practice',
    authors: ['Patel, M.', 'Johnson, K.'], journal: 'Veterinary Record',
    year: 2024, doi: '10.1136/vr.108765',
    abstract: 'A comprehensive review of mobile applications used in veterinary medicine...',
    notes: 'Useful for the semen analysis app project. References similar apps.',
    tags: ['mobile', 'veterinary'], status: 'read', rating: 3, citations: 28,
    readingList: false, createdAt: '2026-05-15', updatedAt: '2026-06-20',
  },
  {
    id: 'r3', title: 'Transfer Learning for Agricultural Image Classification',
    authors: ['Zhang, L.', 'Chen, Y.'], journal: 'IEEE Access',
    year: 2025, doi: '10.1109/ACCESS.2025.356789',
    abstract: 'Transfer learning techniques applied to agricultural image datasets...',
    notes: 'Important methodology reference for thesis.',
    tags: ['transfer-learning', 'image-classification'], status: 'to_read', rating: 0, citations: 12,
    readingList: true, createdAt: '2026-07-01', updatedAt: '2026-07-01',
  },
]

export const writingProjects: WritingProject[] = [
  {
    id: 'w1', title: 'Modern Agri-Tech: A Comprehensive Guide',
    type: 'book', description: 'A book covering modern agricultural technology',
    targetWordCount: 80000, currentWordCount: 12000,
    status: 'in_progress', deadline: '2027-12-31',
    tags: ['book', 'agritech'],
    sessions: [
      { id: 'ws1', date: '2026-07-10', wordCount: 500, timeSpent: 60, notes: 'Wrote introduction' },
      { id: 'ws2', date: '2026-07-08', wordCount: 750, timeSpent: 90, notes: 'Chapter 1 outline' },
    ],
    createdAt: '2025-02-01', updatedAt: '2026-07-10',
  },
  {
    id: 'w2', title: 'Gates Foundation Grant Proposal',
    type: 'grant', description: 'AI in Agriculture grant proposal',
    targetWordCount: 5000, currentWordCount: 3200,
    status: 'in_progress', deadline: '2026-08-15',
    tags: ['grant', 'proposal'],
    sessions: [
      { id: 'ws3', date: '2026-07-09', wordCount: 1200, timeSpent: 180, notes: 'Wrote methodology section' },
    ],
    createdAt: '2026-05-01', updatedAt: '2026-07-10',
  },
  {
    id: 'w3', title: 'PhD Thesis Chapter 4: Methodology',
    type: 'thesis', description: 'Research methodology chapter',
    targetWordCount: 10000, currentWordCount: 4500,
    status: 'in_progress', deadline: '2027-01-31',
    tags: ['phd', 'thesis'],
    sessions: [
      { id: 'ws4', date: '2026-07-07', wordCount: 800, timeSpent: 120, notes: 'Research design section' },
    ],
    createdAt: '2026-06-01', updatedAt: '2026-07-10',
  },
]

export const businessClients: BusinessClient[] = [
  {
    id: 'c1', name: 'Dr. Sarah Johnson', email: 'sarah@vetclinic.com',
    phone: '+1234567890', company: 'VetCare Clinic',
    type: 'client', status: 'active',
    notes: 'Interested in semen analysis software beta trial',
    tags: ['veterinary', 'app'],
    createdAt: '2026-04-15', updatedAt: '2026-07-01',
  },
  {
    id: 'c2', name: 'GreenFarm Cooperative', email: 'info@greenfarm.org',
    type: 'partner', status: 'active',
    notes: 'Training partnership for AgriSkills Academy',
    tags: ['training', 'partnership'],
    createdAt: '2026-03-01', updatedAt: '2026-06-15',
  },
]

export const invoices: Invoice[] = [
  {
    id: 'inv1', clientId: 'c1', number: 'INV-2026-001',
    amount: 2500, status: 'sent', dueDate: '2026-08-01',
    items: [{ id: 'inv1-1', description: 'Consulting fee - Q3 2026', quantity: 1, rate: 2500, amount: 2500 }],
    createdAt: '2026-07-01', updatedAt: '2026-07-01',
  },
]

export const calendarEvents: CalendarEvent[] = [
  {
    id: 'e1', title: 'Deep Work - Literature Review',
    description: 'Focused writing session', start: '2026-07-11T08:00:00', end: '2026-07-11T10:00:00',
    allDay: false, type: 'focus', color: '#8B5CF6', projectId: 'p1',
    createdAt: '2026-07-10', updatedAt: '2026-07-10',
  },
  {
    id: 'e2', title: 'App Wireframe Review',
    description: 'Review semen app wireframes', start: '2026-07-11T11:00:00', end: '2026-07-11T11:45:00',
    allDay: false, type: 'meeting', color: '#F59E0B', projectId: 'p3',
    createdAt: '2026-07-10', updatedAt: '2026-07-10',
  },
  {
    id: 'e3', title: 'Grant Budget Work',
    description: 'Prepare grant budget', start: '2026-07-12T09:00:00', end: '2026-07-12T12:00:00',
    allDay: false, type: 'focus', color: '#3B82F6', projectId: 'p5',
    createdAt: '2026-07-10', updatedAt: '2026-07-10',
  },
  {
    id: 'e4', title: 'PhD Supervisor Meeting',
    description: 'Monthly progress review', start: '2026-07-14T10:00:00', end: '2026-07-14T11:00:00',
    allDay: false, type: 'meeting', color: '#8B5CF6', projectId: 'p1',
    createdAt: '2026-07-10', updatedAt: '2026-07-10',
  },
]

export const aiRecommendations: AIRecommendation[] = [
  {
    id: 'ar1', type: 'warning', title: 'Grant Deadline Approaching',
    description: 'Your Gates Foundation grant proposal is due in 35 days. Recommend completing budget spreadsheet this week.',
    priority: 'critical', category: 'research', actionLabel: 'View Grant', actionLink: '/projects/p5',
    dismissed: false, createdAt: '2026-07-11',
  },
  {
    id: 'ar2', type: 'insight', title: 'Writing Progress Slowing',
    description: 'Your PhD writing has decreased by 40% this week compared to last week. Consider scheduling dedicated writing time.',
    priority: 'high', category: 'writing', actionLabel: 'View Writing', actionLink: '/writing',
    dismissed: false, createdAt: '2026-07-11',
  },
  {
    id: 'ar3', type: 'suggestion', title: 'Best Productivity Window',
    description: 'Analysis shows you work best between 8-11 AM. I recommend scheduling research work tomorrow morning.',
    priority: 'medium', actionLabel: 'Schedule', actionLink: '/calendar',
    dismissed: false, createdAt: '2026-07-11',
  },
  {
    id: 'ar4', type: 'achievement', title: 'Exercise Streak: 7 Days',
    description: 'Great job maintaining your exercise habit for 7 consecutive days!',
    priority: 'low', category: 'health', actionLabel: 'View Habits', actionLink: '/habits',
    dismissed: false, createdAt: '2026-07-11',
  },
  {
    id: 'ar5', type: 'reminder', title: 'Manuscript Not Updated',
    description: 'You haven\'t worked on your manuscript for 4 days. Consider reviewing your progress.',
    priority: 'high', category: 'writing', actionLabel: 'Open Manuscript', actionLink: '/writing/w1',
    dismissed: false, createdAt: '2026-07-11',
  },
]

export const activityLogs: ActivityLog[] = [
  { id: 'al1', type: 'task', action: 'Completed', description: 'Morning exercise', timestamp: '2026-07-11T06:30:00' },
  { id: 'al2', type: 'writing', action: 'Wrote', description: '500 words for book chapter', timestamp: '2026-07-10T14:00:00' },
  { id: 'al3', type: 'research', action: 'Read', description: 'Research paper on deep learning', timestamp: '2026-07-10T10:30:00' },
  { id: 'al4', type: 'task', action: 'Completed', description: 'Literature review outline', timestamp: '2026-07-10T09:00:00' },
  { id: 'al5', type: 'business', action: 'Sent invoice', description: 'Invoice INV-2026-001 to Dr. Johnson', timestamp: '2026-07-09T15:00:00' },
]

export const productivityScores: ProductivityScore[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2026, 5, 11 + i).toISOString(),
  score: Math.floor(Math.random() * 40 + 60),
  tasksCompleted: Math.floor(Math.random() * 8 + 2),
  tasksTotal: Math.floor(Math.random() * 5 + 8),
  focusHours: Math.round((Math.random() * 4 + 2) * 10) / 10,
  deepWorkHours: Math.round((Math.random() * 3 + 0.5) * 10) / 10,
  writingWords: Math.floor(Math.random() * 1000 + 200),
  researchHours: Math.round((Math.random() * 3 + 1) * 10) / 10,
  businessHours: Math.round((Math.random() * 2 + 0.5) * 10) / 10,
  trainingHours: Math.round((Math.random() * 2 + 0.5) * 10) / 10,
}))
