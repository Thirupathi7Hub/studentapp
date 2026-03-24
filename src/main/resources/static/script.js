const API = 'https://studentapp-production-53d0.up.railway.app/students';

let allStudents = [];
let currentStudent = null;

window.onload = loadStudents;

// ================= LOAD =================
function loadStudents() {
  fetch(API)
    .then(res => {
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    })
    .then(data => {
      allStudents = data;
      document.getElementById('total-count').textContent = data.length;
      renderCards(data);
    })
    .catch(err => console.error("Load error:", err));
}

// ================= RENDER =================
function renderCards(students) {
  const grid = document.getElementById('student-grid');

  if (students.length === 0) {
    grid.innerHTML = `<p>No students found</p>`;
    return;
  }

  grid.innerHTML = students.map(s => `
    <div class="card" onclick="openModal(${s.id})">
      <h3>${s.name}</h3>
      <p>${s.department || 'No Department'}</p>
      <p>${s.email}</p>
    </div>
  `).join('');
}

// ================= SAVE =================
function saveStudent() {
  const id = document.getElementById('edit-id').value;

  const body = {
    name: document.getElementById('f-name').value,
    email: document.getElementById('f-email').value,
    phone: document.getElementById('f-phone').value || null,
    age: document.getElementById('f-age').value 
          ? parseInt(document.getElementById('f-age').value)
          : null,
    department: document.getElementById('f-dept').value || null,
    year: document.getElementById('f-year').value || null,
    gender: document.getElementById('f-gender').value || null,
  };

  console.log("Sending:", body);

  fetch(id ? `${API}/${id}` : API, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(async res => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }
    return res.json();
  })
  .then(() => {
    alert(id ? "Updated!" : "Added!");
    showSection('list');
    loadStudents();
  })
  .catch(err => {
    console.error("Save error:", err);
    alert("Error: " + err.message);
  });
}

// ================= DELETE =================
function deleteFromModal() {
  if (!currentStudent) return;

  fetch(`${API}/${currentStudent.id}`, { method: 'DELETE' })
    .then(() => {
      closeModal();
      loadStudents();
    });
}

// ================= UI =================
function showSection(name) {
  document.getElementById('section-list').style.display =
    name === 'list' ? 'block' : 'none';

  document.getElementById('section-add').style.display =
    name === 'add' ? 'block' : 'none';

  document.getElementById('page-title').textContent =
    name === 'list' ? 'All Students' : 'Add Student';
}

// ================= MODAL =================
function openModal(id) {
  const s = allStudents.find(x => x.id === id);
  if (!s) return;

  currentStudent = s;
  alert(`Name: ${s.name}\nEmail: ${s.email}`);
}

function closeModal() {
  currentStudent = null;
}