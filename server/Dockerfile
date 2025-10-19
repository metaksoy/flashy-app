# Debian tabanlı Node.js kullan (Alpine yerine - Prisma ile daha uyumlu)
FROM node:18-slim

# Prisma için gerekli OpenSSL kütüphanesini kur
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Çalışma dizinini ayarla
WORKDIR /app

# SADECE paket dosyalarını kopyala
COPY package.json yarn.lock ./

# Bağımlılıkları kur (root olarak)
# --ignore-scripts: "schema.prisma not found" hatasını veren 'postinstall' script'ini atlar
RUN yarn install --ignore-scripts

# Geri kalan tüm kodları kopyala (artık 'prisma/schema.prisma' da burada)
COPY . .

# Prisma cache'ini temizle ve generate et
RUN rm -rf node_modules/.prisma node_modules/@prisma/client
RUN npx prisma generate
#RUN npx prisma migrate deploy

# Port ayarla
ENV PORT=4000
EXPOSE 4000

# Uygulamayı başlat
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]