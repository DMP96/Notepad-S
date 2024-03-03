// Define global variables
let currentTab = 0;
const notes = [{ title: "", content: "" }];

// Function to save file
function saveFile() {
    const title = document.getElementById("title").value || "New Note";
    const textToSave = document.getElementById("editor").value;
    const filename = title.includes('.') ? title : title + ".txt";
    const blob = new Blob([textToSave], { type: "text/plain;charset=utf-8" });
    const downloadLink = document.createElement("a");

    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.textContent = "Download File";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Function to open file
function openFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function() {
            const text = reader.result;
            const filename = file.name;
            openNewNote(filename, text);
        };
        reader.readAsText(file);
    };
    input.click();
}

function deleteText() {
    var textArea = document.getElementById("editor");
    var selectionStart = textArea.selectionStart;
    var selectionEnd = textArea.selectionEnd;

    if (selectionStart !== selectionEnd) {
        var newText = textArea.value.substring(0, selectionStart) + textArea.value.substring(selectionEnd);
        textArea.value = newText;
        // Adjust cursor position after deletion
        textArea.selectionStart = selectionStart;
        textArea.selectionEnd = selectionStart;
    }

    textArea.focus();
}

function cutText() {
    var textArea = document.getElementById("editor");
    var selectedText = textArea.value.substring(textArea.selectionStart, textArea.selectionEnd);
    var newText = textArea.value.slice(0, textArea.selectionStart) + textArea.value.slice(textArea.selectionEnd);

    if (selectedText.length > 0) {
        navigator.clipboard.writeText(selectedText)
            .then(function() {
                console.log('Selected text cut and copied to clipboard');
                textArea.value = newText;
            })
            .catch(function(err) {
                console.error('Unable to cut and copy selected text: ', err);
            });
    } else {
        console.log('No text selected to cut');
    }

    textArea.focus();
}

function copyText() {
    var textArea = document.getElementById("editor");
    var selectedText = textArea.value.substring(textArea.selectionStart, textArea.selectionEnd);

    if (selectedText.length > 0) {
        navigator.clipboard.writeText(selectedText)
            .then(function() {
                console.log('Selected text copied to clipboard');
            })
            .catch(function(err) {
                console.error('Unable to copy selected text: ', err);
            });
    } else {
        console.log('No text selected to copy');
    }

    textArea.focus();
}

function pasteText() {
    navigator.clipboard.readText()
        .then(function(text) {
            var textArea = document.getElementById("editor");
            textArea.focus();
            var before = textArea.value.substring(0, textArea.selectionStart);
            var after = textArea.value.substring(textArea.selectionStart, textArea.value.length);
            textArea.value = before + text + after;

            // Set cursor position
            var newCursorPos = before.length + text.length;
            textArea.selectionStart = newCursorPos;
            textArea.selectionEnd = newCursorPos;
        })
        .catch(function(err) {
            console.error('Unable to paste text: ', err);
        });
}


// Function to switch between tabs
function switchTab(tabIndex) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab, index) => {
        tab.classList.toggle('active', index === tabIndex);
    });

    // Save the content and title of the current note
    saveCurrentNote();

    currentTab = tabIndex;

    // Restore the content and title of the selected note
    restoreCurrentNote();

    // Focus on the editor input field
    document.getElementById("editor").focus();
}

// Function to update the title of the tab
function updateTabTitle() {
    const titleInput = document.getElementById("title");
    const tab = document.getElementById("tab" + currentTab);
    let title = titleInput.value || "New Note";
    const maxLength = 8; // Adjust this value as needed

    title = title.length > maxLength ? title.substring(0, maxLength) + "..." : title;

    tab.innerHTML = title;
}

// Function to save the current note
function saveCurrentNote() {
    notes[currentTab].content = document.getElementById("editor").value;
    notes[currentTab].title = document.getElementById("title").value;
}

// Function to restore the current note
function restoreCurrentNote() {
    document.getElementById("editor").value = notes[currentTab].content;
    document.getElementById("title").value = notes[currentTab].title;
    updateTabTitle();
}

// Function to open a new note
function openNewNote(title = "", content = "") {
    const id = document.querySelectorAll('.tab').length;
    const newTab = document.createElement('div');
    newTab.className = 'tab';
    newTab.id = 'tab' + id;
    newTab.onclick = () => switchTab(id);

    const tabs = document.getElementById('tabs');
    const lastTab = tabs.lastChild;

    tabs.insertBefore(newTab, lastTab);
    notes.push({ title: title, content: content });

    switchTab(id);

    // Focus on the title input field
    document.getElementById("title").focus();
}

// Function to close a note
function closeNote() {
    if (notes.length === 1) return; // If there's only one note open, do nothing

    const currentTabElement = document.getElementById("tab" + currentTab);
    currentTabElement.parentNode.removeChild(currentTabElement);

    notes.splice(currentTab, 1); // Remove the current note from the notes array

    currentTab = Math.min(currentTab, notes.length - 1); // Ensure currentTab stays within bounds

    // Update tab titles after removing the current tab
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab, index) => {
        tab.id = "tab" + index;
        tab.onclick = () => switchTab(index);
        tab.classList.toggle('active', index === currentTab);
    });

    restoreCurrentNote(); // Restore the content and title of the selected note
}