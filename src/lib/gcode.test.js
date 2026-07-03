import { describe, expect, it } from 'vitest';

import { generateGCode } from './gcode';

// A path running from the page's top-left corner to its bottom-right corner on
// a 100x200 page, so expected coordinates are easy to read off.
const cornerPath = [
  { x: 0, y: 0 },
  { x: 100, y: 200 },
];
const pathListOptions = { width: 100, height: 200 };
const baseOptions = {
  feedRate: 300,
  origin: 'bottom-left',
  invertX: false,
  invertY: false,
  toolOnSequence: '',
  toolOffSequence: '',
  programBeginSequence: '',
  programEndSequence: '',
};

function getMoves(gcodeOptions, pathList = [cornerPath]) {
  return generateGCode(pathList, pathListOptions, {
    ...baseOptions,
    ...gcodeOptions,
  })
    .split('\n')
    .filter((line) => /^G[01] /.test(line));
}

it('returns an empty string for an empty path list', () => {
  expect(generateGCode([], pathListOptions, baseOptions)).toBe('');
});

it('starts the program with units, absolute mode and feed rate', () => {
  const output = generateGCode([cornerPath], pathListOptions, baseOptions);

  expect(output.split('\n').slice(0, 3)).toEqual(['G21', 'G90', 'F300']);
});

describe('origin', () => {
  it.each([
    ['bottom-left', ['G0 X0 Y200', 'G1 X100 Y0']],
    ['bottom-right', ['G0 X-100 Y200', 'G1 X0 Y0']],
    ['top-left', ['G0 X0 Y0', 'G1 X100 Y-200']],
    ['top-right', ['G0 X-100 Y0', 'G1 X0 Y-200']],
    ['center', ['G0 X-50 Y100', 'G1 X50 Y-100']],
  ])('re-bases coordinates for a %s origin', (origin, expected) => {
    expect(getMoves({ origin })).toEqual(expected);
  });

  it('falls back to bottom-left for a missing origin', () => {
    expect(getMoves({ origin: undefined })).toEqual([
      'G0 X0 Y200',
      'G1 X100 Y0',
    ]);
  });
});

describe('axis inversion', () => {
  it('negates X coordinates when invertX is set', () => {
    expect(getMoves({ invertX: true })).toEqual(['G0 X0 Y200', 'G1 X-100 Y0']);
  });

  it('emits Y-down coordinates when invertY is set', () => {
    expect(getMoves({ invertY: true })).toEqual(['G0 X0 Y-200', 'G1 X100 Y0']);
  });

  it('inverts both axes around the origin point', () => {
    expect(
      getMoves({ origin: 'center', invertX: true, invertY: true }),
    ).toEqual(['G0 X50 Y-100', 'G1 X-50 Y100']);
  });

  it('produces positive Y-down coordinates for top-left origin with invertY', () => {
    expect(getMoves({ origin: 'top-left', invertY: true })).toEqual([
      'G0 X0 Y0',
      'G1 X100 Y200',
    ]);
  });
});

it('rounds coordinates to three decimals', () => {
  const path = [
    { x: 10.12345, y: 20.98765 },
    { x: 0.0004, y: 200 },
  ];

  expect(getMoves({}, [path])).toEqual(['G0 X10.123 Y179.012', 'G1 X0 Y0']);
});

describe('command sequences', () => {
  it('wraps each path with the tool on and off sequences', () => {
    const output = generateGCode([cornerPath, cornerPath], pathListOptions, {
      ...baseOptions,
      toolOnSequence: 'G0 Z1',
      toolOffSequence: 'G0 Z0',
    }).split('\n');

    expect(output).toEqual([
      'G21',
      'G90',
      'F300',
      'G0 Z0',
      'G0 X0 Y200',
      'G0 Z1',
      'G1 X100 Y0',
      'G0 Z0',
      'G0 X0 Y200',
      'G0 Z1',
      'G1 X100 Y0',
      'G0 Z0',
    ]);
  });

  it('includes the program begin and end sequences', () => {
    const output = generateGCode([cornerPath], pathListOptions, {
      ...baseOptions,
      programBeginSequence: 'G28',
      programEndSequence: 'G0 X0 Y0',
    }).split('\n');

    expect(output[3]).toBe('G28');
    expect(output.at(-1)).toBe('G0 X0 Y0');
  });
});
