import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from '../components/App.vue'; // We need to create this

export function mount(selector: string) {
    const app = createApp(App);
    const pinia = createPinia();
    const i18n = createI18n({
        legacy: false,
        locale: 'en',
        messages: {}
    });

    app.use(pinia);
    app.use(i18n);

    app.mount(selector);
}
