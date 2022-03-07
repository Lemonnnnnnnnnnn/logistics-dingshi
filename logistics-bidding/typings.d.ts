// declare module '*.css' {
//   const content: { [className: string]: string; };
//   export default content;
// }
declare module '*.scss' {
  const content: { [className: string]: string; };
  export default content;
}
declare module '*.png';
declare module '*.jpg';
declare module '*.svg' {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>,
  ): React.ReactElement;
  const url: string;
  export default url;
}
