export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'done';
  assigneeId: string;
  assigneeName: string;
  due_date: string;
  createdAt: string;
  labels: TaskLabel[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
}

export type TaskStatus = 'todo' | 'inprogress' | 'done';

export const defaultLabels: TaskLabel[] = [
  { id: '1', name: 'Bug', color: '#EF4444' },
  { id: '2', name: 'Feature', color: '#10B981' },
  { id: '3', name: 'Enhancement', color: '#3B82F6' },
  { id: '4', name: 'Documentation', color: '#F59E0B' },
  { id: '5', name: 'Testing', color: '#8B5CF6' },
  { id: '6', name: 'Design', color: '#EC4899' },
  { id: '7', name: 'Backend', color: '#6B7280' },
  { id: '8', name: 'Frontend', color: '#14B8A6' },
  { id: '9', name: 'Urgent', color: '#DC2626' },
  { id: '10', name: 'Low Priority', color: '#9CA3AF' }
];