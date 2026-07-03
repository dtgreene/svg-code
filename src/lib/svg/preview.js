import { nanoid } from 'nanoid';

import { getOriginPoint } from '../origin';

export function generateSVG(d, width, height, strokeWidth) {
  const paperViewBox = `0 0 ${width || 0} ${height || 0}`;

  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="${paperViewBox}"
  strokeLinecap="round"
  strokeWidth="${strokeWidth}"
  stroke="#000"
  fill="none"
  width="${width || 0}mm"
  height="${height || 0}mm"
>
  <path d="${d}" />
</svg>`;
}

export function createPreview(cell, options) {
  const { pathList, pathBounds, gridBounds, viewBoxQuad } = cell;
  const { width, height, marginX, marginY, origin } = options;

  let downPath = '';
  let upPath = '';
  let pathBoundsPath = '';
  let gridBoundsPath = '';
  let marginsPath = '';
  let viewBoxPath = '';
  let position = getOriginPoint(origin, width, height);

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

    pathBoundsPath = getBoundsPath(pathBounds);
  }

  if (marginX !== 0 || marginY !== 0) {
    marginsPath = [
      `M${marginX},${marginY}`,
      `L${width - marginX},${marginY}`,
      `L${width - marginX},${height - marginY}`,
      `L${marginX},${height - marginY}`,
      `L${marginX},${marginY}`,
    ].join(' ');
  }

  if (gridBounds) {
    gridBoundsPath = getBoundsPath(gridBounds);
  }

  if (viewBoxQuad) {
    viewBoxPath = getQuadPath(viewBoxQuad);
  }

  return {
    downPath,
    upPath,
    marginsPath,
    pathBoundsPath,
    gridBoundsPath,
    viewBoxPath,
    width,
    height,
    id: nanoid(),
  };
}

function getBoundsPath(bounds) {
  const { minX, minY, maxX, maxY } = bounds;
  return getQuadPath([
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ]);
}

function getQuadPath(points) {
  const commands = points.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`;
  });

  return `${commands.join(' ')} Z`;
}
