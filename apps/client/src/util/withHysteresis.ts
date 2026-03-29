export default async function withHysteresis<T>(promise: Promise<T>, threshold: number = 1500) {
    const result = await Promise.all([
        promise,
        new Promise(resolve => { setTimeout(resolve, threshold) })
    ])

    return result[0]
}