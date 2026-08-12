export interface ApiError {
  code: string;
  details?: {
    field: string;
    message: string;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: ApiError | null;
}
