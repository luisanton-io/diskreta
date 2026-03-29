import API from "API";
import { userState } from "atoms/user";
import { pki, util } from "node-forge";
import { getRecoil, setRecoil } from "recoil-nexus";

const refreshToken = async () => {
    try {
        const user = getRecoil(userState);

        if (!user) throw new Error()

        const { data } = await API.post<RefreshResponse>("/users/refreshToken", {
            refreshToken: user.refreshToken
        });

        const privateKey = pki.privateKeyFromPem(user.privateKey)

        setRecoil(userState, user => user && ({
            ...user,
            token: privateKey.decrypt(util.decode64(data.token)),
            refreshToken: data.refreshToken
        }))
    } catch (e) {
        console.error(e);
        window.location.assign("/login")
    }
};

export { refreshToken }