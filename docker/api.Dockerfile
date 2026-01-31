FROM node:22

WORKDIR /app

COPY package.json yarn.lock nx.json tsconfig.base.json .

RUN yarn install --frozen-lockfile

COPY apps/api apps/api

EXPOSE 3000

ENV NODE_ENV=development
ENV RUNNING_IN_DOCKER=true

CMD ["yarn", "nx", "serve", "api"]
