import { ValueFunc, LoaderFunc } from './types';

const POINT_COUNT_DEFAULT = 250;

type CreateTrigValueFuncOptions = {
  oscillations?: number;
  yOffset?: number;
  xOffset?: number;
};

export const createTrigValueFunc = (
  trigFn: (n: number) => number,
  {
    oscillations = 1,
    yOffset = 0,
    xOffset = 0,
  }: CreateTrigValueFuncOptions = {}
): ValueFunc => (i, n) =>
  trigFn(xOffset + 2 * Math.PI * (i / n) * oscillations) + yOffset;

type CreateStaticLoaderOptions = {
  pointCount?: number;
  valueFunc?: ValueFunc;
};

export const createStaticLoader = ({
  pointCount = POINT_COUNT_DEFAULT,
  valueFunc = createTrigValueFunc(Math.sin),
}: CreateStaticLoaderOptions = {}): LoaderFunc => ({ timeDomain }) => {
  const diff = timeDomain[1] - timeDomain[0];
  return {
    data: Array(pointCount)
      .fill(null)
      .map((_, i) => {
        return {
          value: valueFunc(i, pointCount),
          timestamp: timeDomain[0] + diff * (i / pointCount),
        };
      }),
  };
};
