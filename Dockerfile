FROM node:14.16.1-buster-slim

EXPOSE 3000

WORKDIR /app

COPY . ./

RUN npm install

ENTRYPOINT ["node", "src/server.js"]