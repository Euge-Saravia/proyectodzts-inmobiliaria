import { describe, it, expect } from "vitest";
import sanityImageLoader from "./imageLoader";

describe("sanityImageLoader", () => {
  it("passes through local paths unchanged", () => {
    expect(
      sanityImageLoader({ src: "/Images/logo.png", width: 300 }),
    ).toBe("/Images/logo.png");
  });

  it("passes through non-Sanity absolute URLs unchanged", () => {
    const src = "https://placehold.co/400x300/png";
    expect(sanityImageLoader({ src, width: 400 })).toBe(src);
  });

  it("sets w to the requested width", () => {
    const src = "https://cdn.sanity.io/images/proj/ds/abc.jpg?w=1920";
    const result = sanityImageLoader({ src, width: 640 });
    expect(new URL(result).searchParams.get("w")).toBe("640");
  });

  it("scales h proportionally when the source has both w and h", () => {
    const src = "https://cdn.sanity.io/images/proj/ds/abc.jpg?w=800&h=600";
    const result = sanityImageLoader({ src, width: 400 });
    const params = new URL(result).searchParams;
    expect(params.get("w")).toBe("400");
    expect(params.get("h")).toBe("300");
  });

  it("caps width at the original w so images are never upscaled", () => {
    const src = "https://cdn.sanity.io/images/proj/ds/abc.jpg?w=800&h=600";
    const result = sanityImageLoader({ src, width: 1600 });
    const params = new URL(result).searchParams;
    expect(params.get("w")).toBe("800");
    expect(params.get("h")).toBe("600");
  });

  it("adds q from quality only when the URL has no q already", () => {
    const src = "https://cdn.sanity.io/images/proj/ds/abc.jpg?w=1920";
    const result = sanityImageLoader({ src, width: 640, quality: 75 });
    expect(new URL(result).searchParams.get("q")).toBe("75");
  });

  it("does not override an existing q", () => {
    const src = "https://cdn.sanity.io/images/proj/ds/abc.jpg?w=1920&q=90";
    const result = sanityImageLoader({ src, width: 640, quality: 75 });
    expect(new URL(result).searchParams.get("q")).toBe("90");
  });

  it("adds auto=format once", () => {
    const src = "https://cdn.sanity.io/images/proj/ds/abc.jpg?w=1920";
    const result = sanityImageLoader({ src, width: 640 });
    const params = new URL(result).searchParams;
    expect(params.getAll("auto")).toEqual(["format"]);
  });

  it("does not duplicate an existing auto param", () => {
    const src = "https://cdn.sanity.io/images/proj/ds/abc.jpg?w=1920&auto=format";
    const result = sanityImageLoader({ src, width: 640 });
    const params = new URL(result).searchParams;
    expect(params.getAll("auto")).toEqual(["format"]);
  });

  it("preserves other params like rect and fit", () => {
    const src =
      "https://cdn.sanity.io/images/proj/ds/abc.jpg?w=800&h=600&rect=0,0,800,600&fit=crop";
    const result = sanityImageLoader({ src, width: 400 });
    const params = new URL(result).searchParams;
    expect(params.get("rect")).toBe("0,0,800,600");
    expect(params.get("fit")).toBe("crop");
  });

  it("sets w when the source has no w or h at all", () => {
    const src = "https://cdn.sanity.io/images/proj/ds/abc.jpg";
    const result = sanityImageLoader({ src, width: 500 });
    const params = new URL(result).searchParams;
    expect(params.get("w")).toBe("500");
    expect(params.get("h")).toBeNull();
  });
});
