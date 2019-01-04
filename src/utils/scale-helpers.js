import * as d3 from 'd3';

export const createYScale = (domain, height) =>
  d3
    .scaleLinear()
    .domain(domain)
    .range([height, 0]);

export const createXScale = (domain, width) =>
  d3
    .scaleLinear()
    .domain(domain)
    .range([0, width]);
