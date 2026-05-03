# Stage 1: Build the Vite React application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for optimal caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the project (outputs to /dist)
RUN npm run build


# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Expose $PORT variable so Nginx can bind to it (default for Cloud Run is 8080)
ENV PORT=8080

# Copy the Nginx configuration template.
# The official Nginx Docker image will automatically substitute the $PORT 
# environment variable in this template and output to /etc/nginx/conf.d/default.conf
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Clear out the default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built React app from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the default Cloud Run port
EXPOSE 8080

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
