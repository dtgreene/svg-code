import SVGPath from 'svgpath';
import createBezierBuilder from 'adaptive-bezier-curve/function.js';

// See:
// https://github.com/mattdesl/adaptive-bezier-curve/blob/master/function.js#L12-L18
const defaultBezierOptions = {
  recursion: 8,
  pathEpsilon: 0.1,
};

const segmentBezier = createBezierBuilder(defaultBezierOptions);

export function getPathGrid(pathList, options) {
  const { grid } = options;

  if (grid.enabled) {
    const { pathList: scaledPathList } = scalePathList(pathList, {
      ...options,
      width: grid.totalWidth,
      height: grid.totalHeight,
      marginX: 0,
      marginY: 0,
    });

    const cellWidth = options.width - options.marginX * 2;
    const cellHeight = options.height - options.marginY * 2;
    const cols = Math.ceil(grid.totalWidth / cellWidth);
    const rows = Math.ceil(grid.totalHeight / cellHeight);

    const results = dividePathList(scaledPathList, {
      cellWidth,
      cellHeight,
      cols,
      rows,
      marginX: options.marginX,
      marginY: options.marginY,
    });

    const bounds = {
      minX: options.marginX,
      maxX: options.width - options.marginX,
      minY: options.marginY,
      maxY: options.height - options.marginY,
    };

    // Re-format the grid results to include the bounds as well
    return {
      pathGrid: results.map((pathList) => ({
        pathList,
        bounds,
      })),
      cols,
      rows,
    };
  } else {
    // Non-grid mode results are treated as single-cell grids
    return {
      pathGrid: [scalePathList(pathList, options)],
      cols: 1,
      rows: 1,
    };
  }
}

export function getPathList(elements, options) {
  const { parentWidth, parentHeight, rotation } = options;

  let pathList = [];

  elements.forEach((element) => {
    const pathData = getPathData(element);

    if (pathData) {
      const instance = SVGPath.from(pathData)
        .unarc()
        .unshort()
        .abs()
        // Reduce the command range from MCLHVQZ to MLCZ
        .iterate((segment, _index, currentX, currentY) => {
          const command = segment[0];

          switch (command) {
            case 'H': {
              return [['L', segment[1], currentY]];
            }
            case 'V': {
              return [['L', currentX, segment[1]]];
            }
            case 'Q': {
              const [x1, y1, x, y] = segment.slice(1);

              const cx1 = currentX + (2 * (x1 - currentX)) / 3;
              const cy1 = currentY + (2 * (y1 - currentY)) / 3;
              const cx2 = x + (2 * (x1 - x)) / 3;
              const cy2 = y + (2 * (y1 - y)) / 3;

              return [['C', cx1, cy1, cx2, cy2, x, y]];
            }
            default: {
              return [segment];
            }
          }
        })
        .transform(element.transform);

      if (rotation !== 0) {
        instance.rotate(rotation, parentWidth * 0.5, parentHeight * 0.5);
      }

      const segmentList = [];

      let currentSegment = [];
      let closeSegment = null;
      let prevCommand = null;

      // Convert the reduced command list into a list of points
      instance.iterate((segment, _index, currentX, currentY) => {
        const command = segment[0];

        switch (command) {
          case 'M': {
            if (currentSegment.length > 0) {
              segmentList.push(currentSegment);
            }
            currentSegment = [segment[1], segment[2]];
            closeSegment = [segment[1], segment[2]];
            break;
          }
          case 'L': {
            currentSegment.push(segment[1], segment[2]);
            break;
          }
          case 'C': {
            const [x1, y1, x2, y2, x3, y3] = segment.slice(1);
            const flatBezier = segmentBezier(
              [currentX, currentY],
              [x1, y1],
              [x2, y2],
              [x3, y3]
            ).flat();

            // If the previous command was a move, then we need to overwrite the
            // current segment before adding a segmented Bezier. This is because
            // the Bezier will start with that point and be duplicated.
            if (prevCommand === 'M') {
              currentSegment = [...flatBezier];
            } else {
              currentSegment.push(...flatBezier);
            }
            break;
          }
          case 'Z': {
            if (closeSegment) {
              currentSegment.push(closeSegment[0], closeSegment[1]);
            }
            break;
          }
          default: {
            console.warn(
              'Encountered unknown command during path parsing:',
              command
            );
          }
        }

        prevCommand = command;
      });

      if (currentSegment.length > 0) {
        segmentList.push(currentSegment);
      }

      // Convert the flat array of numbers into point objects
      segmentList.forEach((segment) => {
        const path = [];
        for (let i = 0; i < segment.length; i += 2) {
          path.push({ x: segment[i], y: segment[i + 1] });
        }
        pathList.push(path);
      });
    }
  });

  return pathList;
}

