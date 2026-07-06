/* ============================================================
   ZCS Connect — interactive proof of concept
   All state is in-memory demo data; nothing persists.
   ============================================================ */

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I per PRD

const state = {
  role: "parent",
  tab: { parent: "home", teacher: "classroom", admin: "compose" },
  openThread: null,      // thread id currently open in chat view
  openForm: null,        // form id currently open
  auditThread: null,     // thread id open in admin audit browser
  onboardStep: 0,        // 0 welcome, 1 code, 2 child, 3 done, -1 dismissed
  composePriority: false,

  classrooms: [
    { id: "vw", name: "Mrs. VanderWall · 3rd Grade", teacher: "Mrs. VanderWall", code: "ZCS-7RM4KX", families: 26 },
    { id: "dv", name: "Mr. DeVries · 6th Grade", teacher: "Mr. DeVries", code: "ZCS-M8Q2TP", families: 24 },
    { id: "kb", name: "Miss Kuiper · Kindergarten", teacher: "Miss Kuiper", code: "ZCS-W4NPRD", families: 22 },
    { id: "ps", name: "Mrs. Steenwyk · PreK (Creation Ridge)", teacher: "Mrs. Steenwyk", code: "ZCS-H6TBKM", families: 18 },
  ],

  children: [
    { name: "Ella Meyer", classroomId: "vw" },
    { name: "Sam Meyer", classroomId: "dv" },
  ],

  members: [
    { name: "Ella Meyer", guardian: "Sarah Meyer", isNew: false },
    { name: "Aiden Bosch", guardian: "Katie Bosch", isNew: false },
    { name: "Lucy Huizenga", guardian: "Dan Huizenga", isNew: false },
    { name: "Owen Dykstra", guardian: "Beth Dykstra", isNew: false },
    { name: "Nora Van Dam", guardian: "Pete Van Dam", isNew: false },
    { name: "Levi Timmer", guardian: "Rachel Timmer", isNew: false },
  ],

  announcements: [
    {
      id: "a1", scope: "classroom", classroomId: "vw", author: "Mrs. VanderWall",
      title: "Week 1 in Room 14 🎉",
      body: "Welcome to 3rd grade! This week we start our <b>Michigan history</b> unit and library day is <b>Thursday</b> — please send books back. Snack calendar is attached.",
      attachment: "Snack-Calendar-Sept.pdf",
      when: "2h ago", priority: false, reads: 18, total: 26, readByMe: false, nudged: false, mine: true,
    },
    {
      id: "a2", scope: "school", classroomId: null, author: "ZCS Front Office",
      title: "RAMS FEST recap & first-day reminders",
      body: "Thank you for a wonderful Meet-Your-Teacher night! Doors open at <b>8:05 AM</b> Thursday. Car line map and drop-off details attached.",
      attachment: "Carline-Map-2026.pdf",
      when: "Yesterday", priority: false, reads: 512, total: 630, readByMe: true, nudged: false, mine: false,
    },
    {
      id: "a3", scope: "classroom", classroomId: "vw", author: "Mrs. VanderWall",
      title: "Field trip: Critter Barn 🐐",
      body: "Our first field trip is <b>Friday, Sept 18</b>. Permission slip is in your To-Do tab — due Sept 11. We still need drivers!",
      attachment: null,
      when: "Yesterday", priority: false, reads: 22, total: 26, readByMe: true, nudged: false, mine: true,
    },
    {
      id: "a4", scope: "school", classroomId: null, author: "ZCS Front Office",
      title: "The Blue Note is going digital 📱",
      body: "This school year, everything that used to arrive in the weekly Blue Note email lands right here in ZCS Connect — announcements, calendar, forms, and volunteer signups in one place.",
      attachment: null,
      when: "Mon", priority: false, reads: 498, total: 630, readByMe: true, nudged: false, mine: false,
    },
  ],

  threads: [
    {
      id: "t1", classroomId: "vw", teacher: "Mrs. VanderWall", guardian: "Sarah Meyer", child: "Ella",
      messages: [
        { from: "guardian", body: "Hi Mrs. VanderWall! Ella has a dentist appointment Thursday — she'll be in by 10.", when: "Tue 8:14 AM" },
        { from: "teacher", body: "Thanks for the heads up, Sarah! I'll save her library book swap for when she arrives. 😊", when: "Tue 8:31 AM" },
      ],
    },
    {
      id: "t2", classroomId: "dv", teacher: "Mr. DeVries", guardian: "Sarah Meyer", child: "Sam",
      messages: [
        { from: "teacher", body: "Sam did a great job leading his group in science today — thought you'd like to know!", when: "Mon 3:40 PM" },
        { from: "guardian", body: "That makes our day — thank you!", when: "Mon 5:02 PM" },
      ],
    },
    {
      id: "t3", classroomId: "vw", teacher: "Mrs. VanderWall", guardian: "Katie Bosch", child: "Aiden",
      messages: [
        { from: "guardian", body: "Is the snack calendar nut-free this year?", when: "Tue 7:05 PM" },
        { from: "teacher", body: "Yes — Room 14 is a nut-free room. The attached calendar has safe suggestions.", when: "Tue 7:22 PM" },
      ],
    },
  ],

  events: [
    {
      id: "e1", scope: "classroom", classroomId: "vw", title: "Fall Party — Room 14",
      mon: "OCT", day: "30", time: "2:00–3:00 PM", location: "Room 14",
      rsvpEnabled: true, myRsvp: null, counts: { yes: 14, maybe: 3, no: 2 },
      slots: [
        { id: "s1", label: "Cookies (1 dozen)", qty: 3, claimed: 2, mine: false },
        { id: "s2", label: "Drivers", qty: 4, claimed: 1, mine: false },
        { id: "s3", label: "Craft helper", qty: 2, claimed: 2, mine: false },
      ],
    },
    {
      id: "e2", scope: "classroom", classroomId: "vw", title: "Field Trip: Critter Barn",
      mon: "SEP", day: "18", time: "9:00 AM–1:00 PM", location: "Critter Barn, Zeeland",
      rsvpEnabled: false, myRsvp: null, counts: null,
      slots: [{ id: "s4", label: "Drivers (4 kids each)", qty: 4, claimed: 2, mine: false }],
    },
    {
      id: "e3", scope: "school", classroomId: null, title: "Picture Day",
      mon: "SEP", day: "9", time: "All day", location: "Gym",
      rsvpEnabled: false, myRsvp: null, counts: null, slots: [],
    },
    {
      id: "e4", scope: "school", classroomId: null, title: "Grandparents' Day Chapel",
      mon: "OCT", day: "9", time: "9:30 AM", location: "Sanctuary",
      rsvpEnabled: true, myRsvp: null, counts: { yes: 204, maybe: 41, no: 12 },
      slots: [],
    },
  ],

  forms: [
    {
      id: "f1", scope: "classroom", classroomId: "vw", child: "Ella Meyer",
      title: "Critter Barn Field Trip — Permission Slip",
      desc: "Friday, Sept 18 · Departs 9:00 AM by parent drivers · Returns 1:00 PM. Cost $6, billed to your account.",
      due: "Due Sep 11", needsSignature: true, consent: null, signature: "",
      status: "open", completed: 24, total: 26,
      incomplete: ["Meyer family", "Timmer family"],
      reminded: false,
    },
    {
      id: "f2", scope: "school", classroomId: null, child: "Sam Meyer",
      title: "2026–27 Handbook Acknowledgment",
      desc: "Please acknowledge you've reviewed the ZCS family handbook for the new school year.",
      due: "Due Sep 5", needsSignature: false, consent: null, signature: "",
      status: "open", completed: 501, total: 630, incomplete: [], reminded: false,
    },
    {
      id: "f3", scope: "school", classroomId: null, child: "Ella Meyer",
      title: "Photo & Media Release",
      desc: "Consent for your child to appear in school publications.",
      due: "Submitted Aug 26", needsSignature: true, consent: "yes", signature: "Sarah Meyer",
      status: "done", completed: 588, total: 630, incomplete: [], reminded: false,
    },
  ],

  staff: [
    { email: "vanderwall@zcs.org", role: "Teacher" },
    { email: "devries@zcs.org", role: "Teacher" },
    { email: "kuiper@zcs.org", role: "Teacher" },
    { email: "steenwyk@zcs.org", role: "Teacher" },
    { email: "office@zcs.org", role: "Admin" },
    { email: "principal@zcs.org", role: "Admin" },
  ],

  audit: [
    { admin: "office@zcs.org", what: "Viewed thread: Mrs. VanderWall ↔ K. Bosch (Room 14)", when: "Aug 31, 2:14 PM" },
    { admin: "principal@zcs.org", what: "Searched messages: “allergy”", when: "Aug 30, 9:02 AM" },
  ],
};

