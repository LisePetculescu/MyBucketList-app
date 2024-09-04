import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Modal, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const App = () => {
  // State variables
  // Array to store notes
  const [notes, setNotes] = useState([]);

  // Selected note for editing
  const [selectedNote, setSelectedNote] = useState(null);

  // Note title
  const [title, setTitle] = useState("");

  // Note content
  const [content, setContent] = useState("");

  // Modal visibility state
  const [modalVisible, setModalVisible] = useState(false);

  // Function to save notes to AsyncStorage
  const saveNotesToStorage = async (notes) => {
    try {
      const jsonNotes = JSON.stringify(notes);
      await AsyncStorage.setItem("notes", jsonNotes);
    } catch (error) {
      console.error("Error saving notes", error);
    }
  };

  // Function to load notes from AsyncStorage
  const loadNotesFromStorage = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem("notes");
      // Check if storedNotes is not null and not undefined before parsing
      if (storedNotes !== null && storedNotes !== undefined) {
        setNotes(JSON.parse(storedNotes));
      } else {
        // If there are no notes, initialize with an empty array
        setNotes([]);
      }
    } catch (error) {
      console.error("Error loading notes", error);
    }
  };

  // Load notes when the app starts
  useEffect(() => {
    loadNotesFromStorage();
  }, []);

  // Function to handle saving a note
  const handleSaveNote = () => {
    let updatedNotes;
    if (selectedNote) {
      // If a note is selected, update it
      updatedNotes = notes.map((note) => (note.id === selectedNote.id ? { ...note, title, content } : note));
      setNotes(updatedNotes);
      setSelectedNote(null);
    } else {
      // If no note is selected, add a new note
      const newNote = {
        id: Date.now(),
        title,
        content
      };
      updatedNotes = [...notes, newNote];
    }

    // Update the notes in state and AsyncStorage
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);

    setTitle("");
    setContent("");
    setModalVisible(false);
  };

  // Function to handle editing a note
  const handleEditNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setModalVisible(true);
  };

  // Function to handle deleting a note
  const handleDeleteNote = (note) => {
    const updatedNotes = notes.filter((item) => item.id !== note.id);
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes); // Save the updated list to AsyncStorage
    setSelectedNote(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>My Bucketlist</Text>
      <Text style={styles.basicText}>30 things to do before 30</Text>

      {/* List of notes */}
      <ScrollView style={styles.noteList}>
        {notes.map((note, index) => (
          <View key={note.id} style={styles.noteList}>
            <Pressable onPress={() => handleEditNote(note)}>
              <Text style={styles.noteTitle}>
                {index + 1}. {note.title}
              </Text>
            </Pressable>
            <Text style={styles.basicText2}>{note.content}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Add Note button */}
      <Pressable
        style={styles.addButton}
        onPress={() => {
          setTitle("");
          setContent("");
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>Add Note</Text>
      </Pressable>

      {/* Modal for creating/editing notes */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          {/* Note title input */}
          <TextInput style={styles.input} placeholder="Enter note title" value={title} onChangeText={setTitle} />

          {/* Note content input */}
          <TextInput style={styles.contentInput} multiline placeholder="Enter note content" value={content} onChangeText={setContent} />

          {/* Buttons for saving, canceling, and deleting */}
          <View style={styles.buttonContainer}>
            <Pressable onPress={handleSaveNote} style={styles.saveButton}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>

            <Pressable onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>

            {selectedNote && (
              <Pressable onPress={() => handleDeleteNote(selectedNote)} style={styles.deleteButton}>
                <Text style={styles.buttonText}>Delete</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    backgroundColor: "#ACE1AF"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333"
  },
  basicText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333"
  },
  basicText2: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 30,
    marginLeft: 25,
    color: "#333"
  },
  noteList: {
    flex: 1
  },
  noteTitle: {
    fontSize: 15,
    marginBottom: 10,
    fontWeight: "bold",
    color: "black",
    backgroundColor: "white",
    height: 40,
    width: "100%",
    padding: 10,
    borderRadius: 8
  },
  addButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 10
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold"
  },
  modalContainer: {
    flex: 1,
    padding: 50,
    backgroundColor: "white"
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5
  },
  contentInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    height: 150,
    verticalAlign: "top"
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  saveButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    width: "30%",
    alignItems: "center"
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 8,
    width: "30%",
    alignItems: "center"
  },
  deleteButton: {
    backgroundColor: "#FF9500",
    padding: 10,
    borderRadius: 8,
    width: "30%",
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold"
  }
});

export default App;
