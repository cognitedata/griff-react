import * as d3 from 'd3';

export type DateFormatter = (date: Date) => string;

const formatMillisecond = d3.timeFormat('.%L');
const formatSecond = d3.timeFormat(':%S');
const formatMinute = d3.timeFormat('%H:%M');
const formatHour = d3.timeFormat('%H:00');
const formatDay = d3.timeFormat('%d/%m');
const formatWeek = d3.timeFormat('%d/%m');
const formatMonth = d3.timeFormat('%d/%m');
const formatYear = d3.timeFormat('%b %Y');

/* eslint-disable no-nested-ternary */
export const multiFormat: DateFormatter = (date: Date): string =>
  (d3.timeSecond(date) < date
    ? formatMillisecond
    : d3.timeMinute(date) < date
    ? formatSecond
    : d3.timeHour(date) < date
    ? formatMinute
    : d3.timeDay(date) < date
    ? formatHour
    : d3.timeMonth(date) < date
    ? d3.timeWeek(date) < date
      ? formatDay
      : formatWeek
    : d3.timeYear(date) < date
    ? formatMonth
    : formatYear)(date);
