export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: TaskStatus;
  priority: Priority;
  assignedTo: string[];
  location: string;
  estimatedHours: number;
  actualHours?: number;
  materials: Material[];
  dependencies: string[]; // IDs of tasks that must be completed first
  category: TaskCategory;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskCategory {
  FOUNDATION = 'foundation',
  STRUCTURE = 'structure',
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  FINISHING = 'finishing',
  INSPECTION = 'inspection',
  OTHER = 'other'
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  client: string;
  budget?: number;
  tasks: Task[];
  team: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  skills: string[];
  hourlyRate?: number;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  hours: number;
  description?: string;
  location?: string;
  createdAt: Date;
}

export interface AIPrompt {
  projectDescription: string;
  duration: number; // in days
  budget?: number;
  teamSize: number;
  priorities: string[];
  constraints?: string[];
  requirements?: string[];
}

export interface Navigation {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
}