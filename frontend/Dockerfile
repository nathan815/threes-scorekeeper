FROM node:18-alpine as builder

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

RUN npm run build

ENTRYPOINT [ "bash" ]

FROM alpine

COPY --from=builder /app/build ./build
COPY --from=builder /app/docker-copy.sh .

CMD [ "sh", "docker-copy.sh" ]
