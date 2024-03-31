FROM node:latest

WORKDIR /movies
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 8050
CMD ["node", "./src/index.js"]











