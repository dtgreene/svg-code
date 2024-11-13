import { proxy } from 'valtio';

export const app = proxy({
  sidebarTab: 'image',
  sidebarOpen: true,
  fileData: null,
  fileName: '',
  workerData: null,
  workerError: null,
});
