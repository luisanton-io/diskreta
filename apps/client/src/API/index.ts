import { userState } from "atoms/user";
import axios from "axios";
import { getRecoil } from "recoil-nexus";
import { refreshToken } from "./refreshToken";

const API = axios.create({ baseURL: process.env.REACT_APP_BE_DOMAIN + "/api" });

API.interceptors.request.use(
    async (config) => {
        const accessToken = getRecoil(userState)?.token;

        config.headers = {
            Authorization: accessToken ? `Bearer ${accessToken}` : '',
            "Content-Type": "application/json"
        };

        return config;
    },
    (error) => {
        Promise.reject(error);
    }
);

API.interceptors.response.use(
    (response) => response,
    async function (error) {
        const failedRequest = error.config;

        if (error.code === "ERR_NETWORK") {
            return await new Promise(resolve => {
                setTimeout(() => {
                    resolve(API(failedRequest))
                }, 3000)
            })
        } else if (
            error.response.status === 401 &&
            !["/users/session", "/users/refreshToken"].includes(failedRequest.url)
        ) {
            await refreshToken();

            const retryRequest = API(failedRequest);
            return retryRequest;
        } else {
            return Promise.reject(error);
        }
    }
);

export default API;
