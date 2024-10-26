const apiBase = '/api/notes';

async function fetchNotes() {
    const res = await fetch(apiBase);
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
            </div>
        `;
        container.appendChild(noteElement);
    });
}

async function deleteNote(id) {
    await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
    fetchNotes();
}

// Form Submission Handler
document.getElementById('noteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const noteId = document.getElementById('noteForm').getAttribute('data-edit-id');

    // Determine if we're editing or adding a new note
    if (noteId) {
        // Update existing note
        await fetch(`${apiBase}/${noteId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
        document.getElementById('noteForm').removeAttribute('data-edit-id');
        document.getElementById('cancelEdit').style.display = 'none';
    } else {
        // Create new note
        await fetch(apiBase, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
        });
    }

    document.getElementById('noteForm').reset();
    fetchNotes();
});

// Start edit mode for a note
function startEdit(id, title, content) {
    document.getElementById('title').value = title;
    document.getElementById('content').value = content;
    document.getElementById('noteForm').setAttribute('data-edit-id', id);
    document.getElementById('cancelEdit').style.display = 'inline';
}

// Cancel edit mode
document.getElementById('cancelEdit').addEventListener('click', () => {
    document.getElementById('noteForm').reset();
    document.getElementById('noteForm').removeAttribute('data-edit-id');
    document.getElementById('cancelEdit').style.display = 'none';
});

// Initial load
fetchNotes();
