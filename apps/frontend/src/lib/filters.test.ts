import { describe, it, expect } from "vitest";
import { parseSortParam, sortProperties } from "./filters";

type P = {
  id: string;
  price?: number | null;
  currency?: string | null;
  sizeTotal?: number | null;
  size?: number | null;
};

const ids = (list: P[]) => list.map((p) => p.id);

describe("parseSortParam", () => {
  it("returns valid options", () => {
    expect(parseSortParam("precio-asc")).toBe("precio-asc");
    expect(parseSortParam("tamano-desc")).toBe("tamano-desc");
  });

  it("returns null for unknown or empty values", () => {
    expect(parseSortParam("")).toBeNull();
    expect(parseSortParam(null)).toBeNull();
    expect(parseSortParam("nope")).toBeNull();
  });
});

describe("sortProperties", () => {
  it("returns the list unchanged when sort is null", () => {
    const list: P[] = [{ id: "a" }, { id: "b" }];
    expect(sortProperties(list, null)).toEqual(list);
  });

  it("does not mutate the input list", () => {
    const list: P[] = [
      { id: "a", price: 2, currency: "USD" },
      { id: "b", price: 1, currency: "USD" },
    ];
    sortProperties(list, "precio-asc");
    expect(ids(list)).toEqual(["a", "b"]);
  });

  it("sorts price ascending within a single currency", () => {
    const list: P[] = [
      { id: "a", price: 300, currency: "USD" },
      { id: "b", price: 100, currency: "USD" },
      { id: "c", price: 200, currency: "USD" },
    ];
    expect(ids(sortProperties(list, "precio-asc"))).toEqual(["b", "c", "a"]);
  });

  it("sorts price descending within a single currency", () => {
    const list: P[] = [
      { id: "a", price: 300, currency: "USD" },
      { id: "b", price: 100, currency: "USD" },
      { id: "c", price: 200, currency: "USD" },
    ];
    expect(ids(sortProperties(list, "precio-desc"))).toEqual(["a", "c", "b"]);
  });

  it("keeps US$ group before AR$ group in both directions", () => {
    const list: P[] = [
      { id: "ars1", price: 100, currency: "ARS" },
      { id: "usd1", price: 500, currency: "USD" },
      { id: "ars2", price: 200, currency: "ARS" },
      { id: "usd2", price: 50, currency: "USD" },
    ];
    expect(ids(sortProperties(list, "precio-asc"))).toEqual([
      "usd2",
      "usd1",
      "ars1",
      "ars2",
    ]);
    expect(ids(sortProperties(list, "precio-desc"))).toEqual([
      "usd1",
      "usd2",
      "ars2",
      "ars1",
    ]);
  });

  it("places properties with no currency after both currency groups", () => {
    const list: P[] = [
      { id: "none", price: 100 },
      { id: "usd", price: 100, currency: "USD" },
      { id: "ars", price: 100, currency: "ARS" },
    ];
    expect(ids(sortProperties(list, "precio-asc"))).toEqual([
      "usd",
      "ars",
      "none",
    ]);
  });

  it("sinks properties with no price to the end in both directions", () => {
    const list: P[] = [
      { id: "noprice", currency: "USD" },
      { id: "usd", price: 100, currency: "USD" },
    ];
    expect(ids(sortProperties(list, "precio-asc"))).toEqual(["usd", "noprice"]);
    expect(ids(sortProperties(list, "precio-desc"))).toEqual(["usd", "noprice"]);
  });

  it("sorts size ascending/descending using effective surface", () => {
    const list: P[] = [
      { id: "a", sizeTotal: 80 },
      { id: "b", size: 50 },
      { id: "c", sizeTotal: 120 },
    ];
    expect(ids(sortProperties(list, "tamano-asc"))).toEqual(["b", "a", "c"]);
    expect(ids(sortProperties(list, "tamano-desc"))).toEqual(["c", "a", "b"]);
  });

  it("prefers sizeTotal over legacy size for sorting", () => {
    const list: P[] = [
      { id: "a", sizeTotal: 100, size: 999 },
      { id: "b", sizeTotal: 200, size: 1 },
    ];
    expect(ids(sortProperties(list, "tamano-asc"))).toEqual(["a", "b"]);
  });

  it("sinks properties with no surface to the end in both directions", () => {
    const list: P[] = [{ id: "nosize" }, { id: "has", sizeTotal: 50 }];
    expect(ids(sortProperties(list, "tamano-asc"))).toEqual(["has", "nosize"]);
    expect(ids(sortProperties(list, "tamano-desc"))).toEqual(["has", "nosize"]);
  });
});
