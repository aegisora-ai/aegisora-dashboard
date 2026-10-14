"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import styles from "./aeri.module.css";

type AeriPhase = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "error";
type ChatMessage = { role: "user" | "assistant"; content: string };

type RealtimeTokenResponse = { value?: string; client_secret?: { value?: string }; error?: string };

const PHASE_LABELS: Record<AeriPhase, string> = {
  idle: "Ready when you are",
  connecting: "Connecting securely…",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  error: "Connection needs attention",
};

async function waitForIceGathering(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === "complete") return;
  await new Promise<void>((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      pc.removeEventListener("icegatheringstatechange", onStateChange);
      resolve();
    };
    const onStateChange = () => {
      if (pc.iceGatheringState === "complete") finish();
    };
    const timer = window.setTimeout(finish, 4500);
    pc.addEventListener("icegatheringstatechange", onStateChange);
  });
}

export default function AeriAssistant() {
  const [phase, setPhase] = useState<AeriPhase>("idle");
  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(false);
  const [draft, setDraft] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello, I’m Aeri — Aegisora’s AI assistant. Start a voice session to talk with me, or connect first and send a text message." },
  ]);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const assistantAudioRef = useRef<HTMLAudioElement | null>(null);
  const assistantDraftRef = useRef("");

  const stopSession = useCallback(() => {
    try { channelRef.current?.close(); } catch { /* already closed */ }
    try { peerRef.current?.close(); } catch { /* already closed */ }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (assistantAudioRef.current) assistantAudioRef.current.srcObject = null;
    channelRef.current = null;
    peerRef.current = null;
    streamRef.current = null;
    setConnected(false);
    setMuted(false);
    setPhase("idle");
    setLiveTranscript("");
    assistantDraftRef.current = "";
  }, []);

  useEffect(() => {
    return () => {
      try { channelRef.current?.close(); } catch { /* already closed */ }
      try { peerRef.current?.close(); } catch { /* already closed */ }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (assistantAudioRef.current) assistantAudioRef.current.srcObject = null;
    };
  }, []);

  const startSession = useCallback(async () => {
    if (connected || phase === "connecting") return;
    setErrorMessage("");
    setPhase("connecting");

    let localStream: MediaStream | null = null;
    let peer: RTCPeerConnection | null = null;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Microphone access requires a supported browser and HTTPS (localhost is allowed for development).");
      }

      // Request microphone access only after the user explicitly clicks Start voice.
      localStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = localStream;

      const tokenResponse = await fetch("/api/aeri/token", { method: "POST", cache: "no-store" });
      const tokenData = (await tokenResponse.json().catch(() => ({}))) as RealtimeTokenResponse;
      const ephemeralKey = tokenData.value ?? tokenData.client_secret?.value;
      if (!tokenResponse.ok || !ephemeralKey) {
        throw new Error(tokenData.error || "Aeri could not create a secure voice session. Check server configuration and sign-in status.");
      }

      peer = new RTCPeerConnection();
      peerRef.current = peer;
      localStream.getTracks().forEach((track) => peer?.addTrack(track, localStream as MediaStream));

      peer.ontrack = (event) => {
        const audio = assistantAudioRef.current;
        if (!audio) return;
        audio.srcObject = event.streams[0];
        void audio.play().catch(() => {
          setErrorMessage("Your browser blocked audio playback. Interact with the page and try reconnecting.");
        });
      };
      peer.onconnectionstatechange = () => {
        if (peer?.connectionState === "failed") {
          setErrorMessage("The voice connection failed. Please disconnect and try again.");
          setPhase("error");
        }
      };

      const channel = peer.createDataChannel("oai-events");
      channelRef.current = channel;
      channel.onopen = () => {
        setConnected(true);
        setPhase("listening");
        setErrorMessage("");
      };
      channel.onclose = () => setConnected(false);
      channel.onmessage = (event) => {
        let payload: Record<string, unknown>;
        try { payload = JSON.parse(String(event.data)) as Record<string, unknown>; }
        catch { return; }

        const type = String(payload.type ?? "");
        const delta = typeof payload.delta === "string" ? payload.delta : "";
        const transcript = typeof payload.transcript === "string" ? payload.transcript : "";
        const text = typeof payload.text === "string" ? payload.text : "";

        if (type === "input_audio_buffer.speech_started") setPhase("listening");
        if (type === "input_audio_buffer.speech_stopped" || type === "response.created") setPhase("thinking");
        if (type === "response.audio.delta" || type === "response.output_audio.delta") setPhase("speaking");

        if (type === "conversation.item.input_audio_transcription.completed" && transcript.trim()) {
          setMessages((current) => [...current, { role: "user", content: transcript.trim() }]);
        }

        if (type === "response.output_audio_transcript.delta" || type === "response.audio_transcript.delta" || type === "response.output_text.delta" || type === "response.text.delta") {
          if (delta) {
            assistantDraftRef.current += delta;
            setLiveTranscript(assistantDraftRef.current);
          }
        }

        const isTranscriptFinal = type === "response.output_audio_transcript.done" || type === "response.audio_transcript.done" || type === "response.output_text.done" || type === "response.text.done";
        if (isTranscriptFinal) {
          const finalText = (transcript || text || assistantDraftRef.current).trim();
          if (finalText) setMessages((current) => [...current, { role: "assistant", content: finalText }]);
          assistantDraftRef.current = "";
          setLiveTranscript("");
        }

        if (type === "response.done") {
          if (assistantDraftRef.current.trim()) {
            const finalText = assistantDraftRef.current.trim();
            setMessages((current) => [...current, { role: "assistant", content: finalText }]);
            assistantDraftRef.current = "";
            setLiveTranscript("");
          }
          setPhase("listening");
        }
        if (type === "error") {
          const error = payload.error as { message?: string } | undefined;
          setErrorMessage(error?.message || "A realtime session error occurred.");
        }
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      await waitForIceGathering(peer);
      const localSdp = peer.localDescription?.sdp;
      if (!localSdp) throw new Error("The browser could not prepare a WebRTC offer.");

      const answerResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: { Authorization: `Bearer ${ephemeralKey}`, "Content-Type": "application/sdp" },
        body: localSdp,
      });
      const answerSdp = await answerResponse.text();
      if (!answerResponse.ok) {
        throw new Error(`The Realtime service rejected the connection (HTTP ${answerResponse.status}). Check model access and API billing.`);
      }
      await peer.setRemoteDescription({ type: "answer", sdp: answerSdp });
    } catch (error) {
      try { channelRef.current?.close(); } catch { /* ignore */ }
      try { peer?.close(); } catch { /* ignore */ }
      localStream?.getTracks().forEach((track) => track.stop());
      peerRef.current = null;
      channelRef.current = null;
      streamRef.current = null;
      setConnected(false);
      setPhase("error");
      setErrorMessage(error instanceof Error ? error.message : "Aeri could not start the voice session.");
    }
  }, [connected, phase]);

  const toggleMute = useCallback(() => {
    const nextMuted = !muted;
    streamRef.current?.getAudioTracks().forEach((track) => { track.enabled = !nextMuted; });
    setMuted(nextMuted);
  }, [muted]);

  const sendText = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    const channel = channelRef.current;
    if (!content || !channel || channel.readyState !== "open") return;
    channel.send(JSON.stringify({
      type: "conversation.item.create",
      item: { type: "message", role: "user", content: [{ type: "input_text", text: content }] },
    }));
    channel.send(JSON.stringify({ type: "response.create" }));
    setMessages((current) => [...current, { role: "user", content }]);
    setDraft("");
    setPhase("thinking");
  }, [draft]);

  const statusClass = styles[`state_${phase}`] || styles.state_idle;

  return (
    <main className={styles.page}>
      <audio ref={assistantAudioRef} autoPlay playsInline className={styles.hiddenAudio} />
      <div className={styles.shell}>
        <header className={styles.header}>
          <a className={styles.brand} href="/" aria-label="Aegisora home">
            <span className={styles.brandMark}>A</span>
            <span>AEGISORA</span>
          </a>
          <div className={styles.headerMeta}><span className={styles.headerDot} /> AI ASSISTANT <span className={styles.headerDivider}>/</span> AERI</div>
        </header>

        <div className={styles.contentGrid}>
          <section className={styles.orbPanel} aria-label="Aeri assistant status">
            <div className={styles.eyebrow}><span className={styles.liveDot} /> AEGISORA INTELLIGENCE</div>
            <div className={`${styles.orbStage} ${statusClass}`}>
              <div className={styles.orbFallback} aria-hidden="true">
                <span className={styles.orbInner} />
                <span className={styles.orbContour} />
                <span className={styles.orbHighlight} />
              </div>
              <img
                src="/aeri/aeri-orb.png"
                alt=""
                aria-hidden="true"
                className={styles.orbArtwork}
                onError={(event) => { event.currentTarget.style.display = "none"; }}
              />
              <div className={styles.orbAura} aria-hidden="true" />
            </div>
            <h1 className={styles.aeriName}>Aeri<span className={styles.namePeriod}>.</span></h1>
            <p className={styles.tagline}>Your runtime security companion.</p>
            <div className={styles.statusPill} aria-live="polite">
              <span className={`${styles.statusDot} ${connected ? styles.statusOnline : ""}`} />
              {connected ? PHASE_LABELS[phase] : PHASE_LABELS[phase]}
            </div>
            <div className={styles.controls}>
              {!connected ? (
                <button type="button" className={styles.primaryButton} onClick={() => void startSession()} disabled={phase === "connecting"}>
                  <span className={styles.buttonIcon}>{phase === "connecting" ? "◌" : "◖"}</span>
                  {phase === "connecting" ? "Connecting…" : "Start voice"}
                </button>
              ) : (
                <>
                  <button type="button" className={styles.secondaryButton} onClick={toggleMute}>
                    {muted ? "Unmute microphone" : "Mute microphone"}
                  </button>
                  <button type="button" className={styles.primaryButton} onClick={stopSession}>End session</button>
                </>
              )}
            </div>
            <p className={styles.privacyNote}><span aria-hidden="true">◇</span> Microphone access is requested only when you start a session.</p>
            {errorMessage ? <div className={styles.errorNotice} role="alert">{errorMessage}</div> : null}
          </section>

          <section className={styles.chatPanel} aria-label="Aeri conversation">
            <div className={styles.chatHeader}>
              <div><h2>Conversation</h2><p>Talk naturally or send a message.</p></div>
              <span className={styles.chatBadge}>BETA</span>
            </div>
            <div className={styles.messages} aria-live="polite" aria-relevant="additions text">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`${styles.message} ${message.role === "user" ? styles.userMessage : styles.assistantMessage}`}>
                  <span className={styles.messageRole}>{message.role === "user" ? "YOU" : "AERI"}</span>
                  <p>{message.content}</p>
                </div>
              ))}
              {liveTranscript ? <div className={`${styles.message} ${styles.assistantMessage}`}><span className={styles.messageRole}>AERI</span><p>{liveTranscript}</p></div> : null}
              {phase === "thinking" ? <div className={styles.thinkingLine}><span /> Aeri is thinking</div> : null}
            </div>
            <form className={styles.composer} onSubmit={sendText}>
              <label className={styles.srOnly} htmlFor="aeri-message">Message Aeri</label>
              <input id="aeri-message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={connected ? "Ask Aeri something…" : "Start a voice session to chat…"} disabled={!connected} maxLength={2000} />
              <button type="submit" disabled={!connected || !draft.trim()} aria-label="Send message">↑</button>
            </form>
            <p className={styles.chatFootnote}>Aeri can explain security concepts. Runtime data integrations and action tools must be explicitly authorized before production use.</p>
          </section>
        </div>
        <footer className={styles.footer}><span>AEGISORA</span><span>SECURE BY DESIGN <i>·</i> AERI PREVIEW</span></footer>
      </div>
    </main>
  );
}