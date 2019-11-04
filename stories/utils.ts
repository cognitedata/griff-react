export const makePrintable = arr => {
  const copy = [...arr];
  copy.toString = () => `[${arr.join(', ')}]`;
  return copy;
};
