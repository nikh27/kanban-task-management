import React from 'react';
import { User } from '../types/User';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  isDark?: boolean; // add this
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md', 
  showName = false,
  isDark = false // add this
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const getInitials = (name?: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  return (
    <div className="flex items-center space-x-2">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium shadow-sm`}
        style={{ backgroundColor: user.color }}
        title={user.username}
      >
        {getInitials(user.username)}
      </div>
      {showName && (
        <span className={`text-sm font-medium truncate ${isDark ? 'text-black-200' : 'text-white-700'}`}>
          {user.username}
        </span>
      )}
    </div>
  );
};