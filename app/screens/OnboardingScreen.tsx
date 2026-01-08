import AsyncStorage from "@react-native-async-storage/async-storage"; // The device stores data permanently
import { useRouter } from "expo-router"; // This is like usenavigate in web I mean it makes the movement between the page screens
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"; // ToucableOpacity tactile area is created and onPress works when pressed becomes transparent when pressed and gives the user the feeling of I pressed it
import { t } from "../utils/i18n";

export default function onboardingScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("sedentary");

  const calculateCalories = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    if (!w || !h || !a) return 2000;

    let bmr; // That's the basal metabolic rate

    if (gender === "male") {
      bmr = 88.362 + 13.397 * w + 4.799 * h - 5.677 * a; // That's Harris-Benedict formul
    } else {
      bmr = 447.593 + 9.247 * w + 3.098 * h - 4.33 * a; // For females
    }

    const activityMultiplier = {
      // This is the multiplier for the activity weekly. These multipliers are used for TDEE programming
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    return Math.round(
      bmr * activityMultiplier[activityLevel as keyof typeof activityMultiplier]
    );
  };

  const handleSave = async () => {
    if (!name || !age || !weight || !height) {
      Alert.alert(t("error"), t("pleaseFillAll"));
      return;
    }

    const dailyCalories = calculateCalories();

    const userData = {
      name,
      gender,
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      activityLevel,
      dailyCalories,
      setupComplete: true, // That's the controls the opening of the app
    };

    try {
      await AsyncStorage.setItem("userData", JSON.stringify(userData)); // It saves the user data permanently in the application and transform the objects to string and data name is userData
      router.replace("/(tabs)"); // When the registration is completed, it deletes the currently registration page and takes the user to the main tab screen.
    } catch (error) {
      Alert.alert(t("error"), "An error occurred while during registration.");
    }
  };

  return (
    // ScrollView enables scrolling if content overflows the screen
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🥗 {t("welcomeTitle")}</Text>
        <Text style={styles.subtitle}>{t("welcomeSubtitle")}</Text>

        <Text style={styles.label}>{t("yourName")}</Text>
        <TextInput // TextInput is text input box
          style={styles.input}
          placeholder={t("namePlaceholder")}
          value={name}
          onChangeText={setName} // when a text changes update the state
        />

        <Text style={styles.label}>{t("yourGender")}</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "male" && styles.genderButtonActive,
            ]} // That's a button that is if male selected makes the more design and effect
            onPress={() => setGender("male")}
          >
            <Text
              style={[
                styles.genderButton,
                gender === "male" && styles.genderTextActive,
              ]}
            >
              {t("male")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "female" && styles.genderButtonActive,
            ]}
            onPress={() => setGender("female")} // If the female button is active it makes the more design to indicate that button selected female
          >
            <Text
              style={[
                styles.genderText,
                gender === "female" && styles.genderTextActive, // If the female selected it makes the more text design to indicate
              ]}
            >
              {t("female")}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>{t("yourAge")}</Text>
        <TextInput
          style={styles.input}
          placeholder="25"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <Text style={styles.label}>
          {t("yourWeight")} ({t("kg")})
        </Text>
        <TextInput
          style={styles.input}
          placeholder="70"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />

        <Text style={styles.label}>
          {t("yourHeight")} ({t("cm")})
        </Text>
        <TextInput
          style={styles.input}
          placeholder="175"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />

        <Text style={styles.label}>{t("activityLevelTitle")}</Text>
        <View style={styles.activityContainer}>
          {[
            { key: "sedentary", label: t("sedentary") },
            { key: "light", label: t("light") },
            { key: "moderate", label: t("moderate") },
            { key: "active", label: t("active") },
            { key: "veryActive", label: t("veryActive") },
          ].map(
            (
              item // We produce the buttons for all the activity level and we can do it with map
            ) => (
              <TouchableOpacity
                key={item.key} // That's key for react native I mean react. React render the all code in the here so it needs to seperate all code all key so it can do with seperate keys and this item.key do that
                style={[
                  styles.activityButton, // That's a button that is if active selected button it makes the active style to indicate it's chosen
                  activityLevel === item.key && styles.activityButtonActive,
                ]}
                onPress={() => setActivityLevel(item.key)} // It updates the activity level
              >
                <Text
                  style={[
                    styles.activityText,
                    activityLevel === item.key && styles.activityTextActive, // Which activity state renders it makes the active style to which activity level is chosen if not don't anything and therefore we added {ite.label} label to the adding more style that we chose activity level
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t("letsGo")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#636e72",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#dfe6e9",
  },
  genderContainer: {
    flexDirection: "row",
    gap: 10,
  },
  genderButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#dfe6e9",
    alignItems: "center",
  },
  genderButtonActive: {
    borderColor: "#00b894",
    backgroundColor: "#00b89410",
  },
  genderText: {
    fontSize: 16,
    color: "#636e72",
  },
  genderTextActive: {
    color: "#00b894",
    fontWeight: "bold",
  },
  activityContainer: {
    gap: 8,
  },
  activityButton: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dfe6e9",
  },
  activityButtonActive: {
    borderColor: "00b894",
    backgroundColor: "#00b89410",
  },
  activityText: {
    fontSize: 14,
    color: "#636e72",
    textAlign: "center",
  },
  activityTextActive: {
    color: "#00b894",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#00b894",
    padding: 18,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
