declare module '*.module.css';
// declare module '*.module.css' {
//   const classes: { [key: string]: string };
//   export default classes;
// }

export interface NewNote {
  title: string;
  text: string;
}

export interface Note {
  id: string;
  title: string;
  text: string;
  createdAt: Date;
}
