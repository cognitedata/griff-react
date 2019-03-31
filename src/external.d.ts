import { Item } from './internal';

export * from './components/AxisPlacement';
export type Domain = [number, number];

export type ItemId = string | number;

export interface Series extends Item {}

export interface Collection extends Item {}
