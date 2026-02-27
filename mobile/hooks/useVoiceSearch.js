import { Audio } from "expo-av";
import { useEffect, useState } from "react";

export const useVoiceSearch = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [audioUri, setAudioUri] = useState(null);

  useEffect(() => {
    return () => {
      if (recording) {
        try {
          recording.stopAndUnloadAsync().catch(() => {});
        } catch (e) {
          // Ignore if already unloaded
        }
      }
    };
  }, [recording]);

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        console.log("Requesting permission..");
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(recording);
      setIsRecording(true);
      setAudioUri(null);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    if (!recording) return null;

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);

      setAudioUri(uri);
      setRecording(undefined);
      setIsRecording(false);
      return uri;
    } catch (error) {
      console.error("Error stopping recording:", error);
      setRecording(undefined);
      setIsRecording(false);
      return null;
    }
  }

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioUri,
  };
};
