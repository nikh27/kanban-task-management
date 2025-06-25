import React from 'react';
import { Calendar, Edit3, Trash2, MessageCircle, Paperclip } from 'lucide-react';
import { Task } from '../types/Task';
import { User } from '../types/User';
import { UserAvatar } from './UserAvatar';

interface TaskCardProps {
  task: Task;
  assignedUser?: User;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDark: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  assignedUser,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  isDragging,
  isDark
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = new Date(task.due_date) < new Date();

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={onDragEnd}
      className={`rounded-lg shadow-sm border p-4 mb-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md group ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      } ${
        isDark 
          ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className={`font-semibold text-sm line-clamp-2 flex-1 pr-2 ${
          isDark ? 'text-gray-100' : 'text-gray-900'
        }`}>
          {task.title}
        </h3>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            className={`p-1 rounded transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <Edit3 size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className={`p-1 rounded transition-colors ${
              isDark ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
            }`}
          >
            <Trash2 size={14} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Labels */}
      {(task.labels?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {(task.labels ?? []).map(label => (
            <span
              key={label.id}
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {task.description && (
        <p className={`text-xs mb-3 line-clamp-2 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {task.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {(task.comments?.length ?? 0) > 0 && (
            <div className={`flex items-center space-x-1 text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <MessageCircle size={12} />
              <span>{task.comments?.length ?? 0}</span>
            </div>
          )}
          {(task.attachments?.length ?? 0) > 0 && (
            <div className={`flex items-center space-x-1 text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Paperclip size={12} />
              <span>{task.attachments?.length ?? 0}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {assignedUser && (
            <UserAvatar user={assignedUser} size="sm" />
          )}
        </div>

        <div className={`flex items-center space-x-1 text-xs ${
          isOverdue ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Calendar size={12} />
          <span>{formatDate(task.due_date)}</span>
        </div>
      </div>
    </div>
  );
};