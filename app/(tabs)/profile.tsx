import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator, // That's loading spinner
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { t } from "../utils/i18n";

interface WeightEntry {
  // Each weight entry will be saved in here
  id: number; // Unique id
  weight: number;
  date: string;
}

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [calorieModalVisible, setCalorieModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newCalorieGoal, setNewCalorieGoal] = useState("");

  useFocusEffect(
    // That works whenever the screen is focused
    React.useCallback(() => {
      loadData(); // That reads the data from the AsyncStorage
    }, [])
  );

  const loadData = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem("userData"); // That takes the userData key from the AsyncStorage
      const weightHistoryStr = await AsyncStorage.getItem("weightHistory"); // And also that take the weightHistory key from the AsyncStorage

      if (userDataStr) {
        // If it has userData this code will write to string and then write the state
        const user = JSON.parse(userDataStr);
        setUserData(user);
        setNewCalorieGoal(user.dailyCalories.toString());
      }

      if (weightHistoryStr) {
        setWeightHistory(JSON.parse(weightHistoryStr));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addWeight = async () => {
    // That a function that adds a new weight
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      // If we entry the empty weight or invalid weight value we will take an error message
      Alert.alert(t("error"), t("enterValidWeight"));
      return;
    }

    const weight = parseFloat(newWeight); // that transform the data from the string to the number
    const today = new Date().toISOString().split("T")[0];

    const entry: WeightEntry = {
      // that entry new weight entry
      id: Date.now(),
      weight,
      date: today,
    };

    try {
      const updatedHistory = [...weightHistory, entry]; // And that adds the new recorded weight to the history
      await AsyncStorage.setItem(
        // That writes the AsyncStorage I mean it updates the history
        "weightHistory",
        JSON.stringify(updatedHistory)
      );

      // Update current weight in userData
      const updatedUser = { ...userData, weight }; // That updates the current weight
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));

      setWeightHistory(updatedHistory); // That updates the weight history
      setUserData(updatedUser); // And also updates the current user data
      setNewWeight("");
      setWeightModalVisible(false);
      Alert.alert(t("success"), "Weight added!");
    } catch (error) {
      Alert.alert(t("error"), "Failed to save weight!");
    }
  };

  const updateCalorieGoal = async () => {
    // That function updates the calorie goal if the user wants
    if (!newCalorieGoal || isNaN(parseFloat(newCalorieGoal))) {
      // If new calorie goal is empty or invalid value we will take an error message
      Alert.alert(t("error"), "Please enter a valid calorie goal!");
      return;
    }

    const calories = parseFloat(newCalorieGoal); // It's variable that show us the new calorie goal that user entered

    try {
      const updatedUser = { ...userData, dailyCalories: calories };
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser)); // That takes the user data to update and writes it to the AsyncStorage new updatedUser data with the new calorie goal

      setUserData(updatedUser); // And updates the user data
      setCalorieModalVisible(false);
      Alert.alert(t("success"), "Calorie goal updated!");
    } catch (error) {
      Alert.alert(t("error"), "Failed to update calorie goal!"); // if we got an error during the updating the calorie goal this message will be shown
    }
  };

  const resetAllData = () => {
    Alert.alert(`⚠️ ${t("resetAllData")}`, t("resetConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("deleteAll"),
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("meals");
            await AsyncStorage.removeItem("weightHistory");
            setWeightHistory([]);
            Alert.alert(t("success"), "All data deleted!");
            loadData();
          } catch (error) {
            Alert.alert(t("error"), "Failed to delete data!");
          }
        },
      },
    ]);
  };

  const getGenderLabel = (gender: string) => {
    return gender === "male" ? t("male") : t("female"); // if the male selected turns to Male if else will turn to Female
  };

  const getActivityLabel = (activity: string) => {
    const labels: { [key: string]: string } = {
      // It turns the activity level to the label
      sedentary: t("sedentary"),
      light: t("light"),
      moderate: t("moderate"),
      active: t("active"),
      very_active: t("veryActive"),
    };
    return labels[activity] || activity;
  };

  const getWeightChange = () => {
    // getWeightChange looks the weight history and calculates the first weight saved value and latest weight value it substracts them to understand the user taken weight or lose weight
    if (weightHistory.length < 2) return null; // If the weight history is less than 2 it'll return null
    const sorted = [...weightHistory].sort(
      // That sorts the weight history by date
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() // that calculates the difference between th dates and sorts them .getTime is milisecond of the date if a value is older than b value it'll sort first if not b value will sort first
    );
    const first = sorted[0].weight;
    const last = sorted[sorted.length - 1].weight;
    const change = last - first; // and substracts the last weight and first weight to understand user taken weight or lose weight
    return {
      change: Math.abs(change).toFixed(1),
      direction: change >= 0 ? "+" : "-",
      color: change >= 0 ? "#ff6b6b" : "#00b894",
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b894" />
      </View>
    );
  }

  if (!userData) return null;

  const weightChange = getWeightChange();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>{t("profile")} 👤</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("personalInfo")}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t("name")}</Text>
          <Text style={styles.infoValue}>{userData.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t("age")}</Text>
          <Text style={styles.infoValue}>
            {userData.age} {t("years")}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t("gender")}</Text>
          <Text style={styles.infoValue}>
            {getGenderLabel(userData.gender)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t("height")}</Text>
          <Text style={styles.infoValue}>
            {userData.height} {t("cm")}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t("currentWeight")}</Text>
          <Text style={styles.infoValue}>
            {userData.weight} {t("kg")}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t("activityLevel")}</Text>
          <Text style={styles.infoValue}>
            {getActivityLabel(userData.activityLevel)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t("dailyCalorieGoal")}</Text>
          <Text style={[styles.infoValue, { color: "#00b894" }]}>
            {userData.dailyCalories} kcal
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>⚖️ {t("weightTracking")}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setNewWeight(userData.weight.toString());
              setWeightModalVisible(true);
            }}
          >
            <Text style={styles.addButtonText}>+ {t("addWeight")}</Text>
          </TouchableOpacity>
        </View>

        {weightChange && (
          <View style={styles.weightSummary}>
            <Text style={styles.weightSummaryLabel}>{t("progress")}</Text>
            <Text
              style={[styles.weightSummaryValue, { color: weightChange.color }]}
            >
              {weightChange.direction}
              {weightChange.change} {t("kg")}
            </Text>
          </View>
        )}

        {weightHistory.length > 0 ? (
          <View style={styles.weightList}>
            {weightHistory
              .slice()
              .reverse()
              .slice(0, 5)
              .map((entry) => (
                <View key={entry.id} style={styles.weightItem}>
                  <Text style={styles.weightDate}>{entry.date}</Text>
                  <Text style={styles.weightValue}>
                    {entry.weight} {t("kg")}
                  </Text>
                </View>
              ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>{t("noWeightEntries")}</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚙️ {t("settings")}</Text>

        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => setCalorieModalVisible(true)}
        >
          <Text style={styles.settingButtonText}>
            🎯 {t("updateCalorieGoal")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingButton, styles.dangerButton]}
          onPress={resetAllData}
        >
          <Text style={[styles.settingButtonText, { color: "#fff" }]}>
            🗑️ {t("resetAllData")}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={weightModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("addWeightEntry")}</Text>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                {t("weight")} ({t("kg")})
              </Text>
              <TextInput
                style={styles.input}
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="numeric"
                placeholder="Enter weight"
                placeholderTextColor="#636e72"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setWeightModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addWeight}>
                <Text style={styles.saveButtonText}>{t("save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={calorieModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("updateCalorieGoal")}</Text>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>{t("dailyCalorieGoal")}</Text>
              <TextInput
                style={styles.input}
                value={newCalorieGoal}
                onChangeText={setNewCalorieGoal}
                keyboardType="numeric"
                placeholder="Enter calorie goal"
                placeholderTextColor="#636e72"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCalorieModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={updateCalorieGoal}
              >
                <Text style={styles.saveButtonText}>{t("update")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f8",
  },
  infoLabel: {
    fontSize: 16,
    color: "#636e72",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
  },
  addButton: {
    backgroundColor: "#00b894",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  weightSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  weightSummaryLabel: {
    fontSize: 16,
    color: "#636e72",
  },
  weightSummaryValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  weightList: {
    marginTop: 10,
  },
  weightItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f8",
  },
  weightDate: {
    fontSize: 14,
    color: "#636e72",
  },
  weightValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
  },
  emptyText: {
    textAlign: "center",
    color: "#b2bec3",
    fontSize: 14,
    marginTop: 10,
  },
  settingButton: {
    backgroundColor: "#f0f4f8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  dangerButton: {
    backgroundColor: "#ff6b6b",
  },
  settingButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1e272e",
    borderRadius: 20,
    padding: 25,
    width: "90%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#b2bec3",
    marginBottom: 10,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#2d3436",
    color: "#fff",
    fontSize: 18,
    padding: 15,
    borderRadius: 10,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#636e72",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#00b894",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
