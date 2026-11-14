# Proyek Deploy Aplikasi Karsa Jobs dengan Kubernetes

Branch ini berisi direktori `kubernetes` (manifest untuk minikube). Source code aplikasi ada di branch
[`karsajobs`](../../tree/karsajobs) (backend, API Go) dan [`karsajobs-ui`](../../tree/karsajobs-ui) (frontend, Vue.js),
masing-masing dengan script `build_push_image_*.sh` dan workflow CI di `.github/workflows/ci.yml`.

Urutan deploy:

```
minikube start --ports=127.0.0.1:30000:30000,127.0.0.1:30001:30001
kubectl apply -f kubernetes/mongodb/
kubectl apply -f kubernetes/backend/
kubectl apply -f kubernetes/frontend/
```

Aplikasi web: http://localhost:30000 (frontend), API: http://localhost:30001 (backend).
