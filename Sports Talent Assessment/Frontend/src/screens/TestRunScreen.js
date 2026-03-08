import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";

const BASE_URL = "http://10.186.239.210:5000"; // <- Replace with your backend IP

export default function TestRunScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { testType, userId } = route.params;

  const [loading, setLoading] = useState(false);

  const analyzeVideo = async (uri) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("video", {
        uri,
        name: "test.mp4",
        type: "video/mp4",
      });

      const res = await axios.post(
        `${BASE_URL}/tests/analyze/${userId}/${testType}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setLoading(false);

      navigation.navigate("ResultsScreen", {
        result: res.data.result,
      });
    } catch (error) {
      console.log("Upload/Analysis Error:", error);
      setLoading(false);
      alert("Failed to upload or analyze video.");
    }
  };

  const recordVideo = async () => {
    const options = {
      mediaType: "video",
      videoQuality: "high",
      durationLimit: 30,
      saveToPhotos: true,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        alert("Camera Error: " + response.errorMessage);
        return;
      }

      const file = response.assets?.[0];
      if (!file) {
        alert("No video recorded");
        return;
      }

      analyzeVideo(file.uri);
    });
  };

  const uploadVideo = async () => {
    const options = {
      mediaType: "video",
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        alert("Picker Error: " + response.errorMessage);
        return;
      }

      const file = response.assets?.[0];
      if (!file) {
        alert("No video selected");
        return;
      }

      analyzeVideo(file.uri);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start Test</Text>
      <Text style={styles.subtitle}>
        {testType === "sprint"
          ? "30m Sprint Test"
          : testType === "squats"
          ? "Sit-ups Test"
          : "Vertical Jump Test"}
      </Text>

      <View style={{ marginTop: 40 }}>
        <TouchableOpacity style={styles.button} onPress={recordVideo}>
          <Text style={styles.buttonText}>🎥 Record Video</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={uploadVideo}>
          <Text style={styles.buttonText}>📁 Upload Video</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 10 }}>Analyzing video...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef7f5",
    alignItems: "center",
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#006a5e",
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    color: "#444",
  },
  button: {
    backgroundColor: "#006a5e",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#1d82f0",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
  loading: {
    marginTop: 40,
    alignItems: "center",
  },
});
