const API = "https://studentapp-production-53d0.up.railway.app/students";

let allStudents = [];
let currentStudent = null;

window.onload = loadStudents;

/* LOAD STUDENTS */
function loadStudents() {
  fetch(API)
    .then(r => {
      if (!r.ok) throw new Error("Failed to load");
      return r.json(); // ✅ FIXED
    })
    .then(data => {
      allStudents = data;
      document.getElementById("total-count").textContent = data.length;
      renderCards(data);
    })
    .catch(err => console.error("Load error:", err));
}

/* RENDER */
function renderCards(students) {
  const grid = document.getElementById("student-grid");

  if (!students.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="big">🎓</div>
        <p>No students found. Add your first student!</p>
      </div>`;
    return;
  }

  grid.innerHTML = students.map(s => `
    <div class="card" onclick="openModal(${s.id})">
      <div class="card-avatar">${initials(s.name)}</div>
      <div class="card-name">${s.name}</div>
      <div class="card-dept">${s.department || 'No Department'}</div>

      <div class="card-info">
        <div>Email: ${s.email}</div>
        <div>Phone: ${s.phone || '—'}</div>
        <div>Age: ${s.age ?? '—'}</div>
      </div>

      <span class="card-badge">${s.year || 'Year N/A'}</span>
    </div>
  `).join('');
}

/* HELPERS */
function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/* SEARCH */
function searchStudents(query) {
  const q = query.toLowerCase();
  const filtered = allStudents.filter(s =>
    s.name.toLowerCase().includes(q) ||
    (s.department && s.department.toLowerCase().includes(q))
  );
  renderCards(filtered);
}

/* MODAL */
function openModal(id) {
  const s = allStudents.find(x => x.id === id);
  if (!s) return;

  currentStudent = s;

  document.getElementById('m-name').textContent = s.name;
  document.getElementById('m-email').textContent = s.email;
  document.getElementById('s.age').textContent = s.age;
  document.getElementById('s.year').textContent = s.year;
  

  document.getElementById('overlay').classList.add('show');
  document.getElementById('modal').classList.add('show');
}

function closeModal() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('modal').classList.remove('show');
  currentStudent = null;
}

/* DELETE */
function deleteFromModal() {
  if (!currentStudent) return;

  fetch(`${API}/${currentStudent.id}`, { method: 'DELETE' })
    .then(() => {
      closeModal();
      loadStudents();
    })
    .catch(err => console.error("Delete error:", err));
}

function showSection(name) {
  document.getElementById('section-list').style.display =
    name === 'list' ? 'block' : 'none';

  document.getElementById('section-add').style.display =
    name === 'add' ? 'block' : 'none';

  document.getElementById('page-title').textContent =
    name === 'list' ? 'All Students' : 'Add Student';

  // highlight active nav
  document.querySelectorAll('.nav-item').forEach((el, i) => {
    el.classList.toggle(
      'active',
      (i === 0 && name === 'list') || (i === 1 && name === 'add')
    );
  });
}

/* SAVE */
function saveStudent() {
  const id = document.getElementById('edit-id').value;

  const body = {
    name: document.getElementById('f-name').value,
    email: document.getElementById('f-email').value,
    phone: document.getElementById('f-phone').value || null,
    age: document.getElementById('f-age').value
          ? parseInt(document.getElementById('f-age').value)
          : null, // ✅ FIXED (no NaN)
    department: document.getElementById('f-dept').value || null,
    year: document.getElementById('f-year').value || null,
    gender: document.getElementById('f-gender').value || null
  };

  const msg = document.getElementById('form-msg');

  if (!body.name || !body.email) {
    msg.textContent = 'Name and Email required!';
    return;
  }

  console.log("Sending:", body); // ✅ DEBUG

  fetch(id ? `${API}/${id}` : API, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then(async r => {
      if (!r.ok) {
        const errText = await r.text(); // ✅ SHOW BACKEND ERROR
        throw new Error(errText);
      }
      return r.json();
    })
    .then(() => {
      msg.textContent = id ? 'Updated!' : 'Added!';
      setTimeout(() => {
        loadStudents();
      }, 1000);
    })
    .catch(err => {
      console.error("Save error:", err);
      msg.textContent = "Error: " + err.message;
    });
}