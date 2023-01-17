FROM node:18

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY ./src .

RUN npm run build

ENV PORT=80
EXPOSE 80

ENTRYPOINT ["node", "build/main.js"]
