export const taskService = {
  list: async (_userId: string, _query: unknown) => [],
  create: async (_userId: string, _data: unknown) => null,
  get: async (_userId: string, _taskId: string) => null,
  update: async (_userId: string, _taskId: string, _data: unknown) => null,
  updateStatus: async (_userId: string, _taskId: string, _status: unknown) => null,
  remove: async (_userId: string, _taskId: string) => null,
};