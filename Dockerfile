# Use official Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the NestJS project
RUN npm run build

# Expose application port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]
