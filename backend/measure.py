import requests, time, statistics

BASE = "http://127.0.0.1:8000"
tests = {
    "Health check": ("GET", "/health/db"),
    "School impact": ("GET", "/impact/school/SCH001"),
    "Student profile": ("GET", "/students/S001"),
    "Pipeline run": ("POST", "/pipeline/run"),
}

for name, (method, path) in tests.items():
    times = []
    for _ in range(20):
        t = time.perf_counter()
        requests.request(method, BASE + path)
        times.append((time.perf_counter() - t) * 1000)
    print(f"{name}: avg {statistics.mean(times):.0f} ms, max {max(times):.0f} ms")