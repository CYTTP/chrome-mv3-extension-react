import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const browserLang = (chrome as any).i18n?.getUILanguage() || 'en'; // 获取浏览器的语言
const defaultLang = browserLang.startsWith('zh') ? 'zh' : 'en';

i18n
    .use(initReactI18next)
    .init({
        lng: defaultLang, // 默认语言
        debug: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translation: {
                    click_me: "click me",
                    dec: "Hello!"
                }
            },
            zh: {
                translation: {
                    click_me: "点击我",
                    dec: "嗨！"
                }
            }
        }
    });

export default i18n;
