export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const token = localStorage.getItem('adminToken')
    const headers = new Headers(init.headers)

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    if (init.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    return fetch(input, {
        ...init,
        headers,
    })
}
