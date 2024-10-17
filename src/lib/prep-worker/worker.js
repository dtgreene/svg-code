import debounce from 'lodash.debounce';

import { app } from 'src/state/app';
import { settings } from 'src/state/settings';

const worker = new Worker(new URL('./worker-script.js', import.meta.url), {
  type: 'module',
});

worker.addEventListener('message', handleMessage);

export function workerStart() {
  app.workerError = null;
  settings.inputError = null;

  if (!app.fileData) {
    app.workerData = null;
    return;
  }

  const {
    width,
    height,
    marginX,
    marginY,
    alignment,
    rotation,
    useBoundingBox,
    postProcessing,
    grid,
  } = settings;
  const {
    merge,
    mergeTolerance,
    filterShort,
    filterShortLength,
    reorder,
    randomizeStart,
    randomizeStartTolerance,
  } = postProcessing;

  const alignmentIndex = ['start', 'middle', 'end'].indexOf(alignment);
  const prepOptions = {
    width: Number(width) || 0,
    height: Number(height) || 0,
    marginX: Number(marginX) || 0,
    marginY: Number(marginY) || 0,
    alignment: alignmentIndex,
    rotation: Number(rotation) || 0,
    useBoundingBox,
    postProcessing: {
      merge,
      mergeTolerance: Number(mergeTolerance) || 0,
      filterShort,
      filterShortLength: Number(filterShortLength) || 0,
      reorder,
      randomizeStart,
      randomizeStartTolerance: Number(randomizeStartTolerance) || 0,
    },
    grid: {
      enabled: grid.enabled,
      cols: Number(grid.cols) || 0,
      rows: Number(grid.rows) || 0,
    },
  };

  if (prepOptions.width <= 0 || prepOptions.height <= 0) {
    settings.inputError = 'Invalid dimensions';
    return;
  }

  if (prepOptions.marginX < 0 || prepOptions.marginY < 0) {
    settings.inputError = 'Invalid margin value(s)';
    return;
  }

  if (prepOptions.alignment === -1) {
    settings.inputError = 'Invalid alignment value';
    return;
  }

  if (
    prepOptions.postProcessing.merge &&
    prepOptions.postProcessing.mergeTolerance <= 0
  ) {
    settings.inputError = 'Invalid merge tolerance';
    return;
  }

  if (
    prepOptions.postProcessing.filterShort &&
    prepOptions.postProcessing.filterShortLength <= 0
  ) {
    settings.inputError = 'Invalid filter short length';
    return;
  }

  if (
    prepOptions.postProcessing.randomizeStart &&
    prepOptions.postProcessing.randomizeStartTolerance <= 0
  ) {
    settings.inputError = 'Invalid randomize start tolerance';
    return;
  }

  if (
    prepOptions.grid.enabled &&
    (prepOptions.grid.rows <= 0 || prepOptions.grid.cols <= 0)
  ) {
    settings.inputError = 'Invalid grid rows or columns';
    return;
  }

  worker.postMessage(
    JSON.stringify({ svg: app.fileData, options: prepOptions })
  );
}

export const debouncedWorkerStart = debounce(workerStart, 500);

function handleMessage(event) {
  try {
    const { isError, errorMessage, result } = JSON.parse(event.data);

    if (isError) {
      app.workerError = errorMessage;
    } else {
      app.workerError = null;
      app.workerData = result;
    }
  } catch (error) {
    console.error('Could not read worker message:', error);
  }
}
