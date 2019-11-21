const POINTS = 250;

type TimeDomain = [number, number];
type LoaderProps = {
  timeDomain: TimeDomain;
};

export const sineLoader = ({ timeDomain }: LoaderProps) => {
  const diff = timeDomain[1] - timeDomain[0];
  return {
    data: Array(POINTS)
      .fill(null)
      .map((_, i) => {
        return {
          value: Math.sin((2 * Math.PI * i) / POINTS),
          timestamp: timeDomain[0] + diff * (i / POINTS),
        };
      }),
  };
};