/* ---------- helpers ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const app = $("#app");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function toast(msg, push = false) {
  const t = $("#toast");
  t.innerHTML = msg;
  t.className = "toast show" + (push ? " push" : "");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2600);
}

function phoneBanner(title, body, alert = false) {
  let b = $(".notif-banner");
  if (!b) {
    b = document.createElement("div");
    b.className = "notif-banner";
    b.innerHTML = `<div class="n-icon">Z</div><div><div class="n-title"></div><div class="n-body"></div></div>`;
    $(".phone").appendChild(b);
  }
  b.classList.toggle("alert", alert);
  $(".n-icon", b).textContent = alert ? "❄" : "Z";
  $(".n-title", b).textContent = title;
  $(".n-body", b).textContent = body;
  requestAnimationFrame(() => b.classList.add("show"));
  clearTimeout(b._h);
  b._h = setTimeout(() => b.classList.remove("show"), 3400);
}

function newCode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return "ZCS-" + s;
}

function classroom(id) { return state.classrooms.find((c) => c.id === id); }
function scopePill(a) {
  if (a.priority) return `<span class="pill priority">⚠ Priority alert</span>`;
  if (a.scope === "school") return `<span class="pill school">🏫 School-wide</span>`;
  return `<span class="pill classroom">${esc(classroom(a.classroomId).teacher)}</span>`;
}

const fakeQR = () => {
  let cells = "";
  for (let i = 0; i < 49; i++) {
    const on = (i * 31 + 17) % 7 < 3 || i < 3 || i % 7 === 0;
    cells += `<i class="${on ? "" : "off"}"></i>`;
  }
  return `<div class="qr">${cells}</div>`;
};

/* ============================================================
   RENDER
   ============================================================ */
function render() {
  const r = state.role;
  let html = "";
  if (r === "parent") html = renderParent();
  else if (r === "teacher") html = renderTeacher();
  else html = renderAdmin();
  app.innerHTML = html;
  if (state.onboardStep >= 0 && r === "parent") app.insertAdjacentHTML("beforeend", renderOnboard());
  wire();
}

/* ---------- header + tabbar ---------- */
function header(title, sub) {
  return `<div class="app-header">
    <div class="school">Zeeland Christian School</div>
    <h2>${title}</h2>
    ${sub ? `<div class="sub">${sub}</div>` : ""}
  </div>`;
}

function tabbar(tabs) {
  const cur = state.tab[state.role];
  return `<div class="tabbar">${tabs
    .map(
      (t) => `<button class="tab ${cur === t.id ? "active" : ""}" data-tab="${t.id}">
        <span class="t-icon">${t.icon}</span>${t.label}
        ${t.badge ? `<span class="badge">${t.badge}</span>` : ""}
      </button>`
    )
    .join("")}</div>`;
}

