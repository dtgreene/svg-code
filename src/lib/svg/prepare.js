import parseStyle from 'style-to-object';
import { XMLParser } from 'fast-xml-parser';
import { reorder, merge, elideShorterThan } from 'optimize-paths';

import { getPathGrid, getPathList } from './path';

const groupTags = ['svg', 'g', 'a'];
const displayTags = [
  'rect',
  'circle',
  'ellipse',
  'path',
  'line',
  'polyline',
  'polygon',
];

const xmlParser = new XMLParser({
  ignoreDeclaration: true,
  ignoreAttributes: false,
  attributeNamePrefix: '',
});

export function prepareSVG(data, options) {
  const {
    width,
    height,
    marginX,
    marginY,
    grid,
    alignment,
    rotation,
    useBoundingBox,
    postProcessing,
  } = options;
  const { svg } = xmlParser.parse(data);

  if (!svg) {
    throw new Error('Root SVG node not found');
  }

  const { viewBox, translation } = parseViewBox(svg);
  const elements = flattenGroup(svg, translation);

  const parentWidth = viewBox.width;
  const parentHeight = viewBox.height;
  const pathOptions = {
    parentWidth,
    parentHeight,
    width,
    height,
    marginX,
    marginY,
    grid,
    alignment,
    rotation,
    useBoundingBox,
  };

  const pathList = getPathList(elements, pathOptions);
  const pathGrid = getPathGrid(pathList, pathOptions);

  pathGrid.forEach((col) => {
    if (postProcessing.merge) {
      col.pathList = merge(col.pathList, postProcessing.mergeTolerance);
    }

    if (postProcessing.filterShort) {
      col.pathList = elideShorterThan(
        col.pathList,
        postProcessing.filterShortLength
      );
    }

    if (postProcessing.reorder) {
      col.pathList = reorder(col.pathList);
    }

    if (postProcessing.randomizeStart) {
      col.pathList = randomizeStart(
        col.pathList,
        postProcessing.randomizeStartTolerance
      );
    }
  });

  return pathGrid;
}

function flattenGroup(group, prevTransform = '') {
  const groupStyle = parseStyle(group.style) ?? {};
  const groupTransform = combineTransforms(
    groupStyle.transform,
    group.transform
  );

  // Skip hidden groups
  if (isElementHidden(group, groupStyle)) {
    return [];
  }

  return Object.entries(group).reduce((result, [tag, value]) => {
    const isGroup = groupTags.includes(tag);
    const isDisplay = displayTags.includes(tag);

    if (isGroup || isDisplay) {
      const children = Array.isArray(value) ? value : [value];

      if (isGroup) {
        let nextTransform = '';

        if (group.tag === 'svg') {
          const { translation } = parseViewBox(group);
          nextTransform = combineTransforms(
            prevTransform,
            translation,
            groupTransform
          );
        } else {
          nextTransform = combineTransforms(prevTransform, groupTransform);
        }

        children.forEach((child) => {
          result.push(...flattenGroup(child, nextTransform));
        });
      } else {
        children.forEach((child) => {
          const childStyle = parseStyle(child.style) ?? {};
          const childTransform = combineTransforms(
            childStyle.transform,
            child.transform
          );
          const nextTransform = combineTransforms(
            prevTransform,
            groupTransform,
            childTransform
          );

          // Skip hidden children
          if (!isElementHidden(child, childStyle)) {
            result.push({
              ...child,
              tag,
              transform: nextTransform,
            });
          }
        });
      }
    }

    return result;
  }, []);
}

function combineTransforms(...transforms) {
  return transforms.filter(Boolean).join(' ');
}

function isElementHidden(element, style) {
  return (
    element.display === 'none' ||
    element.visibility === 'hidden' ||
    style.display === 'none' ||
    style.visibility === 'hidden'
  );
}

function parseViewBox(element) {
  let minX = 0;
  let minY = 0;
  let width = NaN;
  let height = NaN;
  let translation = '';

  if (!element.viewBox) {
    if (element.width && element.height) {
      width = Number(element.width.match(/\d*/));
      height = Number(element.height.match(/\d*/));
    }
  } else {
    const split = element.viewBox.split(' ').map((value) => Number(value));

    minX = split[0];
    minY = split[1];
    width = split[2];
    height = split[3];
  }

  if (isNaN(width) || isNaN(height)) {
    throw new Error('Could not determine view box dimensions.');
  }

  if ((minX !== 0 || minY !== 0) && !isNaN(minX) && !isNaN(minY)) {
    translation = `translate(${minX}, ${minY})`;
  }

  return { viewBox: { minX, minY, width, height }, translation };
}

export function randomizeStart(pathList, tolerance) {
  return pathList.map((path) => {
    // Basically we need to see if this path is a complete loop
    const pathLength = path.length;
    const distance = distanceTo(
      path[0].x,
      path[0].y,
      path[pathLength - 1].x,
      path[pathLength - 1].y
    );

    if (distance < tolerance) {
      let startIndex = Math.floor(Math.random() * pathLength);

      // The start index must be even
      if (startIndex % 2 !== 0) {
        startIndex++;
      }

      if (startIndex > 0 && startIndex < pathLength - 1) {
        const startingPoint = path[startIndex];

        // Recreate the path starting from a new point. We also remove the
        // current ending point and replace it with the new starting point.
        return path
          .slice(startIndex)
          .concat(path.slice(0, startIndex))
          .concat(startingPoint);
      }
    }

    return path;
  });
}

function distanceTo(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}
