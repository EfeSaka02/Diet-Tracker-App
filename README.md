# 🥗 Diet Tracker App

A comprehensive mobile diet tracking application built with React Native and Expo. Track your daily nutrition, manage meals, and achieve your health goals with multi-language support and an intuitive interface.

## ✨ Features

### 📊 Nutrition Tracking
- **Daily Calorie Monitoring**: Set and track your daily calorie goals
- **Macro Distribution**: Visualize protein, fat, and carbohydrate intake with interactive graphs
- **Detailed Nutrition Info**: Track calories, protein, fat, carbs, sugar, and sodium for each meal

### 🍽️ Meal Management
- **Multiple Meal Types**: Breakfast, lunch, dinner, and snacks
- **Flexible Unit System**: Support for grams, pieces, slices, and milliliters
- **50+ Food Database**: Pre-loaded with common foods and their nutritional values
- **Date Navigation**: View and manage meals from previous days
- **Easy Meal Deletion**: Remove meals with a single tap

### 👤 Profile & Settings
- **Personal Information**: Track age, gender, height, weight, and activity level
- **Weight History**: Monitor weight changes over time with visual progress indicators
- **Customizable Goals**: Update your daily calorie target anytime
- **Data Management**: Reset all data when needed

### 🌍 Multi-Language Support
- **3 Languages**: English, Turkish (Türkçe), and Polish (Polski)
- **Automatic Detection**: App language adapts to device settings
- **Seamless Translation**: All UI elements translated including dates and units

### 🎨 User Experience
- **Clean Interface**: Modern, intuitive design with smooth animations
- **Dark Mode Modals**: Easy-on-the-eyes modal dialogs
- **Progress Visualization**: Color-coded progress bars and graphs
- **Tab Navigation**: Quick access to Home, Explore, and Profile screens

## 📱 Screenshots

### Home Screen
![Küçük IMG_2743 ](https://github.com/user-attachments/assets/da76a8d6-c5df-4f9c-b998-8f6993a53ddd)



### Explore Screen
![Küçük IMG_2744 ](https://github.com/user-attachments/assets/2a1489a9-ae65-4c35-b2a4-929272af699b)
![Küçük Ekran Resmi 2026-01-08 17 14 49 ](https://github.com/user-attachments/assets/1228b9ee-bb0f-48f9-94cc-122fb06f1b42)




### Nutrition Details
![Küçük IMG_2749 ](https://github.com/user-attachments/assets/4c7498e2-eaa2-40cd-8e1b-7a52a32663c3)


### Profile Screen
![Küçük Ekran Resmi 2026-01-08 17 13 14 ](https://github.com/user-attachments/assets/83010625-7c67-4f6a-a760-f92c07582f8d)





## 🛠️ Technologies

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Storage**: AsyncStorage for persistent data
- **Internationalization**: i18n-js with expo-localization
- **UI Components**: React Native built-in components
- **Build System**: EAS Build

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/Diet-Tracker-App.git
cd Diet-Tracker-App
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Run on device**
- Press `a` for Android
- Press `i` for iOS (macOS only)
- Scan QR code with Expo Go app

## 🚀 Building APK

### Using EAS Build

1. **Install EAS CLI**
```bash
npm install -g eas-cli
```

2. **Login to Expo**
```bash
eas login
```

3. **Configure build**
```bash
eas build:configure
```

4. **Build APK**
```bash
eas build --platform android --profile preview
```

5. **Download APK**
- Build link will appear in terminal
- Open link in browser
- Click "Install" or "Download"

## 📂 Project Structure
```
Diet-Tracker-App/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home screen
│   │   ├── explore.tsx        # Food search and add
│   │   ├── profile.tsx        # User profile
│   │   └── _layout.tsx        # Tab navigation
│   ├── screens/
│   │   └── OnboardingScreen.tsx  # Initial setup
│   ├── locales/
│   │   ├── en.json            # English translations
│   │   ├── tr.json            # Turkish translations
│   │   └── pl.json            # Polish translations
│   ├── data/
│   │   └── foods.json         # Food database
│   └── utils/
│       └── i18n.ts            # Internationalization config
├── assets/                     # Images and icons
├── components/                 # Reusable components
├── app.json                   # Expo configuration
├── eas.json                   # EAS Build configuration
└── package.json               # Dependencies
```

## 🌐 Language Support

The app automatically detects your device language and displays content in:
- 🇬🇧 English (default)
- 🇹🇷 Turkish
- 🇵🇱 Polish

To add more languages:
1. Create a new JSON file in `app/locales/`
2. Add translations for all keys
3. Import in `app/utils/i18n.ts`
4. Add language code to supported languages array

## 📊 Data Storage

All data is stored locally using AsyncStorage:
- **User Data**: Personal information and calorie goals
- **Meals**: Complete meal history with dates
- **Weight History**: Historical weight entries

## 🔧 Configuration

### Daily Calorie Calculation

The app uses the Harris-Benedict equation to calculate daily calorie needs:

**For Men:**
```
BMR = 88.362 + (13.397 × weight) + (4.799 × height) - (5.677 × age)
```

**For Women:**
```
BMR = 447.593 + (9.247 × weight) + (3.098 × height) - (4.330 × age)
```

Then multiplied by activity level factor (1.2 - 1.9)

## 🐛 Known Issues

- None currently reported

## 🚧 Future Enhancements

- [ ] Cloud sync across devices
- [ ] Barcode scanner for food items
- [ ] Custom food entry
- [ ] Meal planning and recipes
- [ ] Export data to CSV
- [ ] Water intake tracking
- [ ] Exercise tracking
- [ ] Social features and challenges

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Developer

**Efe Saka**
- GitHub: [@EfeSaka02](https://github.com/EfeSaka02)
- Email: efesaka39@gmail.com

## 🙏 Acknowledgments

- Food nutritional data based on USDA database
- Icons from SF Symbols and emoji
- Built with Expo and React Native community tools

## 📱 Download

### Android APK
[Download Latest Release](https://expo.dev/accounts/efe_saka/projects/Mobile_Diet_Application/builds/latest)

*Compatible with Android 5.0 (API 21) and above*

---

**Made with using React Native & Expo**

---

## 🔄 Version History

### Version 1.0.0 (January 2026)
- Initial release
- Multi-language support (EN, TR, PL)
- Flexible unit system (g, piece, slice, ml)
- Daily nutrition tracking
- Weight monitoring
- 50+ food database
