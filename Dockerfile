# Menggunakan base image Node.js 16 versi alpine (kecil) dari Docker Hub; pelajaran 10.11 memakai base alpine
FROM node:16-alpine

# Label yang menghubungkan package di ghcr.io dengan repository GitHub (dokumentasi GitHub, "Working with the Container registry")
LABEL org.opencontainers.image.source="https://github.com/jeffrymahbuubi-dicoding/a433-microservices"

# Menentukan working directory di dalam container adalah /app
WORKDIR /app

# Menyalin package.json dan package-lock.json lebih dulu agar layer dependencies bisa di-cache
COPY package*.json ./

# Menginstal dependencies sesuai package-lock.json
RUN npm ci

# Menyalin sisa source code (termasuk .env) ke working directory
COPY . .

# Mendokumentasikan port yang dipakai aplikasi (sesuai PORT di .env)
EXPOSE 3001

# Saat container diluncurkan, jalankan aplikasi dengan Node.js
CMD ["node", "index.js"]
