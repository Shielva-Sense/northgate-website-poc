/**
 * Fail the build when a server component calls a client hook.
 *
 * This exists because of a real outage. A codemod that threaded the locale
 * through the tree inserted `const { locale } = useLocale();` into four server
 * components. TypeScript was happy, ESLint was happy, `next build` was happy —
 * the file is valid React either way, and nothing in the toolchain knows which
 * side of the server/client boundary a module lands on. It only failed at
 * runtime, as "Attempted to call useLocale() from the server", and because two
 * of those components render on every page it broke every site on the farm
 * while curl still reported 200: the prerendered shell is fine and the error
 * is thrown in the streamed part, so only a real browser sees it.
 *
 * The rule is therefore mechanical: a file that calls one of these hooks must
 * declare "use client" on its first line. Anything else takes the value as a
 * prop from the server parent that already holds it.
 */
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";

const HOOKS = ["useLocale", "useBrand", "useProfile", "useState", "useEffect", "useRef", "useMemo", "useCallback", "useContext", "useId", "useReducer", "usePathname", "useRouter", "useSearchParams"];
const CALL = new RegExp(`\\b(${HOOKS.join("|")})\\s*\\(`);

const files = globSync("app/**/*.tsx", { exclude: (p) => p.includes("node_modules") });
const offenders = [];

for (const file of files) {
    const source = readFileSync(file, "utf8");
    // The directive has to be the first statement; a comment above it is fine.
    const isClient = /^\s*(?:\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n\s*)*["']use client["']/.test(source);
    if (isClient) continue;
    const line = source.split("\n").findIndex((l) => CALL.test(l) && !l.trimStart().startsWith("*") && !l.trimStart().startsWith("//"));
    if (line !== -1) {
        offenders.push(`${file}:${line + 1}  calls ${CALL.exec(source.split("\n")[line])[1]}() without "use client"`);
    }
}

if (offenders.length > 0) {
    console.error("Server components calling client hooks:\n");
    for (const o of offenders) console.error("  " + o);
    console.error("\nEither add \"use client\" to the file, or take the value as a prop from the");
    console.error("server parent that already has it. The second is usually right for a");
    console.error("component with no state and no event handlers.\n");
    process.exit(1);
}
console.info(`check-client-hooks: ${files.length} files, no server component calls a client hook.`);
