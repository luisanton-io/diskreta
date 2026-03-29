import { mnemonicToSeed } from "bip39";
import { pki, random } from "node-forge";

export default async function generateKeyPair(mnemonic: string) {
    const seed = (await mnemonicToSeed(mnemonic)).toString('hex')

    // console.table({ mnemonic, seed })

    const bits = 4096

    const prng = random.createInstance();
    prng.seedFileSync = () => seed

    // Deterministic key generation
    return pki.rsa.generateKeyPair({ bits, prng, workers: 2 })
}