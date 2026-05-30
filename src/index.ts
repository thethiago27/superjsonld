import type {
  BreadcrumbList,
  CollectionPage,
  ItemList,
  Organization,
  WebSite,
  WithContext,
} from "schema-dts"
import {
  breadcrumbLd,
  collectionPageLd,
  itemListLd,
  makeAbsoluteUrl,
  organizationLd,
  websiteLd,
} from "./builders"
import type {
  BreadcrumbItem,
  CollectionPageInput,
  CreateJsonLdConfig,
  ItemListEntry,
  OrganizationInput,
  WebsiteOverrides,
} from "./types"

/** The builders returned by {@link createJsonLd}, bound to a single config. */
export interface JsonLdBuilders {
  /** Resolve a path against the configured `baseUrl`. */
  absoluteUrl(path?: string): string
  /** Build an `Organization` node. */
  organization(
    overrides?: Partial<OrganizationInput>,
  ): WithContext<Organization>
  /** Build a `WebSite` node (with `SearchAction` when search is configured). */
  website(overrides?: WebsiteOverrides): WithContext<WebSite>
  /** Build a `BreadcrumbList` node. */
  breadcrumb(items: BreadcrumbItem[]): WithContext<BreadcrumbList>
  /** Build an `ItemList` node. */
  itemList(items: ItemListEntry[]): WithContext<ItemList>
  /** Build a `CollectionPage` node. */
  collectionPage(input: CollectionPageInput): WithContext<CollectionPage>
}

/**
 * Create a set of JSON-LD builders bound to a single site configuration.
 *
 * @example
 * ```ts
 * const jsonld = createJsonLd({
 *   baseUrl: "https://example.com",
 *   defaultLanguage: "en",
 *   organization: { name: "Example", logo: "/logo.png" },
 *   search: { urlTemplate: "/search?q={search_term_string}" },
 * })
 *
 * jsonld.website()
 * jsonld.breadcrumb([{ name: "Home", path: "/" }])
 * ```
 */
export function createJsonLd(config: CreateJsonLdConfig): JsonLdBuilders {
  return {
    absoluteUrl: (path) => makeAbsoluteUrl(config.baseUrl, path),
    organization: (overrides) => organizationLd(config, overrides),
    website: (overrides) => websiteLd(config, overrides),
    breadcrumb: (items) => breadcrumbLd(config, items),
    itemList: (items) => itemListLd(config, items),
    collectionPage: (input) => collectionPageLd(config, input),
  }
}

export {
  breadcrumbLd,
  collectionPageLd,
  itemListLd,
  makeAbsoluteUrl,
  organizationLd,
  websiteLd,
} from "./builders"

export type {
  BreadcrumbItem,
  CollectionPageInput,
  CreateJsonLdConfig,
  ItemListEntry,
  OrganizationInput,
  SearchActionInput,
  WebsiteOverrides,
} from "./types"
