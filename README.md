# superjsonld

Tiny, configurable [JSON-LD](https://json-ld.org/) ([schema.org](https://schema.org)) builders for the web — with an optional React component.

- **Framework-agnostic core** with zero runtime dependencies.
- **Typed with [`schema-dts`](https://github.com/google/schema-dts)** for autocomplete and safety.
- **Configure once** with `createJsonLd({ baseUrl, organization, ... })`; relative paths are resolved for you.
- **Optional React component** (`superjsonld/react`) for rendering the `<script type="application/ld+json">` tag — server-renderable, works in the Next.js App Router.

## Install

```bash
npm install superjsonld
# or: pnpm add superjsonld / yarn add superjsonld
```

React is only needed if you use the `superjsonld/react` entry — it is declared as an optional peer dependency.

## Quick start

```ts
import { createJsonLd } from "superjsonld"

const jsonld = createJsonLd({
  baseUrl: "https://example.com",
  defaultLanguage: "en",
  organization: {
    name: "Example",
    logo: "/logo.png",
    description: "An example site.",
    sameAs: ["https://instagram.com/example"],
  },
  search: { urlTemplate: "/search?q={search_term_string}" },
})

jsonld.organization()
jsonld.website()
jsonld.breadcrumb([
  { name: "Home", path: "/" },
  { name: "Blog", path: "/blog" },
])
```

`createJsonLd` returns builders already bound to your config, so you never repeat
`baseUrl`. Paths like `/blog` are resolved to absolute URLs; absolute and
protocol-relative URLs are passed through unchanged.

## With React / Next.js App Router

```tsx
import { JsonLd } from "superjsonld/react"
import { createJsonLd } from "superjsonld"

const jsonld = createJsonLd({ baseUrl: "https://example.com", organization: { name: "Example" } })

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <JsonLd data={[jsonld.organization(), jsonld.website()]} />
        {children}
      </body>
    </html>
  )
}
```

`<JsonLd>` accepts a single node, an array of nodes, or a `@graph`, and renders a
single `<script type="application/ld+json">`. It produces no client-side
JavaScript, so it is safe inside React Server Components.

## Builders

| Builder | schema.org type |
| --- | --- |
| `organization(overrides?)` | `Organization` |
| `website(overrides?)` | `WebSite` (with optional `SearchAction`) |
| `breadcrumb(items)` | `BreadcrumbList` |
| `itemList(items)` | `ItemList` |
| `collectionPage(input)` | `CollectionPage` |
| `absoluteUrl(path?)` | resolves a path against `baseUrl` |

Each builder is also exported as a standalone, config-first function
(`organizationLd(config, …)`, `breadcrumbLd(config, items)`, etc.) for advanced
or tree-shaking-sensitive use.

### Configuration

```ts
interface CreateJsonLdConfig {
  baseUrl: string                 // absolute origin, no trailing slash
  organization?: {
    name: string                  // required to use organization()/website()
    url?: string                  // defaults to baseUrl
    logo?: string                 // relative paths resolved against baseUrl
    description?: string
    sameAs?: string[]
  }
  defaultLanguage?: string        // BCP-47, e.g. "en", "pt-BR"
  search?: {
    urlTemplate: string           // must contain {search_term_string}
    queryInput?: string           // default: "required name=search_term_string"
  }
}
```

## Notes

- The `WebSite` `SearchAction` includes the Google-recommended `query-input`
  property, which is not part of the schema.org vocabulary (and therefore not in
  `schema-dts`); `superjsonld` adds it for you.
- Output is intended for Google's
  [structured data](https://developers.google.com/search/docs/appearance/structured-data)
  guidelines. Validate with the
  [Rich Results Test](https://search.google.com/test/rich-results).

## License

[MIT](./LICENSE)
