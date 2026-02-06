import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

type RevalidatePayload = {
  _type: string;
  slug?: {
    current?: string | null;
  } | null;
};

const PATHS_BY_TYPE: Record<string, string[]> = {
  homePage: ["/"],
  propiedadesPage: ["/propiedades"],
  siteSettings: ["/", "/propiedades"],
  seo: ["/", "/propiedades"],
  property: ["/propiedades"],
};

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<RevalidatePayload>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
      true,
    );

    if (!isValidSignature) {
      return new Response("Invalid signature", { status: 401 });
    }

    if (!body?._type) {
      return new Response("Bad request", { status: 400 });
    }

    revalidateTag(body._type, "max");

    const paths = PATHS_BY_TYPE[body._type] ?? [];
    for (const path of paths) {
      revalidatePath(path);
    }

    if (body._type === "property" && body.slug?.current) {
      revalidatePath(`/propiedades/${body.slug.current}`);
    }

    return NextResponse.json({ revalidated: true, tag: body._type });
  } catch (err) {
    console.error(err);
    return new Response((err as Error).message, { status: 500 });
  }
}
