import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { TaskLabel } from '../types/Task';
import { User as UserType } from '../types/User';

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedLabels: string[];
  onLabelsChange: (labels: string[]) => void;
  selectedAssignee: string;
  onAssigneeChange: (assigneeId: string) => void;
  users: UserType[];
  labels: TaskLabel[];
  isDark: boolean;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedLabels,
  onLabelsChange,
  selectedAssignee,
  onAssigneeChange,
  users,
  labels,
  isDark
}) => {
  const toggleLabel = (labelId: string) => {
    if (selectedLabels.includes(labelId)) {
      onLabelsChange(selectedLabels.filter(id => id !== labelId));
    } else {
      onLabelsChange([...selectedLabels, labelId]);
    }
  };

  const clearFilters = () => {
    onSearchChange('');
    onLabelsChange([]);
    onAssigneeChange('');
  };

  const hasActiveFilters = searchTerm || selectedLabels.length > 0 || selectedAssignee;

  return (
    <div className={`p-4 rounded-lg border mb-6 ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks, descriptions, or assignees..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Assignee Filter */}
        <div className="lg:w-48">
          <select
            value={selectedAssignee}
            onChange={(e) => onAssigneeChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Assignees</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.username}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${
              isDark 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <X size={16} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Label Filters */}
      {labels.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center space-x-2 mb-2">
            <Filter size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Filter by Labels:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {labels.map(label => (
              <button
                key={label.id}
                onClick={() => toggleLabel(label.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedLabels.includes(label.id)
                    ? 'text-white shadow-md scale-105'
                    : isDark
                      ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
                style={selectedLabels.includes(label.id) ? { backgroundColor: label.color } : {}}
              >
                {label.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};