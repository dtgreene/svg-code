const commandExp = new RegExp(/G\d+[^G]*/g);

export function generateGCode(pathList, pathListOptions, gcodeOptions) {
  if (pathList.length === 0) return '';

  const { height } = pathListOptions;

  const onSequence = formatInputSequence(gcodeOptions.toolOnSequence);
  const offSequence = formatInputSequence(gcodeOptions.toolOffSequence);
  const programBeginSequence = formatInputSequence(
    gcodeOptions.programBeginSequence
  );
  const programEndSequence = formatInputSequence(
    gcodeOptions.programEndSequence
  );

  let result = ['G21', 'G90', `F${gcodeOptions.feedRate}`, ...offSequence];

  if (programBeginSequence.length > 0) {
    result.push(...programBeginSequence);
  }

  // Y values are inverted because in the drawing space the origin is the top
  // left corner while GCode uses the bottom left corner.
  pathList.forEach((path) => {
    const x0 = path[0].x;
    const y0 = height - path[0].y;

    result.push(`G0 X${x0} Y${y0}`);
    result.push(...onSequence);

    for (let i = 1; i < path.length; i++) {
      const x = path[i].x;
      const y = height - path[i].y;

      result.push(`G1 X${x} Y${y}`);
    }
    result.push(...offSequence);
  });

  if (programEndSequence.length > 0) {
    result.push(...programEndSequence);
  }

  return result.join('\n');
}

function formatInputSequence(sequence) {
  const commands = sequence.toUpperCase().match(commandExp);

  if (commands) {
    return commands.map((command) => command.trim()).filter(Boolean);
  }

  return [];
}
