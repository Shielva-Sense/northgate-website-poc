/**
 * Structured data. Server-rendered into the document so crawlers see it in the
 * initial HTML rather than after hydration.
 *
 * The payload is built from our own constants — never from user input — so
 * there is nothing here an attacker can reach. JSON.stringify output still has
 * its `<` escaped, because a `</script>` inside a string would close this tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }): React.JSX.Element {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data).replace(/</g, "\\u003c"),
            }}
        />
    );
}
