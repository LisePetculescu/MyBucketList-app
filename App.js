import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Modal, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const App = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false); // New modal for viewing note details

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
      if (storedNotes !== null && storedNotes !== undefined) {
        setNotes(JSON.parse(storedNotes));
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("Error loading notes", error);
    }
  };

  useEffect(() => {
    loadNotesFromStorage();
  }, []);

  // Handle saving a note
  const handleSaveNote = () => {
    let updatedNotes;
    if (selectedNote) {
      updatedNotes = notes.map((note) => (note.id === selectedNote.id ? { ...note, title, content } : note));
      setNotes(updatedNotes);
      setSelectedNote(null);
    } else {
      const newNote = {
        id: Date.now(),
        title,
        content
      };
      updatedNotes = [...notes, newNote];
    }
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setTitle("");
    setContent("");
    setModalVisible(false);
  };

  // Handle editing a note
  const handleEditNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setModalVisible(true);
  };

  // Handle deleting a note
  const handleDeleteNote = (note) => {
    const updatedNotes = notes.filter((item) => item.id !== note.id);
    setNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setSelectedNote(null);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Notes</Text>

      <ScrollView style={styles.noteList}>
        {notes.map((note, index) => (
          <View key={note.id} style={styles.noteContainer}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteTitle}>
                {index + 1}. {note.title}
              </Text>

              {/* Edit button next to the title */}
              <Pressable onPress={() => handleEditNote(note)} style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
            </View>

            {/* Pressable content to view details */}
            <Pressable
              onPress={() => {
                setSelectedNote(note);
                setViewModalVisible(true); // Open the view modal
              }}
            >
              <Text style={styles.basicText2}>{note.content.length > 25 ? note.content.substring(0, 25) + "..." : note.content}</Text>
            </Pressable>
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

      {/* Modal for viewing note details */}
      {selectedNote && (
        <Modal visible={viewModalVisible} animationType="slide" transparent={false}>
          <View style={styles.modalContainer}>
            <Text style={styles.detailTitle}>Title: {selectedNote.title}</Text>
            <Text style={styles.detailContent}>Details: {selectedNote.content}</Text>

            {/* Container to hold the Edit and Close buttons on the same line */}
            <View style={styles.buttonRow}>
              {/* Edit button */}
              <Pressable
                onPress={() => {
                  setViewModalVisible(false);
                  handleEditNote(selectedNote); // Switch to the edit modal
                }}
                style={styles.editButtonModal}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>

              {/* Close button */}
              <Pressable onPress={() => setViewModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.buttonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal for creating/editing notes */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainerPurple}>
          <TextInput style={styles.detailTitle} placeholder="Enter note title" value={title} onChangeText={setTitle} />
          <TextInput style={styles.detailContent} multiline placeholder="Enter note content" value={content} onChangeText={setContent} />

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
    color: "#333",
    backgroundColor: "rgb(205 248 176)",
    paddingBottom: 15,
    paddingLeft: 15,
    borderRadius: 8,
    marginBottom: 15,
    marginLeft: 10
  },
  noteList: {
    flex: 1
  },
  noteTitle: {
    fontSize: 15,
    paddingBottom: 10,
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
  modalContainerPurple: {
    flex: 1,
    padding: 50,
    backgroundColor: "rgb(241 192 255)"
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
  },
  modalContainer: {
    flex: 1,
    padding: 50,
    backgroundColor: "pink",
    padding: 10
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10
  },
  detailContent: {
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10
  },
  noteContainer: {
    marginBottom: 20
  },

  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  noteTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "black",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    flex: 1
  },

  editButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "20%"
  },

  editButtonText: {
    color: "black",
    fontWeight: "bold"
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20
  },
  editButtonModal: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "40%"
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "40%"
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold"
  },
  buttonText: {
    color: "white",
    fontWeight: "bold"
  }
});

export default App;
