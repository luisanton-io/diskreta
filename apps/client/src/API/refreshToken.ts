import API from "API";
import { useAuthStore } from "stores/auth";
import { pki, util } from "node-forge";

const refreshToken = async () => {
    try {
        const user = useAuthStore.getState().user;

        if (!user) throw new Error()

        const { data } = await API.post<RefreshResponse>("/users/refreshToken", {
            refreshToken: user.refreshToken
        });

        const privateKey = pki.privateKeyFromPem(user.privateKey)

        useAuthStore.getState().updateTokens(
            privateKey.decrypt(util.decode64(data.token)),
            data.refreshToken
        )
    } catch (e) {
        console.error(e);
        window.location.assign("/login")
    }
};

export { refreshToken }
