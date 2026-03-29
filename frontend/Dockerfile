# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
COPY package.json .
RUN npm install

# Development image: runs Vite dev server
FROM base AS dev
# Copy essential files needed for Vite dev server
COPY index.html vite.config.js ./
CMD ["npm", "run", "dev", "--", "--host"]

# Production build
FROM base AS build
COPY . .
RUN npm run build

FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
