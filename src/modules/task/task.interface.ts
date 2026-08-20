export interface TCreateTask {
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  projectId?: string;
  assignedToId?: string;
  dueDate?: string;
}

export interface TUpdateTask {
  title?: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
}

export interface TAssignTask {
  assignedToId: string;
}

export interface TTaskQuery {
  page?: string;
  limit?: string;
  search?: string;

  status?: "TODO" | "IN_PROGRESS" | "DONE";

  priority?: "LOW" | "MEDIUM" | "HIGH";

  sortBy?: string;

  sortOrder?: "asc" | "desc";

}
