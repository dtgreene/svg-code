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
    dimensionMode,
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
  const useBoundingBox = dimensionMode === 'boundingbox';
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
      totalWidth: Number(grid.totalWidth) || 0,
      totalHeight: Number(grid.totalHeight) || 0,
      includeCorners: grid.includeCorners,
      cornerLength: Number(grid.cornerLength) || 0,
    },
  };

  if (prepOptions.width <= 0 || prepOptions.height <= 0) {
    settings.inputError = 'Invalid dimensions; must be positive';
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

  if (prepOptions.grid.enabled) {
    if (prepOptions.grid.totalWidth <= 0 || prepOptions.grid.totalHeight <= 0) {
      settings.inputError = 'Invalid grid width or height';
      return;
    }

    if (
      prepOptions.grid.totalWidth < prepOptions.width ||
      prepOptions.grid.totalHeight < prepOptions.height
    ) {
      settings.inputError =
        'Invalid grid dimensions; each dimension must be greater than its corresponding base dimension';
      return;
    }

    if (
      prepOptions.grid.includeCorners &&
      prepOptions.grid.cornerLength === 0
    ) {
      settings.inputError = 'Invalid corner length; must be greater than zero';
      return;
    }

    if (
      prepOptions.grid.includeCorners &&
      (prepOptions.grid.cornerLength > prepOptions.width * 0.5 ||
        prepOptions.grid.cornerLength > prepOptions.height * 0.5)
    ) {
      settings.inputError =
        'Invalid corner length; must be less than half of the smallest base dimension';
      return;
    }
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
