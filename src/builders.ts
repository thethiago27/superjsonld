import type {
  BreadcrumbList,
  CollectionPage,
  EntryPoint,
  ItemList,
  ListItem,
  Organization,
  SearchAction,
  WebSite,
  WithContext,
} from "schema-dts"
import type {
  BreadcrumbItem,
  CollectionPageInput,
  CreateJsonLdConfig,
  ItemListEntry,
  OrganizationInput,
  SearchActionInput,
  WebsiteOverrides,
} from "./types"

const SCHEMA_CONTEXT = "https://schema.org"
const DEFAULT_QUERY_INPUT = "required name=search_term_string"

/**
 * Resolve a path against a base origin.
 *
 * - Empty path or `"/"` returns the base origin (no trailing slash).
 * - Absolute URLs (`http://`, `https://`, protocol-relative `//`) are returned as-is.
 * - Other paths are joined to the base with a single leading slash.
 */
export function makeAbsoluteUrl(baseUrl: string, path = ""): string {
  const base = baseUrl.replace(/\/+$/, "")
  if (!path || path === "/") return base
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(path)) return path
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

function resolveOrganization(
  config: CreateJsonLdConfig,
  overrides?: Partial<OrganizationInput>,
): OrganizationInput {
  const merged = { ...config.organization, ...overrides }
  if (!merged.name) {
    throw new Error(
      "super-json-ld: organization.name is required. Provide it in createJsonLd({ organization }) or as an override.",
    )
  }
  return merged as OrganizationInput
}

/** Build an `Organization` node. */
export function organizationLd(
  config: CreateJsonLdConfig,
  overrides?: Partial<OrganizationInput>,
): WithContext<Organization> {
  const org = resolveOrganization(config, overrides)
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Organization",
    name: org.name,
    url: org.url ?? makeAbsoluteUrl(config.baseUrl),
    ...(org.logo ? { logo: makeAbsoluteUrl(config.baseUrl, org.logo) } : {}),
    ...(org.description ? { description: org.description } : {}),
    ...(org.sameAs && org.sameAs.length > 0 ? { sameAs: org.sameAs } : {}),
  }
}

function buildSearchAction(
  baseUrl: string,
  search: SearchActionInput,
): SearchAction & { "query-input": string } {
  const target: EntryPoint = {
    "@type": "EntryPoint",
    urlTemplate: makeAbsoluteUrl(baseUrl, search.urlTemplate),
  }
  return {
    "@type": "SearchAction",
    target,
    // `query-input` is a Google-recommended extension not present in schema-dts.
    "query-input": search.queryInput ?? DEFAULT_QUERY_INPUT,
  }
}

/** Build a `WebSite` node, optionally including a search `SearchAction`. */
export function websiteLd(
  config: CreateJsonLdConfig,
  overrides: WebsiteOverrides = {},
): WithContext<WebSite> {
  const name = overrides.name ?? config.organization?.name
  if (!name) {
    throw new Error(
      "super-json-ld: a site name is required for website(). Provide createJsonLd({ organization }) or pass { name }.",
    )
  }
  const language = overrides.language ?? config.defaultLanguage
  const search = overrides.search ?? config.search
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "WebSite",
    name,
    url: makeAbsoluteUrl(config.baseUrl),
    ...(language ? { inLanguage: language } : {}),
    publisher: { "@type": "Organization", name },
    ...(search
      ? { potentialAction: buildSearchAction(config.baseUrl, search) }
      : {}),
  }
}

function buildBreadcrumbItems(
  baseUrl: string,
  items: BreadcrumbItem[],
): ListItem[] {
  return items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: makeAbsoluteUrl(baseUrl, item.path),
  }))
}

/** Build a `BreadcrumbList` node from ordered breadcrumb items. */
export function breadcrumbLd(
  config: Pick<CreateJsonLdConfig, "baseUrl">,
  items: BreadcrumbItem[],
): WithContext<BreadcrumbList> {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: buildBreadcrumbItems(config.baseUrl, items),
  }
}

function buildListItems(baseUrl: string, items: ItemListEntry[]): ListItem[] {
  return items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: makeAbsoluteUrl(baseUrl, item.path),
    name: item.name,
    ...(item.image ? { image: item.image } : {}),
  }))
}

/** Build a standalone `ItemList` node. */
export function itemListLd(
  config: Pick<CreateJsonLdConfig, "baseUrl">,
  items: ItemListEntry[],
): WithContext<ItemList> {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "ItemList",
    itemListElement: buildListItems(config.baseUrl, items),
  }
}

/** Build a `CollectionPage` node embedding an `ItemList` as its main entity. */
export function collectionPageLd(
  config: CreateJsonLdConfig,
  input: CollectionPageInput,
): WithContext<CollectionPage> {
  const orgName = config.organization?.name
  const mainEntity: ItemList = {
    "@type": "ItemList",
    itemListElement: buildListItems(config.baseUrl, input.items),
  }
  const isPartOf: WebSite = {
    "@type": "WebSite",
    ...(orgName ? { name: orgName } : {}),
    url: makeAbsoluteUrl(config.baseUrl),
  }
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "CollectionPage",
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    url: makeAbsoluteUrl(config.baseUrl, input.path),
    ...(config.defaultLanguage ? { inLanguage: config.defaultLanguage } : {}),
    isPartOf,
    mainEntity,
  }
}
