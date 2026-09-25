import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/** eslint-config-next 16 ships native flat configs — no FlatCompat shim. */
const config = [
    ...coreWebVitals,
    ...typescript,
    {
        ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
    },
    {
        rules: {
            "jsx-a11y/alt-text": "error",
            "jsx-a11y/aria-props": "error",
            "jsx-a11y/aria-proptypes": "error",
            "jsx-a11y/role-has-required-aria-props": "error",
            "jsx-a11y/label-has-associated-control": "error",
            "jsx-a11y/anchor-is-valid": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "no-console": ["error", { allow: ["warn", "error", "info"] }],
        },
    },
];

export default config;
