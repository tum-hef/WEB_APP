FROM node:16-alpine as builder

# Set the working directory to /app inside the container
WORKDIR /app

# Copy app files and .env file
COPY . .

# Install dependencies
RUN npm ci 

# Build the app
RUN npm run build 

# Bundle static assets with nginx
FROM nginx:1.21.0-alpine as production
ENV NODE_ENV development

# Copy built assets from `builder` image
COPY --from=builder /app/build /usr/share/nginx/html

# Copy .env file to the static folder if necessary
COPY .env /usr/share/nginx/html/.env

# Add your nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
