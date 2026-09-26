import { Suspense } from "react";
import { LoginClient } from "./LoginClient";

export const metadata = { title: "Private preview — Shielva Sense" };

/** Server shell. useSearchParams needs the Suspense boundary. */
export default function LoginPage(): React.JSX.Element {
    return (
        <Suspense fallback={null}>
            <LoginClient />
        </Suspense>
    );
}
