# build environment
FROM node:16.13.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY yarn.lock ./
RUN apk add --no-cache python3 make g++ && yarn install
COPY . ./
RUN yarn run build

# --- production environment ---

FROM nginx:stable-alpine
# Nginx'in $PORT değişkenini okuyabilmesi için 'envsubst' aracını kur
RUN apk add --no-cache gettext bash

# React build dosyalarını kopyala
COPY --from=build /app/build /usr/share/nginx/html

# Nginx şablon dosyasını kopyala
COPY nginx/nginx.conf.template /etc/nginx/nginx.conf.template

# Railway PORT değişkenini varsayılan olarak 80 yap
ENV PORT=8080

# Nginx'in dinamik PORT'u dinlediğini belirt
EXPOSE $PORT

# Başlangıç komutu:
# 1. Railway'nin PORT değişkenini kullan (varsayılan 80)
# 2. envsubst ile ${PORT} değişkenini şablona bas
# 3. Nginx'i başlat
CMD sh -c 'envsubst "\$PORT" < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && cat /etc/nginx/conf.d/default.conf && nginx -g "daemon off;"'