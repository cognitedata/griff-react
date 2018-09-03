import * as d3 from 'd3';
import numeral from 'numeral';

export const createYScale = (domain, height) =>
  d3
    .scaleLinear()
    .domain(domain)
    .range([height, 0]);

export const createXScale = (domain, width) =>
  d3
    .scaleTime()
    .domain(domain)
    .range([0, width]);

export const createLinearXScale = (domain, width) =>
  d3
    .scaleLinear()
    .domain(domain)
    .range([0, width]);

export const tickFormat = v => numeral(v).format('0.[00]a');
