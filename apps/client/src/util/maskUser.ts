export default function maskUser(user: LoggedUser | null): User | null {
    return !user ? null : {
        _id: user._id,
        nick: user.nick,
        publicKey: user.publicKey
    }
}
