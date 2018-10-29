import {map, findIndex} from 'ramda';

export const CENTER = 'CENTER';
export const LEFT_TOP = 'LEFT_TOP';
export const LEFT_BOTTOM = 'LEFT_BOTTOM';
export const RIGHT_TOP = 'RIGHT_TOP';
export const RIGHT_BOTTOM = 'RIGHT_BOTTOM';

const positionCalcMap = {
  [LEFT_TOP]: (x) => [x[0], x[1]],
  [RIGHT_TOP]: (x) => [x[0] + x[2], x[1]],
  [LEFT_BOTTOM]: (x) => [x[0], x[1] + x[3]],
  [RIGHT_BOTTOM]: (x) => [x[0] + x[2], x[1] + x[3]],
  [CENTER]: (x) => [x[0] + x[2] / 2, x[1] + x[3] / 2],
}
const diagonalQueue = [
  LEFT_TOP, RIGHT_TOP, RIGHT_BOTTOM, LEFT_BOTTOM
];

export function getControllersPoints(shape) {
  return map((fn) => fn(shape), positionCalcMap);
}

export function getCornerPoint(shape, corner) {
  return positionCalcMap[corner](shape);
}

export function getDiagonalPoint(shape, corner) {
  const diagonalCorner = diagonalQueue[(findIndex((x) => x === corner)(diagonalQueue) + 2) % diagonalQueue.length];
  return getCornerPoint(shape, diagonalCorner);
}

export function normalize(x1, y1, x2, y2) {
  let width = x2 - x1;
  let height = y2 - y1;
  let x = x1;
  let y = y1;

  if (width < 0) {
    x = x2;
    width = -width;
  }
  if (height < 0) {
    y = y2;
    height = -height;
  }

  return [x, y, width, height];
};
