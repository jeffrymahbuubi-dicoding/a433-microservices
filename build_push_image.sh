#!/bin/bash
# Script untuk membuat (build) Docker image order-service lalu mengunggahnya (push) ke GitHub Packages
# (GitHub Container Registry, ghcr.io).
# Cara pakai: GHCR_USER=<username_GitHub> CR_PAT=<token_Anda> bash build_push_image.sh
# Token memerlukan scope write:packages; username dan token tidak ditulis di script ini.

# Hentikan script bila ada perintah yang gagal
set -e

# 1. Membuat Docker image dari Dockerfile di direktori ini, dengan nama order-service dan tag latest
docker build -t order-service:latest .

# 2. Mengubah nama image agar sesuai format GitHub Packages: ghcr.io/<pemilik>/<nama-image>:<tag>
docker tag order-service:latest ghcr.io/jeffrymahbuubi-dicoding/order-service:latest

# 3. Login ke GitHub Packages; token dibaca dari environment variable CR_PAT melalui stdin (tidak tampil di riwayat perintah)
echo "$CR_PAT" | docker login ghcr.io -u "$GHCR_USER" --password-stdin

# 4. Mengunggah image ke GitHub Packages
docker push ghcr.io/jeffrymahbuubi-dicoding/order-service:latest
