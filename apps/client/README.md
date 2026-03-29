# `d i s k r e t a .`

##### <div align="right">by [Luis Antonio Canettoli Ordoñez](http://luisanton.io)</div>
## An E2E encrypted chat system.

- **[Live version here](https://diskreta.vercel.app)**
- [Backend repository](https://github.com/luisanton-io/be-diskreta)
- Based on MongoDB, Express, React and NodeJS.
- Using Socket.io to handle real time communication.
- Fully written in Typescript.

## Why `diskreta`?

"Diskreta" is the [Esperanto](https://en.wikipedia.org/wiki/Esperanto) word for "discreet".
The goal of `diskreta.` is to be an anonymous, discreet, encrypted and secure chat system.

## Overview

The clients [generate deterministically](https://stackoverflow.com/questions/72047474/how-to-generate-safe-rsa-keys-deterministically-using-a-seed/72047475#72047475) (using a 24 words mnemonic) a pair of RSA keys, of which only the public is sent to the server.
From there on, users are encrypting the messages with the recipient's RSA key and storing the chat history in their own device with military grade encryption using, as the encryption _key_, the **digest (SHA512) of their username and password**. 

To understand the flow, I will add some emphasis on the fact that we are encrypting the data on the local device using the **digest of the username and password** as the **encryption key**. (Why not just the password? To avoid [dictionary attacks](https://en.wikipedia.org/wiki/Dictionary_attack), even if the attacker would need physical access to the device to try so.)

Therefore, without providing the same combination of username and password, the user is not able to decrypt the data in the localStorage (at least, [not without breaking AES 256](https://crypto.stackexchange.com/questions/46559/what-are-the-chances-that-aes-256-encryption-is-cracked)). 

To exclude [MITM](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) attacks, we never even send the password at all, but rather this digest, to confirm the identity of the user. (Of course a successful MITM attack would be the ultimate breach of security: yet, at least, we will not be providing the username and password combination to these attackers).

Being an end-to-end encrypted chat, the server is not receiving plain text message contents.

Its only responsibilities are generating JWT tokens to handle the sessions and dispatching the encrypted messages to the appropriate recipient(s).
No logs are kept either, and all messages are stored on the clients and not on an external database.

## Password Recovery Mechanism

The main challenge has been the password recovery system.

- Having an email address to prove the user identity would jeopardise the anonimity of the users. 
- Regenerating the keys from the same mnemonic and comparing the resulting public key was an option. The old digest would have been then sent back to the client to decrypt the data: however, saving the unencrypted digest on the server would allow an attacker able to read the DB to retrieve a legit JWT token and impersonate another user.

Eventually, the only way to make sure the user could safely decrypt again his/her data, was to save _separately_ in the localStorage the digest. This digest/key of course had to be encrypted, but differently, and is in fact encrypted with the user's public key (henceforth to be decrypted using the user's _private key_).

If the user remembers the password: the computed digest is able to decrypt the application data, and we do not interact with the encrypted digest.
Otherwise, the user can provide the 24 words mnemonic to regenerate the old key pair and try decrypting the old digest with the generated **private key**.

In this scenario, first of all we are checking on the server whether the generated public key is matching with the provided username.

If so, we try to use the generated _private key_ to decrypt the old digest: assuming this user was the last one logged on this device, we'll be now able to recover the rest of the data with it (otherwise, obviously if another user's data was there, we can't recover it using this user's mnemonic).

After creating a new password, we can now update the server with their new credentials (actually, with the new **digest**).

If all goes through correctly we are finally re-encrypting the data, this time using the new digest as a key (i.e. the new SHA512 of username and new password).
