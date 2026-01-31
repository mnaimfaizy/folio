FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock nx.json tsconfig.base.json .

RUN yarn install --frozen-lockfile

COPY apps/web apps/web

EXPOSE 5173

ENV NODE_ENV=development

CMD ["yarn", "nx", "serve", "web"]
