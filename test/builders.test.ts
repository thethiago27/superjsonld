import { describe, expect, it } from "vitest"
import {
  breadcrumbLd,
  collectionPageLd,
  createJsonLd,
  itemListLd,
  makeAbsoluteUrl,
  organizationLd,
  websiteLd,
} from "../src/index"
import type { CreateJsonLdConfig } from "../src/types"

const config: CreateJsonLdConfig = {
  baseUrl: "https://example.com",
  defaultLanguage: "en",
  organization: {
    name: "Example",
    logo: "/logo.png",
    description: "An example site",
    sameAs: ["https://instagram.com/example"],
  },
  search: { urlTemplate: "/search?q={search_term_string}" },
}

/** Round-trip through JSON to assert on the serialized output. */
// biome-ignore lint/suspicious/noExplicitAny: tests inspect arbitrary JSON-LD shapes
const json = (value: unknown): any => JSON.parse(JSON.stringify(value))

describe("makeAbsoluteUrl", () => {
  it("returns the base for empty path or '/'", () => {
    expect(makeAbsoluteUrl("https://example.com")).toBe("https://example.com")
    expect(makeAbsoluteUrl("https://example.com", "")).toBe(
      "https://example.com",
    )
    expect(makeAbsoluteUrl("https://example.com", "/")).toBe(
      "https://example.com",
    )
  })

  it("strips a trailing slash from the base", () => {
    expect(makeAbsoluteUrl("https://example.com/", "/foo")).toBe(
      "https://example.com/foo",
    )
  })

  it("joins relative paths with a single leading slash", () => {
    expect(makeAbsoluteUrl("https://example.com", "/foo")).toBe(
      "https://example.com/foo",
    )
    expect(makeAbsoluteUrl("https://example.com", "foo")).toBe(
      "https://example.com/foo",
    )
  })

  it("leaves absolute and protocol-relative URLs untouched", () => {
    expect(makeAbsoluteUrl("https://example.com", "https://cdn.x/y.png")).toBe(
      "https://cdn.x/y.png",
    )
    expect(makeAbsoluteUrl("https://example.com", "//cdn.x/y.png")).toBe(
      "//cdn.x/y.png",
    )
  })
})

describe("organizationLd", () => {
  it("builds an Organization node from config", () => {
    const ld = json(organizationLd(config))
    expect(ld["@context"]).toBe("https://schema.org")
    expect(ld["@type"]).toBe("Organization")
    expect(ld.name).toBe("Example")
    expect(ld.url).toBe("https://example.com")
    expect(ld.logo).toBe("https://example.com/logo.png")
    expect(ld.description).toBe("An example site")
    expect(ld.sameAs).toEqual(["https://instagram.com/example"])
  })

  it("applies overrides", () => {
    const ld = json(organizationLd(config, { name: "Override" }))
    expect(ld.name).toBe("Override")
  })

  it("throws when no name is available", () => {
    expect(() => organizationLd({ baseUrl: "https://example.com" })).toThrow(
      /organization\.name is required/,
    )
  })

  it("omits optional fields when absent", () => {
    const ld = json(
      organizationLd({
        baseUrl: "https://example.com",
        organization: { name: "X" },
      }),
    )
    expect(ld.logo).toBeUndefined()
    expect(ld.description).toBeUndefined()
    expect(ld.sameAs).toBeUndefined()
  })
})

describe("websiteLd", () => {
  it("builds a WebSite node with search action", () => {
    const ld = json(websiteLd(config))
    expect(ld["@type"]).toBe("WebSite")
    expect(ld.name).toBe("Example")
    expect(ld.url).toBe("https://example.com")
    expect(ld.inLanguage).toBe("en")
    expect(ld.publisher).toEqual({ "@type": "Organization", name: "Example" })
    expect(ld.potentialAction["@type"]).toBe("SearchAction")
    expect(ld.potentialAction.target.urlTemplate).toBe(
      "https://example.com/search?q={search_term_string}",
    )
    expect(ld.potentialAction["query-input"]).toBe(
      "required name=search_term_string",
    )
  })

  it("omits potentialAction when no search is configured", () => {
    const ld = json(
      websiteLd({
        baseUrl: "https://example.com",
        organization: { name: "X" },
      }),
    )
    expect(ld.potentialAction).toBeUndefined()
    expect(ld.inLanguage).toBeUndefined()
  })

  it("throws when no name is available", () => {
    expect(() => websiteLd({ baseUrl: "https://example.com" })).toThrow(
      /site name is required/,
    )
  })
})

describe("breadcrumbLd", () => {
  it("builds an ordered BreadcrumbList", () => {
    const ld = json(
      breadcrumbLd(config, [
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
      ]),
    )
    expect(ld["@type"]).toBe("BreadcrumbList")
    expect(ld.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://example.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://example.com/blog",
      },
    ])
  })
})

describe("itemListLd", () => {
  it("builds an ItemList and includes image only when present", () => {
    const ld = json(
      itemListLd(config, [
        { name: "A", path: "/a", image: "https://cdn.x/a.png" },
        { name: "B", path: "/b" },
      ]),
    )
    expect(ld["@type"]).toBe("ItemList")
    expect(ld.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      url: "https://example.com/a",
      name: "A",
      image: "https://cdn.x/a.png",
    })
    expect(ld.itemListElement[1].image).toBeUndefined()
  })
})

describe("collectionPageLd", () => {
  it("builds a CollectionPage embedding an ItemList", () => {
    const ld = json(
      collectionPageLd(config, {
        name: "Reviews",
        description: "All reviews",
        path: "/reviews",
        items: [{ name: "A", path: "/reviews/a" }],
      }),
    )
    expect(ld["@type"]).toBe("CollectionPage")
    expect(ld.name).toBe("Reviews")
    expect(ld.description).toBe("All reviews")
    expect(ld.url).toBe("https://example.com/reviews")
    expect(ld.inLanguage).toBe("en")
    expect(ld.isPartOf).toEqual({
      "@type": "WebSite",
      name: "Example",
      url: "https://example.com",
    })
    expect(ld.mainEntity["@type"]).toBe("ItemList")
    expect(ld.mainEntity.itemListElement[0].url).toBe(
      "https://example.com/reviews/a",
    )
  })

  it("omits description when absent", () => {
    const ld = json(
      collectionPageLd(config, { name: "X", path: "/x", items: [] }),
    )
    expect(ld.description).toBeUndefined()
  })
})

describe("createJsonLd factory", () => {
  it("binds the config across all builders", () => {
    const jsonld = createJsonLd(config)
    expect(jsonld.absoluteUrl("/x")).toBe("https://example.com/x")
    expect(json(jsonld.organization()).name).toBe("Example")
    expect(json(jsonld.website())["@type"]).toBe("WebSite")
    expect(
      json(jsonld.breadcrumb([{ name: "Home", path: "/" }]))["@type"],
    ).toBe("BreadcrumbList")
    expect(json(jsonld.itemList([]))["@type"]).toBe("ItemList")
    expect(
      json(jsonld.collectionPage({ name: "X", path: "/x", items: [] }))[
        "@type"
      ],
    ).toBe("CollectionPage")
  })
})