/* ============================================================
   PARENT
   ============================================================ */
function renderParent() {
  const tab = state.tab.parent;
  const todoCount = state.forms.filter((f) => f.status === "open").length;
  let body = "";
  if (tab === "home") body = parentHome();
  else if (tab === "messages") body = parentMessages();
  else if (tab === "calendar") body = parentCalendar();
  else body = parentTodo();
  return body + tabbar([
    { id: "home", icon: "🏠", label: "Home" },
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "calendar", icon: "📅", label: "Calendar" },
    { id: "todo", icon: "✅", label: "To-Do", badge: todoCount || "" },
  ]);
}

function parentHome() {
  const feed = state.announcements
    .map((a) => {
      const unread = !a.readByMe;
      return `<div class="card post-card ${unread ? "unread" : ""} ${a.priority ? "priority-card" : ""}" data-read="${a.id}">
        <div class="post-head">${scopePill(a)}<span class="meta">${esc(a.when)}</span></div>
        <h3>${esc(a.title)}</h3>
        <div class="body">${a.body}</div>
        ${a.attachment ? `<span class="attach">📎 ${esc(a.attachment)}</span>` : ""}
      </div>`;
    })
    .join("");
  return (
    header("Good morning, Sarah 👋", "Ella · Room 14 &nbsp;&nbsp; Sam · 6th Grade") +
    `<div class="screen">
      <div class="section-title">Your feed — school-wide + both classrooms</div>
      ${feed}
    </div>`
  );
}

function parentMessages() {
  if (state.openThread) return chatView(state.openThread, "guardian");
  const mine = state.threads.filter((t) => t.guardian === "Sarah Meyer");
  return (
    header("Messages", "One thread per teacher, per child") +
    `<div class="screen">
      ${mine
        .map((t) => {
          const last = t.messages[t.messages.length - 1];
          return `<div class="card thread-row" data-thread="${t.id}">
            <div class="avatar">${esc(t.teacher.split(" ").pop()[0])}</div>
            <div class="t-body">
              <div class="t-name">${esc(t.teacher)} <span class="meta">· ${esc(t.child)}</span></div>
              <div class="t-prev">${esc(last.body)}</div>
            </div>
            <div class="t-when">${esc(last.when.split(" ")[0])}</div>
          </div>`;
        })
        .join("")}
      <div class="audit-note">🔒 For student safety, messages are immutable and may be reviewed by school administration. This is disclosed here, at sign-up, and in every composer.</div>
    </div>`
  );
}

function chatView(threadId, as) {
  const t = state.threads.find((x) => x.id === threadId);
  const other = as === "guardian" ? t.teacher : `${t.guardian} (${t.child})`;
  return (
    header(`<button class="back-btn" data-back>‹ Back</button> &nbsp;${esc(other)}`, classroom(t.classroomId).name) +
    `<div class="chat" id="chatScroll">
      ${t.messages
        .map(
          (m) => `<div class="bubble ${m.from === as ? "me" : "them"}">${esc(m.body)}<span class="when">${esc(m.when)}</span></div>`
        )
        .join("")}
    </div>
    <div class="composer-disclosure">Messages may be reviewed by school administration.</div>
    <div class="composer">
      <input type="text" id="chatInput" placeholder="Message ${esc(other.split(" ")[0])}…" autocomplete="off">
      <button class="btn btn-primary" id="chatSend">Send</button>
    </div>`
  );
}

function parentCalendar() {
  const cards = state.events
    .map((ev) => {
      let slots = "";
      if (ev.slots.length) {
        slots = ev.slots
          .map((s) => {
            const full = s.claimed >= s.qty;
            return `<div class="slot-row ${full ? "full" : ""}">
              <span>🙋 ${esc(s.label)}</span>
              <span class="s-count">${s.claimed}/${s.qty}</span>
              ${
                s.mine
                  ? `<button class="btn btn-sm btn-ghost" data-release="${s.id}">Release</button>`
                  : full
                  ? `<span class="pill done">Filled</span>`
                  : `<button class="btn btn-sm btn-gold" data-claim="${s.id}">Claim</button>`
              }
            </div>`;
          })
          .join("");
      }
      let rsvp = "";
      if (ev.rsvpEnabled) {
        rsvp = `<div class="seg rsvp-bar" data-rsvp="${ev.id}">
          ${["yes", "maybe", "no"]
            .map(
              (v) =>
                `<button class="${ev.myRsvp === v ? "on" : ""}" data-val="${v}">${v === "yes" ? "✓ Going" : v === "maybe" ? "Maybe" : "No"}</button>`
            )
            .join("")}
        </div>
        <div class="meta" style="margin-top:6px">${ev.counts.yes} going · ${ev.counts.maybe} maybe${ev.myRsvp ? " · reminder set for the day before ⏰" : ""}</div>`;
      }
      return `<div class="card">
        <div class="event-top">
          <div class="event-date"><span>${ev.mon}</span><b>${ev.day}</b></div>
          <div class="e-info">
            ${scopePill(ev)}
            <h3 style="margin-top:4px">${esc(ev.title)}</h3>
            <div class="meta">${esc(ev.time)} · ${esc(ev.location)} · <a href="#" data-addcal="${ev.id}" style="color:var(--navy);font-weight:600">Add to calendar</a></div>
          </div>
        </div>
        ${rsvp}${slots}
      </div>`;
    })
    .join("");
  return (
    header("Calendar", "School-wide + Room 14 + 6th Grade, merged") +
    `<div class="screen">${cards}</div>`
  );
}

