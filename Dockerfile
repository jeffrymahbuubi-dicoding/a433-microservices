# Menggunakan base image Node.js versi 14 dari Docker Hub
FROM node:14

# Menentukan working directory di dalam container adalah /app
WORKDIR /app

# Menyalin seluruh source code dari direktori proyek (host) ke working directory (/app) di container
COPY . .

# Menjalankan aplikasi dalam production mode dan memakai container bernama item-db sebagai database host
ENV NODE_ENV=production DB_HOST=item-db

# Menginstal dependencies untuk production, kemudian build aplikasi (gulp: menggabung dan minify asset)
RUN npm install --production --unsafe-perm && npm run build

# Mengekspos port 8080 yang digunakan aplikasi (bin/www memakai port 8080 di production mode)
EXPOSE 8080

# Saat container diluncurkan, jalankan server dengan perintah npm start
CMD ["npm", "start"]
