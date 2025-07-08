import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import { View, Text } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import PlanningScreen from '../screens/PlanningScreen';
import TimeTrackingScreen from '../screens/TimeTrackingScreen';

const Tab = createBottomTabNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;
            let iconType: string = 'material';

            if (route.name === 'Dashboard') {
              iconName = 'dashboard';
            } else if (route.name === 'Planning') {
              iconName = 'calendar-today';
            } else if (route.name === 'TimeTracking') {
              iconName = 'access-time';
            } else {
              iconName = 'help';
            }

            return (
              <Icon
                name={iconName}
                type={iconType}
                size={size}
                color={color}
              />
            );
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#e0e0e0',
            borderTopWidth: 1,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            height: 65,
            paddingBottom: 10,
            paddingTop: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 2,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Tableau de bord',
          }}
        />
        <Tab.Screen 
          name="Planning" 
          component={PlanningScreen}
          options={{
            tabBarLabel: 'Planning',
          }}
        />
        <Tab.Screen 
          name="TimeTracking" 
          component={TimeTrackingScreen}
          options={{
            tabBarLabel: 'Pointage',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;