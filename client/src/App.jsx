import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Feedback wall
  const [feedbacks, setFeedbacks] = useState([]);
  const [fbName, setFbName] = useState("");
  const [fbMessage, setFbMessage] = useState("");
  const [fbSent, setFbSent] = useState(false);

  useEffect(() => {
    fetchEntries();
    fetchFeedbacks();
  }, []);

  async function fetchEntries() {
    const res = await fetch(`${API}/entries`);
    const data = await res.json();
    setEntries(data || []);
  }

  async function fetchFeedbacks() {
    const res = await fetch(`${API}/feedbacks`);
    const data = await res.json();
    setFeedbacks(data || []);
  }

  async function submitEntry(e) {
    e.preventDefault();
    if (!title) return;

    if (editingId) {
      await fetch(`${API}/entries/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
    } else {
      await fetch(`${API}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
    }

    setTitle("");
    setDescription("");
    setEditingId(null);
    fetchEntries();
  }

  function startEdit(entry) {
    setEditingId(entry.id);
    setTitle(entry.title);
    setDescription(entry.description);
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setDescription("");
  }

  async function removeEntry(id) {
    await fetch(`${API}/entries/${id}`, { method: "DELETE" });
    if (editingId === id) cancelEdit();
    fetchEntries();
  }

  async function submitFeedback(e) {
    e.preventDefault();
    if (!fbName || !fbMessage) return;

    await fetch(`${API}/feedbacks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fbName, message: fbMessage }),
    });

    setFbName("");
    setFbMessage("");
    setFbSent(true);
    setTimeout(() => setFbSent(false), 2500);
    fetchFeedbacks();
  }

  async function removeFeedback(id) {
    await fetch(`${API}/feedbacks/${id}`, { method: "DELETE" });
    fetchFeedbacks();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600&display=swap');

        :root{
          --bg: #0b1220;
          --panel: #121b2e;
          --panel-2: #0f1826;
          --border: #223047;
          --text: #e7edf5;
          --muted: #7c8aa0;
          --amber: #ff9f1c;
          --teal: #2dd4bf;
          --danger: #ef4565;
        }

        *{ margin:0; padding:0; box-sizing:border-box; }

        body{
          background: var(--bg);
          background-image:
            radial-gradient(circle at 15% 0%, rgba(45,212,191,0.06), transparent 40%),
            radial-gradient(circle at 85% 20%, rgba(255,159,28,0.05), transparent 40%);
          color: var(--text);
          font-family: 'Inter', system-ui, sans-serif;
        }

        .shell{
          max-width: 1080px;
          margin: 0 auto;
          padding: 32px 20px 80px;
        }

        /* ---- status bar (signature element) ---- */
        .statusbar{
          display:flex;
          align-items:center;
          justify-content:space-between;
          flex-wrap: wrap;
          gap: 14px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 20px;
          margin-bottom: 34px;
        }

        .statusbar .brand{
          font-family: 'JetBrains Mono', monospace;
          font-size: 15px;
          letter-spacing: 0.02em;
          color: var(--text);
          display:flex;
          align-items:center;
          gap:10px;
        }

        .dot-live{
          width:8px; height:8px; border-radius:50%;
          background: var(--amber);
          box-shadow: 0 0 0 0 rgba(255,159,28,0.6);
          animation: pulse 1.8s infinite;
        }

        @keyframes pulse{
          0%{ box-shadow: 0 0 0 0 rgba(255,159,28,0.55); }
          70%{ box-shadow: 0 0 0 8px rgba(255,159,28,0); }
          100%{ box-shadow: 0 0 0 0 rgba(255,159,28,0); }
        }

        .services{
          display:flex;
          gap: 18px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: var(--muted);
        }

        .services span{
          display:flex;
          align-items:center;
          gap:6px;
        }

        .services .ok{
          width:6px; height:6px; border-radius:50%;
          background: var(--teal);
        }

        h1.hero{
          font-family: 'JetBrains Mono', monospace;
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        p.sub{
          color: var(--muted);
          font-size: 14px;
          margin-bottom: 34px;
        }

        .grid{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }

        @media (max-width: 860px){
          .grid{ grid-template-columns: 1fr; }
        }

        .panel{
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 22px;
        }

        .panel-header{
          display:flex;
          align-items:baseline;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .panel-title{
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--muted);
        }

        .panel-count{
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: var(--teal);
        }

        form{
          display:flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 18px;
        }

        input, textarea{
          background: var(--panel-2);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
        }

        input::placeholder, textarea::placeholder{ color: #4d5a70; }

        input:focus, textarea:focus{
          outline: none;
          border-color: var(--teal);
        }

        textarea{ resize: vertical; min-height: 70px; }

        .btn-row{ display:flex; gap:8px; }

        button{
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer;
          transition: opacity .15s ease;
        }

        button:hover{ opacity: 0.85; }

        .btn-primary{ background: var(--teal); color: #06231f; }
        .btn-ghost{ background: transparent; border: 1px solid var(--border); color: var(--muted); }
        .btn-danger{ background: transparent; color: var(--danger); border: 1px solid rgba(239,69,101,0.35); padding: 6px 10px; font-size: 12px; }
        .btn-edit{ background: transparent; color: var(--amber); border: 1px solid rgba(255,159,28,0.35); padding: 6px 10px; font-size: 12px; }

        .list{ display:flex; flex-direction: column; gap: 10px; max-height: 420px; overflow-y: auto; }

        .row{
          background: var(--panel-2);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 14px;
          display:flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .row .meta h4{ font-size: 14px; margin-bottom: 3px; }
        .row .meta p{ font-size: 12.5px; color: var(--muted); }

        .row-actions{ display:flex; gap: 6px; flex-shrink: 0; }

        .fb-row{
          background: var(--panel-2);
          border: 1px solid var(--border);
          border-left: 2px solid var(--teal);
          border-radius: 8px;
          padding: 12px 14px;
        }

        .fb-row .fb-top{
          display:flex;
          justify-content: space-between;
          align-items:center;
          margin-bottom: 4px;
        }

        .fb-row .fb-name{
          font-family: 'JetBrains Mono', monospace;
          font-size: 12.5px;
          color: var(--teal);
        }

        .fb-row p{ font-size: 13.5px; color: var(--text); line-height: 1.4; }

        .empty{ color: var(--muted); font-size: 13px; text-align:center; padding: 20px 0; }

        .toast{
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: var(--teal);
          margin-top: -4px;
          margin-bottom: 4px;
        }
      `}</style>

      <div className="shell">

        <div className="statusbar">
        {/* <h1>Testing jenkings</h1> */}
          <div className="brand">
            <span className="dot-live"></span>
            deploy@vps :: live - Test
          </div>
          <div className="services">
            <span><span className="ok"></span>docker</span>
            <span><span className="ok"></span>nginx</span>
            <span><span className="ok"></span>mysql</span>
            <span><span className="ok"></span>gin api</span>
          </div>
        </div>

        <h1 className="hero">Shipped from a VPS, one container at a time.</h1>
        <p className="sub">
          A small full-stack app (Go + Gin + GORM + MySQL, served behind Nginx in Docker)
          built while learning to deploy. Poke at the CRUD panel, or leave feedback below.
        </p>

        <div className="grid">

          {/* ---------------- CRUD PANEL ---------------- */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Entries · full CRUD</span>
              <span className="panel-count">{entries.length} record{entries.length !== 1 ? "s" : ""}</span>
            </div>

            <form onSubmit={submitEntry}>
              <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="btn-row">
                <button type="submit" className="btn-primary">
                  {editingId ? "Save changes" : "Add entry"}
                </button>
                {editingId && (
                  <button type="button" className="btn-ghost" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="list">
              {entries.length === 0 ? (
                <div className="empty">No entries yet — add the first one above.</div>
              ) : (
                entries.map((entry) => (
                  <div className="row" key={entry.id}>
                    <div className="meta">
                      <h4>{entry.title}</h4>
                      {entry.description && <p>{entry.description}</p>}
                    </div>
                    <div className="row-actions">
                      <button className="btn-edit" onClick={() => startEdit(entry)}>Edit</button>
                      <button className="btn-danger" onClick={() => removeEntry(entry.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ---------------- FEEDBACK PANEL ---------------- */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Feedback wall</span>
              <span className="panel-count">{feedbacks.length} message{feedbacks.length !== 1 ? "s" : ""}</span>
            </div>

            <form onSubmit={submitFeedback}>
              <input
                placeholder="Your name"
                value={fbName}
                onChange={(e) => setFbName(e.target.value)}
              />
              <textarea
                placeholder="What do you think of the deployment / app?"
                value={fbMessage}
                onChange={(e) => setFbMessage(e.target.value)}
              />
              <div className="btn-row">
                <button type="submit" className="btn-primary">Send feedback</button>
              </div>
              {fbSent && <div className="toast">✓ feedback received — thank you</div>}
            </form>

            <div className="list">
              {feedbacks.length === 0 ? (
                <div className="empty">No feedback yet — be the first to leave a note.</div>
              ) : (
                feedbacks.map((fb) => (
                  <div className="fb-row" key={fb.id}>
                    <div className="fb-top">
                      <span className="fb-name">{fb.name}</span>
                      <button className="btn-danger" onClick={() => removeFeedback(fb.id)}>×</button>
                    </div>
                    <p>{fb.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}