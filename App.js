import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import Axios from 'axios';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
    }
  }
});

export default function App() {
  const [expoToken, setExpoToken] = useState("")

  const notifyMeBtnHandler = () => {
    // Send Local notification
    // Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: "Notification Baru Lagi",
    //     body: "Helloooooooo!",
    //   },
    //   trigger: {
    //     seconds: 5
    //   }
    // })

    // Send push notification
    const EXPO_URL = "https://exp.host/--/api/v2/push/send";

    Axios.post(EXPO_URL, {
      to: expoToken, // Expo push token
      title: "Push notif from device",
      body: "Notif ini berasal dari device"
    }, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      }
    })
    .then(() => {
      console.log("Notif Sent")
    })
    .catch((err) => {
      console.log(err)
    })
  };

  // Get permissions
  useEffect(() => {
    Permissions.getAsync(Permissions.NOTIFICATIONS)
    .then((permObj) => {
      // console.log("PERMISSION: ",permObj.status);
      if (permObj.status !== "granted") {
        // Ask permission
        return Permissions.askAsync(Permissions.NOTIFICATIONS);
      }

      return permObj;
    })
    .then((permObj) => {
      if (permObj.status !== "granted") {
        throw new Error("No notification permission");
      }
    })
    .then(() => {
      return Notifications.getExpoPushTokenAsync();
    })
    .then((responsePushToken) => {
      console.log(responsePushToken);
      setExpoToken(responsePushToken.data)
    })
    .catch((err) => {
      // console.log(err)
    })
  }, [])

  // Set notification listeners
  useEffect(() => {
    const subNotifForeground = Notifications.addNotificationReceivedListener((notifData) => {
      console.log("FOREGROUND", notifData)
    })

    const subNotifBackground = Notifications.addNotificationResponseReceivedListener((res) => {
      console.log("BACKGROUND", res.notification)
    })

    return () => {
      subNotifForeground.remove()
      subNotifBackground.remove()
    }
  }, [])

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={notifyMeBtnHandler}>
        <Text>Notify Me!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
