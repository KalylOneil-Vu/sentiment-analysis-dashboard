import { useContext } from "react";
import { VLMContext } from "../context/VLMContext";

export function useVLMContext() {
  const context = useContext(VLMContext);
  if (!context) {
    throw new Error("useVLMContext must be used within a VLMProvider");
  }
  return context;
}
