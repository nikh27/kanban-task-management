import React from 'react';
import { Plus } from 'lucide-react';
import { Task, TaskStatus } from '../types/Task';
import { User } from '../types/User';
import { TaskCard } from './TaskCard';

interface ColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  users: User[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, status: TaskStatus) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, status: TaskStatus) => void;
  draggedTask: string | null;
  dragOverColumn: TaskStatus | null;
  isDark: boolean;
}

const columnColors = {
  todo: 'border-t-blue-500 bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800',
  inprogress: 'border-t-amber-500 bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800',
  done: 'border-t-green-500 bg-gradient-to-b from-green-50 to-white dark:from-green-900/20 dark:to-gray-800'
};

const buttonColors = {
  todo: 'bg-blue-500 hover:bg-blue-600',
  inprogress: 'bg-amber-500 hover:bg-amber-600',
  done: 'bg-green-500 hover:bg-green-600'
};

export const Column: React.FC<ColumnProps> = ({
  title,
  status,
  tasks,
  users,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  draggedTask,
  dragOverColumn,
  isDark
}) => {
  const isDragOver = dragOverColumn === status;

  const getUserById = (id: string) => users.find(user => user.id === id);

  return (
    <div className="flex-1 min-w-80 sm:min-w-72">
      <div
        className={`rounded-lg border-t-4 ${columnColors[status]} min-h-96 transition-all duration-300 ${
          isDragOver ? 'ring-2 ring-blue-300 bg-blue-50 dark:bg-blue-900/20' : ''
        } ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
        onDragOver={(e) => onDragOver(e, status)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, status)}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h2 className={`font-semibold text-sm sm:text-base ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                {title}
              </h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isDark 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {tasks.length}
              </span>
            </div>
            <button
              onClick={onAddTask}
              className={`${buttonColors[status]} text-white p-2 rounded-lg transition-colors shadow-sm hover:shadow-md`}
              title="Add new task"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                assignedUser={getUserById(task.assigneeId)}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                isDragging={draggedTask === task.id}
                isDark={isDark}
              />
            ))}
            
            {tasks.length === 0 && (
              <div className={`text-center py-8 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <p className="text-sm">No tasks yet</p>
                <p className="text-xs mt-1">Click + to add a task</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};