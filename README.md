# School Portal

A simple Next.js + MySQL app to add & show schools.
Features: image upload (Cloudinary), responsive UI (Tailwind), API routes, and ready for Vercel deployment.

---

## Quick links

* Pages:

  * `/addSchool` — Add a school (form + optional image upload)
  * `/showSchools` — View all schools
  * `/api/schools` — REST API (GET list, POST create)

---

## Tech stack

* Next.js (Server-side API routes)
* React (client pages)
* Tailwind CSS for styling
* MySQL (`mysql2` via `lib/db.js`) — tested with Railway / PlanetScale / local Docker MySQL
* Cloudinary for image hosting (production)
* Form parsing with `formidable`
* Image uploads streamed to Cloudinary (recommended) or saved to `public/schoolImages` (local dev only)

---

## Requirements

* Node.js (v18+ recommended)
* npm
* Git
* (Optional) Docker — if you want a local MySQL container

---

## Local setup (development)

1. Clone the repo

```bash
git clone https://github.com/Shubham-kr-chaudhary/school-portal.git
cd school-portal
```

2. Install dependencies

```bash
npm install
```

3. Create `.env.local` in the project root. Example:

```env
# Database (Railway / local)
DB_HOST=<db-hostname>
DB_PORT=<db-port>
DB_USER=<db-user>
DB_PASSWORD=<db-password>
DB_NAME=<db-name>

# Cloudinary (production)
CLOUDINARY_ENABLED=true
CLOUDINARY_CLOUD_NAME=<cloudinary-name>
CLOUDINARY_API_KEY=<cloudinary-key>
CLOUDINARY_API_SECRET=<cloudinary-secret>

# JWT & OTP
JWT_SECRET=<long_random_string>
JWT_EXPIRES=7d
OTP_TTL_MIN=10

# Email (SMTP / Gmail app password recommended for small demos)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@example.com
SMTP_PASS=<app_password_or_smtp_password>
EMAIL_FROM=you@example.com

# Dev helper (logs OTP to server terminal — DO NOT enable in production)
DEV_LOG_OTP=true

```

**Important:**

* `DB_HOST` must be JUST the hostname. **Do not** put `mysql://...` there.
* If using Railway locally, use the public host + proxy port Railway gives (like `caboose.proxy.rlwy.net:15344` — split into `DB_HOST` and `DB_PORT`).
* For deployment to Vercel, add these same env vars in your Vercel Project Settings.

4. Create the database table (if not created automatically). Using your MySQL client (you can `mysql` CLI or Railway UI):

```sql
USE railway;
CREATE TABLE IF NOT EXISTS schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  contact VARCHAR(30),
  image TEXT,
  email_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
```
USE railway;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (email),
  INDEX (expires_at)
);
```

The otps table stores only a SHA-256 hash of OTPs and tracks expiry and usage.


5. Start dev server

```bash
npm run dev
# Open http://localhost:3000/addSchool and http://localhost:3000/showSchools
```

---

## Running with local Docker MySQL (optional)

If you prefer local MySQL via Docker:

```powershell
docker run --name school-mysql -e MYSQL_ROOT_PASSWORD=yourpass -e MYSQL_DATABASE=schooldb -p 3306:3306 -d mysql:8.0
```

Set `.env.local` accordingly:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpass
DB_NAME=schooldb
CLOUDINARY_ENABLED=false
```

Then create table either with the provided `scripts/init-db.js` or manually (see SQL above).

---

## Cloudinary notes (production)

* In production (Vercel), you **must** set `CLOUDINARY_ENABLED=true` and add `CLOUDINARY_*` keys in Vercel env variables.
* The app will upload images to Cloudinary and store the secure URL in the database.
* Vercel filesystem is read-only — local saving of `public/schoolImages` will NOT work in production.

---

## next.config.js (images)

If using `next/image` for remote images, ensure `next.config.mjs` allows remote patterns:

```js
export default {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' }
    ],
  },
};
```

(After editing, restart the dev server.)

---

## Deploy to Vercel (recommended)

1. Push your code to GitHub.
2. Import the repo into Vercel.
3. In Vercel Project Settings → Environment Variables, copy the same keys from your `.env.local` (DB\_HOST, DB\_PORT, DB\_USER, DB\_PASSWORD, DB\_NAME, CLOUDINARY\_\*, CLOUDINARY\_ENABLED).
4. Deploy — Vercel will build and run your app. Watch logs in Vercel dashboard for any runtime errors.

---

## API

* `GET /api/schools` — returns JSON array of schools ordered by newest
* `POST /api/schools` — accepts `multipart/form-data`, fields:

  * `name`, `address`, `city`, `state`, `contact`, `email_id`, `image` (file)
* Response codes:

  * `200` / `201` on success
  * `4xx`/`5xx` on errors

---

## Common troubleshooting

* **No images appear in `/showSchools`:**

  * Open `http://localhost:3000/api/schools` and check the `image` field. If it's `null`, Cloudinary upload failed or saving logic used local path and files don't exist.
  * If the `image` is a Cloudinary URL, but still not visible with `next/image`, ensure `next.config.mjs` `remotePatterns` allows `res.cloudinary.com`. Alternatively, the app uses a plain `<img>` tag which should display Cloudinary URLs without additional config.

