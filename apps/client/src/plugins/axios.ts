import axios from 'axios'
import type {App} from 'vue'

interface AxiosOptions {
    baseUrl?: string
}

export default {
    install: (app: App, options: AxiosOptions) => {
        axios.defaults.baseURL = options.baseUrl
    }
}