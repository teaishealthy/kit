import { jsonResponse, type Ok } from "@/lib/utils";
import type { icons } from "@lucide/astro";

export interface Module {
  name: string;
  description: string;
  icon: keyof typeof icons;
  url: string;
}

export interface Modules {
  modules: Module[];
}

export async function GET({ }) {
  const modules = import.meta.glob("./modules/**/_manifest.json", {
    eager: true,
  });

  return jsonResponse({
    status: "ok",
    result: {
      modules: Object.entries(modules).map(([path, module]) => {
        return (module as any).default;
      }),
    },
  } as Ok<Modules>);
}
