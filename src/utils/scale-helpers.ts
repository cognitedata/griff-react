import * as d3 from 'd3';
import { Domain } from '../external';

export type ScalerFunction = d3.ScaleContinuousNumeric<number, number>;

export type ScalerFunctionFactory = (domain: Domain, height: number) => void;

export const createYScale = (domain: Domain, height: number) =>
  d3
    .scaleLinear()
    .domain(domain)
    .range([height, 0]);

export const createXScale = (domain: Domain, width: number) =>
  d3
    .scaleLinear()
    .domain(domain)
    .range([0, width]);
