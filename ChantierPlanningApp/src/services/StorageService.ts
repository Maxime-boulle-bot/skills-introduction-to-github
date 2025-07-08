import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project, Task, TimeEntry, TeamMember } from '../types';

export class StorageService {
  private static readonly PROJECTS_KEY = '@chantier_projects';
  private static readonly TASKS_KEY = '@chantier_tasks';
  private static readonly TIME_ENTRIES_KEY = '@chantier_time_entries';
  private static readonly TEAM_MEMBERS_KEY = '@chantier_team_members';

  // Projects
  static async saveProject(project: Project): Promise<void> {
    try {
      const projects = await this.getProjects();
      const existingIndex = projects.findIndex(p => p.id === project.id);
      
      if (existingIndex >= 0) {
        projects[existingIndex] = project;
      } else {
        projects.push(project);
      }
      
      await AsyncStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  }

  static async getProjects(): Promise<Project[]> {
    try {
      const data = await AsyncStorage.getItem(this.PROJECTS_KEY);
      if (data) {
        const projects = JSON.parse(data);
        return projects.map((p: any) => ({
          ...p,
          startDate: new Date(p.startDate),
          endDate: new Date(p.endDate),
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  static async deleteProject(projectId: string): Promise<void> {
    try {
      const projects = await this.getProjects();
      const filteredProjects = projects.filter(p => p.id !== projectId);
      await AsyncStorage.setItem(this.PROJECTS_KEY, JSON.stringify(filteredProjects));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Tasks
  static async saveTask(task: Task): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const existingIndex = tasks.findIndex(t => t.id === task.id);
      
      if (existingIndex >= 0) {
        tasks[existingIndex] = task;
      } else {
        tasks.push(task);
      }
      
      await AsyncStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving task:', error);
      throw error;
    }
  }

  static async getTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(this.TASKS_KEY);
      if (data) {
        const tasks = JSON.parse(data);
        return tasks.map((t: any) => ({
          ...t,
          startDate: new Date(t.startDate),
          endDate: new Date(t.endDate),
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  }

  static async deleteTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getTasks();
      const filteredTasks = tasks.filter(t => t.id !== taskId);
      await AsyncStorage.setItem(this.TASKS_KEY, JSON.stringify(filteredTasks));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Time Entries
  static async saveTimeEntry(timeEntry: TimeEntry): Promise<void> {
    try {
      const timeEntries = await this.getTimeEntries();
      const existingIndex = timeEntries.findIndex(te => te.id === timeEntry.id);
      
      if (existingIndex >= 0) {
        timeEntries[existingIndex] = timeEntry;
      } else {
        timeEntries.push(timeEntry);
      }
      
      await AsyncStorage.setItem(this.TIME_ENTRIES_KEY, JSON.stringify(timeEntries));
    } catch (error) {
      console.error('Error saving time entry:', error);
      throw error;
    }
  }

  static async getTimeEntries(): Promise<TimeEntry[]> {
    try {
      const data = await AsyncStorage.getItem(this.TIME_ENTRIES_KEY);
      if (data) {
        const timeEntries = JSON.parse(data);
        return timeEntries.map((te: any) => ({
          ...te,
          startTime: new Date(te.startTime),
          endTime: te.endTime ? new Date(te.endTime) : undefined,
          createdAt: new Date(te.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting time entries:', error);
      return [];
    }
  }

  // Team Members
  static async saveTeamMember(teamMember: TeamMember): Promise<void> {
    try {
      const teamMembers = await this.getTeamMembers();
      const existingIndex = teamMembers.findIndex(tm => tm.id === teamMember.id);
      
      if (existingIndex >= 0) {
        teamMembers[existingIndex] = teamMember;
      } else {
        teamMembers.push(teamMember);
      }
      
      await AsyncStorage.setItem(this.TEAM_MEMBERS_KEY, JSON.stringify(teamMembers));
    } catch (error) {
      console.error('Error saving team member:', error);
      throw error;
    }
  }

  static async getTeamMembers(): Promise<TeamMember[]> {
    try {
      const data = await AsyncStorage.getItem(this.TEAM_MEMBERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting team members:', error);
      return [];
    }
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.PROJECTS_KEY,
        this.TASKS_KEY,
        this.TIME_ENTRIES_KEY,
        this.TEAM_MEMBERS_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}