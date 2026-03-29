import { generateMnemonic } from "bip39";
import { pki } from "node-forge";
import generateKeyPair from "util/generateKeypair";

jest.setTimeout(1000000)

describe("Deterministic key generation", () => {

    it("should generate RSA pairs deterministically and consistently from the same mnemonic", async () => {

        const mnemonic = generateMnemonic(256)

        // Generate 10 keys from the same mnemonic
        const keys = Array(10).fill(
            pki.publicKeyToPem(
                (await generateKeyPair(mnemonic)).publicKey
            )
        )

        // All keys should be the same
        expect(keys.every(key => key === keys[0])).toBe(true)

    })
})