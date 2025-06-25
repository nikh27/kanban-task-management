import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, Tag, Upload, MessageCircle, Send, Paperclip, Download } from 'lucide-react';
import { Task, TaskStatus, TaskLabel } from '../types/Task';
import { User } from '../types/User';
import { UserSelector } from './UserSelector';
import { UserAvatar } from './UserAvatar';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'> | Task) => void;
  onAddComment: (taskId: string, content: string, authorId: string, authorName: string) => void;
  onAddAttachment: (taskId: string, file: File, uploadedBy: string) => void;
  task?: Task;
  defaultStatus?: TaskStatus;
  users: User[];
  labels: TaskLabel[];
  currentUser: User;
  isDark: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onAddComment,
  onAddAttachment,
  task,
  defaultStatus = 'todo',
  users,
  labels,
  currentUser,
  isDark
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: defaultStatus as TaskStatus,
    assigneeId: '',
    assigneeName: '',
    due_date: '',
    labels: [] as TaskLabel[]
  });
  console.log("thisef wejgnew ",formData)
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments'>('details');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        assigneeId: task.assigneeId,
        assigneeName: task.assigneeName,
        due_date: task.due_date,
        labels: task.labels || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: defaultStatus,
        assigneeId: '',
        assigneeName: '',
        due_date: '',
        labels: []
      });
    }
  }, [task, defaultStatus, isOpen]);

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.title.trim()) return;

  // Ensure due_date is in YYYY-MM-DD format
  let due_date = formData.due_date;
  if (due_date) {
    // If due_date contains time, slice to YYYY-MM-DD
    due_date = due_date.slice(0, 10);
  }

  const taskData = {
    ...formData,
    due_date,
    attachments: task?.attachments || [],
    comments: task?.comments || []
  };

  if (task) {
    onSave({ ...task, ...taskData });
  } else {
    onSave({
      ...taskData,
      attachments: [],
      comments: []
    });
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUserSelect = (user: User) => {
    setFormData(prev => ({
      ...prev,
      assigneeId: user.id,
      assigneeName: user.username
    }));
  };

  const toggleLabel = (label: TaskLabel) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.some(l => l.id === label.id)
        ? prev.labels.filter(l => l.id !== label.id)
        : [...prev.labels, label]
    }));
  };

  const handleAddComment = () => {
    if (newComment.trim() && task) {
      onAddComment(task.id, newComment.trim(), currentUser.id, currentUser.username);
      setNewComment('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && task) {
      onAddAttachment(task.id, file, currentUser.username);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg sm:text-xl font-semibold ${
            isDark ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-full max-h-[calc(90vh-80px)]">
          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`flex items-center space-x-2 text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FileText size={16} />
                  <span>Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter task title..."
                  required
                />
              </div>

              <div>
                <label className={`flex items-center space-x-2 text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <FileText size={16} />
                  <span>Description</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter task description..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`flex items-center space-x-2 text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Tag size={16} />
                    <span>Status</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="todo">Todo</option>
                    <option value="inprogress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className={`flex items-center space-x-2 text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Calendar size={16} />
                    <span>Due Date</span>
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`flex items-center space-x-2 text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <span>Assignee</span>
                </label>
                <UserSelector
                  users={users}
                  selectedUserId={formData.assigneeId}
                  onSelect={handleUserSelect}
                  placeholder="Select assignee..."
                  isDark={isDark}
                />
              </div>

              {/* Labels */}
              {labels.length > 0 && (
                <div>
                  <label className={`flex items-center space-x-2 text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Tag size={16} />
                    <span>Labels</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {labels.map(label => (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() => toggleLabel(label)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          formData.labels.some(l => l.id === label.id)
                            ? 'text-white shadow-md scale-105'
                            : isDark
                              ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                        }`}
                        style={formData.labels.some(l => l.id === label.id) ? { backgroundColor: label.color } : {}}
                      >
                        {label.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {task ? 'Update' : 'Create'} Task
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar for existing tasks */}
          {task && (
            <div className={`lg:w-96 border-l overflow-y-auto ${
              isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
            }`}>
              {/* Tabs */}
              <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                {[
                  { id: 'comments', label: 'Comments', icon: MessageCircle },
                  { id: 'attachments', label: 'Files', icon: Paperclip }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? isDark
                          ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                          : 'text-blue-600 border-b-2 border-blue-600 bg-white'
                        : isDark
                          ? 'text-gray-400 hover:text-gray-300'
                          : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                    {tab.id === 'comments'  && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                       
                      </span>
                    )}
                    {tab.id === 'attachments'  && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="p-4 space-y-4">
                  {/* Add Comment */}
                  <div className="space-y-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      <Send size={16} />
                      <span>Add Comment</span>
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {(task.comments ?? []).map(comment => (
                      <div key={comment.id} className={`p-3 rounded-lg ${
                        isDark ? 'bg-gray-700' : 'bg-white'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <UserAvatar 
                            user={users.find(u => u.id === comment.authorId) || currentUser} 
                            size="sm" 
                          />
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${
                              isDark ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                              {comment.authorName}
                            </div>
                            <div className={`text-xs ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {formatDate(comment.createdAt)}
                            </div>
                          </div>
                        </div>
                        <p className={`text-sm ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {comment.content}
                        </p>
                      </div>
                    ))}
                    {(task.comments?.length ?? 0) === 0 && (
                      <div className={`text-center py-8 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No comments yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments Tab */}
              {activeTab === 'attachments' && (
                <div className="p-4 space-y-4">
                  {/* Upload */}
                  <div>
                    <label className={`block w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      isDark 
                        ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700' 
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="text-center">
                        <Upload size={24} className={`mx-auto mb-2 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <p className={`text-sm ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Click to upload a file
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Attachments List */}
                  <div className="space-y-2">
                    {(task.attachments ?? []).map(attachment => (
                      <div key={attachment.id} className={`p-3 rounded-lg border flex items-center space-x-3 ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      }`}>
                        <Paperclip size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${
                            isDark ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {attachment.name}
                          </div>
                          <div className={`text-xs ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {formatFileSize(attachment.size)} • {attachment.uploadedBy}
                          </div>
                        </div>
                        <a
                          href={attachment.url}
                          download={attachment.name}
                          className={`p-1 rounded transition-colors ${
                            isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                          }`}
                        >
                          <Download size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                        </a>
                      </div>
                    ))}
                    {(task.attachments?.length ?? 0) === 0 && (
                      <div className={`text-center py-8 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <Paperclip size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No files attached</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};