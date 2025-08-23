import { TOKEN_TYPES } from '@cloudflare/privacypass-ts';
import {
  getPublicKeyBytes,
  Issuer,
  TokenRequest,
} from '@cloudflare/privacypass-ts/lib/src/pub_verif_token';
import { MODE } from './lib/mode';
import { isNewTokenAllowed } from './utils/issue';
import { getKeys } from './utils/keys';

async function setup() {
  const keys = await getKeys();
  const issuer = new Issuer(
    MODE,
    Bun.env.ISSUER_NAME || 'localhost',
    keys.privateKey,
    keys.publicKey,
  );
  const publicKeyBytes = await getPublicKeyBytes(keys.publicKey);

  return { issuer, publicKeyBytes };
}

const { issuer, publicKeyBytes } = await setup();
const tokenPolicy = {
  rate: 100,
  burst: 50,
  windowMs: 1000,
};

Bun.serve({
  port: 8888,
  routes: {
    '/': {
      GET: () => new Response('Torln Privacy Pass Token Issuer Server'),
    },
    '/.well-known/private-token-issuer-directory': {
      GET: async () => {
        const jwk = await crypto.subtle.exportKey('jwk', issuer.publicKey);

        return new Response(
          JSON.stringify({
            'issuer-name': Bun.env.ISSUER_NAME || 'localhost',
            'issuer-request-uri': new URL(
              '/issue',
              Bun.env.ISSUER_DOMAIN || 'http://localhost:8888',
            ).toString(),
            'token-keys': [
              {
                format: 'jwk',
                'token-key': jwk,
              },
              {
                format: 'spki-raw-b64u',
                'token-key': Buffer.from(publicKeyBytes).toString('base64url'),
              },
            ],
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          },
        );
      },
    },
    '/issue': {
      POST: async (req) => {
        const ok = await isNewTokenAllowed('issue:global', tokenPolicy);
        if (!ok) {
          console.warn(
            `[${new Date().toLocaleString()}] Global rate limit exceeded`,
          );
          return new Response('Global Rate limit exceeded', {
            status: 429,
            headers: { 'Retry-After': '1' },
          });
        }

        const bodyBuffer = await req.arrayBuffer();
        if (!bodyBuffer) {
          return new Response('Invalid request body', { status: 400 });
        }
        const tokenRes = await issuer.issue(
          TokenRequest.deserialize(
            TOKEN_TYPES.BLIND_RSA,
            new Uint8Array(bodyBuffer),
          ),
        );

        return new Response(tokenRes.serialize(), {
          headers: { 'Content-Type': 'application/private-token-response' },
        });
      },
    },
  },
  fetch: () =>
    new Response('Not found', {
      status: 404,
    }),
});

console.log(
  `[${new Date().toLocaleString()}] Private Pass Token Issuer running on http://localhost:8888`,
);
