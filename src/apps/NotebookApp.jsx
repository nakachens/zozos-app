/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import './NotebookApp.css';

// Force CSS to load immediately
const ensureFontsLoaded = () => {
  // Create invisible element to force font loading
  const fontTest = document.createElement('div');
  fontTest.style.position = 'absolute';
  fontTest.style.visibility = 'hidden';
  fontTest.style.fontFamily = "'Crimson Text', 'Lora', Georgia, serif";
  fontTest.textContent = 'Font loading test';
  document.body.appendChild(fontTest);
  
  // Force reflow to ensure font is applied
  fontTest.offsetHeight;
  
  // Clean up
  document.body.removeChild(fontTest);
};

const NotebookApp = () => {
  const [notes, setNotes] = useState([]);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [dialogStep, setDialogStep] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [theme, setTheme] = useState('light');
  const [currentScreen, setCurrentScreen] = useState('start');
  const [currentMainScreen, setCurrentMainScreen] = useState('myNotes');
  const [editorContent, setEditorContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogMessage, setDialogMessage] = useState("It's okay, write it out... Let your heart speak through the ink. ✨");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  
  // Add state to track if dialog has been shown in this session
  const [dialogShownThisSession, setDialogShownThisSession] = useState(false);
  
  const autoSaveTimeoutRef = useRef(null);
  const editorRef = useRef(null);
  const clickSoundRef = useRef(null); 

  // setup app
  useEffect(() => {
    // Ensure fonts are loaded immediately
    ensureFontsLoaded();
    
    loadNotesFromStorage();
    
    // use localStorage properly - check for browser support
    try {
      const savedTheme = localStorage.getItem('journalTheme') ? JSON.parse(localStorage.getItem('journalTheme')) : 'light';
      setTheme(savedTheme);
      
      const savedAutoSave = localStorage.getItem('journalAutoSave') ? JSON.parse(localStorage.getItem('journalAutoSave')) : false;
      setAutoSaveEnabled(savedAutoSave);
    } catch (e) {
      console.warn('localStorage not available, using defaults');
    }
    
    const appContainer = document.querySelector('.notebook-app-wrapper');
    if (appContainer) {
      appContainer.classList.toggle('dark-theme', theme === 'dark');
    }

    // setup click sound
    clickSoundRef.current = new Audio('/click.mp3');
    if (clickSoundRef.current) {
      clickSoundRef.current.volume = 0.3;
    }
  }, []);

  // function to play click sound
  const playClickSound = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(error => {
        console.log("Click sound play failed:", error);
      });
    }
  };

  useEffect(() => {
    const appContainer = document.querySelector('.notebook-app-wrapper');
    if (appContainer) {
      appContainer.classList.toggle('dark-theme', theme === 'dark');
    }
  }, [theme]);

  const updateDateDisplay = () => {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return now.toLocaleDateString('en-US', options);
  };

  // delete popup
  const confirmDelete = (noteId, event) => {
    playClickSound();
    if (event) event.stopPropagation();
    setNoteToDelete(noteId);
    setShowDeletePopup(true);
  };

  const handleDeleteConfirm = () => {
    playClickSound();
    if (noteToDelete) {
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteToDelete));
      
      if (currentNoteId === noteToDelete) {
        newNote();
      }
      
      saveNotesToStorage();
    }
    setShowDeletePopup(false);
    setNoteToDelete(null);
  };

  const handleDeleteCancel = () => {
    playClickSound();
    setShowDeletePopup(false);
    setNoteToDelete(null);
  };

  // navigation
  const openNotebook = () => {
    playClickSound();
    setCurrentScreen('notebook');
    showMyNotes();
  };

  const goBackToStart = () => {
    playClickSound();
    setCurrentScreen('start');
  };

  const showMyNotes = () => {
    playClickSound();
    setCurrentMainScreen('myNotes');
  };

  const showNewNote = () => {
    playClickSound();
    setCurrentMainScreen('writing');
    newNote();
    
    // Only show dialog if it hasn't been shown in this session
    if (!dialogShownThisSession) {
      setTimeout(() => {
        showCharacterDialog();
        setDialogShownThisSession(true); // Mark as shown for this session
      }, 100);
    }
  };

  // character dialogue
  const showCharacterDialog = () => {
    setDialogStep(0);
    setDialogMessage("It's okay, write it out... Let your heart speak through the ink. ✨");
    setShowDialog(true);
  };

  const handleDialogChoice = (choice) => {
    playClickSound();
    if (dialogStep === 0) {
      setDialogStep(1);
      if (choice === 'try') {
        setDialogMessage("Good job! I believe in you. Pour your heart onto these pages.  💫");
      } else if (choice === 'away') {
        setDialogMessage("what the heck bro i was just tryna be nice");
      }
    }
  };

  const closeCharacterDialog = () => {
    playClickSound();
    setShowDialog(false);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // note management
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const newNote = () => {
    setEditorContent('');
    setCurrentNoteId(null);
  };

  const saveNote = () => {
    playClickSound();
    const content = editorContent.trim();
    if (!content) {
      alert('Please write something before saving! ✨');
      return;
    }

    const title = content.split('\n')[0].substring(0, 50) || 'Untitled Note';
    const now = new Date();

    if (currentNoteId) {
      // update existing note
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === currentNoteId 
            ? {...note, title, content, lastModified: now.toISOString()}
            : note
        )
      );
    } else {
      // create new note
      const note = {
        id: generateId(),
        title: title,
        content: content,
        date: now.toISOString(),
        lastModified: now.toISOString()
      };
      setNotes(prevNotes => [note, ...prevNotes]);
      setCurrentNoteId(note.id);
    }

    saveNotesToStorage();
    showSaveIndicator();
  };

  const showSaveIndicator = () => {
    const indicator = document.getElementById('autoSaveIndicator');
    if (indicator) {
      indicator.classList.add('show');
      setTimeout(() => {
        indicator.classList.remove('show');
      }, 2000);
    }
  };

  useEffect(() => {
    if (!autoSaveEnabled || !editorContent.trim()) return;

    const timeoutId = setTimeout(() => {
      const content = editorContent.trim();
      if (content) {
        const title = content.split('\n')[0].substring(0, 50) || 'Untitled Note';
        const now = new Date();

        setNotes(prevNotes => {
          if (currentNoteId) {
            return prevNotes.map(note => 
              note.id === currentNoteId 
                ? {...note, title, content, lastModified: now.toISOString()}
                : note
            );
          } else {
            const note = {
              id: generateId(),
              title: title,
              content: content,
              date: now.toISOString(),
              lastModified: now.toISOString()
            };
            setCurrentNoteId(note.id);
            return [note, ...prevNotes];
          }
        });
        
        showSaveIndicator();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [editorContent, autoSaveEnabled, currentNoteId]);

  const toggleAutoSave = () => {
    playClickSound();
    const newAutoSaveEnabled = !autoSaveEnabled;
    setAutoSaveEnabled(newAutoSaveEnabled);
    try {
      localStorage.setItem('journalAutoSave', JSON.stringify(newAutoSaveEnabled));
    } catch (e) {
      console.warn('Could not save auto-save preference');
    }
  };

  const loadNote = (noteId) => {
    playClickSound();
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setCurrentMainScreen('writing');
      setEditorContent(note.content);
      setCurrentNoteId(noteId);
    }
  };

  const deleteNote = (noteId, event) => {
    confirmDelete(noteId, event);
  };

  const deleteCurrentNote = () => {
    playClickSound();
    if (!currentNoteId) {
      alert('No note selected to delete! 📝');
      return;
    }
    
    confirmDelete(currentNoteId);
  };

  const filterNotes = (term) => {
    setSearchTerm(term);
  };

  const exportNote = () => {
    playClickSound();
    const content = editorContent;
    if (!content.trim()) {
      alert('No content to export! ✨');
      return;
    }

    const title = content.split('\n')[0].substring(0, 30) || 'note';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => {
    playClickSound();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      localStorage.setItem('journalTheme', JSON.stringify(newTheme));
    } catch (e) {
      console.warn('Could not save theme preference');
    }
  };

  const updateStats = () => {
    const words = editorContent.trim() ? editorContent.trim().split(/\s+/).length : 0;
    const chars = editorContent.length;
    
    return { words, chars };
  };

  const updateNotesList = () => {
    if (notes.length === 0) {
      return <li className="empty-state">No notes yet. Start writing your first magical entry! ✨</li>;
    }

    const filteredNotes = notes.filter(note => {
      if (!searchTerm) return true;
      return note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
             note.content.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return filteredNotes.map(note => {
      const date = new Date(note.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      const preview = note.content.replace(note.title, '').trim().substring(0, 100);
      
      return (
        <li key={note.id} className="note-item" onClick={() => loadNote(note.id)}>
          <div className="note-title">{note.title}</div>
          <div className="note-date">{date}</div>
          <div className="note-preview">{preview}...</div>
          <button className="delete-btn" onClick={(e) => deleteNote(note.id, e)} title="Delete note">×</button>
        </li>
      );
    });
  };

  const loadNotesFromStorage = () => {
    try {
      const saved = localStorage.getItem('journalNotes');
      if (saved) {
        setNotes(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load notes from storage');
    }
  };

  const saveNotesToStorage = () => {
    try {
      localStorage.setItem('journalNotes', JSON.stringify(notes));
    } catch (e) {
      console.warn('Could not save notes to storage');
    }
  };

  const handleEditorChange = (e) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    
    // trigger auto-save if enabled
    if (autoSaveEnabled) {
      // The useEffect will handle the auto-save timing
    }
  };

  // keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 's':
            e.preventDefault();
            if (currentMainScreen === 'writing') {
              saveNote();
            }
            break;
          case 'n':
            e.preventDefault();
            showNewNote();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentMainScreen, editorContent]);

  const stats = updateStats();

  return (
    <div className="notebook-app-wrapper">
      <div className="app-container">
        {/* start screen*/}
        {currentScreen === 'start' && (
          <div className="screen active start-screen" id="startScreen">
            <div className="mystical-elements">✨🌙⭐</div>
            <h1 className="fantasy-title">Whispers of the Quill</h1>
            <p className="emotional-subtitle">
              Where thoughts find sanctuary and hearts speak in ink... 
              Let the ancient pages hold your deepest secrets and wildest dreams.
            </p>
            <div className="mystical-elements">🕯️📜🖋️</div>
            <button className="open-notebook-btn" onClick={openNotebook}>Open Notebook</button>
          </div>
        )}

        {/* notebook screen */}
        {currentScreen === 'notebook' && (
          <div className="screen active grid notebook-screen" id="notebookScreen">
            <div className="sidebar">
              <div className="sidebar-title">🌟 Menu</div>
              <button className="sidebar-btn" onClick={showMyNotes}>📚 My Notes</button>
              <button className="sidebar-btn" onClick={showNewNote}>✏️ New Note</button>
              <button 
                className="sidebar-btn" 
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
              <button className="sidebar-btn" onClick={goBackToStart}>🏠 Home</button>
            </div>
            <div className="main-content">
              {/* my notes screen*/}
              <div 
                className="my-notes-screen" 
                id="myNotesScreen"
                style={{ display: currentMainScreen === 'myNotes' ? 'block' : 'none' }}
              >
                <h2 className="notes-header">📚 My Collected Thoughts</h2>
                <input 
                  type="text" 
                  className="search-box" 
                  id="searchBox" 
                  placeholder="🔍 Search through your memories..." 
                  value={searchTerm}
                  onChange={(e) => filterNotes(e.target.value)}
                />
                <ul className="notes-list" id="notesList">
                  {updateNotesList()}
                </ul>
              </div>

              {/* writing screen */}
              <div 
                className="writing-screen" 
                id="writingScreen"
                style={{ display: currentMainScreen === 'writing' ? 'flex' : 'none' }}
              >
                <div className="writing-toolbar">
                  <div className="toolbar-left">
                    <button className="toolbar-btn" onClick={toggleTheme}>
                      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                    </button>
                    <button className="toolbar-btn" onClick={exportNote}>📄 Export</button>
                    <button className="toolbar-btn" onClick={deleteCurrentNote}>🗑️ Delete</button>
                    <button className="toolbar-btn" onClick={saveNote}>💾 Save</button>
                    <label className="toolbar-btn">
                      <input 
                        type="checkbox" 
                        id="autoSave" 
                        checked={autoSaveEnabled}
                        onChange={toggleAutoSave} 
                        style={{marginRight: '5px'}} 
                      />
                      Auto-save
                    </label>
                  </div>
                  <div className="date-display" id="dateDisplay">{updateDateDisplay()}</div>
                </div>
                <div className="writing-area">
                  <div className="paper-lines"></div>
                  <textarea 
                    ref={editorRef}
                    className="editor" 
                    id="editor" 
                    placeholder="Dear diary... ✨

The quill awaits your thoughts, dreams, and whispered secrets..."
                    value={editorContent}
                    onChange={handleEditorChange}
                  ></textarea>
                </div>
                <div className="stats-bar">
                  <span id="wordCount">{stats.words} words</span>
                  <span className="auto-save-indicator" id="autoSaveIndicator">Auto-saved ✨</span>
                  <span id="charCount">{stats.chars} characters</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* character dialogue */}
        {showDialog && (
          <div className="character-dialog" id="characterDialog">
            <div className="character-header">
              <div className="character-avatar">🌟</div>
              <div className="character-name">Mysterious dude</div>
            </div>
            <div className="character-message" id="characterMessage">
              {dialogMessage}
            </div>
            <div className="dialog-options" id="dialogOptions">
              {dialogStep === 0 ? (
                <>
                  <button className="dialog-btn" onClick={() => handleDialogChoice('try')}>I'll try my best</button>
                  <button className="dialog-btn" onClick={() => handleDialogChoice('away')}>Go away</button>
                </>
              ) : (
                <button className="dialog-btn" onClick={closeCharacterDialog}>
                  {dialogMessage.includes("Good job") ? "Thank you i guess" : "lol"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* delete popup*/}
        {showDeletePopup && (
          <div className="delete-confirmation-overlay">
            <div className="delete-confirmation-popup">
              <div className="popup-header">Confirm Deletion</div>
              <div className="popup-message">
                Are you sure you want to delete this note? This cannot be undone. 💔
              </div>
              <div className="popup-buttons">
                <button className="popup-btn cancel-btn" onClick={handleDeleteCancel}>Cancel</button>
                <button className="popup-btn confirm-btn" onClick={handleDeleteConfirm}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotebookApp;