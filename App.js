import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import FarmProfileScreen from './src/screens/FarmProfileScreen';
import ListingsScreen from './src/screens/ListingsScreen';
import BuyerDashboardScreen from './src/screens/BuyerDashboardScreen';
import MapScreen from './src/screens/MapScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderSuccessScreen from './src/screens/OrderSuccessScreen';
import TrackOrderScreen from './src/screens/TrackOrderScreen';
import ChatScreen from './src/screens/ChatScreen';
import CategoryProductsScreen from './src/screens/CategoryProductsScreen';
import CartScreen from './src/screens/CartScreen';
import BuyerProfileScreen from './src/screens/BuyerProfileScreen';
import BuyerSettingsScreen from './src/screens/BuyerSettingsScreen';
import PersonalInfoScreen from './src/screens/PersonalInfoScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import PaymentMethodsScreen from './src/screens/PaymentMethodsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import FarmerDashboardScreen from './src/screens/FarmerDashboardScreen';
import PublicFarmProfileScreen from './src/screens/PublicFarmProfileScreen';
import FarmerOrdersScreen from './src/screens/FarmerOrdersScreen';
import FarmerSettingsScreen from './src/screens/FarmerSettingsScreen';
import FarmerChangePasswordScreen from './src/screens/FarmerChangePasswordScreen';
import FarmerBankAccountsScreen from './src/screens/FarmerBankAccountsScreen';
import FarmerHelpScreen from './src/screens/FarmerHelpScreen';
import FarmerTermsScreen from './src/screens/FarmerTermsScreen';
import EditFarmProfileScreen from './src/screens/EditFarmProfileScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import ChatListScreen from './src/screens/ChatListScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="AddProduct" component={AddProductScreen} />
          <Stack.Screen name="FarmProfile" component={FarmProfileScreen} />
          <Stack.Screen name="Listings" component={ListingsScreen} />
          <Stack.Screen name="BuyerDashboard" component={BuyerDashboardScreen} />
          <Stack.Screen name="MapScreen" component={MapScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
          <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="BuyerProfile" component={BuyerProfileScreen} />
          <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
          <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="BuyerSettings" component={BuyerSettingsScreen} />
          <Stack.Screen name="FarmerDashboard" component={FarmerDashboardScreen} />
          <Stack.Screen name="FarmerOrders" component={FarmerOrdersScreen} />
          <Stack.Screen name="FarmerSettings" component={FarmerSettingsScreen} />
          <Stack.Screen name="FarmerChangePassword" component={FarmerChangePasswordScreen} />
          <Stack.Screen name="FarmerBankAccounts" component={FarmerBankAccountsScreen} />
          <Stack.Screen name="FarmerHelp" component={FarmerHelpScreen} />
          <Stack.Screen name="FarmerTerms" component={FarmerTermsScreen} />
          <Stack.Screen name="EditFarmProfile" component={EditFarmProfileScreen} />
          <Stack.Screen name="PublicFarmProfile" component={PublicFarmProfileScreen} />
          <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
