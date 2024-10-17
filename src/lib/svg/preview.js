import { nanoid } from 'nanoid';

export function createPreview(pathList, bounds, options) {
  const { width, height, marginX, marginY } = options;

  let downPath = '';
  let upPath = '';
  let position = { x: 0, y: height };

  if (pathList.length > 0) {
    pathList.forEach((path) => {
      upPath += ` M${position.x},${position.y} L${path[0].x},${path[0].y}`;
      downPath += ` M${path[0].x},${path[0].y}`;
      for (let j = 1; j < path.length; j++) {
        downPath += ` L${path[j].x},${path[j].y}`;
      }
      position.x = path[path.length - 1].x;
      position.y = path[path.length - 1].y;
    });

    downPath = downPath.trim();
    upPath = upPath.trim();
  }

  const marginsPath = [
    `M${marginX},${marginY}`,
    `L${width - marginX},${marginY}`,
    `L${width - marginX},${height - marginY}`,
    `L${marginX},${height - marginY}`,
    `L${marginX},${marginY}`,
  ].join('');

  const { minX, minY, maxX, maxY } = bounds;
  const boundsPath = [
    `M${minX},${minY}`,
    `L${maxX},${minY}`,
    `L${maxX},${maxY}`,
    `L${minX},${maxY}`,
    `L${minX},${minY}`,
  ].join('');

  return {
    downPath,
    upPath,
    marginsPath,
    boundsPath,
    width,
    height,
    id: nanoid(),
  };
}
