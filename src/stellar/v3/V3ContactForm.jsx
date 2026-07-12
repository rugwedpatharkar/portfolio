/*
 * V3ContactForm — the send-a-message form for the v3 Contact stop. Matches v3's
 * hairline/mono/serif aesthetic: no borders except accent underlines, JetBrains
 * Mono labels, Fraunces-inspired inputs. Uses the same EmailJS pipeline the v2
 * Contact form uses (contactContent copy + env-var config). Reduced-motion safe;
 * success/error states inline (no toast dep). Ships alongside the outbound-link
 * accordion — form on top, links below — so both paths work.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import emailjs from "@emailjs/browser";
import { motion, useReducedMotion } from "motion/react";
import { contactContent, personalInfo } from "../../content";
import { EASE as ease } from "./anim";

/* Hold-to-confirm duration and the sequence of tickered labels shown
   while the request is in flight. Per the taste-stack table:
   "Send button has a hold-to-confirm interaction (clip-path inset
   fills left-to-right over 400ms while pressed); transmit label
   animates a mono ticker on submit." */
const HOLD_DURATION_MS = 600;
const TICKER_INTERVAL_MS = 220;
const TICKER_STATES = ["TX", "RELAY", "ACK"];

export default function V3ContactForm() {
  const reduce = useReducedMotion();
  const [topic, setTopic] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ state: "idle", note: "" }); // idle | sending | sent | error
  const remaining = contactContent.msgLimit - form.message.length;

  /* Hold-to-confirm state. `holdProgress` in [0, 1] drives the clip-path
     fill on the Send button; when it hits 1 we `requestSubmit()` the form
     which runs normal validation + the submit handler below. */
  const [holdProgress, setHoldProgress] = useState(0);
  const [tickerLabel, setTickerLabel] = useState(null);
  const rafRef = useRef(null);
  const formRef = useRef(null);

  /* Ticker: while the request is in flight, mono-cycle through
     TX ▸ RELAY ▸ ACK on the button label. Stops when status leaves
     "sending". */
  useEffect(() => {
    if (status.state !== "sending") { setTickerLabel(null); return; }
    let i = 0;
    setTickerLabel(TICKER_STATES[0]);
    const id = setInterval(() => {
      i = (i + 1) % TICKER_STATES.length;
      setTickerLabel(TICKER_STATES[i]);
    }, TICKER_INTERVAL_MS);
    return () => clearInterval(id);
  }, [status.state]);

  /* After a successful send, drop back to idle so the send button re-enables and
     the visitor can send another message (the form is already cleared on success).
     Without this, isDone stayed true forever and the form was one-shot. */
  useEffect(() => {
    if (status.state !== "sent") return undefined;
    const t = setTimeout(() => setStatus({ state: "idle", note: "" }), 5000);
    return () => clearTimeout(t);
  }, [status.state]);

  const cancelHold = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setHoldProgress(0);
  }, []);

  const beginHold = useCallback(() => {
    if (reduce || status.state === "sending" || status.state === "sent") return;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / HOLD_DURATION_MS, 1);
      setHoldProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        formRef.current?.requestSubmit();
        /* Reset immediately — the submit handler owns the "sending"
           visual state from here on. */
        setHoldProgress(0);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [reduce, status.state]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const setField = (key) => (e) => {
    const v = e.target.value;
    if (key === "message" && v.length > contactContent.msgLimit) return;
    setForm((f) => ({ ...f, [key]: v }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (status.state === "sending") return;
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({ state: "error", note: "Fill your name, email, and message." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setStatus({ state: "error", note: "That email doesn't look right." });
      return;
    }
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    const toEmail = import.meta.env.VITE_EMAILJS_TO_EMAIL;
    if (!serviceId || !templateId || !publicKey || !toEmail) {
      setStatus({ state: "error", note: "Email isn't configured — try the links below." });
      return;
    }
    setStatus({ state: "sending", note: "" });
    emailjs
      .send(serviceId, templateId, {
        from_name: form.name,
        to_name: personalInfo.fullName,
        from_email: form.email,
        to_email: toEmail,
        message: `[${topic || "General"}] ${form.message}`,
      }, publicKey)
      .then(
        () => {
          setStatus({ state: "sent", note: contactContent.successMessage });
          setForm({ name: "", email: "", message: "" });
          setTopic("");
        },
        () => setStatus({ state: "error", note: "Something went wrong. Try the links below." }),
      );
  };

  const applyTemplate = (t) => {
    setTopic(t);
    if (!form.message.trim()) setForm((f) => ({ ...f, message: contactContent.msgTemplates?.[t] || "" }));
  };

  const inputStyle = {
    all: "unset", width: "100%", boxSizing: "border-box",
    font: "400 .95rem var(--v3-font-ui)",
    color: "var(--v3-fg)", padding: "10px 2px 8px",
    borderBottom: "1px solid var(--v3-line)",
    transition: "border-color .2s",
  };
  const label = {
    font: "400 11px var(--v3-font-mono)",
    letterSpacing: ".18em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
    marginBottom: 5, display: "block",
  };
  const chip = (on) => ({
    all: "unset", cursor: "pointer",
    font: "400 11px var(--v3-font-mono)",
    letterSpacing: ".1em", textTransform: "uppercase",
    color: on ? "var(--v3-bg-void)" : "var(--v3-fg-dim)",
    background: on ? "var(--v3-accent)" : "transparent",
    border: `1px solid ${on ? "transparent" : "var(--v3-line-strong)"}`,
    borderRadius: 999, padding: "6px 12px",
    transition: "all .18s",
  });
  const isDone = status.state === "sent";

  return (
    <motion.form
      ref={formRef}
      onSubmit={submit}
      aria-label="Contact form"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      style={{
        display: "flex", flexDirection: "column", gap: 12,
        marginTop: 6, marginBottom: 6,
        /* Fill the parent panel now that the side-by-side layout means
           there's real vertical space to consume — the message row
           grows to fill remaining vertical below chips + fields + button. */
        flex: 1, minHeight: 0,
      }}
    >
      {/* Topic chips */}
      <div>
        <span style={label}>What's this about?</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 6 }}>
          {contactContent.topics.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => applyTemplate(t.label)}
              style={chip(topic === t.label)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={label} htmlFor="v3-cname">Name</label>
          <input id="v3-cname" style={inputStyle} type="text" placeholder={contactContent.placeholders.name} value={form.name} onChange={setField("name")} required autoComplete="name" />
        </div>
        <div>
          <label style={label} htmlFor="v3-cemail">Email</label>
          <input id="v3-cemail" style={inputStyle} type="email" placeholder={contactContent.placeholders.email} value={form.email} onChange={setField("email")} required autoComplete="email" />
        </div>
      </div>

      {/* Message row — grows to fill remaining vertical of the form panel
          (side-by-side layout guarantees there's real space to consume).
          `flex: 1, minHeight: 0` chains from the form's own `flex: 1`. */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <label style={label} htmlFor="v3-cmsg">Message</label>
          <span style={{ font: "400 10px var(--v3-font-mono)", color: "var(--v3-fg-mute)" }}>{remaining}</span>
        </div>
        {/* Textarea styled with explicit properties instead of
            `...inputStyle` — that shared style opens with `all: unset`
            which resets `display` to `inline`. When `all: unset` and
            `display: block` are both in the SAME style object, React
            may serialize them in an order where `all` gets emitted
            AFTER `display`, wiping the block back to `inline` — and on
            an inline element `height` is silently ignored. Rendering
            with explicit properties (no `all: unset`) sidesteps the
            problem entirely and gives us the 120 px block we asked for. */}
        <textarea
          id="v3-cmsg"
          style={{
            display: "block",
            width: "100%",
            boxSizing: "border-box",
            /* `flex-shrink: 0` is the real fix. The parent chain
               (form → message row → …) uses `min-height: 0`
               everywhere, allowing every flex box to shrink below its
               content size to fit inside a constrained viewport. In
               that mode, a flex child's explicit `height: 120px` is
               NOT a floor — it's a suggestion that flex-shrink can
               override. Without `flex-shrink: 0`, the browser reduces
               the textarea to its `min-content` height (19 px = one
               line) whenever vertical space is tight, and the parent
               row collapses to 0 px height. Pinning `flex-shrink: 0`
               makes 120 px a floor. */
            /* Grows to fill the message-row's flex-column space; the
               minHeight is the floor. Removed `flex-shrink: 0` — now that
               the outer chain has real vertical to distribute, growing
               the textarea to `flex: 1` is what we want. */
            flex: 1,
            minHeight: 100,
            resize: "vertical",
            fontFamily: "var(--v3-font-ui)",
            fontSize: ".95rem",
            fontWeight: 400,
            lineHeight: 1.5,
            color: "var(--v3-fg)",
            background: "transparent",
            padding: "10px 2px 8px",
            border: "none",
            borderBottom: "1px solid var(--v3-line)",
            outline: "none",
            transition: "border-color .2s",
          }}
          placeholder={contactContent.placeholders.message}
          value={form.message}
          onChange={setField("message")}
          required
        />
      </div>

      {status.note && (
        <div role={status.state === "error" ? "alert" : "status"} style={{ font: "400 var(--v3-type-cap) var(--v3-font-mono)", color: status.state === "error" ? "#ff6b6b" : status.state === "sent" ? "#7fe9cf" : "var(--v3-fg-mute)" }}>{status.note}</div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "space-between", flexWrap: "wrap" }}>
        <span style={{ font: "400 var(--v3-type-cap) var(--v3-font-mono)", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>
          {reduce ? contactContent.responseTime : `${contactContent.responseTime} · Hold to send`}
        </span>
        {/* Hold-to-confirm send button. Under reduced motion this
            degrades to a normal `type="submit"` button — no hold
            required. Otherwise `type="button"` and hold handlers
            drive an accent clip-path fill that reveals the ACCENT
            background left-to-right over HOLD_DURATION_MS; releasing
            early snaps back over 200 ms via a CSS transition on the
            overlay. Completion calls formRef.current.requestSubmit()
            which triggers the same submit handler. */}
        <button
          type={reduce ? "submit" : "button"}
          disabled={status.state === "sending" || isDone}
          className="v3-press"
          onPointerDown={reduce ? undefined : beginHold}
          onPointerUp={reduce ? undefined : cancelHold}
          onPointerLeave={reduce ? undefined : cancelHold}
          onPointerCancel={reduce ? undefined : cancelHold}
          style={{
            position: "relative",
            font: "500 .9rem var(--v3-font-ui)", letterSpacing: ".01em",
            color: "var(--v3-accent)", background: "transparent",
            border: "1px solid var(--v3-accent)", borderRadius: 7,
            padding: "11px 22px",
            cursor: isDone ? "default" : "pointer",
            opacity: status.state === "sending" ? 0.85 : 1,
            overflow: "hidden",
            touchAction: "none",
            userSelect: "none",
            minWidth: "clamp(140px, 12vw, 180px)",
          }}
        >
          {/* Accent fill overlay — clip-path revealed left→right by
              holdProgress. When progress resets to 0, transition
              smooths the retract over 200 ms. */}
          <span
            aria-hidden
            style={{
              position: "absolute", inset: 0,
              background: "var(--v3-accent)",
              clipPath: `inset(0 ${100 - holdProgress * 100}% 0 0)`,
              transition: holdProgress === 0 ? "clip-path .2s var(--v3-ease-smooth)" : "none",
              pointerEvents: "none",
              boxShadow: holdProgress > 0.05 ? "0 0 18px color-mix(in oklab, var(--v3-accent) 45%, transparent)" : "none",
            }}
          />
          {/* Label sits above the fill. When the fill is fully drawn
              (progress > 0.65) the underlying text becomes the void
              color so it reads against the accent bg. */}
          <span style={{
            position: "relative",
            color: holdProgress > 0.65 || status.state === "sending" ? "var(--v3-bg-void)" : "var(--v3-accent)",
            transition: "color .18s",
            display: "inline-flex", alignItems: "center", gap: 8,
            fontVariantNumeric: "tabular-nums",
          }}>
            {status.state === "sending"
              ? (
                <>
                  <span aria-hidden style={{ fontFamily: "var(--v3-font-mono)", letterSpacing: ".2em" }}>{tickerLabel || "TX"}</span>
                  <span aria-hidden style={{ opacity: 0.6 }}>▸</span>
                  <span>{contactContent.sendingText}</span>
                </>
              )
              : isDone
                ? contactContent.sentText
                : contactContent.sendButton}
          </span>
        </button>
      </div>
    </motion.form>
  );
}
