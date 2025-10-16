import React from "react";
import { colors } from "@/components/cigar/colors";
import { FormSection } from "./FormSection";
import { FormInput } from "./FormInput";

export function FlavorNotesSelector({ selectedNotes, onToggle }) {
  // Convert array to string for display, or use string directly
  const flavorNotesText = Array.isArray(selectedNotes) 
    ? selectedNotes.join(", ") 
    : (selectedNotes || "");
  
  const handleTextChange = (text) => {
    // Store as-is without any parsing - allow all characters
    // Just pass the text directly
    if (onToggle) {
      onToggle(text);
    }
  };
  
  return (
    <FormSection title="Flavor Notes">
      <FormInput
        value={flavorNotesText}
        onChangeText={handleTextChange}
        placeholder="Describe the flavors you experienced..."
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        style={{ minHeight: 80 }}
      />
    </FormSection>
  );
}
