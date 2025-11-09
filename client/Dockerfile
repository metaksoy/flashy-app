# build environment
FROM node:16.13.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

# Build-time environment variables
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

ARG REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

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
# ... (Dockerfile'ın üst kısmı aynı)

# Nginx şablon dosyasını kopyala
COPY nginx/nginx.conf.template /etc/nginx/nginx.conf.template

# --- BU SATIRI SİLİN ---
# ENV PORT=8080 <--- BU SATIRI TAMAMEN SİLİN

# Nginx'in dinamik PORT'u dinlediğini belirt
EXPOSE ${PORT}

# --- BU CMD SATIRINI AŞAĞIDAKİ İLE DEĞİŞTİRİN ---
# Başlangıç komutu:
# 1. PORT değişkeni ayarlı değilse 8080 olarak ayarla (fallback)
# 2. envsubst ile ${PORT} değişkenini şablona bas ve gerçek bir .conf dosyası oluştur
# 3. Hata ayıklama için oluşturulan konfigürasyonu log'lara yazdır
# 4. Nginx'i başlat
CMD sh -c 'export PORT=${PORT:-8080} && \
           envsubst "\$PORT" < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && \
           echo "--- Generated Nginx Config ---" && \
           cat /etc/nginx/conf.d/default.conf && \
           echo "------------------------------" && \
           nginx -g "daemon off;"'