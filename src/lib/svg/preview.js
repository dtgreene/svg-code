import { nanoid } from 'nanoid';

export function generateSVG(d, width, height, strokeWidth) {
  const paperViewBox = `0 0 ${width || 0} ${height || 0}`;

  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="${paperViewBox}"
  strokeLinecap="round"
  strokeWidth="${strokeWidth}"
  stroke="#000"
  fill="none"
>
  <path d="${d}" />
</svg>`;
}

export function createPreview(cell, options) {
  const { pathList, pathBounds, gridBounds } = cell;
  const { width, height, marginX, marginY } = options;

  let downPath = '';
  let upPath = '';
  let pathBoundsPath = '';
  let gridBoundsPath = '';
  let marginsPath = '';
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

  return {
    downPath,
    upPath,
    marginsPath,
    pathBoundsPath,
    gridBoundsPath,
    width,
    height,
    id: nanoid(),
  };
}

function getBoundsPath(bounds) {
  const { minX, minY, maxX, maxY } = bounds;
  return [
    `M${minX},${minY}`,
    `L${maxX},${minY}`,
    `L${maxX},${maxY}`,
    `L${minX},${maxY}`,
    `L${minX},${minY}`,
  ].join(' ');
}
