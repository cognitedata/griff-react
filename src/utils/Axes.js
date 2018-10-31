const dimension = key => {
  const functor = input => {
    if (!input) {
      return [0, 0];
    }
    return input[key];
  };
  functor.toString = () => key;
  return functor;
};

export default {
  /**
   * {@code time} is a reference to the time dimension of the plotted data.
   * Note that not all data necessarily _needs_ to have a time dimension (for
   * example: scatterplots might not have one) but it's required for series
   * which need it, such as a line charts.
   */
  time: dimension('time'),

  /**
   * {@code x} is the x-dimension of a plotted point. For time series charts,
   * this axis is not used because that data is inherently tied to time, so
   * {@code time = x}. However, for a scatterplot, this is used to determine
   * where the data point will lie along the x axis.
   */
  x: dimension('x'),

  /**
   * {@code y} is the y-dimension of a plotted point. For time series charts,
   * this will likely be the value of a given point. However, scatterplots will
   * use this to place the point along the y axis (for example, by using the
   * value from another coupled time series).
   */
  y: dimension('y'),

  HORIZONTAL: ['x', 'time'],

  VERTICAL: ['y'],

  ALL: ['time', 'x', 'y'],
};
