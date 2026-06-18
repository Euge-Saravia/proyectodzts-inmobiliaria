import type { ClientReturn } from "@sanity/client";
import { client } from "@/sanity/lib/client";

export async function sanityFetch<const Q extends string>({
  query,
  params,
}: {
  query: Q;
  params?: Record<string, unknown>;
}): Promise<{ data: ClientReturn<Q> }> {
  const data = await client.fetch<ClientReturn<Q>>(query, params ?? {});
  return { data };
}
