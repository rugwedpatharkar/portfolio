/* eslint-disable react-refresh/only-export-components */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { slideIn, textVariant } from "../utils/motion";
import { personalInfo } from "../constants";
import { resume } from "../assets";
import { useToast } from "./Toast";
import TextScramble from "./TextScramble";

const ACCENT = "#915eff";
const MSG_LIMIT = 500;

const TOPICS = [
  { label: "Hiring", icon: "💼" },
  { label: "Freelance", icon: "🤝" },
  { label: "Collaboration", icon: "🚀" },
  { label: "Just saying hi", icon: "👋" },
];

const CONTACT_LINKS = [
  {
    label: "Email",
    value: personalInfo.email,
    href: `mailto:${personalInfo.email}`,
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    copyable: true,
  },
  {
    label: "GitHub",
    value: personalInfo.githubUsername,
    href: personalInfo.github,
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    value: "rugwed-patharkar",
    href: personalInfo.linkedin,
    icon: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

/* ── Contact Link Card ── */
const ContactLinkCard = ({ link }) => {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimerRef.current), []);

  const handleCopy = (e) => {
    if (!link.copyable) return;
    e.preventDefault();
    navigator.clipboard.writeText(link.value);
    setCopied(true);
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <a
      href={link.href}
      target={link.href.startsWith("mailto") ? undefined : "_blank"}
      rel="noopener noreferrer"
      onClick={link.copyable ? handleCopy : undefined}
      className="contact-link-card flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#915eff]/30 transition-all duration-300 group"
    >
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300"
        style={{ background: `${ACCENT}10`, color: ACCENT }}
      >
        {link.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-white/40 text-micro sm:text-caption font-mono">
          {link.label}
        </div>
        <div className="text-white text-caption sm:text-body-sm font-mono truncate">
          {link.value}
        </div>
      </div>
      {link.copyable && (
        <span className="text-micro font-mono text-white/20 group-hover:text-[#00cea8] transition-colors shrink-0">
          {copied ? "Copied!" : "Copy"}
        </span>
      )}
    </a>
  );
};

/* ── Input Field with focus glow + validation ── */
const FormField = ({ label, name, type = "text", value, onChange, placeholder, disabled, isTextarea, maxLength }) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const isEmail = name === "email";
  const isValid = isEmail
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    : value.trim().length > 0;

  const InputTag = isTextarea ? "textarea" : "input";

  return (
    <div className="relative">
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-body-sm sm:text-body font-medium transition-colors duration-300 ${
            focused ? "text-[#915eff]" : "text-white"
          }`}
        >
          {label}
        </span>
        {/* Validation indicator */}
        {hasValue && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`text-caption ${isValid ? "text-[#00cea8]" : "text-[#ff6b6b]"}`}
          >
            {isValid ? "✓" : "✗"}
          </motion.span>
        )}
      </div>

      {/* Input with focus glow */}
      <div
        className="relative rounded-xl transition-shadow duration-300"
        style={{
          boxShadow: focused ? `0 0 0 1px ${ACCENT}40, 0 0 20px ${ACCENT}10` : "none",
        }}
      >
        <InputTag
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required
          aria-required="true"
          disabled={disabled}
          rows={isTextarea ? 5 : undefined}
          maxLength={maxLength}
          className="w-full glass-card py-3 sm:py-4 px-4 sm:px-6 placeholder:text-secondary/50 text-white rounded-xl outline-none font-medium text-body-sm sm:text-body disabled:opacity-50 resize-none transition-colors duration-300"
        />
      </div>

      {/* Character counter for textarea */}
      {isTextarea && maxLength && (
        <div className="flex justify-end mt-1.5">
          <span
            className={`font-mono text-micro ${
              value.length > maxLength * 0.9
                ? "text-[#ff6b6b]"
                : "text-white/20"
            }`}
          >
            {value.length} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

/* ── Live Email Preview ── */
const EmailPreview = ({ form, topic, sent }) => (
  <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
    {/* Email header chrome */}
    <div className="px-4 sm:px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
      </div>
      <span className="text-white/30 text-micro sm:text-caption font-mono ml-2">
        New Message
      </span>
    </div>

    {/* Email fields */}
    <div className="px-4 sm:px-5 py-3 space-y-2 border-b border-white/[0.06] font-mono text-caption sm:text-body-sm">
      <div className="flex gap-3">
        <span className="text-white/25 w-12 shrink-0">From:</span>
        <span className={form.email ? "text-white/70" : "text-white/20"}>
          {form.email || "your@email.com"}
        </span>
      </div>
      <div className="flex gap-3">
        <span className="text-white/25 w-12 shrink-0">To:</span>
        <span className="text-white/70">{personalInfo.email}</span>
      </div>
      <div className="flex gap-3">
        <span className="text-white/25 w-12 shrink-0">Subj:</span>
        <span className={topic ? "text-white/70" : "text-white/20"}>
          {topic ? `${topic} — from ${form.name || "..."}` : "Select a topic..."}
        </span>
      </div>
    </div>

    {/* Email body */}
    <div className="px-4 sm:px-5 py-4 flex-1 font-mono text-caption sm:text-body-sm">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full gap-3 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-14 h-14 rounded-full bg-[#00cea8]/10 flex items-center justify-center"
            >
              <svg className="w-7 h-7 text-[#00cea8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <span className="text-[#00cea8] text-body-sm font-mono">Message sent!</span>
            <span className="text-white/30 text-caption">I'll get back to you soon.</span>
          </motion.div>
        ) : (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {form.message ? (
              <div className="text-white/60 leading-relaxed whitespace-pre-wrap break-words">
                {form.message}
                <span className="contact-cursor inline-block ml-0.5 text-[#915eff]">|</span>
              </div>
            ) : (
              <span className="text-white/20 italic">
                Start typing to see preview...
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Footer */}
    <div className="px-4 sm:px-5 py-2.5 border-t border-white/[0.06] flex items-center justify-between">
      <span className="text-white/20 text-micro font-mono">
        {form.message.length > 0 ? `${form.message.length} chars` : ""}
      </span>
      <span className="text-white/20 text-micro font-mono">
        Cmd+Enter to send
      </span>
    </div>
  </div>
);

/* ── Main Contact Component ── */
const Contact = () => {
  const formRef = useRef(null);
  const toast = useToast();
  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem("contact-form");
      return saved ? JSON.parse(saved) : { name: "", email: "", message: "" };
    } catch {
      return { name: "", email: "", message: "" };
    }
  });
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  /* Persist form to sessionStorage */
  useEffect(() => {
    try {
      sessionStorage.setItem("contact-form", JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (sent) setSent(false);
  };

  const handleSubmit = useCallback(
    (e) => {
      if (e) e.preventDefault();
      if (loading) return;

      if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
        toast("Please fill in all fields.", "warning");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        toast("Please enter a valid email address.", "warning");
        return;
      }

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      const toEmail = import.meta.env.VITE_EMAILJS_TO_EMAIL;

      if (!serviceId || !templateId || !publicKey || !toEmail) {
        toast("Email service is not configured.", "error");
        return;
      }

      setLoading(true);

      emailjs
        .send(
          serviceId,
          templateId,
          {
            from_name: form.name,
            to_name: "Rugwed Patharkar",
            from_email: form.email,
            to_email: toEmail,
            message: `[${topic || "General"}] ${form.message}`,
          },
          publicKey
        )
        .then(
          () => {
            setLoading(false);
            setSent(true);
            toast("Message sent! I'll get back to you soon.", "success");
            setForm({ name: "", email: "", message: "" });
            setTopic("");
            try {
              sessionStorage.removeItem("contact-form");
            } catch {
              /* ignore */
            }
          },
          () => {
            setLoading(false);
            toast("Something went wrong. Please try again.", "error");
          }
        );
    },
    [form, topic, loading, toast]
  );

  /* Cmd/Ctrl + Enter to submit */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        handleSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSubmit]);

  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Get in Touch</p>
        <TextScramble text="Contact" as="h2" className={styles.sectionHeadText} />
      </motion.div>

      <div className="mt-8 sm:mt-12 flex flex-col xl:flex-row gap-6 sm:gap-8">
        {/* ── Left: Info + Form ── */}
        <motion.div
          variants={slideIn("left", "tween", 0.2, 1)}
          className="flex-1 space-y-6"
        >
          {/* Availability + Response time */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00cea8]/10 border border-[#00cea8]/20">
              <span className="w-2 h-2 rounded-full bg-[#00cea8] contact-pulse" />
              <span className="text-[#00cea8] text-micro sm:text-caption font-mono">
                {personalInfo.availability}
              </span>
            </span>
            <span className="text-white/25 text-micro sm:text-caption font-mono">
              Responds within 24h
            </span>
          </div>

          {/* Contact links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CONTACT_LINKS.map((link) => (
              <ContactLinkCard key={link.label} link={link} />
            ))}
          </div>

          {/* Location + Resume CTA */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-white/30 text-caption sm:text-body-sm font-mono">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
              </svg>
              {personalInfo.location}
            </div>
            <a
              href={resume}
              download="Rugwed-Patharkar-Resume.pdf"
              className="flex items-center gap-1.5 text-[#915eff]/70 hover:text-[#915eff] text-caption sm:text-body-sm font-mono transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Resume
            </a>
          </div>

          {/* Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="glass-card rounded-2xl p-5 sm:p-7 space-y-5"
            style={{ borderColor: `${ACCENT}10` }}
          >
            {/* Topic selector */}
            <div>
              <span className="text-white font-medium text-body-sm sm:text-body block mb-2">
                What's this about?
              </span>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setTopic(topic === t.label ? "" : t.label)}
                    className={`px-3 py-1.5 rounded-full font-mono text-micro sm:text-caption border transition-all duration-300 ${
                      topic === t.label
                        ? "bg-[#915eff]/15 border-[#915eff]/40 text-[#915eff]"
                        : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/15"
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                label="Your Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={loading}
              />
              <FormField
                label="Your Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                disabled={loading}
              />
            </div>

            {/* Message */}
            <FormField
              label="Your Message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell me about your project or just say hi..."
              disabled={loading}
              isTextarea
              maxLength={MSG_LIMIT}
            />

            {/* Submit button */}
            <div className="flex items-center justify-between gap-4">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                className="contact-send-btn flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl font-bold text-body-sm sm:text-body transition-all duration-300 disabled:opacity-50"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </motion.span>
                  ) : sent ? (
                    <motion.span
                      key="sent"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-[#00cea8]"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Sent!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      Send Message
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <span className="hidden sm:block text-white/20 text-micro font-mono">
                Cmd+Enter
              </span>
            </div>
          </form>
        </motion.div>

        {/* ── Right: Live Email Preview ── */}
        <motion.div
          variants={slideIn("right", "tween", 0.2, 1)}
          className="xl:flex-1 xl:max-w-[440px] hidden md:block"
        >
          <div className="sticky top-28">
            <EmailPreview form={form} topic={topic} sent={sent} />
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SectionWrapper(Contact, "contact");