function scalePathList(pathList, options) {
  const pathListCopy = structuredClone(pathList);
  const {
    parentWidth,
    parentHeight,
    width,
    height,
    marginX,
    marginY,
    alignment,
    rotation,
    useBoundingBox,
  } = options;

  const bounds = {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  };

  // Calculate the bounding box
  pathListCopy.forEach((path) => {
    path.forEach((point) => {
      bounds.minX = Math.min(point.x, bounds.minX);
      bounds.maxX = Math.max(point.x, bounds.maxX);
      bounds.minY = Math.min(point.y, bounds.minY);
      bounds.maxY = Math.max(point.y, bounds.maxY);
    });
  });

  let inputWidth = 0;
  let inputHeight = 0;
  let offsetX = 0;
  let offsetY = 0;

  if (useBoundingBox) {
    inputWidth = bounds.maxX - bounds.minX;
    inputHeight = bounds.maxY - bounds.minY;

    offsetX = -bounds.minX;
    offsetY = -bounds.minY;
  } else {
    const rotationRads = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rotationRads));
    const cos = Math.abs(Math.cos(rotationRads));

    inputWidth = parentWidth * cos + parentHeight * sin;
    inputHeight = parentWidth * sin + parentHeight * cos;

    offsetX = (inputWidth - parentWidth) * 0.5;
    offsetY = (inputHeight - parentHeight) * 0.5;
  }

  if (inputWidth === 0 || inputHeight === 0) {
    throw new Error('Could not determine SVG dimensions');
  }

  const outputWidth = width - marginX * 2;
  const outputHeight = height - marginY * 2;
  const scale = Math.min(outputWidth / inputWidth, outputHeight / inputHeight);

  const alignX = (outputWidth - inputWidth * scale) * 0.5 * alignment;
  const alignY = (outputHeight - inputHeight * scale) * 0.5 * alignment;

  pathListCopy.forEach((path) => {
    path.forEach((point) => {
      point.x = (point.x + offsetX) * scale + alignX + marginX;
      point.y = (point.y + offsetY) * scale + alignY + marginY;
    });
  });

  // Scale the bounds
  bounds.minX = (bounds.minX + offsetX) * scale + alignX + marginX;
  bounds.minY = (bounds.minY + offsetY) * scale + alignY + marginY;
  bounds.maxX = (bounds.maxX + offsetX) * scale + alignX + marginX;
  bounds.maxY = (bounds.maxY + offsetY) * scale + alignY + marginY;

  return { pathList: pathListCopy, bounds };
}

function dividePathList(pathList, options) {
  const { cellWidth, cellHeight, cols, rows, marginX, marginY } = options;
  // This is the maximum position any point can reach. If points are found
  // beyond this position, an error will be thrown because it means we messed
  // up somewhere previously.
  const maxPageX = cellWidth * cols;
  const maxPageY = cellHeight * rows;

  let startingPathList = structuredClone(pathList);
  let result = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let innerPathList = [];
      let outerPathList = [];
      let currentPath = startingPathList.shift();

      const minX = col * cellWidth;
      const minY = row * cellHeight;
      const maxX = minX + cellWidth;
      const maxY = minY + cellHeight;
      const cellBounds = { minX, minY, maxX, maxY };

      while (currentPath) {
        let prevWithin = false;
        let prevCrossIndex = 0;
        let prevSplitPoint = null;

        currentPath.forEach((point, index) => {
          if (
            point.x < 0 ||
            point.x > maxPageX ||
            point.y < 0 ||
            point.y > maxPageY
          ) {
            // An invalid point will never be added to a cell and would cause an infinite loop.
            throw new Error(
              `Invalid point found during path division: ${point.x}, ${point.y}`
            );
          }

          const pointIsWithin =
            point.x >= minX &&
            point.x < maxX &&
            point.y >= minY &&
            point.y < maxY;

          // When switching from going in to out or vice versa
          if (pointIsWithin !== prevWithin) {
            if (index > 0) {
              let innerPoint, outerPoint;

              if (pointIsWithin) {
                innerPoint = point;
                outerPoint = currentPath[index - 1];
              } else {
                innerPoint = currentPath[index - 1];
                outerPoint = point;
              }

              const splitPoint = splitSegment(
                innerPoint,
                outerPoint,
                cellBounds
              );
              const pathSlice = currentPath
                .slice(prevCrossIndex, index)
                .concat(splitPoint);

              if (prevSplitPoint) {
                pathSlice.unshift(prevSplitPoint);
              }

              if (pointIsWithin) {
                outerPathList.push(pathSlice);
              } else {
                innerPathList.push(pathSlice);
              }

              prevSplitPoint = { ...splitPoint };
            }

            prevWithin = pointIsWithin;
            prevCrossIndex = index;
          }
        });

        const pathSlice = currentPath.slice(prevCrossIndex);

        if (prevSplitPoint) {
          pathSlice.unshift(prevSplitPoint);
        }

        if (prevWithin) {
          innerPathList.push(pathSlice);
        } else {
          outerPathList.push(pathSlice);
        }

        currentPath = startingPathList.shift();
      }

      // Subtract the cell's position from each point.
      innerPathList.forEach((path) => {
        path.forEach((point) => {
          point.x = point.x - minX + marginX;
          point.y = point.y - minY + marginY;
        });
      });

      // Add the current cell's paths to the current row.
      result.push(innerPathList);

      // The starting path list should now be everything that wasn't part of this cell.
      startingPathList = outerPathList;
    }
  }

  return result;
}

