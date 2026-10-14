"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import styles from "./aeri.module.css";

type AeriPhase = "idle" | "listening" | "thinking" | "speaking" | "error";
type ChatMessage = { role: "user" | "assistant"; content: string };
type SpeechAlternativeLike = { transcript: string };
type SpeechResultLike = { isFinal: boolean; length: number; 0: SpeechAlternativeLike };
type SpeechEventLike = { resultIndex: number; results: ArrayLike<SpeechResultLike> };
type SpeechErrorLike = { error?: string };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechEventLike) => void) | null;
  onerror: ((event: SpeechErrorLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type WindowWithSpeechRecognition = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const PHASE_LABELS: Record<AeriPhase, string> = {
  idle: "Local demo ready",
  listening: "Listening",
  thinking: "Preparing local demo response",
  speaking: "Speaking",
  error: "Voice input unavailable",
};

function getLocalReply(input: string): string {
  const lang = (document.documentElement.lang || navigator.language || "en").toLowerCase().slice(0, 2);
  const value = input.toLowerCase();
  const mentionsSecurity = /security|secure|risk|policy|agent|runtime|audit|gÃ¼ven|risk|politika|ajan|denetim|sicherheit|richtlinie|prÃ¼fung/.test(value);
  const isGreeting = /hello|hi\b|hey|merhaba|selam|nasÄ±lsÄ±n|hallo|guten tag/.test(value);

  if (lang === "tr" || /merhaba|selam|nasÄ±lsÄ±n|aegisora nedir|ne yap/.test(value)) {
    if (isGreeting) return "Merhaba, ben Aeri. Åu anda yerel demo modundayÄ±m; mavi orb animasyonumu, mikrofon giriÅŸini ve cihazÄ±nÄ±n sesini test edebilirsin.";
    if (mentionsSecurity) return "Aegisora, otonom yapay zekÃ¢ ajanlarÄ±nÄ±n eylemlerini Ã§alÄ±ÅŸma anÄ±nda kontrol etmeye odaklanÄ±r. Ä°stek baÄŸlam ve politikalara gÃ¶re deÄŸerlendirilir; karar ve kanÄ±tlar denetlenebilir ÅŸekilde kaydedilir. Bu yerel demo gerÃ§ek Ã§alÄ±ÅŸma alanÄ± kayÄ±tlarÄ±na baÄŸlÄ± deÄŸil.";
    return "Åu anda yerel demo modundayÄ±m. GerÃ§ek bir dil modeli veya Aegisora Ã§alÄ±ÅŸma alanÄ± verilerine baÄŸlanmadÄ±m; bu yÃ¼zden yalnÄ±zca temel, yerel Ã¶rnek yanÄ±tlarÄ± verebilirim. Orbun animasyonunu ve sesli arayÃ¼zÃ¼ test ediyoruz.";
  }
  if (lang === "de") {
    if (isGreeting) return "Hallo, ich bin Aeri. Ich laufe gerade im lokalen Demo-Modus. Du kannst die Orb-Animation, Mikrofoneingabe und Sprachausgabe testen.";
    if (mentionsSecurity) return "Aegisora kontrolliert Aktionen autonomer KI-Agenten zur Laufzeit. Anfragen werden anhand ihres Kontexts und der Richtlinien bewertet; Entscheidungen und Nachweise sollen nachvollziehbar bleiben. Diese lokale Demo ist nicht mit echten Workspace-Daten verbunden.";
    return "Ich bin im lokalen Demo-Modus. Noch ist kein Sprachmodell und keine Aegisora-Workspace-Datenquelle verbunden. Ich kann die Animation, Spracheingabe und Sprachausgabe demonstrieren, aber keine offenen Fragen wie ein echtes KI-Modell beantworten.";
  }
  if (isGreeting) return "Hello, I'm Aeri. I'm running in local demo mode, so you can test the orb animation, microphone input and device speech output.";
  if (mentionsSecurity) return "Aegisora focuses on controlling autonomous AI-agent actions at runtime. Requests can be evaluated against context and policy, with decisions and evidence designed to remain auditable. This local demo is not connected to real workspace records.";
  return "I'm currently running in local demo mode. No language model or Aegisora workspace data is connected, so my replies are limited to built-in examples. We can still test the animated orb, browser voice input and speech playback.";
}

export default function AeriLocalDemo() {
  const [phaseState, setPhaseState] = useState<AeriPhase>("idle");
  const [draft, setDraft] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello, I'm Aeri. Local demo mode is active â€” no OpenAI API key is used. Try typing a message or start listening to test the orb and device voice." },
  ]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const phaseRef = useRef<AeriPhase>("idle");
  const handledFinalRef = useRef(false);

  const setPhase = useCallback((next: AeriPhase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const speakLocalReply = useCallback((input: string) => {
    setPhase("thinking");
    setErrorMessage("");
    const reply = getLocalReply(input);
    setMessages((current) => [...current, { role: "assistant", content: reply }]);
    setLiveTranscript(reply);

    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setPhase("speaking");
      window.setTimeout(() => { setLiveTranscript(""); setPhase("idle"); }, 3200);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(reply);
    utterance.lang = document.documentElement.lang || navigator.language || "en-US";
    utterance.rate = 1.02;
    utterance.pitch = 1.0;
    utterance.volume = 0.95;
    utterance.onstart = () => setPhase("speaking");
    utterance.onend = () => { setLiveTranscript(""); setPhase("idle"); };
    utterance.onerror = () => { setLiveTranscript(""); setPhase("idle"); };
    setPhase("speaking");
    window.speechSynthesis.speak(utterance);
  }, [setPhase]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    try { recognition?.stop(); } catch { /* Recognition may already have stopped. */ }
    if (phaseRef.current === "listening") setPhase("idle");
  }, [setPhase]);

  const startListening = useCallback(() => {
    setErrorMessage("");
    if (phaseRef.current === "listening") { stopListening(); return; }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    const speechWindow = window as WindowWithSpeechRecognition;
    const SpeechRecognitionApi = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognitionApi) {
      setPhase("error");
      setErrorMessage("This browser does not expose speech recognition. You can still type below; orb animation and speech playback remain available.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionApi();
      recognitionRef.current = recognition;
      handledFinalRef.current = false;
      recognition.lang = document.documentElement.lang || navigator.language || "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.onresult = (event) => {
        let interim = "";
        let finalText = "";
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const item = event.results[index];
          const transcript = item?.[0]?.transcript ?? "";
          if (item?.isFinal) finalText += transcript;
          else interim += transcript;
        }
        if (interim.trim()) {
          setLiveTranscript(interim.trim());
          setPhase("listening");
        }
        if (finalText.trim() && !handledFinalRef.current) {
          handledFinalRef.current = true;
          const userText = finalText.trim();
          setLiveTranscript("");
          setMessages((current) => [...current, { role: "user", content: userText }]);
          setPhase("thinking");
          window.setTimeout(() => speakLocalReply(userText), 350);
        }
      };
      recognition.onerror = (event) => {
        if (event.error && event.error !== "no-speech" && event.error !== "aborted") {
          setErrorMessage(`Browser speech recognition reported: ${event.error}. You can use the text box instead.`);
          setPhase("error");
        } else if (phaseRef.current === "listening") {
          setPhase("idle");
        }
      };
      recognition.onend = () => {
        if (recognitionRef.current === recognition) recognitionRef.current = null;
        if (phaseRef.current === "listening") setPhase("idle");
      };
      setLiveTranscript("I'm listeningâ€¦");
      setPhase("listening");
      recognition.start();
    } catch (error) {
      recognitionRef.current = null;
      setPhase("error");
      setErrorMessage(error instanceof Error ? error.message : "Could not start browser speech recognition. Try the text box instead.");
    }
  }, [setPhase, speakLocalReply, stopListening]);

  const sendText = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    stopListening();
    setMessages((current) => [...current, { role: "user", content }]);
    setDraft("");
    speakLocalReply(content);
  }, [draft, speakLocalReply, stopListening]);

  useEffect(() => () => {
    try { recognitionRef.current?.abort(); } catch { /* Ignore unmount cleanup errors. */ }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const phase = phaseState;
  const statusClass = styles[`state_${phase}`] || styles.state_idle;
  const listening = phase === "listening";

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <a className={styles.brand} href="/" aria-label="Aegisora home">
            <span className={styles.brandMark}>A</span><span>AEGISORA</span>
          </a>
          <div className={styles.headerMeta}><span className={styles.headerDot} /> LOCAL INTERACTIVE DEMO <span className={styles.headerDivider}>/</span> AERI</div>
        </header>

        <div className={styles.contentGrid}>
          <section className={styles.orbPanel} aria-label="Aeri assistant status">
            <div className={styles.eyebrow}><span className={styles.liveDot} /> AEGISORA INTELLIGENCE</div>
            <div className={`${styles.orbStage} ${statusClass}`}>
              <div className={styles.orbFallback} aria-hidden="true">
                <span className={styles.orbInner} /><span className={styles.orbContour} /><span className={styles.orbHighlight} />
              </div>
              <img src="/aeri/aeri-orb.png" alt="" aria-hidden="true" className={styles.orbArtwork}
                onError={(event) => { event.currentTarget.style.display = "none"; }} />
              <div className={styles.orbAura} aria-hidden="true" />
            </div>
            <h1 className={styles.aeriName}>Aeri<span className={styles.namePeriod}>.</span></h1>
            <p className={styles.tagline}>Your runtime security companion.</p>
            <div className={styles.statusPill} aria-live="polite">
              <span className={`${styles.statusDot} ${listening || phase === "speaking" ? styles.statusOnline : ""}`} />
              {PHASE_LABELS[phase]}
            </div>
            <div className={styles.controls}>
              <button type="button" className={styles.primaryButton} onClick={startListening}>
                <span className={styles.buttonIcon}>{listening ? "â…¡" : "â—–"}</span>
                {listening ? "Stop listening" : "Start listening"}
              </button>
              <button type="button" className={styles.secondaryButton} onClick={() => {
                stopListening();
                if ("speechSynthesis" in window) window.speechSynthesis.cancel();
                setLiveTranscript(""); setErrorMessage(""); setPhase("idle");
              }}>Reset orb</button>
            </div>
            <p className={styles.privacyNote}><span aria-hidden="true">â—‡</span> No OpenAI API key or external AI endpoint is used in this demo.</p>
            {errorMessage ? <div className={styles.errorNotice} role="alert">{errorMessage}</div> : null}
          </section>

          <section className={styles.chatPanel} aria-label="Aeri local demo conversation">
            <div className={styles.chatHeader}>
              <div><h2>Conversation</h2><p>Local demo Â· built-in sample responses</p></div>
              <span className={styles.chatBadge}>LOCAL</span>
            </div>
            <div className={styles.messages} aria-live="polite" aria-relevant="additions text">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`${styles.message} ${message.role === "user" ? styles.userMessage : styles.assistantMessage}`}>
                  <span className={styles.messageRole}>{message.role === "user" ? "YOU" : "AERI"}</span><p>{message.content}</p>
                </div>
              ))}
              {liveTranscript ? <div className={`${styles.message} ${styles.assistantMessage}`}><span className={styles.messageRole}>{listening ? "MICROPHONE" : "AERI"}</span><p>{liveTranscript}</p></div> : null}
              {phase === "thinking" ? <div className={styles.thinkingLine}><span /> Aeri is thinking</div> : null}
            </div>
            <form className={styles.composer} onSubmit={sendText}>
              <label className={styles.srOnly} htmlFor="aeri-message">Message Aeri</label>
              <input id="aeri-message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type to test the local demoâ€¦" maxLength={2000} />
              <button type="submit" disabled={!draft.trim()} aria-label="Send message">â†‘</button>
            </form>
            <p className={styles.chatFootnote}>This demo animates the orb and uses browser voice features. It does not provide real LLM intelligence or access Aegisora workspace records.</p>
          </section>
        </div>
        <footer className={styles.footer}><span>AEGISORA</span><span>SECURE BY DESIGN <i>Â·</i> AERI LOCAL PREVIEW</span></footer>
      </div>
    </main>
  );
}