# The website (Next.js) as a Docker image (used by Render).
FROM node:24-slim

WORKDIR /app

# Install packages first, so Docker can reuse this layer when only the code changes
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# The build already reads from the API (pages are pre-rendered), so it needs its address.
# Render passes the service's environment variables in as build arguments.
ARG API_URL
ENV API_URL=$API_URL
ENV NODE_ENV=production

# The free API sleeps when idle and takes ~1 minute to wake up, longer than Next waits
# for a page's data. So wake it first (up to 3 minutes), then build.
RUN node -e "const u=process.env.API_URL+'/health';(async()=>{for(let i=0;i<36;i++){try{if((await fetch(u)).ok){console.log('API is awake');return}}catch{}await new Promise(r=>setTimeout(r,5000))}console.log('API did not answer, building anyway')})()"
RUN npm run build

# `next start` listens on the PORT that Render gives it
EXPOSE 3000
CMD ["npm", "start"]
