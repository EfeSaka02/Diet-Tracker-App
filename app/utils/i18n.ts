import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import en from "../locales/en.json";
import pl from "../locales/pl.json";
import tr from "../locales/tr.json";

const i18n = new I18n({
  en,
  pl,
  tr,
});

const deviceLanguage = Localization.getLocales()[0].languageCode; // That takes the device language and returns the language code it applies to the application

i18n.locale = ["en", "tr", "pl"].includes(deviceLanguage)
  ? deviceLanguage
  : "en"; // If the device language is in the array list do it if not start the application with english language

i18n.enableFallback = true; // I wrote this line because for example the device language is polish but some keys can be missing so I set the default language to English so the app doen't crash if there's no Polish language key.
i18n.defaultLocale = "en";

export const t = (key: string, options?: any) => i18n.t(key, options); // I wrapped i18n.t so that I could get clean and controlled translations from everywhere

export default i18n;