function parentTodo() {
  if (state.openForm) return formView(state.openForm);
  const open = state.forms.filter((f) => f.status === "open");
  const done = state.forms.filter((f) => f.status === "done");
  const row = (f) => `<div class="card thread-row" data-form="${f.id}">
    <div class="avatar ${f.status === "done" ? "green" : ""}">${f.status === "done" ? "✓" : "✍️"}</div>
    <div class="t-body">
      <div class="t-name">${esc(f.title)}</div>
      <div class="t-prev">For ${esc(f.child)} · ${f.scope === "school" ? "School-wide" : classroom(f.classroomId).teacher}</div>
    </div>
    <span class="pill ${f.status === "done" ? "done" : "due"}">${esc(f.due)}</span>
  </div>`;
  return (
    header("To-Do", "Every open form & RSVP, sorted by due date") +
    `<div class="screen">
      ${open.length ? `<div class="section-title">Needs your attention</div>` + open.map(row).join("") : `<div class="empty">🎉 All caught up!</div>`}
      ${done.length ? `<div class="section-title">Completed</div>` + done.map(row).join("") : ""}
    </div>`
  );
}

function formView(formId) {
  const f = state.forms.find((x) => x.id === formId);
  const isDone = f.status === "done";
  return (
    header(`<button class="back-btn" data-back>‹ To-Do</button>`, "") +
    `<div class="screen">
      <div class="card">
        ${scopePill(f)} <span class="pill ${isDone ? "done" : "due"}">${esc(f.due)}</span>
        <h3 style="margin-top:8px">${esc(f.title)}</h3>
        <div class="meta" style="margin:4px 0 8px">Response for <b>${esc(f.child)}</b> — responses are per child, so multi-kid families stay unambiguous.</div>
        <div class="body" style="font-size:13.5px;line-height:1.55;color:#3a4552">${esc(f.desc)}</div>
        ${f.id === "f1" ? `<span class="attach">📎 CritterBarn-Details.pdf</span>` : ""}

        <div class="field-block">
          <label class="f-label">${f.needsSignature ? "Do you give permission?" : "Acknowledgment"}</label>
          <div class="choice-row" data-consent>
            <button class="btn ${f.consent === "yes" ? "btn-primary" : "btn-ghost"}" data-val="yes" ${isDone ? "disabled" : ""}>✓ Yes${f.needsSignature ? ", I consent" : ", I've read it"}</button>
            ${f.needsSignature ? `<button class="btn ${f.consent === "no" ? "btn-danger" : "btn-ghost"}" data-val="no" ${isDone ? "disabled" : ""}>✗ No</button>` : ""}
          </div>
        </div>

        ${
          f.needsSignature
            ? `<div class="field-block">
                <label class="f-label">Signature — type your full legal name</label>
                <input type="text" id="sigInput" placeholder="Sarah Meyer" value="${esc(f.signature)}" ${isDone ? "disabled" : ""}>
                <div class="sig-note">Stored with your account identity + timestamp (lightweight e-signature).</div>
              </div>`
            : ""
        }

        <div class="field-block">
          ${
            isDone
              ? `<div class="meta">✅ Submitted${f.signature ? ` — signed “${esc(f.signature)}”` : ""}. The teacher's dashboard updated instantly.</div>`
              : `<button class="btn btn-primary btn-block" id="formSubmit">Submit</button>`
          }
        </div>
      </div>
    </div>`
  );
}

/* ---------- Onboarding overlay (F1) ---------- */
function renderOnboard() {
  const s = state.onboardStep;
  const dots = `<div class="ob-steps">${[0, 1, 2, 3].map((i) => `<i class="${i <= s ? "on" : ""}"></i>`).join("")}</div>`;
  let inner = "";
  if (s === 0)
    inner = `<div class="brand-mark">Z</div>
      <h2>Welcome to ZCS Connect</h2>
      <p>One app for everything between Zeeland Christian and home. This is the parent onboarding flow — designed to take <b>under two minutes</b> at Meet-Your-Teacher night.</p>
      <button class="btn btn-gold btn-block" data-ob="1">Get started</button>
      <button class="skip" data-ob="-1">Skip — take me to the demo</button>`;
  else if (s === 1)
    inner = `<h2>Enter your classroom code</h2>
      <p>It's on the handout from your child's teacher.<br>Try <b>ZCS-7RM4KX</b> (Mrs. VanderWall, 3rd grade).</p>
      <input type="text" id="obCode" placeholder="ZCS-______" maxlength="10" autocomplete="off">
      <div class="err" id="obErr"></div>
      <button class="btn btn-gold btn-block" data-ob="2">Join classroom</button>
      <button class="skip" data-ob="-1">Skip</button>`;
  else if (s === 2)
    inner = `<h2>Who's your student?</h2>
      <p>This links <b>you</b> to your child's classroom. Kids never get accounts — ZCS Connect is adults-only.</p>
      <input type="text" id="obChild" value="Ella Meyer" autocomplete="off">
      <button class="btn btn-gold btn-block" data-ob="3">Add my child</button>`;
  else
    inner = `<div class="brand-mark">🎉</div>
      <h2>You're in Room 14!</h2>
      <p>Mrs. VanderWall just got a “new family joined” notification. Add another child anytime with their classroom code — a guardian with three kids simply joins three classrooms.</p>
      <button class="btn btn-gold btn-block" data-ob="-1">Open my feed</button>`;
  return `<div class="onboard">${dots}${inner}</div>`;
}

/* ============================================================
   TEACHER  (Mrs. VanderWall)
   ============================================================ */
function renderTeacher() {
  const tab = state.tab.teacher;
  let body = "";
  if (tab === "classroom") body = teacherClassroom();
  else if (tab === "post") body = teacherPost();
  else if (tab === "messages") body = teacherMessages();
  else body = teacherForms();
  return body + tabbar([
    { id: "classroom", icon: "🏫", label: "Classroom" },
    { id: "post", icon: "📣", label: "Post" },
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "forms", icon: "📋", label: "Forms" },
  ]);
}

function teacherClassroom() {
  const c = classroom("vw");
  return (
    header("Room 14 · 3rd Grade", "Mrs. VanderWall — owner · Mrs. Bruins — co-teacher") +
    `<div class="screen">
      <div class="card code-card">
        <div class="meta">Classroom join code</div>
        <div class="code" id="joinCode">${esc(c.code)}</div>
        ${fakeQR()}
        <div class="meta">Parents scan or type this at Meet-Your-Teacher night</div>
        <div class="code-actions">
          <button class="btn btn-sm btn-gold" id="shareHandout">📄 Print handout</button>
          <button class="btn btn-sm btn-ghost" style="background:rgba(255,255,255,.15);color:#fff" id="regenCode">↻ Regenerate</button>
        </div>
      </div>

      <div class="card">
        <h3>Families · ${c.families}</h3>
        <div class="meta" style="margin-bottom:4px">You're notified when a family joins, and can remove mis-joins.</div>
        ${state.members
          .map(
            (m) => `<div class="member-row">
              <div class="avatar" style="width:32px;height:32px;font-size:12px">${esc(m.name[0])}</div>
              <div><b>${esc(m.name)}</b><div class="meta">${esc(m.guardian)}</div></div>
              ${m.isNew ? `<span class="m-tag read" style="margin-left:auto">NEW</span>` : ""}
            </div>`
          )
          .join("")}
        <div class="meta" style="margin-top:8px;text-align:center">+ ${c.families - state.members.length} more families</div>
      </div>
    </div>`
  );
}

function teacherPost() {
  const mine = state.announcements.filter((a) => a.mine);
  return (
    header("New announcement", "Room 14 · push goes to all 26 families") +
    `<div class="screen">
      <div class="card">
        <label class="f-label">Title</label>
        <input type="text" id="postTitle" placeholder="e.g. Library day is Thursday" autocomplete="off">
        <label class="f-label" style="margin-top:10px">Message</label>
        <textarea id="postBody" rows="3" placeholder="Rich text, images & PDFs supported…"></textarea>
        <div class="meta" style="margin:8px 0">📎 Attach · 🕐 Schedule · Drafts autosave</div>
        <button class="btn btn-primary btn-block" id="publishPost">Publish + notify 26 families</button>
      </div>

      <div class="section-title">Your posts — read tracking</div>
      ${mine
        .map((a) => {
          const pct = Math.round((a.reads / a.total) * 100);
          return `<div class="card">
            <h3>${esc(a.title)}</h3>
            <div class="meta">${esc(a.when)} · ${a.reads}/${a.total} families viewed (${pct}%)</div>
            <div class="progress"><i style="width:${pct}%"></i></div>
            <div class="read-row">
              <span>${a.total - a.reads} unread ${a.total - a.reads === 1 ? "family" : "families"}</span>
              <button class="btn btn-sm ${a.nudged ? "btn-ghost" : "btn-gold"}" data-nudge="${a.id}" ${a.nudged || a.reads >= a.total ? "disabled" : ""}>
                ${a.nudged ? "Nudged ✓" : "🔔 Nudge unread"}
              </button>
            </div>
            <div class="meta" style="margin-top:5px">One re-notify per post — anti-spam by design.</div>
          </div>`;
        })
        .join("")}
    </div>`
  );
}

function teacherMessages() {
  if (state.openThread) return chatView(state.openThread, "teacher");
  const mine = state.threads.filter((t) => t.teacher === "Mrs. VanderWall");
  return (
    header("Messages", "Your Room 14 families") +
    `<div class="screen">
      ${mine
        .map((t) => {
          const last = t.messages[t.messages.length - 1];
          return `<div class="card thread-row" data-thread="${t.id}">
            <div class="avatar green">${esc(t.guardian[0])}</div>
            <div class="t-body">
              <div class="t-name">${esc(t.guardian)} <span class="meta">· ${esc(t.child)}'s ${t.guardian.includes("Sarah") ? "mom" : "parent"}</span></div>
              <div class="t-prev">${esc(last.body)}</div>
            </div>
            <div class="t-when">${esc(last.when.split(" ")[0])}</div>
          </div>`;
        })
        .join("")}
    </div>`
  );
}

function teacherForms() {
  const f = state.forms.find((x) => x.id === "f1");
  const pct = Math.round((f.completed / f.total) * 100);
  return (
    header("Forms", "Room 14 completion dashboards") +
    `<div class="screen">
      <div class="card">
        <span class="pill classroom">Permission slip</span>
        <h3 style="margin-top:6px">${esc(f.title)}</h3>
        <div class="meta">${esc(f.due)} · typed-name signature required</div>
        <div class="progress"><i style="width:${pct}%"></i></div>
        <div class="meta" style="margin-top:5px"><b>${f.completed}/${f.total}</b> complete (${pct}%)</div>
        ${
          f.incomplete.length
            ? `<div class="field-block">
                <label class="f-label">Still waiting on</label>
                ${f.incomplete.map((n) => `<div class="member-row"><span>⏳ ${esc(n)}</span><span class="m-tag unread">incomplete</span></div>`).join("")}
                <button class="btn btn-sm btn-gold btn-block" style="margin-top:10px" data-remind="f1" ${f.reminded ? "disabled" : ""}>
                  ${f.reminded ? "Reminder sent ✓ (rate-limited to 1/day)" : "🔔 Remind non-responders"}
                </button>
              </div>`
            : `<div class="meta" style="margin-top:8px">🎉 Everyone's in!</div>`
        }
      </div>
      <div class="card">
        <h3>+ New form</h3>
        <div class="meta" style="margin-top:4px">Fields: acknowledgment, yes/no, multiple choice, short text, typed-name signature. Optional PDF attachment & due date. Responses export to CSV.</div>
        <button class="btn btn-ghost btn-block" style="margin-top:10px" data-toastmsg="Form builder — out of scope for this mockup, P0 for launch">Open form builder</button>
      </div>
    </div>`
  );
}

/* ============================================================
   ADMIN  (Front office)
   ============================================================ */
function renderAdmin() {
  const tab = state.tab.admin;
  let body = "";
  if (tab === "compose") body = adminCompose();
  else if (tab === "classrooms") body = adminClassrooms();
  else if (tab === "staff") body = adminStaff();
  else body = adminAudit();
  return body + tabbar([
    { id: "compose", icon: "📣", label: "Compose" },
    { id: "classrooms", icon: "🏫", label: "Classrooms" },
    { id: "staff", icon: "👥", label: "Staff" },
    { id: "audit", icon: "🔍", label: "Audit" },
  ]);
}

function adminCompose() {
  const p = state.composePriority;
  return (
    header("School-wide post", "Reaches every guardian & staff member") +
    `<div class="screen">
      <div class="card" ${p ? 'style="border:1.5px solid var(--red)"' : ""}>
        <label class="f-label">Title</label>
        <input type="text" id="postTitle" placeholder="e.g. Early release Friday" autocomplete="off">
        <label class="f-label" style="margin-top:10px">Message</label>
        <textarea id="postBody" rows="3" placeholder="Drafts autosave — long posts on a phone are the price of mobile-only v1…"></textarea>

        <div class="field-block">
          <div class="choice-row">
            <button class="btn ${!p ? "btn-primary" : "btn-ghost"}" data-pri="0">📣 Normal</button>
            <button class="btn ${p ? "btn-danger" : "btn-ghost"}" data-pri="1">⚠ Priority alert</button>
          </div>
          <div class="sig-note">${
            p
              ? "Bypasses quiet hours & notification preferences. Distinct sound. For closures, delays, emergencies."
              : "Normal posts respect each family's quiet hours (default 9 PM – 7 AM)."
          }</div>
        </div>
        <button class="btn ${p ? "btn-danger" : "btn-primary"} btn-block" id="publishPost">${p ? "Send priority alert to ~1,500 devices" : "Publish + notify all families"}</button>
      </div>
      <div class="card">
        <h3>Quick template</h3>
        <div class="meta" style="margin:4px 0 10px">ZCS follows ZPS weather closures — one tap replaces the news-outlet scramble.</div>
        <button class="btn btn-ghost btn-block" id="snowTemplate">❄️ Snow day announcement</button>
      </div>
    </div>`
  );
}

function adminClassrooms() {
  return (
    header("Classrooms", "All 55 · showing 4") +
    `<div class="screen">
      ${state.classrooms
        .map(
          (c) => `<div class="card thread-row">
            <div class="avatar">${esc(c.teacher.split(" ").pop()[0])}</div>
            <div class="t-body">
              <div class="t-name">${esc(c.name)}</div>
              <div class="t-prev">Code ${esc(c.code)} · ${c.families} families joined</div>
            </div>
            <span class="pill done">active</span>
          </div>`
        )
        .join("")}
      <div class="card">
        <h3>Adoption</h3>
        <div class="meta">Activated families — target ≥90% by Sept 15</div>
        <div class="progress"><i style="width:87%"></i></div>
        <div class="meta" style="margin-top:5px"><b>549/630 families</b> (87%) · 24h announcement read rate: <b>84%</b></div>
      </div>
    </div>`
  );
}

function adminStaff() {
  return (
    header("Staff allowlist", "Emails here auto-assign Teacher/Admin at sign-up") +
    `<div class="screen">
      <div class="card">
        <label class="f-label">Add staff email</label>
        <div style="display:flex;gap:8px">
          <input type="text" id="staffEmail" placeholder="name@zcs.org" autocomplete="off">
          <button class="btn btn-primary" id="staffAdd">Add</button>
        </div>
        <div class="sig-note">Bulk paste supported. New sign-ups matching the list get the role automatically.</div>
      </div>
      <div class="card">
        ${state.staff
          .map(
            (s) => `<div class="member-row">
              <span>${esc(s.email)}</span>
              <span class="m-tag ${s.role === "Admin" ? "unread" : "read"}" style="margin-left:auto">${s.role}</span>
            </div>`
          )
          .join("")}
      </div>
    </div>`
  );
}

function adminAudit() {
  if (state.auditThread) {
    const t = state.threads.find((x) => x.id === state.auditThread);
    return (
      header(`<button class="back-btn" data-back>‹ Audit log</button>`, "") +
      `<div class="screen">
        <div class="card">
          <span class="pill school">DM thread</span>
          <h3 style="margin-top:6px">${esc(t.teacher)} ↔ ${esc(t.guardian)}</h3>
          <div class="meta">${esc(classroom(t.classroomId).name)} · messages are immutable — no edits or deletes, ever</div>
        </div>
        ${t.messages
          .map(
            (m) => `<div class="card" style="padding:10px 14px">
              <div class="meta"><b>${m.from === "teacher" ? esc(t.teacher) : esc(t.guardian)}</b> · ${esc(m.when)}</div>
              <div class="body" style="font-size:13.5px;margin-top:3px">${esc(m.body)}</div>
            </div>`
          )
          .join("")}
        <div class="audit-note">👁️ <b>This view was just logged.</b> Every admin read of a thread is written to <code>admin_access_log</code> — accountability runs both directions.</div>
      </div>`
    );
  }
  return (
    header("Audit log", "Search all DM threads · every view is logged") +
    `<div class="screen">
      <div class="card">
        <input type="text" placeholder="🔍 Search by participant, classroom, keyword…" autocomplete="off">
      </div>
      <div class="section-title">DM threads</div>
      ${state.threads
        .map(
          (t) => `<div class="card thread-row" data-audit="${t.id}">
            <div class="avatar">🔒</div>
            <div class="t-body">
              <div class="t-name">${esc(t.teacher)} ↔ ${esc(t.guardian)}</div>
              <div class="t-prev">${esc(classroom(t.classroomId).name)} · ${t.messages.length} messages</div>
            </div>
          </div>`
        )
        .join("")}
      <div class="section-title">Admin access log</div>
      <div class="card">
        ${state.audit
          .map((a) => `<div class="audit-row"><b>${esc(a.admin)}</b> — ${esc(a.what)}<div class="a-when">${esc(a.when)}</div></div>`)
          .join("")}
      </div>
    </div>`
  );
}

/* ============================================================
   WIRING
   ============================================================ */
function wire() {
  // tabs
  app.querySelectorAll("[data-tab]").forEach((b) =>
    b.addEventListener("click", () => {
      state.tab[state.role] = b.dataset.tab;
      state.openThread = null;
      state.openForm = null;
      state.auditThread = null;
      render();
    })
  );

  // back buttons
  app.querySelectorAll("[data-back]").forEach((b) =>
    b.addEventListener("click", () => {
      state.openThread = null;
      state.openForm = null;
      state.auditThread = null;
      render();
    })
  );

  // open thread / form / audit thread
  app.querySelectorAll("[data-thread]").forEach((el) =>
    el.addEventListener("click", () => { state.openThread = el.dataset.thread; render(); scrollChat(); })
  );
  app.querySelectorAll("[data-form]").forEach((el) =>
    el.addEventListener("click", () => { state.openForm = el.dataset.form; render(); })
  );
  app.querySelectorAll("[data-audit]").forEach((el) =>
    el.addEventListener("click", () => {
      state.auditThread = el.dataset.audit;
      state.audit.unshift({ admin: "office@zcs.org (you)", what: `Viewed thread: ${state.threads.find((t) => t.id === el.dataset.audit).teacher} ↔ ${state.threads.find((t) => t.id === el.dataset.audit).guardian}`, when: "Just now" });
      render();
    })
  );

  // chat send
  const send = $("#chatSend", app);
  if (send) {
    const doSend = () => {
      const input = $("#chatInput", app);
      const text = input.value.trim();
      if (!text) return;
      const t = state.threads.find((x) => x.id === state.openThread);
      const as = state.role === "teacher" ? "teacher" : "guardian";
      t.messages.push({ from: as, body: text, when: "Just now" });
      render();
      scrollChat();
      toast("Delivered in real time (Supabase Realtime) ⚡");
      if (as === "guardian" && t.id === "t1") {
        setTimeout(() => {
          t.messages.push({ from: "teacher", body: "Got it — thanks for letting me know!", when: "Just now" });
          if (state.role === "parent" && state.openThread === t.id) { render(); scrollChat(); }
          phoneBanner("Mrs. VanderWall", "Got it — thanks for letting me know!");
        }, 1600);
      }
    };
    send.addEventListener("click", doSend);
    $("#chatInput", app).addEventListener("keydown", (e) => { if (e.key === "Enter") doSend(); });
  }

  // RSVP
  app.querySelectorAll("[data-rsvp]").forEach((seg) =>
    seg.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => {
        const ev = state.events.find((x) => x.id === seg.dataset.rsvp);
        const val = b.dataset.val;
        if (ev.myRsvp) ev.counts[ev.myRsvp]--;
        ev.myRsvp = val;
        ev.counts[val]++;
        render();
        toast(val === "yes" ? "RSVP saved — reminder push set for the day before ⏰" : "RSVP saved");
      })
    )
  );

  // slots
  app.querySelectorAll("[data-claim]").forEach((b) =>
    b.addEventListener("click", () => {
      const s = findSlot(b.dataset.claim);
      if (s.claimed >= s.qty) return;
      s.claimed++; s.mine = true;
      render();
      toast(`You're signed up: ${s.label} ✓ — capacity enforced atomically`);
    })
  );
  app.querySelectorAll("[data-release]").forEach((b) =>
    b.addEventListener("click", () => {
      const s = findSlot(b.dataset.release);
      s.claimed--; s.mine = false;
      render();
      toast("Slot released — it's open for another family");
    })
  );

  // add to calendar
  app.querySelectorAll("[data-addcal]").forEach((a) =>
    a.addEventListener("click", (e) => { e.preventDefault(); toast("Added to your device calendar 📅 (Expo Calendar)"); })
  );

  // form consent + submit
  const consentRow = $("[data-consent]", app);
  if (consentRow) {
    consentRow.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => {
        const f = state.forms.find((x) => x.id === state.openForm);
        if (f.status === "done") return;
        f.consent = b.dataset.val;
        const sig = $("#sigInput", app);
        if (sig) f.signature = sig.value;
        render();
      })
    );
  }
  const submit = $("#formSubmit", app);
  if (submit) {
    submit.addEventListener("click", () => {
      const f = state.forms.find((x) => x.id === state.openForm);
      const sig = $("#sigInput", app);
      if (!f.consent) return toast("Choose a response first");
      if (f.needsSignature && (!sig || sig.value.trim().length < 5)) return toast("Type your full legal name to sign");
      if (sig) f.signature = sig.value.trim();
      f.status = "done";
      f.due = "Submitted just now";
      f.completed++;
      f.incomplete = f.incomplete.filter((n) => !n.includes("Meyer"));
      render();
      toast("✅ Done in ~30 seconds — no paper lost in a backpack");
    });
  }

  // teacher: publish post
  const pub = $("#publishPost", app);
  if (pub) {
    pub.addEventListener("click", () => {
      const title = $("#postTitle", app).value.trim();
      const body = $("#postBody", app).value.trim();
      if (!title) return toast("Add a title first");
      const isAdmin = state.role === "admin";
      const pri = isAdmin && state.composePriority;
      state.announcements.unshift({
        id: "a" + (state.announcements.length + 1 + Math.floor(Math.random() * 999)),
        scope: isAdmin ? "school" : "classroom",
        classroomId: isAdmin ? null : "vw",
        author: isAdmin ? "ZCS Front Office" : "Mrs. VanderWall",
        title, body: esc(body || "(no body)"),
        attachment: null, when: "Just now", priority: pri,
        reads: 0, total: isAdmin ? 630 : 26, readByMe: false, nudged: false, mine: !isAdmin,
      });
      state.composePriority = false;
      render();
      if (pri) {
        phoneBanner("⚠ ZCS PRIORITY ALERT", title, true);
        toast("Priority alert fanned out to ~1,500 devices — bypassed quiet hours", true);
      } else {
        phoneBanner("ZCS Connect", title);
        toast(`<b>Push sent</b> to ${isAdmin ? "all ~630 families" : "26 families"} 📲 Switch to Parent to see it land`, true);
      }
    });
  }

  // teacher: nudge
  app.querySelectorAll("[data-nudge]").forEach((b) =>
    b.addEventListener("click", () => {
      const a = state.announcements.find((x) => x.id === b.dataset.nudge);
      a.nudged = true;
      render();
      toast(`Re-notified ${a.total - a.reads} unread families — once per post, max`);
    })
  );

  // teacher: remind form
  app.querySelectorAll("[data-remind]").forEach((b) =>
    b.addEventListener("click", () => {
      const f = state.forms.find((x) => x.id === b.dataset.remind);
      f.reminded = true;
      render();
      toast(`Reminder pushed to ${f.incomplete.length} families 🔔`);
    })
  );

  // teacher: code card
  const regen = $("#regenCode", app);
  if (regen)
    regen.addEventListener("click", () => {
      classroom("vw").code = newCode();
      render();
      toast("Code regenerated — old code invalid, existing members unaffected");
    });
  const share = $("#shareHandout", app);
  if (share)
    share.addEventListener("click", () => toast("📄 One-page PDF generated: code + QR + store links → share sheet"));

  // admin: priority toggle & snow template
  app.querySelectorAll("[data-pri]").forEach((b) =>
    b.addEventListener("click", () => {
      const t = $("#postTitle", app), bd = $("#postBody", app);
      state._draftTitle = t ? t.value : ""; state._draftBody = bd ? bd.value : "";
      state.composePriority = b.dataset.pri === "1";
      render();
      const t2 = $("#postTitle", app), bd2 = $("#postBody", app);
      if (t2) t2.value = state._draftTitle;
      if (bd2) bd2.value = state._draftBody;
    })
  );
  const snow = $("#snowTemplate", app);
  if (snow)
    snow.addEventListener("click", () => {
      state.composePriority = true;
      render();
      $("#postTitle", app).value = "SNOW DAY — School closed today ❄️";
      $("#postBody", app).value = "Zeeland Christian is CLOSED today following ZPS weather closures. All activities and childcare are cancelled. Stay warm, Rams!";
      toast("Template loaded — ready to send");
    });

  // admin: staff add
  const staffAdd = $("#staffAdd", app);
  if (staffAdd)
    staffAdd.addEventListener("click", () => {
      const inp = $("#staffEmail", app);
      const v = inp.value.trim().toLowerCase();
      if (!v.includes("@")) return toast("Enter a valid email");
      state.staff.unshift({ email: v, role: "Teacher" });
      render();
      toast(`${v} added — they'll be a Teacher the moment they sign up`);
    });

  // generic toast buttons
  app.querySelectorAll("[data-toastmsg]").forEach((b) =>
    b.addEventListener("click", () => toast(b.dataset.toastmsg))
  );

  // onboarding
  app.querySelectorAll("[data-ob]").forEach((b) =>
    b.addEventListener("click", () => {
      const next = parseInt(b.dataset.ob, 10);
      if (next === 2) {
        const code = ($("#obCode", app).value || "").toUpperCase().replace(/\s/g, "");
        if (code !== "ZCS-7RM4KX" && code !== "ZCS7RM4KX") {
          $("#obErr", app).textContent = "Hmm, that code doesn't match. Try ZCS-7RM4KX.";
          return;
        }
      }
      if (next === 3) {
        toast("Mrs. VanderWall was notified: “New family joined” 🔔", true);
        const m = state.members.find((x) => x.name === "Ella Meyer");
        if (m) m.isNew = true;
      }
      state.onboardStep = next;
      render();
      if (next === 1) { const c = $("#obCode", app); if (c) c.focus(); }
    })
  );

  // parent home: mark unread as read (read receipts)
  if (state.role === "parent" && state.tab.parent === "home" && state.onboardStep === -1) {
    const unread = state.announcements.filter((a) => !a.readByMe);
    if (unread.length) {
      setTimeout(() => {
        let changed = false;
        unread.forEach((a) => {
          if (!a.readByMe) { a.readByMe = true; a.reads = Math.min(a.total, a.reads + 1); changed = true; }
        });
        if (changed && state.role === "parent" && state.tab.parent === "home") {
          toast("Read receipts sent — the teacher's read count just ticked up ✓");
        }
      }, 1800);
    }
  }
}

function findSlot(id) {
  for (const ev of state.events) {
    const s = ev.slots.find((x) => x.id === id);
    if (s) return s;
  }
}

function scrollChat() {
  const c = $("#chatScroll", app);
  if (c) c.scrollTop = c.scrollHeight;
}

/* ---------- role switcher (sidebar) ---------- */
document.querySelectorAll(".role-btn").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".role-btn").forEach((x) => x.classList.toggle("active", x === b));
    state.role = b.dataset.role;
    state.openThread = null;
    state.openForm = null;
    state.auditThread = null;
    if (state.role !== "parent" && state.onboardStep >= 0) state.onboardStep = -1;
    render();
  })
);

render();
