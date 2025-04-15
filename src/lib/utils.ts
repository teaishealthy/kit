import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function jsonResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export interface Ok<T = any> {
  status: "ok";
  result: T;
}

export interface Error {
  status: "error";
  message: string;
}

export type Response = Ok | Error;
