FROM node:20.5.0-bullseye-slim

# Set up a non-root user (Optional but recommended)
RUN groupadd -r app && useradd -r -g app -d /usr/src/app app

# Set the working directory
WORKDIR /usr/src/app

COPY package*.json ./

# Change ownership of the working directory to the "app" user
RUN chown -R app:app .

# Switch to the non-root user
USER app

RUN npm install --production

COPY . .

# Add a health check (Optional but recommended)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD node -e "require('http').get('http://localhost:10000', () => process.exit(0)).on('error', () => process.exit(1))"

CMD [ "npm", "start" ]