/**
 * Liang-Barsky function by Daniel White
 * @link http://www.skytopia.com/project/articles/compsci/clipping.html
 */
function splitSegment(innerPoint, outerPoint, bounds) {
  const { minX, minY, maxX, maxY } = bounds;
  const { x: x0, y: y0 } = innerPoint;
  const { x: x1, y: y1 } = outerPoint;
  const dx = x1 - x0;
  const dy = y1 - y0;

  let t0 = 0;
  let t1 = 1;
  let p, q, r;

  for (let edge = 0; edge < 4; edge++) {
    // Traverse through left, right, bottom, top edges.
    if (edge === 0) {
      p = -dx;
      q = -(minX - x0);
    }
    if (edge === 1) {
      p = dx;
      q = maxX - x0;
    }
    if (edge === 2) {
      p = -dy;
      q = -(minY - y0);
    }
    if (edge === 3) {
      p = dy;
      q = maxY - y0;
    }

    r = q / p;

    if (p === 0 && q < 0) {
      return null;
    }

    if (p < 0) {
      if (r > t1) {
        return null;
      } else if (r > t0) {
        t0 = r;
      }
    } else if (p > 0) {
      if (r < t0) {
        return null;
      } else if (r < t1) {
        t1 = r;
      }
    }
  }

  return {
    x: x0 + t1 * dx,
    y: y0 + t1 * dy,
  };
}

function getPathData(element) {
  switch (element.tag) {
    case 'path': {
      return element.d;
    }
    case 'rect': {
      return getRect(element);
    }
    case 'circle': {
      return getCircle(element);
    }
    case 'ellipse': {
      return getEllipse(element);
    }
    case 'line': {
      return getLine(element);
    }
    case 'polygon': {
      return getPolygon(element);
    }
    case 'polyline': {
      return getPolyline(element);
    }
    default: {
      return null;
    }
  }
}

function getNumberProps(element, props) {
  return props.map((prop) => {
    return Number(element[prop]);
  });
}

function createPath(values) {
  return values.join(' ');
}

function getRect(element) {
  const [x, y, width, height, inputRX, inputRY] = getNumberProps(element, [
    'x',
    'y',
    'width',
    'height',
    'rx',
    'ry',
  ]);

  if (inputRX || inputRY) {
    let rx = !inputRX ? inputRY : inputRX;
    let ry = !inputRY ? inputRX : inputRY;

    if (rx * 2 > width) {
      rx -= (rx * 2 - width) / 2;
    }
    if (ry * 2 > height) {
      ry -= (ry * 2 - height) / 2;
    }

    // prettier-ignore
    return createPath([
      'M',
      x + rx, y,
      'h',
      width - rx * 2,
      's',
      rx, 0, rx, ry,
      'v',
      height - ry * 2,
      's',
      0, ry, -rx, ry,
      'h',
      -width + rx * 2,
      's',
      -rx, 0, -rx, -ry,
      'v',
      -height + ry * 2,
      's',
      0, -ry, rx, -ry,
    ]);
  } else {
    // prettier-ignore
    return createPath([
      'M',
      x, y,
      'h',
      width,
      'v',
      height,
      'H',
      x,
      'Z',
    ]);
  }
}

function getCircle(element) {
  const [cx, cy, r] = getNumberProps(element, ['cx', 'cy', 'r']);

  // prettier-ignore
  return createPath([
    'M',
    cx - r, cy,
    'a',
    r, r, 0, 1, 0, 2 * r, 0,
    'a',
    r, r, 0, 1, 0, -2 * r, 0,
  ]);
}

function getEllipse(element) {
  const [cx, cy, rx, ry] = getNumberProps(element, ['cx', 'cy', 'rx', 'ry']);

  // prettier-ignore
  return createPath([
    'M',
    cx - rx, cy,
    'a',
    rx, ry, 0, 1, 0, 2 * rx, 0,
    'a',
    rx, ry, 0, 1, 0, -2 * rx, 0,
  ]);
}

function getLine(element) {
  const [x1, x2, y1, y2] = getNumberProps(element, ['x1', 'x2', 'y1', 'y2']);
  return createPath(['M', x1, y1, 'L', x2, y2]);
}

function getPolygon(element) {
  return getPolyPath(element).concat('Z');
}

function getPolyline(element) {
  return getPolyPath(element);
}

function getPolyPath(element) {
  const { points = '' } = element;
  const data = points.trim().split(/[ ,]+/);

  const path = [];
  for (let i = 0; i < data.length; i += 2) {
    path.push(i === 0 ? 'M' : 'L', [Number(data[i]), Number(data[i + 1])]);
  }

  return createPath(path);
}
