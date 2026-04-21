# Aakaar — Canva Clone

Aakaar is a full-stack Canva-style design editor built with **Next.js** and **Node.js microservices**, focused on scalable architecture, modern UI, and rich canvas editing capabilities.

## Project Overview

This project demonstrates end-to-end product development across frontend, backend, authentication, cloud storage, subscriptions, and AI-assisted design workflows.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TailwindCSS, Shadcn UI
- **Canvas Engine:** Fabric.js
- **State Management:** Zustand
- **Authentication:** Auth.js / NextAuth v5
- **Backend:** Node.js microservices + API Gateway
- **Database:** MongoDB
- **Media Storage:** Cloudinary
- **Payments:** PayPal Subscription integration

## Core Features

- Canva-like editor with object-based canvas controls
- Add and manipulate **shapes, text, freehand drawings, and images**
- Sidebar panels for Shapes, Uploads, Text, Draw, and AI tools
- Smart shape factory and custom property editor
- Canvas lock/unlock mode for focused editing
- Auto-save and seamless design reloading
- AI image generation panel (external API based)
- Image uploads with Cloudinary and canvas preview integration
- Export designs as **PNG, JPG, SVG, and JSON**
- Responsive UI using TailwindCSS + Shadcn UI

## Subscription & Access Control

- Premium membership and upgrade flow
- PayPal-based subscription handling
- Free-tier limits (up to 5 designs)
- AI feature gating for non-premium users
- Billing info, design history, and upgrade dialogs
- Delete design projects directly from dashboard

## Microservices Architecture

- **API Gateway** for request routing and auth-aware forwarding
- **Design Service** for design CRUD and history
- **Upload Service** for media and AI image handling
- **Subscription Service** for plan and billing lifecycle

## Project Name Clarification

- **Repository name:** Canvas Clone
- **Product/Website name:** Aakaar

## Notes

This project was developed as a guided build inspired by a long-form YouTube implementation and expanded into a complete, portfolio-ready full-stack system.

## Repository Structure

- `client/` - Next.js frontend (recommended deployment: Vercel)
- `server/` - Node.js microservices, API gateway, Nginx, Docker Compose

## Running the Project

You can run this project in two common modes:

1. Frontend local + backend local Docker (development)
2. Frontend on Vercel + backend on a server via Docker (production-style)

---

## Backend (Docker)

All backend container files are inside `server/`:

- `server/docker-compose.dev.yml` - development stack (includes local MongoDB)
- `server/docker-compose.yml` - server/deployment stack (uses cloud MongoDB)
- `server/nginx/default.conf` - reverse proxy to API Gateway
- `server/.env.dev.example` - sample env for dev compose
- `server/.env.example` - sample env for server compose

### 1) Development backend (with local MongoDB)

From project root:

```bash
cd server
cp .env.dev.example .env.dev
docker compose -f docker-compose.dev.yml --env-file .env.dev up -d --build
```

Backend entrypoint:

- Nginx/API URL: `http://localhost:8080`

Stop:

```bash
docker compose -f docker-compose.dev.yml --env-file .env.dev down
```

### 2) Server/deployment backend (with cloud MongoDB)

From project root:

```bash
cd server
cp .env.example .env
# fill required values in .env
docker compose -f docker-compose.yml up -d --build
```

Stop:

```bash
docker compose -f docker-compose.yml down
```

## Required Backend Environment Variables

In `server/.env` (or `.env.dev`), configure:

- `MONGO_URI` - cloud MongoDB connection string (required for server compose)
- `GOOGLE_CLIENT_ID` - used by gateway token verification
- `GOOGLE_CLIENT_SECRET` - included for auth configuration completeness
- `CORS_ORIGINS` - comma-separated frontend origins
- `STABILITY_API_KEY` - AI image generation key
- `cloud_name` - Cloudinary cloud name
- `api_key` - Cloudinary API key
- `api_secret` - Cloudinary API secret

## Backend Service Ports (inside Docker network)

- API Gateway: `5000`
- Design Service: `5001`
- Upload Service: `5002`
- Subscription Service: `5003`
- Nginx public entrypoint: `8080 -> 80`

---

## Frontend (Next.js)

From project root:

```bash
cd client
npm install
npm run dev
```

Frontend URL:

- `http://localhost:3000`

### Frontend API URL Switching

Frontend API resolution supports local and Docker gateway modes via `client/.env.local`:

- `NEXT_PUBLIC_API_MODE=local` uses `NEXT_PUBLIC_LOCAL_API_URL`
- `NEXT_PUBLIC_API_MODE=docker` uses `NEXT_PUBLIC_DOCKER_API_URL`
- `NEXT_PUBLIC_API_URL` overrides both when set (useful for deployed backend)

Default local values:

- `NEXT_PUBLIC_LOCAL_API_URL=http://localhost:5000`
- `NEXT_PUBLIC_DOCKER_API_URL=http://localhost:8080`

Recommended for Docker backend + local frontend:

- `NEXT_PUBLIC_API_MODE=docker`

---

## Recommended Deployment Pattern

- Deploy `client/` on Vercel.
- Deploy `server/` on a VM/container host using Docker Compose.
- Point frontend API env (`NEXT_PUBLIC_API_URL`) to your deployed backend gateway domain.
- Set `CORS_ORIGINS` in backend to include your Vercel domain.

Example:

- Frontend: `https://your-app.vercel.app`
- Backend Gateway: `https://api.yourdomain.com`
- Backend `CORS_ORIGINS=https://your-app.vercel.app`
- Frontend `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`

---

## Health Check

After backend is up:

```bash
curl http://localhost:8080/health
```

Expected response: JSON with gateway health status.

## Useful Docker Commands

From `server/`:

```bash
# See running containers
docker compose ps

# Follow logs
docker compose logs -f

# Rebuild and restart
docker compose up -d --build

# Stop the production server compose
docker compose -f docker-compose.yml down

# Stop the development compose
docker compose -f docker-compose.dev.yml --env-file .env.dev down
```

## Troubleshooting

- If frontend gets CORS errors, update `CORS_ORIGINS` in backend env.
- If auth fails, verify `GOOGLE_CLIENT_ID` matches the token issuer app.
- If upload/AI routes fail, verify Cloudinary and Stability keys.
- If compose warns `MONGO_URI` is empty, fill it in `.env` before running.
