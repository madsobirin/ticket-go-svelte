# Gunakan Node.js 22 LTS (Slim Debian) agar mendukung Promise.withResolvers pada SvelteKit 3
FROM node:22-slim

WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependensi
RUN npm install

# Salin semua kode proyek ke dalam container
COPY . .

# Build aplikasi SvelteKit
RUN npm run build

# Buka port 3000
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Jalankan server aplikasi
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