* **Error: `getaddrinfo` or `EAI_FAIL` with DB host:**

  * Remove `mysql://` prefix if you copied the full URL into `DB_HOST`. Put only the hostname in `DB_HOST`, and port in `DB_PORT`.

* **Vercel: `ENOENT: mkdir '/var/task/public/schoolImages'`:**

  * On Vercel the server cannot create folders. Ensure `CLOUDINARY_ENABLED=true` in your Vercel env vars so the app uses Cloudinary instead of trying to write to `public/`.

* **Form fails to upload:**

  * Check server terminal for stack trace. Look for errors from `formidable` or `cloudinary`. Ensure `CLOUDINARY_ENABLED` and Cloudinary keys are correct.

* **Tailwind not applying:**

  * Ensure `styles/globals.css` includes:

    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```
  * Ensure `pages/_app.jsx` imports `../styles/globals.css`.

---

## Project structure (key files)

```
/pages
  /api
    /schools
      index.js        # API (GET/POST)
  addSchool.jsx
  showSchools.jsx
  index.jsx
/lib
  db.js               # mysql2 pool using env vars
/styles
  globals.css
/next.config.mjs
/package.json
```

---

Test OTP flow (PowerShell)

PowerShell Invoke-RestMethod example:

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/request-otp" -Method POST -Headers @{ "Content-Type"="application/json" } -Body '{"email":"you@example.com"}'
# check terminal (if DEV_LOG_OTP=true) or your email for OTP
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/verify-otp" -Method POST -Headers @{ "Content-Type"="application/json" } -Body '{"email":"you@example.com","otp":"123456"}'


Or use curl in WSL / Git Bash:

curl -X POST http://localhost:3000/api/auth/request-otp -H "Content-Type: application/json" -d '{"email":"you@example.com"}'


On successful verification the server sets an HttpOnly cookie sp_session (JWT). The /addSchool page is protected server-side and requires this cookie.

Email provider options
SMTP (Gmail App Password) — quick to set up for demos

Enable 2-step verification on the Google account

Create an App Password and use that as SMTP_PASS

Works on Vercel (store the same env vars in Vercel project settings)

lib/email.js uses Nodemailer. Install:

npm install nodemailer


If you prefer SendGrid / Mailgun / Postmark — implement or swap the lib/email.js provider accordingly and add provider keys to env.

Cloudinary notes (production)

In production set CLOUDINARY_ENABLED=true and add CLOUDINARY_* values in Vercel envs.

Vercel’s server filesystem is read-only — do not rely on public/schoolImages in production.

next.config.mjs (images)

If you use next/image with Cloudinary URLs, ensure next.config.mjs includes:

export default {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' }
    ],
  },
};


Restart the dev server after changing config.

Deploy to Vercel

Push code to GitHub (do not push .env.local).

Import the repository into Vercel.

In Vercel project settings add the same environment variables (DB, JWT, SMTP, Cloudinary). Set for Production.

Deploy — Vercel auto-deploys on push. Monitor build & runtime logs for errors (DB, SMTP, Cloudinary).

Important: Do NOT enable DEV_LOG_OTP in production.

API summary

GET /api/schools — list schools (public)

POST /api/schools — create school (requires valid session cookie — authenticated)

POST /api/auth/request-otp — send OTP to email

POST /api/auth/verify-otp — verify OTP and set session cookie

POST /api/auth/logout — clear session cookie

GET /api/auth/me — returns { authenticated: true|false }

Troubleshooting

No OTP email:

If DEV_LOG_OTP=true you will see OTP in server terminal — use this only for dev.

If SMTP returns auth errors, rotate and re-enter the SMTP credentials (Gmail App Password recommended).

DB connection errors (getaddrinfo, EAI_FAIL):

Make sure DB_HOST contains only the hostname (no mysql://), and DB_PORT is set correctly.

ENOENT mkdir /public/schoolImages on Vercel:

Ensure CLOUDINARY_ENABLED=true so the app uploads to Cloudinary instead of writing to the filesystem.

Session/cookie issues:

Ensure JWT_SECRET is set in Vercel and locally. Cookies are HttpOnly — client JS cannot read them directly.

Tailwind not applied:

Confirm styles/globals.css includes Tailwind directives and _app.jsx imports it.

Project structure (key files)
/pages
  /api
    /auth
      request-otp.js
      verify-otp.js
      logout.js
      me.js
    /schools
      index.js
  addSchool.jsx
  showSchools.jsx
  login.jsx
  verify.jsx
  index.jsx

/lib
  auth.js
  email.js
  getUser.js
  db.js

/styles
  globals.css

/next.config.mjs
/package.json
/scripts
  init-db.js

Security & housekeeping

Do not commit secrets. Use Vercel environment variables for production.

Rotate credentials immediately if they were exposed (SMTP app password, DB password, Cloudinary keys).

DEV_LOG_OTP=true is for local testing only — never enable in production.

OTPs are stored only as SHA-256 hashes and marked used after verification.

Next steps & recommended improvements

Add rate limiting for request-otp (prevent brute-force or spam).

Add attempt limits and account lockouts for OTP verification.

Add pagination/search on /showSchools.

Replace raw SQL with an ORM (Prisma) if you want migrations and type safety.

Add user roles if you need admin vs viewer controls.
---
