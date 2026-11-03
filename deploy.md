# Deployment guide

This project has a Vite/React frontend and four Node.js backend services:

```text
Vercel frontend
      |
      v
Render gateway ---> Render auth
      |          ---> Render chat
      |          ---> Render agent ---> chat
      |                            ---> MongoDB, Redis, S3, AI providers
      +------------------------------> Redis
```

The gateway is the only backend URL the browser should use. The Vercel rewrite
in `client/vercel.json` sends `/api/...` requests to that gateway while keeping
the browser on the Vercel origin. The other services are separate Render web
services. They share the `backend` directory, so set that as the **Root
Directory for every Render service**; using a service's individual
subdirectory will break its imports from `backend/shared`.

Free-tier limits, quotas, and availability can change. Render free services may
sleep when idle, so the first request after inactivity can be slow. This setup
is suitable for a demo or small project, not guaranteed always-on production.

## 1. Prepare external services

Create or configure these before deploying:

1. **MongoDB Atlas**: create a database user, allow connections from Render
   (for a quick demo you may allow `0.0.0.0/0`; use tighter network controls
   where available), and copy the MongoDB connection string. Replace its
   username, password, and database name as needed.
2. **Redis**: create a hosted Redis instance, for example on a provider with a
   free tier. Copy its TLS connection URL if provided (`rediss://...`). The
   gateway, auth, and agent services must all use the same Redis instance:
   they share login sessions and cached conversation history.
3. **Firebase**: enable Google as a sign-in provider in Firebase Authentication.
   Create/download a Firebase Admin service-account JSON for the backend.
   Keep this credential private; it is not the Firebase web-app config used by
   the frontend.
4. **AWS S3**: create a bucket and an IAM user/key with only the S3 permissions
   needed for that bucket. The agent uses S3 for generated files.
5. **AI/search providers**: create API keys for Groq, Google AI (Gemini), and
   Tavily. The agent uses Groq for chat/search/coding, Gemini for image prompt
   generation, and Tavily for web search. Provider usage can have separate
   quotas or charges.

Do not put backend secrets in the frontend or commit them to the repository.
If a credential has already been committed or shared, rotate it before
deploying.

## 2. Deploy the backend to Render

The gateway requires `FRONTEND_URL` when `NODE_ENV=production`. First create
the Vercel project and get its production domain by following section 3 steps
1–5. Then return here to deploy Render, using that domain for `FRONTEND_URL`.
Keep the placeholder API rewrite until the Render gateway has been deployed.

Connect the repository to Render and create **four Web Services**. For each
service, select the same repository and branch, set **Root Directory** to
`backend`, choose the Node runtime, and set the service's build and start
commands from the table below.

| Render service | Build command (from `backend`) | Start command (from `backend`) |
| --- | --- | --- |
| Gateway | `npm ci && npm ci --prefix gateway` | `npm --prefix gateway start` |
| Auth | `npm ci && npm ci --prefix services/auth` | `npm --prefix services/auth start` |
| Chat | `npm ci && npm ci --prefix services/chat` | `npm --prefix services/chat start` |
| Agent | `npm ci && npm ci --prefix services/agent` | `npm --prefix services/agent start` |

The root `npm ci` installs `ioredis`, which the shared Redis module imports.
Each second install uses the lockfile for that service. Do not set a fixed
`PORT`; each service reads Render's `PORT` value. Render provides the service
URL and port, so use the full HTTPS service URL in the service URL settings
below; do not append a port number.

### Set Render environment variables

Add these in each service's **Environment** settings. Use the actual URLs and
credentials from your providers. For service URLs, use the URL of the
corresponding Render service, including `https://` and without an API path.

**Gateway**

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | The exact Vercel production origin, e.g. `https://your-app.vercel.app` (no trailing slash); comma-separate any additional allowed origins |
| `AUTH_SERVICE_URL` | Auth service URL |
| `CHAT_SERVICE_URL` | Chat service URL |
| `AGENT_SERVICE_URL` | Agent service URL |
| `REDIS_URL` | Hosted Redis connection URL |

`REDIS_URL` is a backend secret: set it in Render as shown above, not in
`vercel.json` or Vercel environment variables.

**Auth**

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `REDIS_URL` | The same Redis connection URL as the gateway |
| `FIREBASE_SERVICE_ACCOUNT` | The Firebase Admin service-account JSON, pasted as a single-line JSON value |

For `FIREBASE_SERVICE_ACCOUNT`, use the JSON contents, not a local file path.
Keep the private key intact (including its escaped `\n` sequences). Never use
this value in a `VITE_` variable.

