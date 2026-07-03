// The machine's origin as a point in drawing space (top-left origin, Y down).
export function getOriginPoint(origin, width, height) {
  switch (origin) {
    case 'bottom-right':
      return { x: width, y: height };
    case 'top-left':
      return { x: 0, y: 0 };
    case 'top-right':
      return { x: width, y: 0 };
    case 'center':
      return { x: width * 0.5, y: height * 0.5 };
    default:
      return { x: 0, y: height };
  }
}
