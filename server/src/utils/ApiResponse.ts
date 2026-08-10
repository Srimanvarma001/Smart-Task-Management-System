export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const ok = <T>(data: T): ApiResponse<T> => ({ success: true, data });