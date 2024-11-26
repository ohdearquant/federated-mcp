FROM denoland/deno:1.40.2

# Set working directory
WORKDIR /app

# Copy dependency files
COPY deno.lock* .
COPY import_map.json* .

# Copy source code
COPY . .

# Cache dependencies
RUN deno cache apps/deno/server.ts

# Compile the server
RUN deno compile --allow-net --allow-read apps/deno/server.ts

# The port that your application listens to
EXPOSE 3000

# Prefer not to run as root
USER deno

# Start the server
CMD ["./server"]
