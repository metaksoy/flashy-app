FROM node:16.13.0-buster

WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --ignore-scripts
COPY . .
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npx prisma migrate deploy --schema=./prisma/schema.prisma

EXPOSE 8080

CMD ["node", "src/server.js"]
