# Use a stable Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose the port your TCP server uses (e.g., 5000)
EXPOSE 3699

# Start the server
CMD ["node", "server.js"]
