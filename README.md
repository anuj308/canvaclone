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
