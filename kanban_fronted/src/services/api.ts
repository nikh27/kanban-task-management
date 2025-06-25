const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Client class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{
      user: any;
      token: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string) {
    return this.request<{
      user: any;
      token: string;
      refreshToken: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  // Users endpoints
  async getUsers() {
    return this.request<any[]>('/users');
  }

  async getUser(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Tasks endpoints
  async getTasks(params?: {
    status?: string;
    assignee?: string;
    search?: string;
    labels?: string;
    page?: number;
    limit?: number;
  }) {
    let endpoint = '/tasks';
    const searchParams = new URLSearchParams();

    if (params) {
      // If assignee is present, use /tasks/{assigneeId}
      if (params.assignee) {
        endpoint = `/tasks/${params.assignee}`;
        // Remove assignee from params so it's not added as a query param
        const { assignee, ...rest } = params;
        Object.entries(rest).forEach(([key, value]) => {
          if (value) searchParams.append(key, value.toString());
        });
      } else {
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value.toString());
        });
      }
    }

    const queryString = searchParams.toString();
    if (queryString) endpoint += `?${queryString}`;

    const response = await this.request<any>(endpoint);

    // Always extract from response.results.data
    if (response?.results?.data && Array.isArray(response.results.data)) {
      return {
        success: true,
        data: response.results.data,
        count: response.count,
        next: response.next,
        previous: response.previous,
      };
    }

    console.warn("Unexpected tasks response structure:", response);
    return { success: false, data: [], count: 0, next: null, previous: null };
  }

  async getTask(id: string) {
    return this.request<any>(`/tasks/${id}`);
  }

  async createTask(data: any) {
    return this.request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: any) {
    return this.request<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateTaskStatus(id: string, status: string) {
    return this.request<any>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateTaskAssignee(id: string, assigneeId: string) {
    return this.request<any>(`/tasks/${id}/assignee`, {
      method: 'PATCH',
      body: JSON.stringify({ assigneeId }),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Labels endpoints
  async getLabels() {
    return this.request<any[]>('/labels');
  }

  async createLabel(data: { name: string; color: string }) {
    return this.request<any>('/labels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLabel(id: string, data: { name: string; color: string }) {
    return this.request<any>(`/labels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLabel(id: string) {
    return this.request(`/labels/${id}`, {
      method: 'DELETE',
    });
  }

  // Comments endpoints
  async getTaskComments(taskId: string) {
    return this.request<any[]>(`/tasks/${taskId}/comments`);
  }

  async addTaskComment(taskId: string, content: string) {
    return this.request<any>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async updateComment(id: string, content: string) {
    return this.request<any>(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(id: string) {
    return this.request(`/comments/${id}`, {
      method: 'DELETE',
    });
  }

  // Attachments endpoints
  async getTaskAttachments(taskId: string) {
    return this.request<any[]>(`/tasks/${taskId}/attachments`);
  }

  async uploadTaskAttachment(taskId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/tasks/${taskId}/attachments`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    return data;
  }

  async deleteAttachment(id: string) {
    return this.request(`/attachments/${id}`, {
      method: 'DELETE',
    });
  }

  async downloadAttachment(id: string) {
    const response = await fetch(`${this.baseURL}/attachments/${id}/download`, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    });
    
    if (!response.ok) {
      throw new Error('Download failed');
    }
    
    return response.blob();
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request<{
      totalTasks: number;
      todoTasks: number;
      inProgressTasks: number;
      doneTasks: number;
      overdueTasks: number;
      totalUsers: number;
      tasksThisWeek: number;
      completedThisWeek: number;
    }>('/dashboard/stats');
  }

  async getDashboardActivity() {
    return this.request<any[]>('/dashboard/activity');
  }

  // Search endpoints
  async searchTasks(query: string, filters?: any) {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    
    return this.request<{
      tasks: any[];
      totalResults: number;
      searchQuery: string;
      filters: any;
    }>(`/search/tasks?${params.toString()}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);