const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "codechef123"; // change this!

const db = new Database(path.join(__dirname, "club.db"));
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS events(
  id INTEGER PRIMARY KEY, name TEXT, club TEXT, cat TEXT, date TEXT, venue TEXT,
  description TEXT, emoji TEXT, c TEXT, featured INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS registrations(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id),
  name TEXT NOT NULL, email TEXT NOT NULL, college TEXT NOT NULL,
  year TEXT NOT NULL, phone TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  UNIQUE(event_id, email));
`);

// Seed sample events on first run. Edit them here or directly in club.db.
const SEED = [
{id:1,name:"HackVerse 24-Hour Hackathon",club:"CodeChef ABESEC",cat:"Technology",date:"2026-10-17T09:00",venue:"Main Auditorium",desc:"Build, break and ship in 24 hours. Teams of up to 4, mentors on call and prizes worth ₹50,000.",emoji:"💻",c:"#5b47e0",featured:1},
{id:2,name:"Open Mic Night",club:"CodeChef ABESEC",cat:"Arts & Culture",date:"2026-10-05T18:00",venue:"Amphitheatre",desc:"Sing, strum or spit poetry. Sign up for a slot or just come and cheer.",emoji:"🎤",c:"#e0479a"},
{id:3,name:"Inter-College Football Cup",club:"CodeChef ABESEC",cat:"Sports",date:"2026-10-11T08:30",venue:"University Ground",desc:"Knockout tournament featuring 8 colleges. Register your team or come to support.",emoji:"⚽",c:"#1a8f5a"},
{id:4,name:"Startup Pitch Night",club:"CodeChef ABESEC",cat:"Career",date:"2026-10-24T16:00",venue:"Seminar Hall B",desc:"Pitch your idea to alumni founders and investors. Feedback guaranteed.",emoji:"🚀",c:"#ff7a59"},
{id:5,name:"Photography Walk: Old City",club:"CodeChef ABESEC",cat:"Arts & Culture",date:"2026-10-10T06:30",venue:"Gate 1 (meeting point)",desc:"Golden-hour street photography walk with a pro. Bring any camera, phones welcome.",emoji:"📷",c:"#8f5bff"},
{id:6,name:"Intro to Machine Learning Workshop",club:"CodeChef ABESEC",cat:"Technology",date:"2026-11-02T14:00",venue:"Computer Lab 3",desc:"Hands-on beginner workshop: train your first model in Python. Laptops required.",emoji:"🤖",c:"#2b8fd6"},
{id:7,name:"Campus Clean-Up Drive",club:"CodeChef ABESEC",cat:"Community",date:"2026-10-19T07:30",venue:"Central Lawn",desc:"Join us to clean and plant saplings across campus. Gloves and snacks provided.",emoji:"🌱",c:"#3aa655"},
{id:8,name:"Resume & LinkedIn Clinic",club:"CodeChef ABESEC",cat:"Career",date:"2026-11-07T11:00",venue:"Seminar Hall A",desc:"Get your resume reviewed one-on-one by industry mentors.",emoji:"📄",c:"#d68b2b"}
];
if (db.prepare("SELECT COUNT(*) n FROM events").get().n === 0) {
  const ins = db.prepare(`INSERT INTO events(id,name,club,cat,date,venue,description,emoji,c,featured)
    VALUES(@id,@name,@club,@cat,@date,@venue,@desc,@emoji,@c,@featured)`);
  db.transaction(() => SEED.forEach(e => ins.run({ featured: 0, ...e })))();
}

const app = express();
app.use(express.json());

app.get("/api/events", (req, res) =>
  res.json(db.prepare('SELECT id,name,club,cat,date,venue,description AS "desc",emoji,c,featured FROM events ORDER BY date').all()));

app.get("/api/events/:id/count", (req, res) => {
  const n = db.prepare("SELECT COUNT(*) n FROM registrations WHERE event_id=?").get(req.params.id).n;
  res.json({ count: n });
});

app.post("/api/register", (req, res) => {
  const { eventId, name, email, college, year, phone } = req.body || {};
  const clean = s => String(s ?? "").trim();
  const d = { name: clean(name), email: clean(email).toLowerCase(), college: clean(college), year: clean(year), phone: clean(phone).replace(/[\s-]/g, "") };
  if (d.name.length < 2 || !/^\S+@\S+\.\S+$/.test(d.email) || !d.college || !d.year || !/^(\+91)?[6-9]\d{9}$/.test(d.phone))
    return res.status(400).json({ error: "Please check your details and try again." });
  if (!db.prepare("SELECT 1 FROM events WHERE id=?").get(eventId))
    return res.status(404).json({ error: "Event not found." });
  try {
    db.prepare("INSERT INTO registrations(event_id,name,email,college,year,phone) VALUES(?,?,?,?,?,?)")
      .run(eventId, d.name, d.email, d.college, d.year, d.phone);
    res.json({ ok: true });
  } catch (e) {
    if (String(e.code).startsWith("SQLITE_CONSTRAINT")) return res.status(409).json({ error: "This email is already registered for this event." });
    console.error(e); res.status(500).json({ error: "Server error." });
  }
});

// ---- Admin (HTTP basic auth) ----
const auth = (req, res, next) => {
  const [u, p] = Buffer.from((req.headers.authorization || "").split(" ")[1] || "", "base64").toString().split(":");
  if (u === ADMIN_USER && p === ADMIN_PASS) return next();
  res.set("WWW-Authenticate", 'Basic realm="Admin"').status(401).send("Login required");
};
app.use("/api/admin", auth);
app.use("/admin", auth);

const rows = () => db.prepare(`SELECT r.id, r.event_id, e.name AS event, r.name, r.email, r.college, r.year, r.phone, r.created_at
  FROM registrations r JOIN events e ON e.id=r.event_id ORDER BY r.id DESC`).all();

app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "admin.html")));

app.get("/api/admin/registrations", (req, res) => res.json(rows()));
app.get("/api/admin/registrations.csv", (req, res) => {
  const r = rows(), cols = ["id","event","name","email","college","year","phone","created_at"];
  const q = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  res.type("text/csv").attachment("registrations.csv")
    .send([cols.join(","), ...r.map(x => cols.map(c => q(x[c])).join(","))].join("\n"));
});
app.delete("/api/admin/registrations/:id", (req, res) => {
  db.prepare("DELETE FROM registrations WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ---- Admin: event management (CRUD) ----
const nextId = () => (db.prepare("SELECT MAX(id) m FROM events").get().m || 0) + 1;
const validEvent = b => {
  const s = v => String(v ?? "").trim();
  const e = { name: s(b.name), club: s(b.club) || "CodeChef ABESEC", cat: s(b.cat), date: s(b.date),
    venue: s(b.venue), desc: s(b.desc), emoji: s(b.emoji) || "🎉", c: /^#[0-9a-fA-F]{6}$/.test(b.c) ? b.c : "#e0580f",
    featured: b.featured ? 1 : 0 };
  if (!e.name || !e.cat || !e.date || !e.venue || !e.desc) return null;
  return e;
};

app.get("/api/admin/events", (req, res) =>
  res.json(db.prepare('SELECT id,name,club,cat,date,venue,description AS "desc",emoji,c,featured FROM events ORDER BY date').all()));

app.post("/api/admin/events", (req, res) => {
  const e = validEvent(req.body);
  if (!e) return res.status(400).json({ error: "Please fill in name, category, date, venue and description." });
  const id = nextId();
  if (e.featured) db.prepare("UPDATE events SET featured=0").run();
  db.prepare(`INSERT INTO events(id,name,club,cat,date,venue,description,emoji,c,featured)
    VALUES(@id,@name,@club,@cat,@date,@venue,@desc,@emoji,@c,@featured)`).run({ id, ...e });
  res.json({ ok: true, id });
});

app.put("/api/admin/events/:id", (req, res) => {
  const e = validEvent(req.body);
  if (!e) return res.status(400).json({ error: "Please fill in name, category, date, venue and description." });
  if (!db.prepare("SELECT 1 FROM events WHERE id=?").get(req.params.id)) return res.status(404).json({ error: "Event not found." });
  if (e.featured) db.prepare("UPDATE events SET featured=0").run();
  db.prepare(`UPDATE events SET name=@name,club=@club,cat=@cat,date=@date,venue=@venue,
    description=@desc,emoji=@emoji,c=@c,featured=@featured WHERE id=@id`).run({ id: req.params.id, ...e });
  res.json({ ok: true });
});

app.delete("/api/admin/events/:id", (req, res) => {
  db.prepare("DELETE FROM registrations WHERE event_id=?").run(req.params.id);
  db.prepare("DELETE FROM events WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

app.use(express.static(path.join(__dirname, "public")));
app.listen(PORT, () => console.log(`Running: http://localhost:${PORT}   Admin: http://localhost:${PORT}/admin`));
