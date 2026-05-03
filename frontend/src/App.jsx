import { useState, useRef, useEffect } from "react"
import MessageBubble from "./components/MessageBubble"
import TypingIndicator from "./components/TypingIndicator"
import "./index.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const LOCATIONS = ["Any Location", "Whitefield", "Hebbal", "Indiranagar", "Koramangala", "Sarjapur Road", "Kanakapura Road", "Bannerghatta Road", "Devanahalli", "Electronic City"]
const TYPES = ["Any Type", "Flat", "Villa", "Plot"]
const BUDGETS = ["Any Budget", "Under 50 Lakhs", "50L - 1 Crore", "1Cr - 2Cr", "Above 2 Crore"]

const WELCOME = {
  role: "assistant",
  content: "Namaste! 🙏 I'm Riya, your personal property advisor at RAW Real Estate.\n\nLooking for a flat, villa, or plot in Bangalore? Use the filters above or just ask me anything!"
}

export default function App() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [leadCaptured, setLeadCaptured] = useState(false)
  const [type, setType] = useState("Any Type")
  const [location, setLocation] = useState("Any Location")
  const [budget, setBudget] = useState("Any Budget")
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const userText = text || input.trim()
    if (!userText || loading) return

    const userMsg = { role: "user", content: userText }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })
      if (!res.ok) throw new Error("Server error")
      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }])
      if (data.lead_captured) setLeadCaptured(true)
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again 🙏"
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleSearch = () => {
    const parts = []
    if (type !== "Any Type") parts.push(type + "s")
    if (location !== "Any Location") parts.push("in " + location)
    if (budget !== "Any Budget") parts.push("budget " + budget)
    const query = parts.length > 0
      ? "Show me " + parts.join(" ")
      : "Show me all available properties"
    sendMessage(query)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectStyle = {
    background: "var(--dark-3)",
    border: "1px solid var(--dark-4)",
    color: "var(--text-primary)",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    flex: 1,
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
  }

  return (
    <div style={{ background: "var(--dark)", height: "100dvh", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{
        background: "var(--dark-2)",
        borderBottom: "1px solid var(--dark-4)",
        padding: "12px 16px",
        flexShrink: 0
      }}>
        {/* Top row - logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "var(--gold)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700, fontSize: 13, color: "var(--dark)", flexShrink: 0
          }}>RAW</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700 }}
              className="logo-text">RAW Real Estate</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4CAF50", display: "inline-block" }}></span>
              Riya is online · Bangalore
            </div>
          </div>
        </div>

        {/* Filter row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "var(--gold)", pointerEvents: "none", fontSize: 10 }}>▼</span>
          </div>
          <div style={{ position: "relative", flex: 1 }}>
            <select value={location} onChange={e => setLocation(e.target.value)} style={selectStyle}>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "var(--gold)", pointerEvents: "none", fontSize: 10 }}>▼</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <select value={budget} onChange={e => setBudget(e.target.value)} style={selectStyle}>
              {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "var(--gold)", pointerEvents: "none", fontSize: 10 }}>▼</span>
          </div>
          <button onClick={handleSearch} disabled={loading} style={{
            background: "var(--gold)",
            color: "var(--dark)",
            border: "none",
            borderRadius: 10,
            padding: "8px 20px",
            fontWeight: 700,
            fontSize: 13,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            flexShrink: 0,
            opacity: loading ? 0.6 : 1
          }}>
            🔍 Search
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "16px 16px 8px",
        display: "flex", flexDirection: "column"
      }}>
        {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
        {loading && <TypingIndicator />}
        {leadCaptured && (
          <div className="msg-animate" style={{
            textAlign: "center", padding: "10px 16px", margin: "8px 0",
            background: "rgba(201,168,76,0.1)", borderRadius: 12,
            border: "1px solid rgba(201,168,76,0.3)",
            fontSize: 13, color: "var(--gold)"
          }}>
            ✅ Our team will reach out to you shortly!
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "10px 16px 14px",
        background: "var(--dark-2)",
        borderTop: "1px solid var(--dark-4)",
        flexShrink: 0
      }}>
        <div style={{
          display: "flex", gap: 8, alignItems: "flex-end",
          background: "var(--dark-3)",
          border: "1px solid var(--dark-4)",
          borderRadius: 14, padding: "8px 8px 8px 14px"
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Or type your question here..."
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "var(--text-primary)", fontSize: 14, resize: "none",
              fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
              maxHeight: 80, outline: "none"
            }}
            onInput={e => {
              e.target.style.height = "auto"
              e.target.style.height = e.target.scrollHeight + "px"
            }}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
            width: 36, height: 36, borderRadius: 9, border: "none",
            background: loading || !input.trim() ? "var(--dark-4)" : "var(--gold)",
            color: loading || !input.trim() ? "var(--text-muted)" : "var(--dark)",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.2s", fontWeight: 700, fontSize: 17
          }}>↑</button>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
          RAW Real Estate · Bangalore
        </p>
      </div>
    </div>
  )
}
