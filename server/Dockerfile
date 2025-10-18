FROM node:16.13.0-buster

WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]
RUN yarn install
COPY . .
RUN npx prisma generate

EXPOSE 8080

CMD ["node", "src/server.js"]
