import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { X } from "lucide-react-native";
import { colors } from "./colors";
import { apiRequest } from "@/utils/api";

const STRENGTH_OPTIONS = ["mild", "medium", "full"];

export function EditCigarModal({ visible, onClose, cigar, onSuccess }) {
  const [formData, setFormData] = useState({
    brand: "",
    line: "",
    vitola: "",
    strength: "medium",
    wrapper: "",
    binder: "",
    filler: "",
    origin: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cigar) {
      setFormData({
        brand: cigar.brand || "",
        line: cigar.line || "",
        vitola: cigar.vitola || "",
        strength: cigar.strength || "medium",
        wrapper: cigar.wrapper || "",
        binder: cigar.binder || "",
        filler: cigar.filler || "",
        origin: cigar.origin || "",
        description: cigar.description || "",
      });
    }
  }, [cigar]);

  const handleSubmit = async () => {
    if (!formData.brand.trim() || !formData.vitola.trim()) {
      Alert.alert("Required Fields", "Brand and Vitola are required");
      return;
    }

    try {
      setSubmitting(true);

      const response = await apiRequest(`/api/cigars/${cigar.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update cigar");
      }

      Alert.alert("Success", "Cigar details updated!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Update cigar error:", error);
      Alert.alert("Error", error.message || "Failed to update cigar details");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 60,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
          }}
        >
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text
            style={{ color: colors.textPrimary, fontSize: 18, fontWeight: "600" }}
          >
            Edit Cigar Details
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{ opacity: submitting ? 0.5 : 1 }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.accentGold} />
            ) : (
              <Text
                style={{
                  color: colors.accentGold,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Brand */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Brand *
              </Text>
              <TextInput
                value={formData.brand}
                onChangeText={(text) =>
                  setFormData({ ...formData, brand: text })
                }
                placeholder="e.g. Cohiba"
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.textPrimary,
                }}
              />
            </View>

            {/* Line */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Line / Series
              </Text>
              <TextInput
                value={formData.line}
                onChangeText={(text) => setFormData({ ...formData, line: text })}
                placeholder="e.g. Behike"
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.textPrimary,
                }}
              />
            </View>

            {/* Vitola */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Vitola *
              </Text>
              <TextInput
                value={formData.vitola}
                onChangeText={(text) =>
                  setFormData({ ...formData, vitola: text })
                }
                placeholder="e.g. Robusto"
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.textPrimary,
                }}
              />
            </View>

            {/* Strength */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Strength
              </Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {STRENGTH_OPTIONS.map((str) => (
                  <TouchableOpacity
                    key={str}
                    onPress={() => setFormData({ ...formData, strength: str })}
                    style={{
                      flex: 1,
                      backgroundColor:
                        formData.strength === str
                          ? colors.accentGold
                          : colors.surface,
                      padding: 12,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color:
                          formData.strength === str
                            ? colors.bgPrimary
                            : colors.textPrimary,
                        fontSize: 14,
                        fontWeight: "600",
                        textTransform: "capitalize",
                      }}
                    >
                      {str}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Wrapper */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Wrapper
              </Text>
              <TextInput
                value={formData.wrapper}
                onChangeText={(text) =>
                  setFormData({ ...formData, wrapper: text })
                }
                placeholder="e.g. Connecticut"
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.textPrimary,
                }}
              />
            </View>

            {/* Binder */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Binder
              </Text>
              <TextInput
                value={formData.binder}
                onChangeText={(text) =>
                  setFormData({ ...formData, binder: text })
                }
                placeholder="e.g. Nicaraguan"
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.textPrimary,
                }}
              />
            </View>

            {/* Filler */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Filler
              </Text>
              <TextInput
                value={formData.filler}
                onChangeText={(text) =>
                  setFormData({ ...formData, filler: text })
                }
                placeholder="e.g. Dominican"
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.textPrimary,
                }}
              />
            </View>

            {/* Origin */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Origin
              </Text>
              <TextInput
                value={formData.origin}
                onChangeText={(text) =>
                  setFormData({ ...formData, origin: text })
                }
                placeholder="e.g. Cuba"
                placeholderTextColor={colors.textTertiary}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.textPrimary,
                }}
              />
            </View>

            {/* Description */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Description
              </Text>
              <TextInput
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Add any notes about this cigar..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.textPrimary,
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

