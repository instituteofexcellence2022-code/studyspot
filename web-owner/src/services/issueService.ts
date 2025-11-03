/**
 * Issue Management Service
 * Handles all API communication for issue management
 */

import { apiService } from './api';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category_name: string;
  category_display_name: string;
  category_icon: string;
  category_color: string;
  priority_name: string;
  priority_display_name: string;
  priority_level: number;
  priority_color: string;
  status_name: string;
  status_display_name: string;
  status_color: string;
  status_is_final: boolean;
  assigned_to_first_name?: string;
  assigned_to_last_name?: string;
  assigned_to_email?: string;
  reported_by_first_name?: string;
  reported_by_last_name?: string;
  reported_by_email?: string;
  library_name?: string;
  student_count: number;
  reported_at: string;
  first_response_at?: string;
  resolved_at?: string;
  sla_deadline?: string;
  is_overdue: boolean;
  satisfaction_rating?: number;
  satisfaction_feedback?: string;
  tags: string[];
  attachments: any[];
}

export interface IssueCategory {
  id: string;
  name: string;
  display_name: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
}

export interface IssuePriority {
  id: string;
  name: string;
  display_name: string;
  level: number;
  color: string;
  sla_hours: number;
  is_active: boolean;
}

export interface IssueStatus {
  id: string;
  name: string;
  display_name: string;
  description: string;
  color: string;
  is_final: boolean;
  is_active: boolean;
}

export interface IssueComment {
  id: string;
  issue_id: string;
  user_id: string;
  comment: string;
  is_internal: boolean;
  attachments: any[];
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export interface IssueResponseTemplate {
  id: string;
  tenant_id: string;
  name: string;
  subject: string;
  body: string;
  category_id?: string;
  priority_id?: string;
  is_active: boolean;
  usage_count: number;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_display_name?: string;
  priority_name?: string;
  priority_display_name?: string;
  created_by_first_name?: string;
  created_by_last_name?: string;
}

export interface IssueAnalytics {
  overview: {
    total_issues: number;
    open_issues: number;
    closed_issues: number;
    overdue_issues: number;
    avg_resolution_time_hours: number;
    avg_satisfaction_rating: number;
    satisfaction_count: number;
  };
  byCategory: Array<{
    name: string;
    display_name: string;
    icon: string;
    color: string;
    count: number;
    open_count: number;
  }>;
  byPriority: Array<{
    name: string;
    display_name: string;
    level: number;
    color: string;
    count: number;
    open_count: number;
    overdue_count: number;
  }>;
  trend: Array<{
    date: string;
    total: number;
    resolved: number;
  }>;
}

export interface CreateIssueData {
  title: string;
  description: string;
  category_id: string;
  priority_id: string;
  library_id?: string;
  reported_by_name?: string;
  reported_by_email?: string;
  reported_by_phone?: string;
  student_count?: number;
  tags?: string[];
  attachments?: any[];
}

export interface UpdateIssueData {
  title?: string;
  description?: string;
  category_id?: string;
  priority_id?: string;
  status_id?: string;
  assigned_to_user_id?: string;
  student_count?: number;
  tags?: string[];
  attachments?: any[];
  satisfaction_rating?: number;
  satisfaction_feedback?: string;
}

export interface IssueFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  assigned_to?: string;
  library_id?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface DuplicateIssue {
  id: string;
  title: string;
  description: string;
  student_count: number;
  status_id: string;
  created_at: string;
}

class IssueService {
  private baseUrl = '/api/issue-management';

  // ============================================
  // CATEGORIES
  // ============================================

  async getCategories(): Promise<{ data: IssueCategory[] }> {
    const response = await apiService.get(`${this.baseUrl}/categories`);
    return (response as any).data;
  }

  // ============================================
  // PRIORITIES
  // ============================================

  async getPriorities(): Promise<{ data: IssuePriority[] }> {
    const response = await apiService.get(`${this.baseUrl}/priorities`);
    return (response as any).data;
  }

  // ============================================
  // STATUSES
  // ============================================

  async getStatuses(): Promise<{ data: IssueStatus[] }> {
    const response = await apiService.get(`${this.baseUrl}/statuses`);
    return (response as any).data;
  }

  // ============================================
  // ISSUES CRUD
  // ============================================

  async getIssues(filters: IssueFilters = {}): Promise<{
    data: Issue[];
    meta: {
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    };
  }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await apiService.get(`${this.baseUrl}?${params.toString()}`);
    return (response as any).data;
  }

  async getIssue(id: string): Promise<{ data: Issue }> {
    const response = await apiService.get(`${this.baseUrl}/${id}`);
    return (response as any).data;
  }

  async createIssue(data: CreateIssueData): Promise<{
    data: {
      issue: Issue;
      duplicates: DuplicateIssue[];
      message: string;
    };
  }> {
    const response = await apiService.post(`${this.baseUrl}`, data);
    return (response as any).data;
  }

  async updateIssue(id: string, data: UpdateIssueData): Promise<{ data: Issue }> {
    const response = await apiService.put(`${this.baseUrl}/${id}`, data);
    return (response as any).data;
  }

