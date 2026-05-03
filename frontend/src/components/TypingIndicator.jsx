export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
        style={{ background: "var(--gold)", color: "var(--dark)", fontWeight: 700, fontSize: 13 }}>
        R
      </div>
      <div className="px-4 py-3 rounded-2xl flex items-center gap-1"
        style={{ background: "var(--dark-3)", border: "1px solid var(--dark-4)", borderBottomLeftRadius: 4 }}>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    </div>
  )
}
