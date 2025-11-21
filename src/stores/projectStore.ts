import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  assigneeId?: number;
  sprintId: string;
  estimatedHours: number;
  actualHours: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  attachments: string[];
  comments: Comment[];
}

export interface Sprint {
  id: string;
  name: string;
  description: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  goal: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  velocity: number;
  plannedPoints: number;
  completedPoints: number;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  sprints: Sprint[];
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  currentSprint: Sprint | null;
  activeSprint: Sprint | null;
  
  // Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'sprints' | 'totalTasks' | 'completedTasks'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  addSprint: (projectId: string, sprint: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt' | 'tasks' | 'velocity' | 'plannedPoints' | 'completedPoints'>) => void;
  updateSprint: (sprintId: string, updates: Partial<Sprint>) => void;
  deleteSprint: (sprintId: string) => void;
  setActiveSprint: (sprint: Sprint | null) => void;
  
  addTask: (sprintId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'actualHours'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  
  addComment: (taskId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteComment: (commentId: string) => void;
  
  getTasksByStatus: (sprintId: string, status: TaskStatus) => Task[];
  getTasksByAssignee: (assigneeId: number) => Task[];
  getSprintVelocity: (sprintId: string) => number;
  getProjectProgress: (projectId: string) => number;
  getBurndownData: (sprintId: string) => { day: number; remaining: number; ideal: number }[];
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentSprint: null,
      activeSprint: null,

      addProject: (project) => {
        const newProject: Project = {
          ...project,
          id: Date.now().toString(),
          sprints: [],
          totalTasks: 0,
          completedTasks: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: [...state.projects, newProject],
        }));
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates, updatedAt: new Date().toISOString() } : project
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        }));
      },

      addSprint: (projectId, sprint) => {
        const newSprint: Sprint = {
          ...sprint,
          id: Date.now().toString(),
          tasks: [],
          velocity: 0,
          plannedPoints: 0,
          completedPoints: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, sprints: [...project.sprints, newSprint], updatedAt: new Date().toISOString() }
              : project
          ),
        }));
      },

      updateSprint: (sprintId, updates) => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            sprints: project.sprints.map((sprint) =>
              sprint.id === sprintId ? { ...sprint, ...updates, updatedAt: new Date().toISOString() } : sprint
            ),
          })),
        }));
      },

      deleteSprint: (sprintId) => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            sprints: project.sprints.filter((sprint) => sprint.id !== sprintId),
          })),
        }));
      },

      setActiveSprint: (sprint) => {
        set({ activeSprint: sprint });
      },

      addTask: (sprintId, task) => {
        const newTask: Task = {
          ...task,
          id: Date.now().toString(),
          comments: [],
          attachments: [],
          actualHours: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            sprints: project.sprints.map((sprint) =>
              sprint.id === sprintId
                ? {
                    ...sprint,
                    tasks: [...sprint.tasks, newTask],
                    plannedPoints: sprint.plannedPoints + (task.estimatedHours || 0),
                    updatedAt: new Date().toISOString(),
                  }
                : sprint
            ),
          })),
        }));
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            sprints: project.sprints.map((sprint) => ({
              ...sprint,
              tasks: sprint.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
              ),
            })),
          })),
        }));
      },

      deleteTask: (taskId) => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            sprints: project.sprints.map((sprint) => ({
              ...sprint,
              tasks: sprint.tasks.filter((task) => task.id !== taskId),
            })),
          })),
        }));
      },

      moveTask: (taskId, newStatus) => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            sprints: project.sprints.map((sprint) => ({
              ...sprint,
              tasks: sprint.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
                  : task
              ),
            })),
          })),
        }));
      },

      addComment: (taskId, comment) => {
        const newComment: Comment = {
          ...comment,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            sprints: project.sprints.map((sprint) => ({
              ...sprint,
              tasks: sprint.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, comments: [...task.comments, newComment], updatedAt: new Date().toISOString() }
                  : task
              ),
            })),
          })),
        }));
      },

      deleteComment: (commentId) => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            sprints: project.sprints.map((sprint) => ({
              ...sprint,
              tasks: sprint.tasks.map((task) => ({
                ...task,
                comments: task.comments.filter((comment) => comment.id !== commentId),
              })),
            })),
          })),
        }));
      },

      getTasksByStatus: (sprintId, status) => {
        const state = get();
        const sprint = state.projects
          .flatMap((p) => p.sprints)
          .find((s) => s.id === sprintId);
        return sprint?.tasks.filter((task) => task.status === status) || [];
      },

      getTasksByAssignee: (assigneeId) => {
        const state = get();
        return state.projects
          .flatMap((p) => p.sprints)
          .flatMap((s) => s.tasks)
          .filter((task) => task.assigneeId === assigneeId);
      },

      getSprintVelocity: (sprintId) => {
        const state = get();
        const sprint = state.projects
          .flatMap((p) => p.sprints)
          .find((s) => s.id === sprintId);
        
        if (!sprint) return 0;
        
        const completedTasks = sprint.tasks.filter((task) => task.status === 'done');
        return completedTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
      },

      getProjectProgress: (projectId) => {
        const state = get();
        const project = state.projects.find((p) => p.id === projectId);
        
        if (!project) return 0;
        
        const allTasks = project.sprints.flatMap((s) => s.tasks);
        const completedTasks = allTasks.filter((task) => task.status === 'done');
        
        return allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;
      },

      getBurndownData: (sprintId) => {
        const state = get();
        const sprint = state.projects
          .flatMap((p) => p.sprints)
          .find((s) => s.id === sprintId);
        
        if (!sprint) return [];
        
        const totalPoints = sprint.plannedPoints;
        const totalDays = 14; // Assume 2-week sprint
        const idealBurndown = totalPoints;
        
        const data = [];
        for (let day = 0; day <= totalDays; day++) {
          const idealRemaining = totalPoints - (totalPoints / totalDays) * day;
          const actualRemaining = sprint.tasks
            .filter((task) => task.status !== 'done')
            .reduce((sum, task) => sum + task.estimatedHours, 0);
          
          data.push({
            day,
            remaining: actualRemaining,
            ideal: idealRemaining,
          });
        }
        
        return data;
      },
    }),
    {
      name: 'project-storage',
    }
  )
);