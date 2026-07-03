import { getOriginPoint } from './origin';

const commandExp = new RegExp(/G\d+[^G]*/g);

export function generateGCode(pathList, pathListOptions, gcodeOptions) {
  if (pathList.length === 0) return '';

  const { width, height } = pathListOptions;
  const { x: originX, y: originY } = getOriginPoint(
    gcodeOptions.origin,
    width,
    height,
  );
  const signX = gcodeOptions.invertX ? -1 : 1;
  const signY = gcodeOptions.invertY ? 1 : -1;

  const onSequence = formatInputSequence(gcodeOptions.toolOnSequence);
  const offSequence = formatInputSequence(gcodeOptions.toolOffSequence);
  const programBeginSequence = formatInputSequence(
    gcodeOptions.programBeginSequence,
  );
  const programEndSequence = formatInputSequence(
    gcodeOptions.programEndSequence,
  );

  let result = ['G21', 'G90', `F${gcodeOptions.feedRate}`, ...offSequence];

  if (programBeginSequence.length > 0) {
    result.push(...programBeginSequence);
  }

  // Coordinates are measured from the origin point, with a sign per axis. The
  // default signs negate Y because drawing space is Y-down while GCode is
  // Y-up; the invert options flip an axis relative to that convention.
  pathList.forEach((path) => {
    const x0 = round(signX * (path[0].x - originX));
    const y0 = round(signY * (path[0].y - originY));

    result.push(`G0 X${x0} Y${y0}`);
    result.push(...onSequence);

    for (let i = 1; i < path.length; i++) {
      const x = round(signX * (path[i].x - originX));
      const y = round(signY * (path[i].y - originY));

      result.push(`G1 X${x} Y${y}`);
    }
    result.push(...offSequence);
  });

  if (programEndSequence.length > 0) {
    result.push(...programEndSequence);
  }

  return result.join('\n');
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function formatInputSequence(sequence) {
  const commands = sequence.toUpperCase().match(commandExp);

  if (commands) {
    return commands.map((command) => command.trim()).filter(Boolean);
  }

  return [];
}
