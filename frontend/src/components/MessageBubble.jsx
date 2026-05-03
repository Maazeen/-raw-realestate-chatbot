const PROPERTY_IMAGES = {
  "Flat": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80",
  "Villa": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80",
  "Plot": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80",
}

const LOCATION_IMAGES = {
  "Whitefield": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80",
  "Hebbal": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80",
  "Indiranagar": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80",
  "Koramangala": "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&q=80",
  "Sarjapur Road": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80",
  "Devanahalli": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80",
}

function getImage(text) {
  for (const [loc, img] of Object.entries(LOCATION_IMAGES)) {
    if (text.includes(loc)) return img
  }
  if (text.includes("Villa")) return PROPERTY_IMAGES["Villa"]
  if (text.includes("Plot")) return PROPERTY_IMAGES["Plot"]
  return PROPERTY_IMAGES["Flat"]
}

function PropertyCard({ text, onWhatsApp, onVisit }) {
  const image = getImage(text)
  const priceMatch = text.match(/₹[\d,]+/)
  const price = priceMatch ? priceMatch[0] : ""
  const bhkMatch = text.match(/\d BHK/)
  const bhk = bhkMatch ? bhkMatch[0] : ""

  return (
    <div className="property-card msg-animate" style={{ maxWidth: 280 }}>
      <img src={image} alt="Property"
        style={{ width: "100%", height: 140, objectFit: "cover" }}
        onError={e => e.target.style.display = "none"}
      />
      <div style={{ padding: "12px 14px" }}>
        <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>{text}</p>
        {(price || bhk) && (
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {bhk && <span style={{
              background: "var(--gold-pale)", color: "var(--gold)",
              borderRadius: 6, padding: "3px 8px", fontSize: 12, fontWeight: 600
            }}>{bhk}</span>}
            {price && <span style={{
              background: "var(--gold-pale)", color: "var(--gold)",
              borderRadius: 6, padding: "3px 8px", fontSize: 12, fontWeight: 600
            }}>{price}</span>}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button onClick={onVisit} style={{
            flex: 1, background: "var(--gold)", color: "white",
            border: "none", borderRadius: 8, padding: "7px 0",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif"
          }}>📅 Book Visit</button>
          <button onClick={onWhatsApp} style={{
            flex: 1, background: "#25D366", color: "white",
            border: "none", borderRadius: 8, padding: "7px 0",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif"
          }}>💬 WhatsApp</button>
        </div>
      </div>
    </div>
  )
}

function parseMessageParts(content) {
  const lines = content.split('\n')
  const parts = []
  let textBuffer = []

  for (const line of lines) {
    const isPropertyLine =
      (line.includes('BHK') || line.includes('Villa') || line.includes('Plot')) &&
      (line.includes('₹') || line.includes('sqft') || line.includes('Lakhs'))

    if (isPropertyLine) {
      if (textBuffer.length > 0) {
        parts.push({ type: 'text', content: textBuffer.join('\n').trim() })
        textBuffer = []
      }
      parts.push({ type: 'property', content: line.trim() })
    } else {
      textBuffer.push(line)
    }
  }

  if (textBuffer.length > 0) {
    parts.push({ type: 'text', content: textBuffer.join('\n').trim() })
  }

  return parts
}

export default function MessageBubble({ message, onBookVisit, onWhatsApp }) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className="msg-animate flex justify-end mb-3">
        <div style={{
          maxWidth: "75%", padding: "10px 16px",
          background: "var(--gold)", color: "white",
          borderRadius: "18px 18px 4px 18px",
          fontSize: 14, lineHeight: 1.5, fontWeight: 500
        }}>
          {message.content}
        </div>
      </div>
    )
  }

  const parts = parseMessageParts(message.content)
  const hasPropertyCard = parts.some(p => p.type === 'property')

  return (
    <div className="msg-animate flex justify-start mb-3" style={{ gap: 8 }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%",
        background: "var(--gold)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Playfair Display', serif",
        fontWeight: 700, fontSize: 12, color: "white",
        flexShrink: 0, marginTop: 2,
        boxShadow: "0 2px 8px rgba(201,168,76,0.4)"
      }}>R</div>

      <div style={{ maxWidth: "80%", display: "flex", flexDirection: "column", gap: 6 }}>
        {parts.map((part, i) => {
          if (part.type === 'property') {
            return (
              <PropertyCard
                key={i}
                text={part.content}
                onVisit={() => onBookVisit && onBookVisit(part.content)}
                onWhatsApp={() => onWhatsApp && onWhatsApp(part.content)}
              />
            )
          }
          if (!part.content) return null
          return (
            <div key={i} style={{
              padding: "10px 14px",
              background: "white",
              borderRadius: "4px 18px 18px 18px",
              fontSize: 14, lineHeight: 1.6,
              color: "var(--text-primary)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              border: "1px solid var(--border)"
            }}>
              {part.content.split('\n').map((line, j) => (
                <span key={j}>{line}{j < part.content.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
