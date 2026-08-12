export interface DashboardData {
  total_tasks: number;

  by_status: {
    to_do: number;
    in_progress: number;
    done: number;
  };

  overdue_tasks: number;
}
