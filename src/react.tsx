import type { Graph, Thing, WithContext } from "schema-dts"

/** Any JSON-LD payload accepted by {@link JsonLd}. */
export type JsonLdData =
  | WithContext<Thing>
  | Graph
  | ReadonlyArray<WithContext<Thing>>

export interface JsonLdProps {
  /** A single node built by `super-json-ld`, a `@graph`, or an array of nodes. */
  data: JsonLdData
}

/**
 * Render a JSON-LD `<script>` tag. Server-renderable (no client JavaScript) and
 * safe to use in React Server Components, including the Next.js App Router.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires script injection
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
