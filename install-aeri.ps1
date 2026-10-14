$ErrorActionPreference = 'Stop'

# Aeri installer for the existing Aegisora website4 Next.js app.
# Run from C:\AI\AEGISORA\website4. Existing target files are backed up before replacement.

$Root = (Get-Location).Path.TrimEnd('\')
if (-not (Test-Path (Join-Path $Root 'package.json'))) {
    $FallbackRoot = 'C:\AI\AEGISORA\website4'
    if (Test-Path (Join-Path $FallbackRoot 'package.json')) {
        $Root = $FallbackRoot
    }
    else {
        Write-Host 'ERROR: package.json was not found. Open PowerShell in C:\AI\AEGISORA\website4 and run this script again.' -ForegroundColor Red
        return
    }
}

$AppRoot = $null
$AppCandidates = @((Join-Path $Root 'src\app'), (Join-Path $Root 'app'))
foreach ($Candidate in $AppCandidates) {
    if ((Test-Path $Candidate) -and ((Test-Path (Join-Path $Candidate 'layout.tsx')) -or (Test-Path (Join-Path $Candidate 'layout.jsx')) -or (Test-Path (Join-Path $Candidate 'page.tsx')) -or (Test-Path (Join-Path $Candidate 'page.jsx')))) {
        $AppRoot = $Candidate
        break
    }
}
if (-not $AppRoot) {
    foreach ($Candidate in $AppCandidates) {
        if (Test-Path $Candidate) { $AppRoot = $Candidate; break }
    }
}
if (-not $AppRoot) {
    Write-Host 'ERROR: Could not find the existing Next.js app directory (src/app or app). No files were written.' -ForegroundColor Red
    return
}

$Timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$BackupRoot = Join-Path $Root ("backups\aeri-preinstall-" + $Timestamp)
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Write-AeriFile {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )
    $Parent = Split-Path -Parent $Path
    if (-not (Test-Path $Parent)) { New-Item -ItemType Directory -Path $Parent -Force | Out-Null }
    if (Test-Path $Path) {
        $Relative = $Path.Substring($Root.Length).TrimStart('\')
        $BackupPath = Join-Path $BackupRoot $Relative
        $BackupParent = Split-Path -Parent $BackupPath
        if (-not (Test-Path $BackupParent)) { New-Item -ItemType Directory -Path $BackupParent -Force | Out-Null }
        Copy-Item -LiteralPath $Path -Destination $BackupPath -Force
        Write-Host ("Backup: " + $Relative) -ForegroundColor DarkYellow
    }
    [System.IO.File]::WriteAllText($Path, $Content, $Utf8NoBom)
    Write-Host ("Wrote: " + $Path.Substring($Root.Length).TrimStart('\')) -ForegroundColor Green
}

# Detect whether this app uses a top-level root layout or a locale segment as its root layout.
$HasTopLevelLayout = (Test-Path (Join-Path $AppRoot 'layout.tsx')) -or (Test-Path (Join-Path $AppRoot 'layout.jsx'))
$LocaleRoot = $null
if (-not $HasTopLevelLayout) {
    $LocaleCandidates = Get-ChildItem -LiteralPath $AppRoot -Directory -ErrorAction SilentlyContinue | Where-Object {
        ($_.Name -match '^\[[^\]]+\]$') -and ((Test-Path (Join-Path $_.FullName 'layout.tsx')) -or (Test-Path (Join-Path $_.FullName 'layout.jsx')))
    }
    if ($LocaleCandidates) { $LocaleRoot = $LocaleCandidates[0].FullName }
}
if ($LocaleRoot) {
    $PageDir = Join-Path $LocaleRoot 'aeri'
}
else {
    $PageDir = Join-Path $AppRoot 'aeri'
}
$ApiDir = Join-Path $AppRoot 'api\aeri\token'
$ComponentDir = Join-Path $Root 'components\aeri'
$PublicAeriDir = Join-Path $Root 'public\aeri'

# Use a relative import, so the route does not depend on a particular tsconfig alias.
$PageRelative = $PageDir.Substring($Root.Length).TrimStart('\')
$PageSegments = @($PageRelative -split '[\\/]+' | Where-Object { $_ -ne '' })
$UpPrefix = ('../' * $PageSegments.Count)
$ComponentImport = $UpPrefix + 'components/aeri/aeri-assistant'

$OrbTsx = @'
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
'@

$Css = @'
.page {
  --aeri-bg: #080d17;
  --aeri-panel: rgba(14, 22, 38, .78);
  --aeri-border: rgba(139, 164, 205, .15);
  --aeri-text: #edf5ff;
  --aeri-muted: #8b9bb4;
  --aeri-blue: #2588ff;
  --aeri-cyan: #83f0ff;
  min-height: 100vh;
  color: var(--aeri-text);
  background: radial-gradient(ellipse at 22% 17%, rgba(20, 86, 176, .15), transparent 35%), radial-gradient(ellipse at 85% 85%, rgba(14, 84, 144, .11), transparent 34%), var(--aeri-bg);
  padding: 0 clamp(18px, 4vw, 64px);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.shell { max-width: 1440px; min-height: 100vh; margin: 0 auto; display: flex; flex-direction: column; }
.header { height: 76px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(150, 176, 214, .12); }
.brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: #f3f8ff; font-size: 12px; font-weight: 750; letter-spacing: .17em; }
.brandMark { display: grid; place-items: center; width: 27px; height: 27px; border: 1px solid rgba(91, 183, 255, .62); border-radius: 9px; color: #79dfff; font-size: 15px; letter-spacing: 0; box-shadow: inset 0 0 16px rgba(45, 144, 255, .13); }
.headerMeta { display: flex; align-items: center; gap: 9px; color: #8fa3c0; font-size: 10px; font-weight: 700; letter-spacing: .15em; }
.headerDot, .liveDot, .statusDot { display: inline-block; border-radius: 50%; width: 6px; height: 6px; background: #54dafa; box-shadow: 0 0 10px rgba(84, 218, 250, .6); }
.headerDivider { color: #3f536f; }
.contentGrid { flex: 1; display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(360px, .95fr); gap: clamp(32px, 6vw, 100px); align-items: center; padding: 42px 0 38px; }
.orbPanel { display: flex; align-items: center; flex-direction: column; text-align: center; min-width: 0; }
.eyebrow { display: inline-flex; align-items: center; gap: 9px; color: #9ab1d0; font-size: 10px; letter-spacing: .19em; font-weight: 750; }
.liveDot { width: 5px; height: 5px; }
.orbStage { position: relative; width: min(100%, 380px); aspect-ratio: 1; display: grid; place-items: center; isolation: isolate; margin: 14px auto 0; }
.orbFallback { position: absolute; width: 69%; height: 69%; border-radius: 50%; overflow: hidden; background: radial-gradient(circle at 37% 30%, rgba(180, 245, 255, .98) 0, rgba(72, 213, 255, .96) 7%, rgba(16, 129, 255, .97) 26%, rgba(14, 67, 201, .96) 49%, rgba(4, 23, 91, .99) 70%, #071226 100%); border: 1px solid rgba(148, 238, 255, .8); box-shadow: inset -17px -18px 34px rgba(0, 8, 55, .82), inset 12px 12px 26px rgba(135, 233, 255, .44), 0 0 36px rgba(18, 122, 255, .28), 0 0 100px rgba(10, 120, 255, .16); animation: orbFloat 6s ease-in-out infinite, orbBreath 4.4s ease-in-out infinite; }
.orbFallback::before { content: ""; position: absolute; inset: 7% 5% 7% 8%; border-radius: 46% 54% 58% 42% / 48% 43% 57% 52%; border: 1px solid rgba(177, 247, 255, .48); transform: rotate(-25deg); box-shadow: inset 0 0 24px rgba(104, 226, 255, .21), 0 0 16px rgba(91, 226, 255, .13); }
.orbFallback::after { content: ""; position: absolute; inset: 3% 1% auto 13%; height: 38%; border-radius: 50%; background: linear-gradient(165deg, rgba(224, 255, 255, .73), rgba(103, 205, 255, .1) 38%, transparent 66%); filter: blur(7px); transform: rotate(-17deg); }
.orbInner { position: absolute; width: 58%; height: 48%; left: 21%; top: 26%; border-radius: 50%; background: radial-gradient(ellipse, rgba(174, 249, 255, .98), rgba(75, 213, 255, .52) 26%, rgba(22, 134, 255, .1) 70%, transparent); filter: blur(9px); animation: corePulse 3.1s ease-in-out infinite; }
.orbContour { position: absolute; z-index: 2; width: 90%; height: 42%; left: 2%; top: 33%; border: 2px solid rgba(118, 239, 255, .88); border-top-color: rgba(170, 251, 255, .12); border-right-color: rgba(94, 208, 255, .8); border-radius: 50%; transform: rotate(-32deg); filter: drop-shadow(0 0 5px rgba(99, 235, 255, .86)); clip-path: inset(0 0 0 8%); }
.orbHighlight { position: absolute; z-index: 3; width: 30%; height: 8%; left: 17%; top: 12%; border-radius: 50%; background: rgba(213, 253, 255, .66); filter: blur(11px); transform: rotate(-35deg); }
.orbArtwork { position: absolute; z-index: 4; width: 100%; height: 100%; object-fit: contain; mix-blend-mode: screen; filter: drop-shadow(0 0 22px rgba(18, 125, 255, .2)); animation: orbFloat 6s ease-in-out infinite; }
.orbAura { position: absolute; z-index: -1; width: 82%; height: 82%; border-radius: 50%; background: radial-gradient(circle, rgba(7, 124, 255, .23), rgba(19, 96, 206, .09) 40%, transparent 70%); filter: blur(15px); animation: auraBreathe 4s ease-in-out infinite; }
.state_listening .orbFallback, .state_listening .orbArtwork { filter: brightness(1.14) saturate(1.12) drop-shadow(0 0 24px rgba(64, 200, 255, .32)); }
.state_listening .orbContour { animation: contourFlow 2.3s ease-in-out infinite; }
.state_thinking .orbInner { animation-duration: 1.25s; }
.state_speaking .orbFallback { animation: orbFloat 6s ease-in-out infinite, speakPulse 1.1s ease-in-out infinite; }
.state_speaking .orbArtwork { animation: speakPulse 1.1s ease-in-out infinite; filter: brightness(1.2) drop-shadow(0 0 30px rgba(63, 206, 255, .4)); }
.state_speaking .orbAura { animation-duration: 1.1s; }
.state_error .orbFallback { filter: saturate(.7); }
.aeriName { margin: -5px 0 0; font-size: clamp(37px, 4vw, 49px); font-weight: 630; letter-spacing: -.055em; line-height: 1.05; }
.namePeriod { color: #5ad9ff; }
.tagline { margin: 10px 0 0; font-size: 14px; color: #91a4c0; }
.statusPill { margin-top: 21px; padding: 8px 12px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(136, 167, 207, .16); border-radius: 999px; color: #b2c2d8; background: rgba(17, 28, 47, .64); font-size: 11px; }
.statusDot { background: #8091aa; box-shadow: none; }
.statusOnline { background: #64e5bc; box-shadow: 0 0 10px rgba(100, 229, 188, .4); }
.controls { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
.primaryButton, .secondaryButton { display: inline-flex; min-height: 43px; align-items: center; justify-content: center; gap: 10px; border-radius: 12px; padding: 0 18px; border: 1px solid rgba(107, 193, 255, .45); color: #fff; cursor: pointer; font-size: 12px; font-weight: 700; transition: transform .18s ease, background .18s ease, border-color .18s ease; }
.primaryButton { background: linear-gradient(120deg, #1677ef, #159fe9); box-shadow: 0 8px 30px rgba(11, 117, 244, .18), inset 0 1px rgba(255,255,255,.2); }
.secondaryButton { border-color: rgba(140, 165, 201, .24); background: rgba(20, 31, 50, .82); color: #d7e6fb; }
.primaryButton:hover, .secondaryButton:hover { transform: translateY(-1px); }
.primaryButton:disabled, .secondaryButton:disabled { opacity: .55; cursor: wait; }
.buttonIcon { font-size: 17px; }
.privacyNote { margin: 16px 0 0; color: #72849f; font-size: 10px; line-height: 1.7; }
.privacyNote span { color: #58cee9; margin-right: 5px; }
.errorNotice { max-width: 420px; margin-top: 14px; border: 1px solid rgba(255, 142, 142, .25); border-radius: 10px; padding: 10px 12px; background: rgba(111, 27, 44, .18); color: #ffbbbb; font-size: 12px; line-height: 1.5; }
.chatPanel { min-height: 530px; max-height: 650px; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--aeri-border); border-radius: 22px; background: linear-gradient(155deg, rgba(17, 27, 45, .87), rgba(9, 16, 29, .9)); box-shadow: 0 24px 80px rgba(0, 0, 0, .2), inset 0 1px rgba(255, 255, 255, .025); }
.chatHeader { display: flex; justify-content: space-between; align-items: center; padding: 23px 24px 19px; border-bottom: 1px solid rgba(143, 169, 207, .11); }
.chatHeader h2 { margin: 0; font-size: 15px; font-weight: 650; letter-spacing: -.02em; }
.chatHeader p { margin: 6px 0 0; font-size: 11px; color: #8294af; }
.chatBadge { color: #84caff; border: 1px solid rgba(83, 168, 255, .25); border-radius: 6px; padding: 4px 6px; font-size: 9px; letter-spacing: .12em; }
.messages { flex: 1; min-height: 250px; overflow-y: auto; padding: 22px 24px; display: flex; flex-direction: column; gap: 17px; }
.message { max-width: 94%; }
.messageRole { display: block; margin-bottom: 7px; font-size: 9px; letter-spacing: .15em; font-weight: 800; color: #5e9fca; }
.message p { margin: 0; color: #d2deef; font-size: 12px; line-height: 1.75; white-space: pre-wrap; overflow-wrap: anywhere; }
.userMessage { align-self: flex-end; border: 1px solid rgba(75, 143, 233, .18); border-radius: 13px 13px 3px 13px; padding: 12px 14px; background: rgba(22, 75, 139, .22); }
.userMessage .messageRole { color: #86aef1; text-align: right; }
.assistantMessage { align-self: flex-start; border-left: 2px solid rgba(66, 194, 244, .6); padding: 3px 0 3px 13px; }
.thinkingLine { display: flex; align-items: center; gap: 9px; color: #8ca4c4; font-size: 11px; }
.thinkingLine span { width: 6px; height: 6px; border-radius: 50%; background: #67d9ff; box-shadow: 0 0 12px rgba(103, 217, 255, .6); animation: thinkingBlink 1s ease-in-out infinite; }
.composer { display: flex; gap: 9px; margin: 0 17px; padding: 8px 8px 8px 14px; border: 1px solid rgba(132, 158, 197, .18); background: rgba(5, 12, 23, .62); border-radius: 13px; }
.composer input { flex: 1; min-width: 0; outline: 0; border: 0; background: transparent; color: #e6f0ff; font: inherit; font-size: 12px; }
.composer input::placeholder { color: #61728d; }
.composer input:disabled { cursor: not-allowed; }
.composer button { width: 33px; height: 33px; border: 0; border-radius: 9px; background: #167eea; color: white; font-size: 21px; cursor: pointer; }
.composer button:disabled { opacity: .35; cursor: not-allowed; }
.chatFootnote { margin: 14px 21px 18px; color: #687a94; font-size: 9px; line-height: 1.65; }
.footer { display: flex; justify-content: space-between; align-items: center; padding: 18px 0 22px; border-top: 1px solid rgba(150, 176, 214, .1); color: #62748f; font-size: 9px; font-weight: 700; letter-spacing: .14em; }
.footer i { font-style: normal; color: #4bbde7; padding: 0 5px; }
.hiddenAudio, .srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; clip-path: inset(50%); }
@keyframes orbFloat { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(.4deg); } }
@keyframes orbBreath { 0%, 100% { scale: 1; } 50% { scale: 1.025; } }
@keyframes corePulse { 0%, 100% { opacity: .7; transform: scale(.92); } 50% { opacity: 1; transform: scale(1.1); } }
@keyframes auraBreathe { 0%, 100% { opacity: .58; transform: scale(.92); } 50% { opacity: 1; transform: scale(1.06); } }
@keyframes speakPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.035); } }
@keyframes contourFlow { 0%, 100% { opacity: .68; transform: rotate(-32deg) scale(.98); } 50% { opacity: 1; transform: rotate(-27deg) scale(1.02); } }
@keyframes thinkingBlink { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
@media (max-width: 960px) { .contentGrid { grid-template-columns: 1fr; gap: 26px; padding-top: 30px; } .orbStage { width: min(82vw, 350px); margin-top: 8px; } .chatPanel { min-height: 490px; max-height: 610px; } }
@media (max-width: 520px) { .page { padding: 0 15px; } .header { height: 64px; } .headerMeta { font-size: 8px; letter-spacing: .08em; } .contentGrid { padding-top: 24px; } .chatPanel { border-radius: 17px; } .chatHeader { padding: 19px 17px 16px; } .messages { padding: 18px 17px; } .composer { margin: 0 11px; } .chatFootnote { margin-right: 14px; margin-left: 14px; } .footer { font-size: 8px; letter-spacing: .08em; } }
@media (prefers-reduced-motion: reduce) { .orbFallback, .orbFallback::before, .orbFallback::after, .orbInner, .orbArtwork, .orbAura, .orbContour, .thinkingLine span { animation: none !important; transition: none !important; } .primaryButton, .secondaryButton { transition: none; } }
'@

$TokenRoute = @'
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AERI_INSTRUCTIONS = [
  "You are Aeri, the AI assistant built into Aegisora, an AI-agent runtime security and governance platform.",
  "Speak naturally, clearly, calmly, and concisely. Be friendly without being overfamiliar.",
  "Help explain agent runtime security, policy decisions, risk, execution evidence, and audit concepts.",
  "Do not claim to have inspected Aegisora workspace data unless a trusted server-side tool explicitly provides it.",
  "Do not invent policy results, audit evidence, security events, customers, or metrics.",
  "You cannot change policies, execute actions, approve requests, or bypass enforcement from conversation alone.",
  "For sensitive actions, require the application's explicit authorization and confirmation flow.",
  "When uncertain, say so plainly and recommend checking the relevant evidence in Aegisora.",
].join(" ");

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Aeri voice is not configured: OPENAI_API_KEY is missing on the server." }, { status: 503 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Aeri voice authentication is not configured: Supabase public URL/key is missing." }, { status: 503 });
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Some render contexts disallow cookie writes; auth is still verified below.
          }
        },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Sign in to Aegisora before starting an Aeri voice session." }, { status: 401 });
    }

    const safetyIdentifier = createHash("sha256").update(user.id).digest("hex");
    const config = {
      session: {
        type: "realtime",
        model: process.env.AERI_REALTIME_MODEL || "gpt-realtime-2.1",
        instructions: AERI_INSTRUCTIONS,
        audio: {
          input: { transcription: { model: "gpt-4o-mini-transcribe" } },
          output: { voice: process.env.AERI_REALTIME_VOICE || "marin" },
        },
      },
    };

    const openAIResponse = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Safety-Identifier": safetyIdentifier,
      },
      body: JSON.stringify(config),
      cache: "no-store",
    });

    const data = await openAIResponse.json().catch(() => ({})) as { value?: string; expires_at?: number; client_secret?: { value?: string; expires_at?: number } };
    if (!openAIResponse.ok) {
      console.error("Aeri Realtime client-secret request failed", { status: openAIResponse.status });
      return NextResponse.json({ error: "The voice provider could not create a session. Verify API access, model availability, and billing." }, { status: 502 });
    }

    const value = data.value ?? data.client_secret?.value;
    if (!value) {
      return NextResponse.json({ error: "The voice provider did not return a temporary session credential." }, { status: 502 });
    }

    return NextResponse.json({ value, expires_at: data.expires_at ?? data.client_secret?.expires_at }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Aeri session initialization failed", error instanceof Error ? error.name : "unknown_error");
    return NextResponse.json({ error: "Aeri could not initialize the voice session. Check the server logs." }, { status: 500 });
  }
}
'@

$Readme = @'
# Aeri preview setup

Aeri is added as a standalone page at `/aeri`. The initial release includes a CSS-animated blue orb, typed messages over an active Realtime voice session, microphone mute, disconnect, and a server route that creates an ephemeral Realtime credential only after the Supabase user is authenticated.

## Required server environment

- `OPENAI_API_KEY` — a server-side OpenAI API key. Never prefix it with `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_SUPABASE_URL` — the existing Aegisora Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — the existing public Supabase key.

Optional:
- `AERI_REALTIME_MODEL` — defaults to `gpt-realtime-2.1`; change it if that model is not enabled for the OpenAI project.
- `AERI_REALTIME_VOICE` — defaults to `marin`.

Add these to the local `.env.local` using your editor or your existing secrets manager. Do not paste secret API keys into chat, source code, or client-side variables. Restart the Next.js server after changing environment variables.

## Route and safety boundaries

- The page is available at `/aeri` (or under the app's locale-root route if the locale segment is configured as the root layout).
- `/api/aeri/token` requires a Supabase-authenticated user and returns a temporary Realtime credential. The permanent OpenAI key remains on the server.
- This preview is a conversational voice UI. It does not yet access workspace audit records, policies, or execution tools. Those integrations must be connected through existing server-side Aegisora authorization and workspace isolation before production use.
- Add a shared-store per-user rate limit before exposing voice sessions broadly in production. Do not treat an in-memory rate limit as sufficient for multi-instance hosting.

## First verification

1. Sign in to Aegisora.
2. Open `/aeri`.
3. Click **Start voice** and grant microphone access.
4. Say a short test phrase; confirm audio responses and the orb's speaking state.
5. Try mute, text send, and **End session**.
6. If the endpoint returns `401`, the page's Supabase session is not being recognized; check the existing auth cookies and environment configuration rather than disabling authentication.
'@

$Page = @'
import AeriAssistant from "__COMPONENT_IMPORT__";

export const metadata = {
  title: "Aeri | Aegisora",
  description: "Meet Aeri, Aegisora's runtime security assistant.",
};

export default function AeriPage() {
  return <AeriAssistant />;
}
'@
$Page = $Page.Replace('__COMPONENT_IMPORT__', $ComponentImport)

try {
    Write-AeriFile -Path (Join-Path $ComponentDir 'aeri-assistant.tsx') -Content $OrbTsx
    Write-AeriFile -Path (Join-Path $ComponentDir 'aeri.module.css') -Content $Css
    Write-AeriFile -Path (Join-Path $ApiDir 'route.ts') -Content $TokenRoute
    Write-AeriFile -Path (Join-Path $PageDir 'page.tsx') -Content $Page
    Write-AeriFile -Path (Join-Path $Root 'AERI_SETUP.md') -Content $Readme

    # If the exact orb PNG is available in common local folders, copy it into public/aeri.
    if (-not (Test-Path $PublicAeriDir)) { New-Item -ItemType Directory -Path $PublicAeriDir -Force | Out-Null }
    $AssetTarget = Join-Path $PublicAeriDir 'aeri-orb.png'
    $AssetCandidates = @(
        (Join-Path $Root 'Glowing Cyan Glass Orb-Photoroom.png'),
        (Join-Path $env:USERPROFILE 'Downloads\Glowing Cyan Glass Orb-Photoroom.png'),
        (Join-Path $env:USERPROFILE 'Desktop\Glowing Cyan Glass Orb-Photoroom.png')
    )
    $FoundAsset = $AssetCandidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
    if ($FoundAsset) {
        Copy-Item -LiteralPath $FoundAsset -Destination $AssetTarget -Force
        Write-Host 'Copied custom Aeri orb artwork to public\aeri\aeri-orb.png' -ForegroundColor Green
    }
    elseif (Test-Path $AssetTarget) {
        Write-Host 'Existing public\aeri\aeri-orb.png retained.' -ForegroundColor DarkCyan
    }
    else {
        Write-Host 'Custom PNG not found in project/Downloads/Desktop; the animated CSS orb fallback is ready. Copy your PNG to public\aeri\aeri-orb.png to use your exact artwork.' -ForegroundColor Yellow
    }

    # Append safe placeholders to .env.example if that file exists, without editing .env.local.
    $EnvExample = Join-Path $Root '.env.example'
    if (Test-Path $EnvExample) {
        $EnvText = Get-Content -LiteralPath $EnvExample -Raw
        if ($EnvText -notmatch '(?m)^OPENAI_API_KEY=') {
            $EnvAddition = @'

# Aeri voice preview (server-side only)
OPENAI_API_KEY=
AERI_REALTIME_MODEL=gpt-realtime-2.1
AERI_REALTIME_VOICE=marin
'@
            [System.IO.File]::AppendAllText($EnvExample, $EnvAddition, $Utf8NoBom)
            Write-Host 'Added Aeri placeholders to .env.example (no secret was written).' -ForegroundColor Green
        }
    }

    Write-Host ''
    Write-Host 'Aeri preview files are installed.' -ForegroundColor Green
    Write-Host ("App directory: " + $AppRoot.Substring($Root.Length).TrimStart('\')) -ForegroundColor Cyan
    Write-Host ("Page route: " + $PageDir.Substring($Root.Length).TrimStart('\') + '\page.tsx') -ForegroundColor Cyan
    Write-Host ("Backup folder (only if existing files were replaced): " + $BackupRoot) -ForegroundColor DarkCyan
    Write-Host ''
    Write-Host 'NEXT: Check AERI_SETUP.md and configure OPENAI_API_KEY in the existing .env.local without sharing it.' -ForegroundColor Yellow
    Write-Host 'Then verify in this project with: pnpm exec tsc --noEmit' -ForegroundColor Yellow
    Write-Host 'After fixing any type errors, run the existing website4 build command from package.json.' -ForegroundColor Yellow
}
catch {
    Write-Host ("Aeri installer stopped: " + $_.Exception.Message) -ForegroundColor Red
    Write-Host 'Review the files already written above and the backup folder before rerunning.' -ForegroundColor Yellow
}
