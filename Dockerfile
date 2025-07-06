# ----------- Builder Stage -----------
FROM node:16-alpine AS builder

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Install dependencies
RUN npm ci

# Build the app
RUN npm run build


# ----------- Production Stage -----------
FROM nginx:1.21.0-alpine AS production

# Set environment variable (use = format, and consider 'production' for final build)
ENV NODE_ENV=production

# Copy built frontend from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy .env to the static folder (optional, depending on frontend usage)
COPY .env /usr/share/nginx/html/.env

# Add custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose desired port
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
