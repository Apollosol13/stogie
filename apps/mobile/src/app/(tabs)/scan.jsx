import React, { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useCameraPermissions } from "expo-camera";
import useUser from "@/utils/auth/useUser";
import AuthPrompt from "@/components/auth/AuthPrompt";
import useCigarScanner from "@/hooks/useCigarScanner";
import CameraMode from "@/components/scan/CameraMode";
import ProcessingMode from "@/components/scan/ProcessingMode";
import ResultsMode from "@/components/scan/ResultsMode";
import PermissionsRequired from "@/components/scan/PermissionsRequired";
import { colors } from "@/components/scan/colors";

export default function ScanScreen() {
  const { data: user, loading: userLoading } = useUser();
  const [permission, requestPermission] = useCameraPermissions();
  const {
    step,
    capturedImage,
    matches,
    processingProgress,
    selectedMatch,
    isAdding,
    identifyCigar,
    pickImageFromGallery,
    resetScan,
    handleMatchSelect,
    setSelectedMatch,
  } = useCigarScanner();

  useEffect(() => {
    // Only request permission if we can ask and it's not already granted
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission().catch((error) => {
        console.error("Error requesting camera permission:", error);
      });
    }
  }, [permission, requestPermission]);

  // Loading state while checking permissions
  if (!permission) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.accentGold} />
        <Text
          style={{
            color: colors.textSecondary,
            marginTop: 16,
            fontSize: 16,
          }}
        >
          Checking camera permissions...
        </Text>
      </View>
    );
  }

  // User loading state
  if (userLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.accentGold} />
      </View>
    );
  }

  // Auth prompt if not signed in
  if (!user) {
    return <AuthPrompt />;
  }

  // Permission request screen
  if (!permission.granted) {
    return <PermissionsRequired requestPermission={requestPermission} />;
  }

  const renderContent = () => {
    try {
      switch (step) {
        case "camera":
          return (
            <CameraMode
              identifyCigar={identifyCigar}
              pickImageFromGallery={pickImageFromGallery}
            />
          );
        case "processing":
          return (
            <ProcessingMode
              capturedImage={capturedImage}
              processingProgress={processingProgress}
            />
          );
        case "results":
          return (
            <ResultsMode
              matches={matches}
              selectedMatch={selectedMatch}
              setSelectedMatch={setSelectedMatch}
              resetScan={resetScan}
              capturedImage={capturedImage}
              handleMatchSelect={handleMatchSelect}
              isAdding={isAdding}
            />
          );
        default:
          return (
            <CameraMode
              identifyCigar={identifyCigar}
              pickImageFromGallery={pickImageFromGallery}
            />
          );
      }
    } catch (error) {
      console.error("Error rendering scan content:", error);
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.bgPrimary,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <StatusBar style="light" />
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 18,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Camera Error
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            Unable to load camera. Please restart the app.
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      {renderContent()}
    </View>
  );
}
