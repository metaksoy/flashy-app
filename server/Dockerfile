# node:18 kullanın (kök package.json'da belirttiğiniz gibi)
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Yetkilendirme için 'node' kullanıcısını ayarla (daha güvenli)
RUN chown -R node:node .
USER node

# SADECE paket dosyalarını kopyala.
# Build context'imiz '/server' olacağı için bu,
# 'server/package.json' ve 'server/yarn.lock' dosyalarını kopyalar.
COPY package.json yarn.lock ./

# Bağımlılıkları kur. 
# --ignore-scripts: "schema.prisma not found" hatasını veren 'postinstall' script'ini atlar.
# --frozen-lockfile: 'yarn.lock' dosyasını kullanarak hızlı ve tutarlı kurulum yapar.
RUN yarn install --ignore-scripts --frozen-lockfile

# Geri kalan tüm kodları kopyala (artık 'prisma/schema.prisma' da burada)
COPY . .

# Artık dosyalar kopyalandığına göre Prisma komutlarını GÜVENLE çalıştır
# '/server' context'inde olduğumuz için yolu './prisma/schema.prisma' olarak bulur
RUN npx prisma generate
RUN npx prisma migrate deploy

# docker-compose dosyanızda 4000 portunu kullandığınızı belirttiniz.
ENV PORT=4000
EXPOSE 4000

#ekle

# Uygulamayı başlat
CMD ["node", "src/server.js"]