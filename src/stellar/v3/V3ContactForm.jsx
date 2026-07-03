/* eslint-disable jsx-a11y/no-autofocus */
/*
 * V3ContactForm — the send-a-message form for the v3 Contact stop. Matches v3's
 * hairline/mono/serif aesthetic: no borders except accent underlines, JetBrains
 * Mono labels, Fraunces-inspired inputs. Uses the same EmailJS pipeline the v2
 * Contact form uses (contactContent copy + env-var config). Reduced-motion safe;
 * success/error states inline (no toast dep). Ships alongside the outbound-link
 * accordion — form on top, links below — so both paths work.
 */
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { motion, useReducedMotion } from "motion/react";
import { contactContent, personalInfo } from "../../content";

const ease = [0.22, 1, 0.36, 1];

export default function V3ContactForm() {
  const reduce = useReducedMotion();
  const [topic, setTopic] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ state: "idle", note: "" }); // idle | sending | sent | error
  const remaining = contactContent.msgLimit - form.message.length;

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

  const useTemplate = (t) => {
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
    font: "400 var(--v3-type-cap) var(--v3-font-mono)",
    letterSpacing: ".14em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
    marginBottom: 4, display: "block",
  };
  const chip = (on) => ({
    all: "unset", cursor: "pointer",
    font: "400 var(--v3-type-cap) var(--v3-font-mono)",
    letterSpacing: ".1em", textTransform: "uppercase",
    color: on ? "var(--v3-bg-void)" : "var(--v3-fg-dim)",
    background: on ? "var(--v3-accent)" : "transparent",
    border: `1px solid ${on ? "transparent" : "var(--v3-line-strong)"}`,
    borderRadius: 999, padding: "5px 11px",
    transition: "all .18s",
  });
  const isDone = status.state === "sent";

  return (
    <motion.form
      onSubmit={submit}
      aria-label="Contact form"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      style={{
        display: "flex", flexDirection: "column", gap: 18,
        marginTop: 22, marginBottom: 26, paddingBottom: 24,
        borderBottom: "1px solid var(--v3-line)",
        /* Fill the parent panel so the message textarea can grow to consume
           the LEFT rail's remaining vertical space — otherwise the panel
           has awkward dead space below the Send button. */
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
              onClick={() => useTemplate(t.label)}
              style={chip(topic === t.label)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div>
          <label style={label} htmlFor="v3-cname">Name</label>
          <input id="v3-cname" style={inputStyle} type="text" placeholder={contactContent.placeholders.name} value={form.name} onChange={setField("name")} required autoComplete="name" />
        </div>
        <div>
          <label style={label} htmlFor="v3-cemail">Email</label>
          <input id="v3-cemail" style={inputStyle} type="email" placeholder={contactContent.placeholders.email} value={form.email} onChange={setField("email")} required autoComplete="email" />
        </div>
      </div>

      {/* Message row grows to fill the form's remaining vertical space so the
          panel doesn't have dead area below the Send button. */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <label style={label} htmlFor="v3-cmsg">Message</label>
          <span style={{ font: "400 10px var(--v3-font-mono)", color: "var(--v3-fg-mute)" }}>{remaining}</span>
        </div>
        <textarea
          id="v3-cmsg"
          style={{
            ...inputStyle,
            flex: 1, minHeight: 100, resize: "vertical", lineHeight: 1.5,
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
        <span style={{ font: "400 var(--v3-type-cap) var(--v3-font-mono)", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>{contactContent.responseTime}</span>
        <button
          type="submit"
          disabled={status.state === "sending" || isDone}
          className="v3-press"
          style={{
            font: "500 .9rem var(--v3-font-ui)", letterSpacing: ".01em",
            color: "var(--v3-bg-void)", background: "var(--v3-accent)",
            border: "1px solid transparent", borderRadius: 7,
            padding: "12px 22px", cursor: isDone ? "default" : "pointer",
            opacity: status.state === "sending" ? 0.7 : 1,
          }}
        >
          {status.state === "sending" ? contactContent.sendingText : isDone ? contactContent.sentText : contactContent.sendButton}
        </button>
      </div>
    </motion.form>
  );
}
