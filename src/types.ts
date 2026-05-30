/**
 * Public configuration and input types for `superjsonld`.
 *
 * These describe what a consumer passes in. The builders return strongly typed
 * schema.org objects (via `schema-dts`); see `builders.ts`.
 */

/** Data used to describe the publishing organization / brand. */
export interface OrganizationInput {
  /** Organization name. Required. */
  name: string
  /** Canonical organization URL. Defaults to `config.baseUrl`. */
  url?: string
  /**
   * Logo path or absolute URL. Relative paths are resolved against `baseUrl`.
   * e.g. `"/logo.png"` or `"https://cdn.example.com/logo.png"`.
   */
  logo?: string
  /** Short description of the organization. */
  description?: string
  /** Related/canonical profile URLs (social networks, Wikipedia, etc.). */
  sameAs?: string[]
}

/** Site search configuration used to build a `WebSite` `SearchAction`. */
export interface SearchActionInput {
  /**
   * URL template containing the `{search_term_string}` placeholder.
   * Relative templates are resolved against `baseUrl`.
   * e.g. `"/search?q={search_term_string}"`.
   */
  urlTemplate: string
  /** `query-input` value. Defaults to `"required name=search_term_string"`. */
  queryInput?: string
}

/** Configuration passed to {@link createJsonLd} and the standalone builders. */
export interface CreateJsonLdConfig {
  /** Absolute site origin, without a trailing slash. e.g. `"https://example.com"`. */
  baseUrl: string
  /** Default organization, used by `organization()` and as `WebSite` publisher. */
  organization?: OrganizationInput
  /** Default BCP-47 language tag for `WebSite`/`CollectionPage`. e.g. `"en"`, `"pt-BR"`. */
  defaultLanguage?: string
  /** Default site search configuration for `website()`. */
  search?: SearchActionInput
}

/** Per-call overrides for the `website()` builder. */
export interface WebsiteOverrides {
  /** Override the site name (defaults to the organization name). */
  name?: string
  /** Override the `inLanguage` value (defaults to `config.defaultLanguage`). */
  language?: string
  /** Override the search configuration (defaults to `config.search`). */
  search?: SearchActionInput
}

/** A single entry of a `BreadcrumbList`. */
export interface BreadcrumbItem {
  name: string
  /** Path or absolute URL, resolved against `baseUrl`. */
  path: string
}

/** A single entry of an `ItemList` / `CollectionPage`. */
export interface ItemListEntry {
  name: string
  /** Path or absolute URL, resolved against `baseUrl`. */
  path: string
  /** Optional image URL. */
  image?: string
}

/** Input for the `collectionPage()` builder. */
export interface CollectionPageInput {
  name: string
  description?: string
  /** Path or absolute URL of the page, resolved against `baseUrl`. */
  path: string
  items: ItemListEntry[]
}
