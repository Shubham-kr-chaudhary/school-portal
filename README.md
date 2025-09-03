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
# Railway / hosted MySQL (public proxy host)
DB_HOST=
DB_PORT=
DB_USER=root
DB_PASSWORD=
DB_NAME=

# Cloudinary (set to true for production/Vercel)
CLOUDINARY_ENABLED=true
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
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

## Recommended improvements (optional)

* Add validation (Zod + @hookform/resolvers).
* Add pagination or search to `/showSchools`.
* Add authentication for protected admin actions.
* Convert to Prisma for schema migrations.

---
