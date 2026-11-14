// Updates Grafana dashboard 6417 "Kubernetes Cluster (Prometheus)" (2017) to current metric names:
// kube-state-metrics v2 replaced per-resource metrics with one metric + a "resource" label, and node_exporter
// added the _bytes suffix to filesystem metrics. Input: dashboard JSON exported from Grafana; output: fixed JSON.
// Usage: node fix-6417.mjs <in.json> <out.json>
import { readFileSync, writeFileSync } from "node:fs"
const [, , inFile, outFile] = process.argv
const raw = JSON.parse(readFileSync(inFile, "utf8"))
const d = raw.dashboard ?? raw
const rules = [
  // kube-state-metrics v2: node capacity/allocatable and container requests use a resource label
  [/kube_node_status_(allocatable|capacity)_cpu_cores\{/g, 'kube_node_status_$1{resource="cpu",'],
  [/kube_node_status_(allocatable|capacity)_memory_bytes\{/g, 'kube_node_status_$1{resource="memory",'],
  [/kube_node_status_(allocatable|capacity)_pods\{/g, 'kube_node_status_$1{resource="pods",'],
  [/kube_pod_container_resource_requests_cpu_cores\{/g, 'kube_pod_container_resource_requests{resource="cpu",'],
  [/kube_pod_container_resource_requests_memory_bytes\{/g, 'kube_pod_container_resource_requests{resource="memory",'],
  [/kube_pod_container_status_restarts\{/g, "kube_pod_container_status_restarts_total{"],
  // node_exporter >= 0.16: filesystem metrics end in _bytes; they carry no "nodename" label (single node here)
  [/node_filesystem_(size|free)\{nodename=~"\$node"\}/g, 'node_filesystem_$1_bytes{fstype!~"tmpfs|overlay"}'],
]
let changed = 0
const fix = (s) => rules.reduce((acc, [re, to]) => acc.replace(re, to), s)
const walk = (panels) => panels?.forEach((p) => {
  walk(p.panels)
  p.targets?.forEach((t) => { if (t.expr) { const n = fix(t.expr); if (n !== t.expr) { t.expr = n; changed++ } } })
})
walk(d.panels); d.rows?.forEach((r) => walk(r.panels))
d.id = null
d.uid = "k8s-cluster-6417-ksm2"
d.title = "Kubernetes Cluster (Prometheus) — 6417, metrics updated"
writeFileSync(outFile, JSON.stringify(d, null, 2) + "\n")
console.log(`fixed ${changed} queries → ${outFile}`)
