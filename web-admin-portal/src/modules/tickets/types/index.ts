/**
 * Ticket Management Types
 */

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  tenantId: string;
  tenantName: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  sla?: {
    responseTime: number;
    resolutionTime: number;
  };
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userN: string;
  comment: string;
  createdAt: string;
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface TicketStatistics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResolutionTime: number;
  satisfactionRate: number;
}

export interface TicketCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface SLAConfiguration {
  id: string;
  category: string;
  responseTime: number;
  resolutionTime: number;
}

export interface TicketDashboard {
  stats: TicketStatistics;
  categories: TicketCategory[];
  recentTickets: Ticket[];
}

export interface CreateTicketData {
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  tenantId: string;
}

export interface UpdateTicketData {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
  description?: string;
}

export interface BulkTicketAction {
  action: 'assign' | 'close' | 'delete';
  ticketIds: string[];
  assignedTo?: string;
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  assignedTo?: string;
  search?: string;
}


