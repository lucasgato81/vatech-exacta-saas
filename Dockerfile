FROM node:20-alpine

WORKDIR /app

# Copy package definitions
COPY package*.json ./
COPY saas-platform/package*.json ./saas-platform/

# Install dependencies
RUN npm install
RUN cd saas-platform && npm install

# Copy application files
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start server
CMD ["node", "saas-platform/server.js"]
