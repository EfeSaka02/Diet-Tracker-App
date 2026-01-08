import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import foodsData from "./data/foods.json"; // There is a json file that contains the nutritional values

interface Food {
  // Interface food defines the nutritional values a person should have this definitaion allows these values to be used reloably in calculations and on the screen
  id: number;
  name: string;
  category: string;
  perGram: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    sugar: number;
    sodium: number;
  };
}

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null); // That's food of the user chose
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState("100");
  const [mealType, setMealType] = useState("breakfast");

  const foods: Food[] = foodsData; // We use the json file and we keep it in Food type

  const categories = [
    "All",
    ...Array.from(new Set(foods.map((food) => food.category))), // These codes written for making the categories unique and I used map to make categories that we entered a food
  ];

  // Filter Method

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()); // food.name.toLowercase() That's code for example we wrote APPLE in search and this food written like apple so the system will be change it like apple and also searchQuery.toLowerCase() for if we wrote ap the system will show us the similar foods like apple for example
    const matchesCategory =
      selectedCategory === "All" || food.category === selectedCategory;
    return matchesSearch && matchesCategory; // if the search contains the both conditions it'll be return
  });

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food); // And this code will be print the food to statement that we wrote up this will be print the useState null to food that const selectedFood
    setAmount("100"); // That's the default amount of grams of the food that we have chosen
    setModalVisible(true);
  };

  const calculateNutrition = () => {
    if (!selectedFood) return null;
    const grams = parseFloat(amount) || 0;
    return {
      calories: Math.round(selectedFood.perGram.calories * grams), // That's calculates food's calories food's pergram calories multiply by gram that we ate and rounds the nearest integer number
      protein: Math.round(selectedFood.perGram.protein * grams * 10) / 10, // We added 10 multiply and divide for the calculating like pointer for example 5.2 gram we didn't do that in calories because calories rounds the integer but protein fat carbs and sugar no needed the rounding
      fat: Math.round(selectedFood.perGram.fat * grams * 10) / 10,
      carbs: Math.round(selectedFood.perGram.carbs * grams * 10) / 10,
      sugar: Math.round(selectedFood.perGram.sugar * grams * 10) / 10,
      sodium: Math.round(selectedFood.perGram.sodium * grams * 1000) / 1000, // We muliplyed and divided by 1000 because of sodium is measured in milligrams and even very small values matter so we mutliplied and divided by 1000
    };
  };

  const addFood = async () => {
    if (!selectedFood || !amount) {
      Alert.alert("Error", "Please select a food and enter an amount.");
      return;
    }

    const nutrition = calculateNutrition(); // We wrote here for if we change the variable of the grams or the food so the system will change it I mean it'll be render what we're doing This code runs the calculateNutrition function to get the food's nutritional values and it'll put the outputs I mean food's nuitrition in this variable
    const today = new Date().toISOString().split("T")[0];

    const meal = {
      // That's saves the food object that's the dynamic object what we chose this code will be save it
      id: Date.now(),
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      amount: parseFloat(amount), // That's the amount of grams that we ate
      mealType,
      date: today,
      nutrition,
    };

    try {
      // We used try catch block for error handling if there's a problem about phone during the saving the data this application won't crash it just will show a message like we got a error during the saving
      const existingMeals = await AsyncStorage.getItem("meals"); // That's the brings the data that saved in meal object first open the object that we saved meal object and then bring it to save the data our daily meals we used await because of this code reads the data from the storage so that takes a little bit time like ms but that's need it
      const meals = existingMeals ? JSON.parse(existingMeals) : []; // Storage stores the data like string so this JSON.parse transform the data to understandable for Javascript if the user no select anything that'll be empty list
      meals.push(meal); // And this push the meals that transformed to understandable for Javascript so that'll be push into the meal object
      await AsyncStorage.setItem("meals", JSON.stringify(meals)); // Then we transform the string the updated new list and storage the phone key of the name meals

      Alert.alert("Success", `${selectedFood.name} added.`);
      setModalVisible(false); // That turn off the modal
      setAmount("100"); // That's the updates the default gram's amount and it's 100
    } catch (error) {
      Alert.alert("Error", "An error occurred while saving the food.");
    }
  };

  const nutrition = calculateNutrition(); // And we wrote second time but at this time for saving themeal

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Food Search</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Food search...(eg: chicken, beef)"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView
        showsHorizontalScrollIndicator={false} // That's code hides the scroll line
        style={styles.categoryScroll}
      >
        {categories.map(
          // If this category selected this code adds the more style to the button That code adds the buttons for the each category so I used map
          (category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)} // The user pressed this button will be update the state of the selectedCategory
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive, // And it's the same like Button if we chose this category this code adds the more style to the text I mean it changes the text size font like that
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      <FlatList
        data={filteredFoods} // That's code will print the our selected foods with being filtered to our daily food list
        keyExtractor={(item) => item.id.toString()} // We used here item because every item's has a different key number so this keyExtractor set the different key for different items so we used keyExtractor and item and this item is food object and this keys are number so I wrote toString to transform the number to string and the we add to UI with renderItem
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.foodItem}
            onPress={() => handleSelectFood(item)} // That's code will set the food and open the modal when we pressed the food
          >
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodCategory}>{item.category}</Text>
            </View>
            <Text style={styles.foodCalories}>
              {Math.round(item.perGram.calories * 100)} kcal
              {/* I wrote this Math.round for only 100 gram it's just a information per 100 gram of the food's calories */}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No foods found.</Text>
        }
      />

      {/* That's Food's Detail Modal*/}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          {/* That's the overlay that darkens the background  */}
          <View style={styles.modalContent}>
            {/* That's the white card of the modal  */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* If content is long so with this code we can scroll the page */}
              <Text style={styles.modalTitle}>{selectedFood?.name}</Text>
              <View style={styles.amountSection}>
                <Text style={styles.sectionTitle}>Add to My Food Diary</Text>
                <View style={styles.amountInputRow}>
                  {/* That's the row for input value and gram is side by side*/}
                  <TextInput
                    style={styles.amountInput} // That's the design of gram input
                    value={amount} // Input connected the amount state I mean gram of the food
                    onChangeText={setAmount} // This code updates the amount state of the gram of the food when the user types
                    keyboardType="numeric"
                  />
                  <Text style={styles.unitText}>g</Text>
                  {/* Gram unit seperate text better alignment */}
                </View>
              </View>
              {/* Nutritional Values Grid Diagram That's for nutritional
            s values I did grid diagram to read easily of nutirional's values  */}
              {nutrition && (
                <View style={styles.nutritionSection}>
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                      <Text style={styles.nutritionValue}>
                        {nutrition.calories}
                      </Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Fat</Text>
                      <Text style={styles.nutritionValue}>
                        {nutrition.fat}g
                      </Text>
                    </View>
                  </View>
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Carb</Text>
                      <Text style={styles.nutritionValue}>
                        {nutrition.carbs}g
                      </Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Protein</Text>
                      <Text style={styles.nutritionValue}>
                        {nutrition.protein}g
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              {/* That's for shows the nutiritonla values of the food we consume */}
              {nutrition && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Nutritional Value</Text>
                  <View style={styles.portionRow}>
                    <Text style={styles.portionText}>Portion</Text>
                    <Text style={styles.portionValue}>{amount}g</Text>
                  </View>
                  <View style={styles.divider} />{" "}
                  {/* That's seperate the portion and nutritional values */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Energy</Text>
                    <Text style={styles.detailValue}>
                      {nutrition.calories} kcal
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fat</Text>
                    <Text style={styles.detailValue}>{nutrition.fat}g</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Carbonhydrate</Text>
                    <Text style={styles.detailValue}>{nutrition.carbs}g</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}> Sugar</Text>
                    <Text style={styles.detailValue}>{nutrition.sugar}g</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Protein</Text>
                    <Text style={styles.detailValue}>{nutrition.protein}g</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Salt</Text>
                    <Text style={styles.detailValue}>{nutrition.sodium}g</Text>
                  </View>
                </View>
              )}
              {/* That's for chosing meal page */}
              <View style={styles.mealSection}>
                {" "}
                {/* That's main container of the chosing meal */}
                <Text style={styles.sectionTitle}>Choose Your Meal</Text>
                <View style={styles.mealButtons}>
                  {[
                    { key: "breakfast", label: "🍳 Breakfast" },
                    { key: "lunch", label: "🥪 Lunch" },
                    { key: "dinner", label: "🍗 Dinner" },
                    { key: "snack", label: "🍪 Snack" }, // Map the adds the buttons of each the meals so I used the map also map is dynamic and scalable and pratical the because if I didn't the use map I would have to add the buttons seperately and that takes time
                  ].map((meal) => (
                    <TouchableOpacity
                      key={meal.key} // That's the key is mandatory for the React
                      style={[
                        styles.mealButton,
                        mealType === meal.key && styles.mealButtonActive,
                      ]}
                      onPress={() => setMealType(meal.key)}
                    >
                      <Text
                        style={[
                          styles.mealButtonText,
                          mealType === meal.key && styles.mealButtonTextActive,
                        ]}
                      >
                        {meal.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)} // When the user pressed the cancel button this code turns off the modal with setModalvisible(false)
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={addFood}>
                  {/* The user pressed the save button addFood function runs and nutrition values will calculated and store in the AsyncStorage after that modalvisible(false) turns off the modal */}
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#dfe6e9",
  },
  categoryScroll: {
    marginBottom: 15,
    maxHeight: 45,
  },
  categoryButton: {
    // These are the categories button under the filter section
    paddingHorizontal: 20, // That's the space of the button from left and right
    paddingVertical: 10, // That's the space of the button from top and bottom
    marginRight: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dfe6e9",
  },
  categoryButtonActive: {
    backgroundColor: "#00b894",
    borderColor: "#00b894",
  },
  categoryText: {
    fontSize: 14,
    color: "#636e72",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  foodItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
  },
  foodCategory: {
    fontSize: 12,
    color: "#636e72",
    marginTop: 4,
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00b894",
  },
  emptyText: {
    // This is the style of the message shown to the user when the list is empty
    textAlign: "center",
    color: "#b2bec3",
    marginTop: 50,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end", // It starts the modal content from the bottom of the screen
  },
  modalContent: {
    backgroundColor: "#1e272e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  amountSection: {
    backgroundColor: "#2d3436",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#b2bec3",
    marginBottom: 10,
    fontWeight: "600",
  },
  amountInputRow: {
    // The container arranges the gram input field in a horizontal row
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3d4447",
    borderRadius: 8,
    paddingHorizontal: 15, // That's the space of the button from left and right
  },
  amountInput: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    paddingVertical: 12,
  },
  unitText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  nutritionSection: {
    marginBottom: 15,
  },
  nutritionGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  nutritionItem: {
    flex: 1,
    backgroundColor: "#2d3436",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  nutritionLabel: {
    color: "#b2bec3",
    fontSize: 12,
    marginBottom: 5,
  },
  nutritionValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  detailSection: {
    backgroundColor: "#2d3436",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  portionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  portionText: {
    color: "#b2bec3",
    fontSize: 14,
  },
  portionValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#3d4447",
    marginVertical: 10,
  },
  detailRow: {
    // This style organizes each row in the nutritional information list like energy,fat,carbonhydrate within the modal
    flexDirection: "row",
    justifyContent: "space-between", // This takes the label left and value right
    paddingVertical: 8, // It's the space of the row from top and bottom
  },
  detailLabel: {
    color: "#b2bec3",
    fontSize: 14,
  },
  detailValues: {
    // That's the details of nutritional informations list like fat carbonhydrate and calories
    flexDirection: "row",
    gap: 10,
  },
  detailValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  mealSection: {
    marginBottom: 20,
  },
  mealButtons: {
    gap: 10,
  },
  mealButton: {
    backgroundColor: "#2d3436",
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2d3436",
  },
  mealButtonActive: {
    borderColor: "#00b894",
    backgroundColor: "#00b89420",
  },
  mealButtonText: {
    color: "#b2bec3",
    fontSize: 16,
    textAlign: "center",
  },
  mealButtonTextActive: {
    color: "#00b894",
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
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
