import AsyncStorage from "@react-native-async-storage/async-storage"; // For permanently storing of app data
import { useFocusEffect, useRouter } from "expo-router"; // That's for navigation between the pages
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"; // ActivityIndicator is showing the loading
import { t } from "../utils/i18n";

interface Meal {
  // This interface defines the data schema for the meal log in TypScript. In other words it claraifies how each entry in the meals array you save to AsyncStorage will look
  id: number;
  foodName: string;
  amount: number;
  unit: string;
  mealType: string;
  date: string;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    sugar: number;
    sodium: number;
  };
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useFocusEffect(
    // That's needed for the navigation of the screen's tabs to work immidiately
    React.useCallback(() => {
      setSelectedDate(new Date());
      // So it reloads the data every time it returns to the screen
    }, [])
  ); // Runs only once in the render

  useEffect(() => {
    if (userData) {
      loadData();
    }
    // And that's needed for the date navigation with using the arrows above, the Daily calculations goal useEffect can directly display the previous and current day's and useFocusEffect works when switching between screens.
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    // That controls the user data and AsyncStorage read the userData key if the user registered before it will be String if there is no data it will be redirect to the onboarding screen
    try {
      const userDataStr = await AsyncStorage.getItem("userData");
      const mealsStr = await AsyncStorage.getItem("meals");
      if (!userDataStr) {
        router.replace("/screens/OnboardingScreen");
        return;
      }

      const user = JSON.parse(userDataStr);
      setUserData(user);

      if (mealsStr) {
        const allMeals = JSON.parse(mealsStr);
        const dateString = selectedDate.toISOString().split("T")[0];
        const dateMeals = allMeals.filter((m: Meal) => m.date === dateString);
        setMeals(dateMeals);
      } else {
        setMeals([]);
      }
    } catch (error) {
      console.error("Error loading user data:", error); // If there is an error during the AsyncStorage reading data this message will be shown
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = () => {
    const today = new Date().toISOString().split("T")[0];
    const selected = selectedDate.toISOString().split("T")[0];
    return today === selected;
  };

  const formatDate = () => {
    const today = new Date().toISOString().split("T")[0];
    const selected = selectedDate.toISOString().split("T")[0];
    if (today === selected) return t("today");

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toISOString().split("T")[0] === selected)
      return t("yesterday");

    const options: Intl.DateTimeFormatOptions = {
      // These are the settings accepted by JS's built-in date formatting API
      month: "short",
      day: "numeric",
      year:
        selectedDate.getFullYear() !== new Date().getFullYear()
          ? "numeric"
          : undefined,
    };
    return selectedDate.toLocaleDateString("en-US", options);
  };

  const calculateTotals = () => {
    return meals.reduce(
      (acc, meal) => ({
        // acc is previous total value of the nutrition and meal is the next meal recording
        calories: acc.calories + meal.nutrition.calories,
        protein: acc.protein + meal.nutrition.protein,
        fat: acc.fat + meal.nutrition.fat,
        carbs: acc.carbs + meal.nutrition.carbs,
        sugar: acc.sugar + meal.nutrition.sugar,
        sodium: acc.sodium + meal.nutrition.sodium,
      }),
      { calories: 0, protein: 0, fat: 0, carbs: 0, sugar: 0, sodium: 0 } // That's the reduce the initial value
    );
  };

  const deleteMeal = async (mealId: number) => {
    Alert.alert(t("delete"), t("deleteConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            const mealsStr = await AsyncStorage.getItem("meals");
            if (mealsStr) {
              const allMeals = JSON.parse(mealsStr); // That takes the all meals from the storage
              const updatedMeals = allMeals.filter(
                (m: Meal) => m.id !== mealId
              ); // That filters the all meal instead of the meal that we want to delete
              await AsyncStorage.setItem("meals", JSON.stringify(updatedMeals)); // That writes the AsyncStorage with the updated meals
              loadData(); // And again loads all updated data to UI
            }
          } catch (error) {
            Alert.alert(
              t("error"),
              "An error occured while deleting the meal."
            ); // If we go error during the deleting this meal you'll get this alert message
          }
        },
      },
    ]);
  };

  const getMealsByType = (type: string) => {
    return meals.filter((m) => m.mealType === type); // That filters the meal's array
  };

  const getMealTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      breakfast: `🍳 ${t("breakfast")}`,
      lunch: `🥪 ${t("lunch")}`,
      dinner: `🍗 ${t("dinner")}`,
      snack: `🍪 ${t("snack")}`,
    };
    return labels[type] || type;
  };

  const getUnitLabel = (unit: string) => {
    return t(unit);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b894" />
      </View>
    );
  }

  if (!userData) return null; // if loading finished but still there is no userData it'll be render space screen

  const totals = calculateTotals();
  const calorieProgress = (totals.calories / userData.dailyCalories) * 100;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>
        {t("greeting")}, {userData.name} 👋
      </Text>
      <Text style={styles.title}>🥗 {t("dailySummary")}</Text>

      <View style={styles.dateSelector}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => changeDate(-1)}
        >
          {/* This button takes the back of the today's day and so I wrote changeDate(-1) */}
          <Text style={styles.dateButtonText}>◀</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateDisplay}
          onPress={() => setSelectedDate(new Date())}
        >
          <Text style={styles.dateText}>{formatDate()}</Text>
          {!isToday() && (
            <Text style={styles.dateSubText}>{t("tapToGoToday")}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dateButton, !isToday() && styles.dateButtonDisabled]}
          onPress={() => changeDate(1)}
          disabled={isToday()}
        >
          <Text
            style={[
              styles.dateButtonText,
              !isToday && styles.dateButtonTextDisabled,
            ]}
          >
            ▶
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.calorieCard}
        onPress={() => setDetailModalVisible(true)}
      >
        {/* That's daily calorie card's style I wrote the TouchableOpacity because I want to able to touch this card to look our food's values that we ate today and when we pressed the card card'll open with this code */}
        <Text style={styles.subtitle}>{t("dailyCalorieGoal")}</Text>
        <Text style={styles.calorie}>
          {totals.calories} / {userData.dailyCalories} kcal
        </Text>

        {/* That's the total calories that we ate today and daily calories is we need to take calories into day */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progress,
              {
                width: `${Math.min(calorieProgress, 100)}%`,
                backgroundColor: calorieProgress > 100 ? "#ff6b6b" : "#00b894",
              },
            ]}
          />

          {/* That's the bar occupancy percentage and calorieprogress is take we ate today / daily calories and multipliey with 100 for the calculating percentage and Math.min for that bar doesn't exceed 100% if the target is reached and the bar turns red if not it stays green*/}
        </View>
        <Text style={styles.progressText}>
          {calorieProgress > 100
            ? `${Math.round(totals.calories - userData.dailyCalories)} ${t(
                "kcalOver"
              )}`
            : `${Math.round(userData.dailyCalories - totals.calories)} ${t(
                "kcalLeft"
              )}`}
        </Text>
        {/* If the target reached it'll show the how many calories over the target */}
      </TouchableOpacity>

      {["breakfast", "lunch", "dinner", "snack"].map((mealType) => {
        // That looks the each meal type card the goal is here to show each meal type seperately in here it produces meal card for each meal type
        const mealItems = getMealsByType(mealType); // That takes just one meal type that we'll enter the our ated foods for example I did breakfast and I'll enter the breakfast type and this code does that
        if (mealItems.length === 0) return null; // if we have no meal type we didn't entered anything it'll be null I mean empty

        const mealTotal = mealItems.reduce(
          (sum, m) => sum + m.nutrition.calories,
          0
        ); // That adds the all meal types's calories for daily calories goal and sum is the calories collected now and m is the next meal and the reduce is starting value

        return (
          // I stopped here that'll be the View key for mealType like breakfast lunch dinner snack I wrote the function of these subjects that I wrote the explanation now I'll write these to the page
          <View key={mealType} style={styles.mealSection}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealTitle}>{getMealTypeLabel(mealType)}</Text>
              <Text style={styles.mealCalories}>{mealTotal} kcal</Text>
            </View>
            {mealItems.map((meal) => (
              <View key={meal.id} style={styles.mealItem}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.foodName}</Text>
                  {/* styles.mealName is the style but meal.foodName is text it's data I mean first one is only style second one is just data  */}
                  <Text style={styles.mealAmount}>
                    {meal.amount}
                    {getUnitLabel(meal.unit || "g")}
                  </Text>
                </View>
                <View style={styles.mealActions}>
                  <Text style={styles.mealItemCalories}>
                    {meal.nutrition.calories} kcal
                    {/* That meal.nutiriton.calories shows us how many calories we ate from the food that we saved */}
                  </Text>
                  <TouchableOpacity onPress={() => deleteMeal(meal.id)}>
                    <Text style={styles.deleteButton}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        );
      })}

      {meals.length === 0 && (
        <Text style={styles.emptyText}>
          {isToday() ? t("noMealsAdded") : t("noMealsRecorded")}
        </Text>
      )}

      {/* Detail Modal with Graph That shows the graph when we pressed the our daily calorie goal bar */}

      <Modal visible={detailModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                📊 {formatDate()}'s {t("nutritionDetails")}
              </Text>

              {meals.length > 0 && (
                <View style={styles.graphSection}>
                  <Text style={styles.graphTitle}>
                    {t("macroDistribution")}
                  </Text>
                  <View style={styles.macroCards}>
                    <View style={styles.macroCard}>
                      <Text style={styles.macroLabel}>💪 {t("protein")}</Text>
                      <Text style={styles.macroValue}>
                        {totals.protein.toFixed(0)}g
                        {/* That's the protein that we collected in a day and toFixed(0) is doing the integer number of protein value that we collected */}
                      </Text>
                      <View style={styles.macroBar}>
                        <View
                          style={[
                            styles.macroProgress,
                            {
                              width: `${Math.min(
                                (totals.protein /
                                  (totals.protein +
                                    totals.fat +
                                    totals.carbs)) *
                                  100,
                                100
                              )}%`,
                              backgroundColor: "#e74c3c",
                            },
                          ]}
                        />
                        {/* Width is the occupancy percentage and totals.protein / (totals.protein + totals.fat + totals.carbs is the calculates the protein content and we multiply by 100 for the percentage */}
                      </View>
                    </View>

                    <View style={styles.macroCard}>
                      <Text style={styles.macroLabel}>🧈 {t("fat")}</Text>
                      <Text style={styles.macroValue}>
                        {totals.fat.toFixed(0)}g
                      </Text>
                      <View style={styles.macroBar}>
                        <View
                          style={[
                            styles.macroProgress,
                            {
                              width: `${Math.min(
                                (totals.fat /
                                  (totals.fat +
                                    totals.protein +
                                    totals.carbs)) *
                                  100,
                                100
                              )}%`,
                              backgroundColor: "#f39c12",
                            },
                          ]}
                        />
                      </View>
                    </View>

                    <View style={styles.macroCard}>
                      <Text style={styles.macroLabel}>
                        🍞 {t("carbohydrate")}
                      </Text>
                      <Text style={styles.macroValue}>
                        {totals.carbs.toFixed(0)}g
                      </Text>
                      <View style={styles.macroBar}>
                        <View
                          style={[
                            styles.macroProgress,
                            {
                              width: `${Math.min(
                                (totals.carbs /
                                  (totals.carbs +
                                    totals.protein +
                                    totals.fat)) *
                                  100,
                                100
                              )}%`,
                              backgroundColor: "#3498db",
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>{t("nutritionDetails")}</Text>

                <View style={styles.detailRow}>
                  {/* I wrote detailRow because of one line enough to show of each food's values */}
                  <Text style={styles.detailLabel}>🔥 {t("energy")}</Text>
                  <Text style={styles.detailValue}>
                    {totals.calories} / {userData.dailyCalories} kcal
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>💪 {t("protein")}</Text>
                  <Text style={styles.detailValue}>
                    {Math.round(totals.protein)}g
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>🧈 {t("fat")}</Text>
                  <Text style={styles.detailValue}>
                    {Math.round(totals.fat)}g
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>🍞 {t("carbohydrate")}</Text>
                  <Text style={styles.detailValue}>
                    {Math.round(totals.carbs)}g
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>🍯 {t("sugar")}</Text>
                  <Text style={styles.detailValue}>
                    {Math.round(totals.sugar)}g
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>🧂 {t("salt")}</Text>
                  <Text style={styles.detailValue}>
                    {Math.round(totals.sodium * 1000)}mg
                  </Text>
                </View>
              </View>

              {meals.length > 0 && (
                <View style={styles.mealsListSection}>
                  <Text style={styles.sectionTitle}>{t("todaysMeals")}</Text>
                  {meals.map((meal) => (
                    <View key={meal.id} style={styles.modalMealItem}>
                      <View style={styles.modalMealInfo}>
                        <Text style={styles.modalMealName}>
                          {meal.foodName}
                        </Text>
                        <Text style={styles.modalMealDetails}>
                          {getMealTypeLabel(meal.mealType)} • {meal.amount}
                          {getUnitLabel(meal.unit || "g")}
                        </Text>
                      </View>
                      <Text style={styles.modalMealCalories}>
                        {meal.nutrition.calories}kcal
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {meals.length === 0 && (
                <Text style={styles.emptyModalText}>
                  {t("noMealsRecorded")}
                </Text>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>{t("close")}</Text>
              </TouchableOpacity>
            </ScrollView>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 20,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dateButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00b894",
    borderRadius: 20,
  },
  dateButtonDisabled: {
    backgroundColor: "#dfe6e9",
  },
  dateButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  dateButtonTextDisabled: {
    color: "#b2bec3",
  },
  dateDisplay: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3436",
  },
  dateSubText: {
    fontSize: 12,
    color: "#636e72",
    marginTop: 4,
  },
  calorieCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000", // That's black color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#636e72",
    marginBottom: 10,
  },
  calorie: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#00b894",
    marginBottom: 15,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#dfe6e9",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 10,
  },
  progress: {
    height: "100%",
  },
  progressText: {
    fontSize: 14,
    color: "#636e72",
    textAlign: "center",
  },
  mealSection: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dfe6e9",
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3436",
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00b894",
  },
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f8",
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    color: "#2d3436",
    fontWeight: "600",
  },
  mealAmount: {
    fontSize: 14,
    color: "#636e72",
    marginTop: 4,
  },
  mealActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  mealItemCalories: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00b894",
  },
  deleteButton: {
    fontSize: 18,
  },
  emptyText: {
    textAlign: "center",
    color: "#b2bec3",
    fontSize: 16,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1e272e",
    borderRadius: 20,
    padding: 25,
    width: "90%",
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  graphSection: {
    backgroundColor: "#2d3436",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  macroCards: {
    gap: 10,
  },
  macroCard: {
    backgroundColor: "#1e272e",
    padding: 15,
    borderRadius: 10,
  },
  macroLabel: {
    fontSize: 14,
    color: "#b2bec3",
    marginBottom: 5,
  },
  macroValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  macroBar: {
    height: 8,
    backgroundColor: "#3d4447",
    borderRadius: 4,
    overflow: "hidden", // so that if the bar inside is full it doesn't overflow outside
  },
  macroProgress: {
    height: "100%",
    borderRadius: 4,
  },
  detailSection: {
    backgroundColor: "#2d3436",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#3d4447",
  },
  detailLabel: {
    fontSize: 16,
    color: "#b2bec3",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  mealsListSection: {
    backgroundColor: "#2d3436",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  modalMealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#3d4447",
  },
  modalMealInfo: {
    flex: 1,
  },
  modalMealName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  modalMealDetails: {
    fontSize: 12,
    color: "#b2bec3",
  },
  modalMealCalories: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00b894",
  },
  emptyModalText: {
    textAlign: "center",
    color: "#b2bec3",
    fontSize: 14,
    marginVertical: 20,
  },
  closeButton: {
    backgroundColor: "#00b894",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
