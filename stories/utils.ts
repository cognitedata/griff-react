export const makePrintable = <T>(arr: T[]) => {
  const copy = [...arr];
  copy.toString = () => `[${arr.join(', ')}]`;
  return copy;
};
