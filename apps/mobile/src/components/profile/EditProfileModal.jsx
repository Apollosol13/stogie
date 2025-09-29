import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Save } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import FormField from "@/components/profile/form/FormField";
import SelectField from "@/components/profile/form/SelectField";
import { colors } from "@/constants/colors";

export default function EditProfileModal({
  visible,
  onClose,
  profile,
  onSave,
  saving,
}) {
  const insets = useSafeAreaInsets();
  const [editForm, setEditForm] = useState({
    display_name: "",
    username: "",
    bio: "",
    location: "",
    experience_level: "beginner",
    favorite_strength: "medium",
    favorite_wrapper: "",
  });

  useEffect(() => {
    if (profile) {
      setEditForm({
        display_name: profile.display_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        location: profile.location || "",
        experience_level: profile.experience_level || "beginner",
        favorite_strength: profile.favorite_strength || "medium",
        favorite_wrapper: profile.favorite_wrapper || "",
      });
    }
  }, [profile, visible]);

  const handleSave = () => {
    onSave(editForm);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
          }}
        >
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            Edit Profile
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              flexDirection: "row",
              alignItems: "center",
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.accentGold} />
            ) : (
              <Save size={24} color={colors.accentGold} />
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <FormField
              label="Display Name"
              value={editForm.display_name}
              onChangeText={(text) =>
                setEditForm({ ...editForm, display_name: text })
              }
              placeholder="Your display name"
            />
            <FormField
              label="Username"
              value={editForm.username}
              onChangeText={(text) =>
                setEditForm({ ...editForm, username: text })
              }
              placeholder="username"
            />
            <FormField
              label="Bio"
              value={editForm.bio}
              onChangeText={(text) => setEditForm({ ...editForm, bio: text })}
              placeholder="Tell us about your cigar journey..."
              multiline
            />
            <FormField
              label="Location"
              value={editForm.location}
              onChangeText={(text) =>
                setEditForm({ ...editForm, location: text })
              }
              placeholder="City, State/Country"
            />
            <SelectField
              label="Experience Level"
              value={editForm.experience_level}
              onValueChange={(value) =>
                setEditForm({ ...editForm, experience_level: value })
              }
              options={[
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
                { value: "expert", label: "Expert" },
              ]}
            />
            <SelectField
              label="Favorite Strength"
              value={editForm.favorite_strength}
              onValueChange={(value) =>
                setEditForm({ ...editForm, favorite_strength: value })
              }
              options={[
                { value: "mild", label: "Mild" },
                { value: "medium", label: "Medium" },
                { value: "full", label: "Full" },
              ]}
            />
            <FormField
              label="Favorite Wrapper"
              value={editForm.favorite_wrapper}
              onChangeText={(text) =>
                setEditForm({ ...editForm, favorite_wrapper: text })
              }
              placeholder="e.g., Maduro, Connecticut, Habano"
            />
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingAnimatedView>
      </View>
    </Modal>
  );
}
