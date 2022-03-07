/**
 * 打平数组
 * @param array: 源数组
 * @param childrenKey: 嵌套数组字段名
 * @returns 打平后到数组
 */
const flatten = (array: any[], childrenKey: string): any[] =>
  array.reduce(
    (prev, curr) =>
      curr[childrenKey] && curr[childrenKey].length
        ? [...prev, curr, ...flatten(curr[childrenKey], childrenKey)]
        : [...prev, curr],
    []
  );

export default flatten;
