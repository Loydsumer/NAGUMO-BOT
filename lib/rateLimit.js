
// lib/rateLimit.js
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚡ RATE LIMIT HANDLER - لمنع ظهور error 429
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let lastRequestTime = {}
const MIN_DELAY = 3000 // 3 ثواني بين الطلبات

export async function waitForRateLimit(key = 'default', minDelay = MIN_DELAY) {
    return new Promise((resolve) => {
        const now = Date.now()
        const last = lastRequestTime[key] || 0
        const elapsed = now - last
        
        if (elapsed < minDelay) {
            const waitTime = minDelay - elapsed
            setTimeout(resolve, waitTime)
        } else {
            resolve()
        }
        lastRequestTime[key] = Date.now()
    })
}

export async function safeRequest(fn, key = 'default') {
    await waitForRateLimit(key)
    return await fn()
}

export async function withRetry(fn, key = 'default', retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await waitForRateLimit(key)
            return await fn()
        } catch (err) {
            if (err.message?.includes('429') || err.status === 429) {
                console.log(`⚠️ Rate limit hit, retry ${i + 1}/${retries}...`)
                await new Promise(r => setTimeout(r, 5000 * (i + 1)))
                continue
            }
            throw err
        }
    }
    throw new Error('Max retries reached')
}

export { MIN_DELAY }