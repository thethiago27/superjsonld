import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { organizationLd } from "../src/index"
import { JsonLd } from "../src/react"

describe("<JsonLd>", () => {
  it("renders a JSON-LD script tag with serialized data", () => {
    const data = organizationLd({
      baseUrl: "https://example.com",
      organization: { name: "Example" },
    })
    const html = renderToStaticMarkup(<JsonLd data={data} />)
    expect(html).toContain('<script type="application/ld+json">')
    expect(html).toContain('"@context":"https://schema.org"')
    expect(html).toContain('"@type":"Organization"')
    expect(html).toContain('"name":"Example"')
  })

  it("renders an array of nodes", () => {
    const html = renderToStaticMarkup(
      <JsonLd
        data={[
          organizationLd({
            baseUrl: "https://example.com",
            organization: { name: "A" },
          }),
        ]}
      />,
    )
    expect(html).toContain('"name":"A"')
    expect(html.startsWith("<script")).toBe(true)
  })
})
