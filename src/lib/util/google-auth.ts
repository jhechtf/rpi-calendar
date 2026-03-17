import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/shell";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { GoogleAuth } from "$lib/types/config";

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

function base64urlEncode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64urlEncode(bytes);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64urlEncode(new Uint8Array(digest));
}

function generateState(): string {
  return base64urlEncode(crypto.getRandomValues(new Uint8Array(16)));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

/**
 * Runs a full PKCE OAuth2 flow for Google:
 *  1. Starts a local HTTP server via the Tauri `start_oauth_server` command.
 *  2. Opens the Google consent page in the system browser.
 *  3. Waits for the `oauth-callback` Tauri event.
 *  4. Exchanges the authorization code for tokens.
 *  5. Returns the parsed token + basic user info.
 */
export async function signInWithGoogle(clientId: string, clientSecret: string): Promise<GoogleAuth> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Ask Rust to start a one-shot HTTP listener; get back the port.
  const port: number = await invoke("start_oauth_server");
  const redirectUri = `http://127.0.0.1:${port}`;

  const authParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
    access_type: "offline",
    prompt: "consent",
  });

  await open(`https://accounts.google.com/o/oauth2/v2/auth?${authParams}`);

  return new Promise<GoogleAuth>((resolve, reject) => {
    let unlisten: UnlistenFn | null = null;

    listen<string>("oauth-callback", async (event) => {
      // Unregister immediately — we only need one callback.
      if (unlisten) unlisten();

      try {
        const callbackUrl = new URL(event.payload);
        const error = callbackUrl.searchParams.get("error");
        if (error) throw new Error(`Google OAuth error: ${error}`);

        const returnedState = callbackUrl.searchParams.get("state");
        if (returnedState !== state) throw new Error("OAuth state mismatch");

        const code = callbackUrl.searchParams.get("code");
        if (!code) throw new Error("No authorization code in callback");

        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
            code_verifier: codeVerifier,
          }),
        });

        if (!tokenRes.ok) {
          const body = await tokenRes.text();
          throw new Error(`Token exchange failed (${tokenRes.status}): ${body}`);
        }

        const tokens = await tokenRes.json();

        // Decode the ID token JWT payload (middle segment) for user info.
        const payload = JSON.parse(atob(tokens.id_token.split(".")[1]));

        resolve({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? "",
          expiresAt: Date.now() + tokens.expires_in * 1000,
          email: payload.email ?? "",
          name: payload.name ?? payload.email ?? "",
        });
      } catch (err) {
        reject(err);
      }
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch(reject);
  });
}
