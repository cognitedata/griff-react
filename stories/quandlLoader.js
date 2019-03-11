import { action } from '@storybook/addon-actions';
import moment from 'moment';
import axios from 'axios';

const calculateGranularity = (domain, pps) => {
  const diff = domain[1] - domain[0];

  if (diff / (1000 * 60 * 60 * 24) < pps) {
    // Can we show daily
    return 'daily';
  }
  if (diff / (1000 * 60 * 60 * 24 * 7) < pps) {
    // Can we show weekly
    return 'weekly';
  }
  if (diff / (1000 * 60 * 60 * 24 * 30) < pps) {
    // Can we show monthly
    return 'monthly';
  }
  if (diff / (1000 * 60 * 60 * 24 * 30 * 3) < pps) {
    return 'quarterly';
  }
  return 'annualy';
};
const formatDate = date => moment(date).format('YYYY-MM-DD');

export default async ({
  id,
  timeDomain,
  timeSubDomain,
  pointsPerSeries,
  oldSeries,
  reason,
}) => {
  const granularity = calculateGranularity(timeSubDomain, pointsPerSeries);
  action(`Loader requested data for id ${id}. Reason: ${reason}`)(
    reason,
    timeDomain,
    timeSubDomain,
    granularity
  );
  const domain = reason === 'MOUNTED' ? timeDomain : timeSubDomain;
  const result = await axios.get(
    `https://www.quandl.com/api/v3/datasets/${id}.json?start_date=${formatDate(
      domain[0]
    )}&end_date=${formatDate(
      domain[1]
    )}&order=asc&collapse=${granularity}&api_key=Yztsvxixwuz_NQz-8Ze3`
  );
  const { dataset } = result.data;
  let data = dataset.data.map(d => ({
    timestamp: +moment(d[0]),
    value: d[1],
  }));
  if (reason === 'UPDATE_SUBDOMAIN') {
    const oldData = [...oldSeries.data];
    if (oldData.length > 0) {
      const { xAccessor } = oldSeries;
      const firstPoint = xAccessor(data[0]);
      const lastPoint = xAccessor(data[data.length - 1]);
      let insertionStart = 0;
      let insertionEnd = oldData.length - 1;

      for (let idx = 1; idx < oldData.length; idx += 1) {
        if (xAccessor(oldData[idx]) > firstPoint) {
          insertionStart = idx - 1;
          break;
        }
      }
      for (let idx = oldData.length - 2; idx > 0; idx -= 1) {
        if (xAccessor(oldData[idx]) <= lastPoint) {
          insertionEnd = idx + 1;
          break;
        }
      }
      data = [
        ...oldData.slice(0, insertionStart),
        ...data,
        ...oldData.slice(insertionEnd),
      ];
    }
  }
  return { data, drawPoints: granularity === 'daily' };
};
