// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translation resources
const resources = {
  en: {
    translation: {
      // App.tsx content
      pointA: "Origin",
      pointB: "Destination",
      startPoint: "Enter starting city",
      endPoint: "Enter destination city",
      startingCity: "starting city",
      destinationCity: "destination city",
      enter: "Enter ",
      includeBridges: "Include Bridges",
      includeTunnels: "Include Tunnels",
      avoidObstacles: "Avoid Obstacles",
      calculateRoute: "Calculate Route",
      routeInfo: "Route Information",
      distance: "Distance",
      duration: "Duration",
      loading: "Loading...",
      searchForPlace: "Search for a place...",
      routeSummary: "Route Summary",
      routeOptions: "Route Options",
      firstStation: "First Station",
      lastStation: "Last Station",
      stations: "Stations",
    },
  },
  ru: {
    translation: {
      // Russian translations
      pointA: "Начало",
      pointB: "Пункт назначения",
      startPoint: "Введите город отправления",
      endPoint: "Введите город назначения",
      startingCity: "начальный город",
      destinationCity: "город назначения",
      enter: "Введите ",
      includeBridges: "Включать мосты",
      includeTunnels: "Включать туннели",
      avoidObstacles: "Избегать препятствий",
      calculateRoute: "Рассчитать маршрут",
      routeInfo: "Информация о маршруте",
      distance: "Расстояние",
      duration: "Длительность",
      loading: "Загрузка...",
      searchForPlace: "Поиск места...",
      routeSummary: "Сводка маршрута",
      routeOptions: "Опции маршрута",
      firstStation: "Точка отправления",
      lastStation: "Точка назначения",
      stations: "Остановки",
    },
  },
  az: {
    translation: {
      // Azerbaijani translations
      pointA: "Başlanğıc",
      pointB: "Təyinat",
      startPoint: "Başlanğıc şəhəri daxil edin",
      endPoint: "Təyinat şəhəri daxil edin",
      startingCity: "başlanğıc şəhəri",
      destinationCity: "təyinat şəhəri",
      enter: "Daxil edin ",
      includeBridges: "Körpüləri daxil edin",
      includeTunnels: "Tunelləri daxil edin",
      avoidObstacles: "Maneələrdən qaçın",
      calculateRoute: "Marşrutu hesablayın",
      routeInfo: "Marşrut məlumatı",
      distance: "Məsafə",
      duration: "Müddət",
      loading: "Yüklənir...",
      searchForPlace: "Yer axtarın...",
      routeSummary: "Marşrut xülasəsi",
      routeOptions: "Marşrut seçimləri",
      firstStation: "İlk dayanacaq",
      lastStation: "Son dayanacaq",
      stations: "Dayanacaqlar",
    },
  },
};

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    detection: {
      order: ["navigator", "localStorage", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;
