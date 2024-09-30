import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Modal, StyleSheet } from "react-native";
import { firestore } from "./firebaseConfig.js";
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";

const App = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false); // State for confirmation modal

  // Load notes from Firestore
  const loadNotesFromFirestore = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, "notes"));
      const notes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotes(notes);
    } catch (error) {
      console.error("Error loading notes from Firestore", error);
    }
  };

  useEffect(() => {
    loadNotesFromFirestore();
  }, []);

  const handleSaveNote = async () => {
    let updatedNotes;
    if (selectedNote) {
      const noteRef = doc(firestore, "notes", selectedNote.id);
      updatedNotes = notes.map((note) => (note.id === selectedNote.id ? { ...note, title, content } : note));
      setNotes(updatedNotes);

      await updateDoc(noteRef, { title, content });
      setSelectedNote(null);
    } else {
      const newNote = { title, content };
      const docRef = await addDoc(collection(firestore, "notes"), newNote);
      updatedNotes = [...notes, { id: docRef.id, ...newNote }];
      setNotes(updatedNotes);
    }
    setTitle("");
    setContent("");
    setModalVisible(false);
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setModalVisible(true);
  };

  const handleDeleteNote = (note) => {
    setModalVisible(false); // Close the edit modal first
    setTimeout(() => {
      setSelectedNote(note); // Set the selected note for deletion
      setConfirmDeleteModalVisible(true); // Show the confirmation modal after a small delay
    }, 300); // Optional small delay to ensure the modal transitions properly
  };

  const confirmDeleteNote = async () => {
    const updatedNotes = notes.filter((item) => item.id !== selectedNote.id);
    setNotes(updatedNotes);

    const noteRef = doc(firestore, "notes", selectedNote.id);
    await deleteDoc(noteRef);

    setConfirmDeleteModalVisible(false); // Close the confirmation modal
    setSelectedNote(null); // Reset the selected note
  };

  // const handleDeleteNote = (note) => {
  //   setSelectedNote(note); // Set the selected note for deletion
  //   setConfirmDeleteModalVisible(true); // Show the confirmation modal
  // };

  // const confirmDeleteNote = async () => {
  //   const updatedNotes = notes.filter((item) => item.id !== selectedNote.id);
  //   setNotes(updatedNotes);

  //   const noteRef = doc(firestore, "notes", selectedNote.id);
  //   await deleteDoc(noteRef);

  //   setConfirmDeleteModalVisible(false); // Close the confirmation modal
  //   setSelectedNote(null); // Reset the selected note
  // };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bucketlist 😁</Text>

      <ScrollView style={styles.noteList}>
        {notes.map((note, index) => (
          <View key={note.id} style={styles.noteContainer}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteTitle}>
                {index + 1}. {note.title}
              </Text>
              <Pressable onPress={() => handleEditNote(note)} style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => {
                setSelectedNote(note);
                setViewModalVisible(true);
              }}
            >
              <Text style={styles.basicText2}>{note.content.length > 25 ? note.content.substring(0, 25) + "..." : note.content}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

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

      {/* Confirmation Modal for Deleting Note */}
      <Modal visible={confirmDeleteModalVisible} animationType="slide" transparent={true}>
        <View style={styles.confirmationModalContainer}>
          <Text style={styles.confirmationText}>Are you sure you want to delete this note?</Text>
          <View style={styles.buttonRow}>
            <Pressable onPress={confirmDeleteNote} style={styles.deleteButton}>
              <Text style={styles.buttonText}>Yes</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setConfirmDeleteModalVisible(false); // Close the confirmation modal
                setModalVisible(true); // Reopen the edit modal
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.buttonText}>No</Text>
            </Pressable>

            {/* <Pressable onPress={() => setConfirmDeleteModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.buttonText}>No</Text>
            </Pressable> */}
          </View>
        </View>
      </Modal>

      {/* Modal for viewing note details */}
      {selectedNote && (
        <Modal visible={viewModalVisible} animationType="slide" transparent={false}>
          <View style={styles.modalContainer}>
            <Text style={styles.detailTitle}>Title: {selectedNote.title}</Text>
            <Text style={styles.detailContent}>Details: {selectedNote.content}</Text>
            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => {
                  setViewModalVisible(false);
                  handleEditNote(selectedNote);
                }}
                style={styles.editButtonModal}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
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
    fontWeight: "bold",
    color: "black",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    flex: 1
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
  buttonText: {
    color: "white",
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

  editButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "20%"
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
    backgroundColor: "#FF9500",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "40%"
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 8,
    width: "30%",
    alignItems: "center"
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold"
  },
  confirmationModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    padding: 20
  },
  confirmationText: {
    fontSize: 18,
    marginBottom: 20,
    color: "white" // Adjust text color as needed
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%"
  }
});

export default App;
