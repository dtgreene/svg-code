import { proxy } from 'valtio';

export const app = proxy({
  sidebarTab: 'image',
  fileData: null,
  fileName: '',
  workerData: null,
  workerError: null,
});
