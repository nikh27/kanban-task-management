export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
}

export const defaultUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    color: '#3B82F6'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@company.com',
    color: '#10B981'
  },
  {
    id: '3',
    name: 'Alex Rodriguez',
    email: 'alex@company.com',
    color: '#F59E0B'
  },
  {
    id: '4',
    name: 'Emma Davis',
    email: 'emma@company.com',
    color: '#EF4444'
  },
  {
    id: '5',
    name: 'James Wilson',
    email: 'james@company.com',
    color: '#8B5CF6'
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    email: 'lisa@company.com',
    color: '#EC4899'
  }
];