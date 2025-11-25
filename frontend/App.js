import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import ConversationScreen from './screens/ConversationScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerTitle: '',
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#478FEB',
          tabBarInactiveTintColor: '#999',
          tabBarIcon: () => {
            let iconName;
            if (route.name === 'Home') iconName = '🏠';
            else if (route.name === 'Conversation') iconName = '🗣️';
            else if (route.name === 'Settings') iconName = '⚙️';
            return <Text style={{ fontSize: 28 }}>{iconName}</Text>;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Conversation" component={ConversationScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
