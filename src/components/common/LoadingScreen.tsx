import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Wait, cooking up.....",
}) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    const rotate = () => {
      rotation.setValue(0);
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => rotate());
    };

    rotate();
  }, [rotation]);

  const rotateInterpolation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
        <Image
          source={require("../../../assets/Brand/loadingSwirl.png")}
          style={styles.swirl}
          resizeMode="contain"
        />
      </Animated.View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  swirl: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    fontFamily: "Zalando-Medium",
    color: "#1f2937",
    textAlign: "center",
  },
});
