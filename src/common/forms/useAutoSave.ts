"use client";

import { useCallback, useEffect, useRef } from "react";

import { FormUtils, useFormStateManager } from "./FormStateManager";

interface UseAutoSaveOptions {
  formKey: string;
  debounceMs?: number;
  onSave?: (data: any) => Promise<void>;
  onSaveSuccess?: (data: any) => void;
  onSaveError?: (error: Error) => void;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  lastError: string | null;
  saveCount: number;
}

export function useAutoSave({
  formKey,
  debounceMs = 2000,
  onSave,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveOptions) {
  const { setAutoSaveData, getAutoSaveData, clearAutoSaveData } =
    useFormStateManager();
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastDataRef = useRef<any>(null);
  const stateRef = useRef<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    lastError: null,
    saveCount: 0,
  });

  // Debounced save function
  const debouncedSave = useCallback(
    async (data: any) => {
      if (!onSave) return;

      try {
        stateRef.current.isSaving = true;
        await onSave(data);

        // Update local storage
        setAutoSaveData(formKey, data);

        stateRef.current.lastSaved = new Date();
        stateRef.current.lastError = null;
        stateRef.current.saveCount++;

        onSaveSuccess?.(data);
      } catch (error) {
        stateRef.current.lastError =
          error instanceof Error ? error.message : "Save failed";
        onSaveError?.(
          error instanceof Error ? error : new Error("Save failed"),
        );
      } finally {
        stateRef.current.isSaving = false;
      }
    },
    [onSave, formKey, setAutoSaveData, onSaveSuccess, onSaveError],
  );

  // Debounced wrapper with inline function to fix dependency warning
  const debouncedSaveWrapper = useCallback(
    (data: any) => {
      return FormUtils.debounce(debouncedSave, debounceMs)(data);
    },
    [debouncedSave, debounceMs],
  );

  // Trigger auto-save
  const triggerAutoSave = useCallback(
    (data: any) => {
      // Skip if data hasn't changed
      if (JSON.stringify(data) === JSON.stringify(lastDataRef.current)) {
        return;
      }

      lastDataRef.current = data;
      debouncedSaveWrapper(data);
    },
    [debouncedSaveWrapper],
  );

  // Load saved data on mount
  const loadSavedData = useCallback(() => {
    const savedData = getAutoSaveData(formKey);
    if (savedData) {
      // Remove the savedAt timestamp
      const { savedAt, ...data } = savedData;
      return data;
    }
    return null;
  }, [formKey, getAutoSaveData]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    clearAutoSaveData(formKey);
    lastDataRef.current = null;
    stateRef.current = {
      isSaving: false,
      lastSaved: null,
      lastError: null,
      saveCount: 0,
    };
  }, [formKey, clearAutoSaveData]);

  // Get current state
  const getState = useCallback((): AutoSaveState => {
    return { ...stateRef.current };
  }, []);

  // Cleanup on unmount - fix the ref warning by copying the value inside the effect
  useEffect(() => {
    const timeoutId = saveTimeoutRef.current;
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return {
    triggerAutoSave,
    loadSavedData,
    clearSavedData,
    getState,
    isSaving: stateRef.current.isSaving,
    lastSaved: stateRef.current.lastSaved,
    lastError: stateRef.current.lastError,
    saveCount: stateRef.current.saveCount,
  };
}
