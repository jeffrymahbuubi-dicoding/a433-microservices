#!/bin/bash
# Script untuk membuat (build) Docker image karsajobs-ui (frontend Vue.js) lalu mengunggahnya (push) ke
# GitHub Packages (GitHub Container Registry, ghcr.io) — saran kedua submission.
# Sebelum menjalankan, simpan Personal Access Token GitHub (scope write:packages) di environment variable:
#   export CR_PAT=<token_Anda>
# Di GitHub Actions (saran keempat), CR_PAT diisi dengan GITHUB_TOKEN bawaan workflow.

# Hentikan script bila ada perintah yang gagal (misalnya build gagal, maka push tidak dijalankan)
set -e

# Nama image lengkap sesuai format GitHub Packages: ghcr.io/<pemilik>/<nama-image>:<tag>
IMAGE=ghcr.io/jeffrymahbuubi-dicoding/karsajobs-ui:latest

# 1. Build Docker image dari berkas Dockerfile di direktori ini dan langsung beri nama $IMAGE
docker build -t $IMAGE .

# 2. Login ke GitHub Packages; token dibaca dari environment variable CR_PAT (tidak ditulis di script).
#    Username diambil dari GITHUB_ACTOR bila berjalan di GitHub Actions, selain itu jeffrymahbuubi.
echo $CR_PAT | docker login ghcr.io -u ${GITHUB_ACTOR:-jeffrymahbuubi} --password-stdin

# 3. Push (unggah) image ke GitHub Packages
docker push $IMAGE
