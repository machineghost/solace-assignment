declare module "*.module.css";

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
