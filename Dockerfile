FROM node:16.8.0-alpine3.13 as builder
WORKDIR /app

RUN apk add --update git bash

ADD package.json /app
RUN npm install --production

FROM node:16.8.0-alpine3.13
WORKDIR /app

EXPOSE 3000

ENV NODE_ENV production

COPY --from=builder /app/node_modules ./node_modules
ADD . /app


CMD ["node", "index.js"]