  async deleteIssue(id: string): Promise<{ message: string }> {
    const response = await apiService.delete(`${this.baseUrl}/${id}`);
    return (response as any).data;
  }

  // ============================================
  // ISSUE COMMENTS
  // ============================================

  async getIssueComments(issueId: string): Promise<{ data: IssueComment[] }> {
    const response = await apiService.get(`${this.baseUrl}/${issueId}/comments`);
    return (response as any).data;
  }

  async addIssueComment(
    issueId: string,
    data: {
      comment: string;
      is_internal?: boolean;
      attachments?: any[];
    }
  ): Promise<{ data: IssueComment }> {
    const response = await apiService.post(`${this.baseUrl}/${issueId}/comments`, data);
    return (response as any).data;
  }

  // ============================================
  // ANALYTICS
  // ============================================

  async getAnalytics(params: {
    library_id?: string;
    period?: '7d' | '30d' | '90d';
  } = {}): Promise<{ data: IssueAnalytics }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await apiService.get(`${this.baseUrl}/analytics/overview?${queryParams.toString()}`);
    return (response as any).data;
  }

  // ============================================
  // RESPONSE TEMPLATES
  // ============================================

  async getResponseTemplates(params: {
    category_id?: string;
    priority_id?: string;
  } = {}): Promise<{ data: IssueResponseTemplate[] }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await apiService.get(`${this.baseUrl}/templates?${queryParams.toString()}`);
    return (response as any).data;
  }

  async createResponseTemplate(data: {
    name: string;
    subject: string;
    body: string;
    category_id?: string;
    priority_id?: string;
  }): Promise<{ data: IssueResponseTemplate }> {
    const response = await apiService.post(`${this.baseUrl}/templates`, data);
    return (response as any).data;
  }

  async updateResponseTemplate(
    id: string,
    data: {
      name?: string;
      subject?: string;
      body?: string;
      category_id?: string;
      priority_id?: string;
      is_active?: boolean;
    }
  ): Promise<{ data: IssueResponseTemplate }> {
    const response = await apiService.put(`${this.baseUrl}/templates/${id}`, data);
    return (response as any).data;
  }

  async deleteResponseTemplate(id: string): Promise<{ message: string }> {
    const response = await apiService.delete(`${this.baseUrl}/templates/${id}`);
    return (response as any).data;
  }

  // ============================================
  // DUPLICATE DETECTION
  // ============================================

  async findDuplicates(data: {
    title: string;
    description: string;
    library_id?: string;
  }): Promise<{ data: DuplicateIssue[] }> {
    const response = await apiService.post(`${this.baseUrl}/duplicates`, data);
    return (response as any).data;
  }

  async mergeIssues(
    mainIssueId: string,
    data: { duplicate_issue_id: string }
  ): Promise<{
    message: string;
    data: {
      main_issue_id: string;
      duplicate_issue_id: string;
      new_student_count: number;
    };
  }> {
    const response = await apiService.post(`${this.baseUrl}/${mainIssueId}/merge`, data);
    return (response as any).data;
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  // Get priority color by level
  getPriorityColor(level: number): string {
    const colors = {
      1: '#F44336', // Critical - Red
      2: '#FF9800', // High - Orange
      3: '#2196F3', // Medium - Blue
      4: '#4CAF50', // Low - Green
    };
    return colors[level as keyof typeof colors] || '#9E9E9E';
  }

  // Get status color by name
  getStatusColor(statusName: string): string {
    const colors = {
      open: '#FF9800',
      assigned: '#2196F3',
      in_progress: '#9C27B0',
      pending_feedback: '#FF5722',
      resolved: '#4CAF50',
      closed: '#9E9E9E',
      cancelled: '#607D8B',
    };
    return colors[statusName as keyof typeof colors] || '#9E9E9E';
  }

  // Format time ago
  formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  }

  // Check if issue is overdue
  isOverdue(issue: Issue): boolean {
    if (issue.status_is_final) return false;
    if (!issue.sla_deadline) return false;
    return new Date(issue.sla_deadline) < new Date();
  }

  // Calculate SLA progress
  getSLAProgress(issue: Issue): number {
    if (!issue.sla_deadline || issue.status_is_final) return 100;
    
    const now = new Date();
    const deadline = new Date(issue.sla_deadline);
    const reported = new Date(issue.reported_at);
    
    const totalTime = deadline.getTime() - reported.getTime();
    const elapsedTime = now.getTime() - reported.getTime();
    
    const progress = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
    return Math.round(progress);
  }

  // Get SLA status
  getSLAStatus(issue: Issue): 'on_time' | 'warning' | 'overdue' {
    if (issue.status_is_final) return 'on_time';
    if (!issue.sla_deadline) return 'on_time';
    
    const now = new Date();
    const deadline = new Date(issue.sla_deadline);
    const timeLeft = deadline.getTime() - now.getTime();
    
    if (timeLeft < 0) return 'overdue';
    if (timeLeft < 2 * 60 * 60 * 1000) return 'warning'; // Less than 2 hours
    return 'on_time';
  }
}

export const issueService = new IssueService();
