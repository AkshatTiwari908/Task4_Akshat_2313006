document.addEventListener("DOMContentLoaded", function() {
    const apiBase = 'api/notes';
    let token = localStorage.getItem('token');

    const authSection = document.getElementById('authSection');
    const notesApp = document.getElementById('notesApp');

    // Set  headers with token for authenticated requests
    async function fetchWithAuth(url, options = {}) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
        return await fetch(url, options);
    }

    // Login function
    async function login() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const res = await fetch('/api/r/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
    
        const data = await res.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            token = data.token;    
           /*  authSection.reset(); */
            authSection.style.display = 'none';
            notesApp.style.display = 'block';
            fetchNotes();
        } else {
            alert('Login failed');
        }
    }
    //Logout
    function logout(){
        const notesApp = document.getElementById('notesApp')
        localStorage.removeItem('token');
        token = null;
        if (authSection.style.display === 'none') {
            notesApp.style.display = 'none';
            authSection.style.display = 'block';  
        } else {
            authSection.style.display = 'none';
            notesApp.style.display = 'block';
        }
    }
     //registration function
    async function register() {
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const res = await fetch('/api/r/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) {
            alert('Registration successful');
        } else {
            alert('Registration failed');
        }
    }

    //fetch notes
    async function fetchNotes() {
        const res = await fetchWithAuth(apiBase);
        const notes = await res.json();
        const container = document.getElementById('notesContainer');
        container.innerHTML = '';

        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.innerHTML = `
                <div class="note-title">${note.title}</div>
                <div class="note-content">${note.content}</div>
                <div class="actions">
                    <button onclick="startEdit('${note._id}', '${note.title}', '${note.content}')">Edit</button>
                    <button onclick="deleteNote('${note._id}')">Delete</button>
                </div>`;
            container.appendChild(noteElement);
        });
    }

       // delete a note
    async function deleteNote(id) {
        await fetchWithAuth(`${apiBase}/${id}`, { method: 'DELETE' });
        fetchNotes();
    }

    document.getElementById('noteForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const noteId = document.getElementById('noteForm').getAttribute('data-edit-id');

        if (noteId) {
            await fetchWithAuth(`${apiBase}/${noteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
            document.getElementById('noteForm').removeAttribute('data-edit-id');
            document.getElementById('cancelEdit').style.display = 'none';
        } else {
            await fetchWithAuth(apiBase, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
        }

        document.getElementById('noteForm').reset();
        fetchNotes();
    });

    function startEdit(id, title, content) {
        document.getElementById('title').value = title;
        document.getElementById('content').value = content;
        document.getElementById('noteForm').setAttribute('data-edit-id', id);
        document.getElementById('cancelEdit').style.display = 'inline';
    }

    document.getElementById('cancelEdit').addEventListener('click', () => {
        document.getElementById('noteForm').reset();
        document.getElementById('noteForm').removeAttribute('data-edit-id');
        document.getElementById('cancelEdit').style.display = 'none';
    });

    function toggleAuthForms() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm.style.display === 'none') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }
    }

    if (token) {
        authSection.style.display = 'none';
        notesApp.style.display = 'block';
        fetchNotes();
    } else {
        authSection.style.display = 'block';
    }

    window.login = login;
    window.register = register;
    window.toggleAuthForms = toggleAuthForms;
    window.startEdit = startEdit;
    window.deleteNote = deleteNote;
    window.logout = logout;
});
