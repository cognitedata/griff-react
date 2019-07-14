import { ItemId } from '../external';

export default function<T extends { id: ItemId }>(items: T[]) {
  return items.reduce((acc, i) => ({ ...acc, [i.id]: i }), {});
}