**Chat**

| Variable | Value |
| --- | --- |
| `MONGO_URI` | MongoDB Atlas connection string |

**Agent**

| Variable | Value |
| --- | --- |
| `MONGO_URI` | MongoDB Atlas connection string |
| `REDIS_URL` | The same Redis connection URL as the gateway and auth |
| `CHAT_SERVICE` | Chat service URL |
| `GROQ_API_KEY` | Groq API key |
| `GOOGLE_API_KEY` | Google AI API key for Gemini |
| `TAVILY_API_KEY` | Tavily API key |
| `AWS_REGION` | AWS region containing the bucket |
| `AWS_ACCESS_KEY_ID` | IAM access key ID |
| `AWS_SECRET_ACCESS_KEY` | IAM secret access key |
| `AWS_BUCKET_NAME` | S3 bucket name |

Deploy auth, chat, and agent first, then set their service URLs in the gateway
and agent environments and deploy/redeploy the gateway and agent. In Render,
wait for each service to show **Live** and copy its public URL from the service
page. Set the gateway's health check path to `/health`. Where Render private
networking is available for your services, you can use its internal URLs for
service-to-service variables instead.

## 3. Deploy the frontend to Vercel

1. Import the same repository into Vercel.
2. Set **Root Directory** to `client`. This makes Vercel use
   `client/vercel.json`; `backend/vercel.json` is not used for this frontend
   project.
3. Use the Vite preset, build command `npm run build`, and output directory
   `dist`. Vercel normally detects these automatically.
4. Add the following environment variables for the Production environment:

   | Variable | Value |
   | --- | --- |
   | `VITE_FIREBASE_API_KEY` | Firebase web-app API key |
   | `VITE_FIREBASE_AUTH_DOMAIN` | Firebase web-app auth domain |
   | `VITE_FIREBASE_PROJECT_ID` | Firebase web-app project ID |
   | `VITE_FIREBASE_STORAGE_BUCKET` | Firebase web-app storage bucket |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase web-app messaging sender ID |
   | `VITE_FIREBASE_APP_ID` | Firebase web-app app ID |

   Get the `VITE_FIREBASE_*` values from Firebase Console → Project settings →
   General → Your apps. These browser config values are public; do not put
   service-account credentials or provider API keys here.
5. Deploy the frontend once to get its production Vercel domain. The API rewrite
   will not work until the Render gateway URL is configured in the next step.
   Use this domain as Render's `FRONTEND_URL`.
6. After the Render gateway is live, replace `YOUR-GATEWAY` in
   `client/vercel.json` with the gateway service's Render subdomain. For
   example, if the service URL is `https://agentrix-gateway.onrender.com`, use
   `https://agentrix-gateway.onrender.com/api/:path*` as the rewrite destination.
   Keep the `/api/:path*` suffix. Commit and push this change so Vercel
   redeploys.
7. In Firebase Authentication settings, add the deployed Vercel hostname to
   the authorized domains. Add your custom domain there too if you use one.

Vite environment variables are embedded at build time. Redeploy the Vercel
project after changing any `VITE_*` value.

## 4. Verify the deployment

1. Open the Vercel URL and sign in with Google.
2. Confirm that login creates a session and that conversations load.
3. Send a chat prompt, then test search and file-generation features. Chat,
   search, and coding use Groq; image prompt generation uses Gemini; search
   needs Tavily; generated files need working S3 credentials.
4. Check the Render service logs if something fails:
   - Gateway: verify `FRONTEND_URL`, backend service URLs, and Redis.
   - Auth: verify Firebase Admin JSON, MongoDB, and Redis.
   - Chat: verify MongoDB.
   - Agent: verify MongoDB, Redis, `CHAT_SERVICE`, provider keys, and S3.

`VITE_SERVER_URL` is not needed for the Vercel deployment: production API
requests use the same-origin rewrite. It can optionally be set for local Vite
development when calling a deployed gateway; if doing so, add
`http://localhost:5173` to the gateway's comma-separated `FRONTEND_URL` values.

The auth service sets an HTTP-only `SameSite=None; Secure` session cookie in
production, and the Vercel rewrite keeps API traffic on the frontend origin to
avoid third-party-cookie blocking. The gateway enables credentialed CORS only
for origins listed in `FRONTEND_URL` (or requests without an `Origin` header).
Set `NODE_ENV=production` on the auth service so production cookie settings are
used.
