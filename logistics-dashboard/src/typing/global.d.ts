interface obj<T = any> {
  [any: string]: T;
}

interface Window {
  envConfig: obj<any>;
  ejdSocket: any;
}

interface ListItem<T> {
  count: number;
  items: T[];
}

// 剔除T中的所有K属性
type TOmit<T, K> = Pick<T, Exclude<keyof T, K>>;
