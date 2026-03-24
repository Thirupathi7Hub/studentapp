const API = 'http://localhost:8080/students';
let allStudents = [];
let currentStudent = null;

window.onload = loadStudents;

function loadStudents() {
  fetch(API)
    .then(r => r.json())
    .then(data => {
      allStudents = data;
      document.getElementById('total-count').textContent = data.length;
      renderCards(data);
    });
}

function renderCards(students) {
  const grid = document.getElementById('student-grid');
  if (students.length === 0) {
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
        <div class="card-row">
          <span class="card-key">Email</span>
          <span class="card-val">${s.email}</span>
        </div>
        <div class="card-row">
          <span class="card-key">Phone</span>
          <span class="card-val">${s.phone || '—'}</span>
        </div>
        <div class="card-row">
          <span class="card-key">Age</span>
          <span class="card-val">${s.age}</span>
        </div>
      </div>
      <span class="card-badge">${s.year || 'Year N/A'}</span>
    </div>
  `).join('');
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function searchStudents(query) {
  const q = query.toLowerCase();
  const filtered = allStudents.filter(s =>
    s.name.toLowerCase().includes(q) ||
    (s.department && s.department.toLowerCase().includes(q))
  );
  renderCards(filtered);
}

function openModal(id) {
  const s = allStudents.find(x => x.id === id);
  if (!s) return;
  currentStudent = s;
  document.getElementById('m-avatar').textContent = initials(s.name);
  document.getElementById('m-name').textContent   = s.name;
  document.getElementById('m-dept').textContent   = s.department || '—';
  document.getElementById('m-email').textContent  = s.email;
  document.getElementById('m-phone').textContent  = s.phone || '—';
  document.getElementById('m-age').textContent    = s.age;
  document.getElementById('m-year').textContent   = s.year || '—';
  document.getElementById('m-gender').textContent = s.gender || '—';
  document.getElementById('m-id').textContent     = '#' + s.id;
  document.getElementById('overlay').classList.add('show');
  document.getElementById('modal').classList.add('show');
}

function closeModal() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('modal').classList.remove('show');
  currentStudent = null;
}

function editFromModal() {
  closeModal();
  showSection('add');
  const s = currentStudent || allStudents.find(x => x.id == document.getElementById('m-id').textContent.replace('#',''));
  if (!s) return;
  document.getElementById('edit-id').value  = s.id;
  document.getElementById('f-name').value   = s.name;
  document.getElementById('f-email').value  = s.email;
  document.getElementById('f-phone').value  = s.phone || '';
  document.getElementById('f-age').value    = s.age;
  document.getElementById('f-dept').value   = s.department || '';
  document.getElementById('f-year').value   = s.year || '';
  document.getElementById('f-gender').value = s.gender || '';
}

function deleteFromModal() {
  if (!currentStudent) return;
  if (!confirm('Delete ' + currentStudent.name + '?')) return;
  fetch(`${API}/${currentStudent.id}`, { method: 'DELETE' })
    .then(() => { closeModal(); loadStudents(); });
}

function saveStudent() {
  const id   = document.getElementById('edit-id').value;
  const body = {
    name:       document.getElementById('f-name').value,
    email:      document.getElementById('f-email').value,
    phone:      document.getElementById('f-phone').value,
    age:        parseInt(document.getElementById('f-age').value),
    department: document.getElementById('f-dept').value,
    year:       document.getElementById('f-year').value,
    gender:     document.getElementById('f-gender').value,
  };
  const msg = document.getElementById('form-msg');
  if (!body.name || !body.email) {
    msg.textContent = 'Name and Email are required!';
    msg.className = 'form-msg error';
    return;
  }
  fetch(id ? `${API}/${id}` : API, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  .then(r => r.json())
  .then(() => {
    msg.textContent = id ? 'Student updated!' : 'Student added!';
    msg.className = 'form-msg success';
    setTimeout(() => { showSection('list'); loadStudents(); }, 1000);
  });
}

function showSection(name) {
  document.getElementById('section-list').style.display = name === 'list' ? 'block' : 'none';
  document.getElementById('section-add').style.display  = name === 'add'  ? 'block' : 'none';
  document.getElementById('page-title').textContent = name === 'list' ? 'All Students' : 'Add Student';
  document.querySelectorAll('.nav-item').forEach((el, i) => {
    el.classList.toggle('active', (i === 0 && name === 'list') || (i === 1 && name === 'add'));
  });
  if (name === 'add') {
    document.getElementById('edit-id').value = '';
    document.getElementById('form-msg').textContent = '';
  }
}