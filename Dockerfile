# Use the official Node.js image as the base image
FROM node:18-alpine

# Install required libraries
RUN apk add --no-cache libssl3 openssl

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies using yarn and cache them
RUN yarn install --frozen-lockfile

# Copy the Prisma schema and migrations
COPY prisma ./prisma

# Generate the Prisma client
RUN yarn prisma generate

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]