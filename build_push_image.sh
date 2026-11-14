#!/bin/bash
# Script untuk membuat (build) Docker image item-app lalu mengunggahnya (push) ke GitHub Packages
# (GitHub Container Registry, ghcr.io).
# Sebelum menjalankan, simpan Personal Access Token GitHub (scope write:packages) di environment variable:
#   export CR_PAT=<token_Anda>

# Hentikan script bila ada perintah yang gagal
set -e

# 1. Membuat Docker image dari Dockerfile di direktori ini, dengan nama item-app dan tag v1
docker build -t item-app:v1 .

# 2. Melihat daftar image yang ada di lokal
docker images

# 3. Mengubah nama image agar sesuai format GitHub Packages: ghcr.io/<pemilik>/<nama-image>:<tag>
docker tag item-app:v1 ghcr.io/jeffrymahbuubi-dicoding/item-app:v1

# 4. Login ke GitHub Packages via Terminal; token dibaca dari environment variable CR_PAT (tidak ditulis di script)
echo $CR_PAT | docker login ghcr.io -u jeffrymahbuubi --password-stdin

# 5. Mengunggah image ke GitHub Packages
docker push ghcr.io/jeffrymahbuubi-dicoding/item-app:v1
