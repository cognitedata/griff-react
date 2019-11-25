import { Datapoint } from 'external';
import { ValueFunc, LoaderFunc } from './types';

const POINT_COUNT_DEFAULT = 250;

type CreateTrigValueFuncOptions = {
  oscillations?: number;
  yOffset?: number;
  xOffset?: number;
};

export const createTrigValueFunc = (
  trigFunc: (n: number) => number,
  {
    oscillations = 1,
    yOffset = 0,
    xOffset = 0,
  }: CreateTrigValueFuncOptions = {}
): ValueFunc => (i, n) =>
  trigFunc(xOffset + 2 * Math.PI * (i / n) * oscillations) + yOffset;

export const mergeInsert = (
  base: Datapoint[],
  newData: Datapoint[],
  startIndex: number
) => {
  return [
    ...base.slice(0, startIndex),
    ...newData,
    ...base.slice(startIndex + newData.length),
  ];
};

type CreateStaticLoaderOptions = {
  pointCount?: number;
  valueFunc?: ValueFunc;
};
export const createStaticLoader = ({
  pointCount = POINT_COUNT_DEFAULT,
  valueFunc = createTrigValueFunc(Math.sin),
}: CreateStaticLoaderOptions = {}): LoaderFunc => ({
  timeDomain,
  timeSubDomain,
  oldSeries,
}) => {
  const diff = timeDomain[1] - timeDomain[0];
  const i0 = Math.ceil(
    (pointCount / diff) * (timeSubDomain[0] - timeDomain[0])
  );
  const i1 = Math.floor(
    (pointCount / diff) * (timeSubDomain[1] - timeDomain[0])
  );
  const pointsDisplayed = i1 - i0;

  if (oldSeries.data.length !== 0) {
    return {
      data: oldSeries.data,
      drawPoints: pointsDisplayed < pointCount / 2,
    };
  }

  const newData = Array(pointCount)
    .fill(undefined)
    .map((_, i) => {
      return {
        value: valueFunc(i, pointCount),
        timestamp: timeDomain[0] + diff * (i / pointCount),
      };
    });
  return {
    data: newData,
    drawPoints: pointsDisplayed < pointCount / 2,
  };
};

type CreateStaticScatterplotLoaderOptions = {
  pointCount?: number;
  xValueFunc?: ValueFunc;
  yValueFunc?: ValueFunc;
};
export const createStaticScatterplotLoader = ({
  pointCount = POINT_COUNT_DEFAULT,
  xValueFunc = createTrigValueFunc(Math.sin),
  yValueFunc = createTrigValueFunc(Math.cos),
}: CreateStaticScatterplotLoaderOptions = {}): LoaderFunc => ({
  timeDomain,
  oldSeries,
}) => {
  if (oldSeries.data.length !== 0) {
    return { data: oldSeries.data, drawPoints: true };
  }

  const diff = timeDomain[1] - timeDomain[0];
  const newData = Array(pointCount)
    .fill(undefined)
    .map((_, i) => {
      return {
        x: xValueFunc(i, pointCount),
        y: yValueFunc(i, pointCount),
        timestamp: timeDomain[0] + diff * (i / pointCount),
      };
    });
  return {
    data: newData,
    drawPoints: true,
  };
};
