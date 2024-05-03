import { useTokenStore } from '@/stores/auth'
import axios from 'axios'
import type {App} from 'vue'

interface AxiosOptions {
    baseUrl?: string
}

export default {
    install: (app: App, options: AxiosOptions) => {
        axios.defaults.baseURL = options.baseUrl

        axios.interceptors.request.use((config) => {
            const tokenStore = useTokenStore();
            config.headers.Authorization = `Bearer ${tokenStore.token}`;

            return config;
        });
    }
}