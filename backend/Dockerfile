FROM node:18-slim

WORKDIR /app

# Install curl for debugging
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && \
    npm install --save-dev @types/bcryptjs

# Copy source code and environment file
COPY . .

# Build the application
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV DEBUG=express:*
ENV DB_HOST=rds-database-1.c766iiku6v45.ap-southeast-2.rds.amazonaws.com
ENV DB_USER=nadiaTiwingAdmin
ENV DB_PASSWORD=Ukitnam2020!
ENV DB_NAME=dental_clinic_db
ENV DB_PORT=3306
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/test || exit 1

CMD ["npm", "run", "start"]