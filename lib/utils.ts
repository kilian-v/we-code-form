import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const findElemById = ({ id, elems }: { id: string; elems: any }) => {
  return elems.find((elem: any) => elem.id === id);
};

export const findElemByName = ({
  name,
  elems,
}: {
  name: string;
  elems: any;
}) => {
  return elems.find((elem: any) => elem.name === name);
};
