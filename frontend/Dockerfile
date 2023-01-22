FROM node:18-alpine as builder

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

ARG REACT_APP_NAME
ENV REACT_APP_NAME=${REACT_APP_NAME}

ENV REACT_APP_CLARITY_KEY=${REACT_APP_CLARITY_KEY}
ARG REACT_APP_CLARITY_KEY

ARG REACT_APP_GOOGLE_ANALYTICS_KEY
ENV REACT_APP_GOOGLE_ANALYTICS_KEY=${REACT_APP_GOOGLE_ANALYTICS_KEY}

RUN npm run build

ENTRYPOINT [ "bash" ]

FROM alpine

COPY --from=builder /app/build ./build
COPY --from=builder /app/docker-copy.sh .

CMD [ "sh", "docker-copy.sh" ]
