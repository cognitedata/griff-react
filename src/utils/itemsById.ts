import { ItemId } from '../external';
import { ItemIdMap } from '../internal';

export default function<T extends { id: ItemId }>(items: T[]): ItemIdMap<T> {
  return items.reduce((acc, i) => ({ ...acc, [i.id]: i }), {});
}
