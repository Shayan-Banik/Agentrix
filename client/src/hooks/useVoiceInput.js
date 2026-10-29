import { useCallback, useEffect, useRef, useState } from "react";

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function useVoiceInput(value, setValue, setError) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const baseTextRef = useRef("");

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }

    setError("");
    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    baseTextRef.current = value ? `${value.replace(/\s+$/, "")} ` : "";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }
      setValue(baseTextRef.current + transcript);
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone access was blocked. Allow it in your browser settings.");
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setError("Voice input error. Please try again.");
      }
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [setError, setValue, value]);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, startListening, stopListening]);

  useEffect(
    () => () => recognitionRef.current?.stop(),
    [],
  );

  return {
    listening,
    stopListening,
    toggleListening,
  };
}
