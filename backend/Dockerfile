FROM node:16

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY src .

ENTRYPOINT ["node", "src/index.js"]

EXPOSE 8080
