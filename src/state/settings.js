import { createStorageProxy, StorageKeys } from './storage';

export const settings = createStorageProxy(StorageKeys.SETTINGS, {
  width: '297',
  height: '420',
  preset: '0',
  marginX: '20',
  marginY: '20',
  alignment: 'middle',
  rotation: '0',
  dimensionMode: 'boundingbox',
  grid: {
    enabled: false,
    totalWidth: '297',
    totalHeight: '420',
  },
  postProcessing: {
    merge: true,
    mergeTolerance: '0.1',
    filterShort: true,
    filterShortLength: '0.1',
    reorder: true,
    randomizeStart: false,
    randomizeStartTolerance: '0.1',
  },
  display: {
    toolOn: true,
    toolOff: true,
    margins: true,
    boundingBox: false,
    strokeWidth: '1',
  },
  gcode: {
    feedRate: '300',
    toolOnSequence: '',
    toolOffSequence: '',
    programBeginSequence: '',
    programEndSequence: '',
  },
  autoRefresh: true,
  inputError: null,
});
