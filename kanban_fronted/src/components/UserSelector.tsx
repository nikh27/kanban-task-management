import React, { useState } from 'react';
import { ChevronDown, Search, User as UserIcon } from 'lucide-react';
import { User } from '../types/User';
import { UserAvatar } from './UserAvatar';

interface UserSelectorProps {
  users: User[];
  selectedUserId?: string;
  onSelect: (user: User) => void;
  placeholder?: string;
  isDark?: boolean;
}


export const UserSelector: React.FC<UserSelectorProps> = ({
  users,
  selectedUserId,
  onSelect,
  placeholder = "Select assignee...",
  isDark = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedUser = users.find(user => user.id === selectedUserId);
  
  const filteredUsers = users.filter(user =>
    (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  console.log("selected user",selectedUser)
  const handleSelect = (user: User) => {
    onSelect(user);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between ${
          isDark 
            ? 'bg-gray-700 border-gray-600 text-white' 
            : 'bg-white border-gray-300 text-gray-900'
        }`}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {selectedUser ? (
            <UserAvatar user={selectedUser} size="sm" showName />
          ) : (
            <>
              <UserIcon size={16} className={isDark ? 'text-gray-400' : 'text-gray-400'} />
              <span className={`truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {placeholder}
              </span>
            </>
          )}
        </div>
        <ChevronDown size={16} className={`transition-transform ${
          isOpen ? 'rotate-180' : ''
        } ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-60 overflow-hidden ${
          isDark 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-2 border-b ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>
            <div className="relative">
              <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark 
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className={`w-full px-3 py-2 text-left transition-colors flex items-center space-x-3 ${
                    isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <UserAvatar user={user} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${
                      isDark ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {user.username}
                    </div>
                    <div className={`text-xs truncate ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {user.email}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className={`px-3 py-4 text-sm text-center ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No users found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


