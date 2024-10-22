import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Modal, Image } from "react-native";
import { firestore } from "./firebaseConfig.js";
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { launchImageLibrary } from "react-native-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { styles } from "./styles.js";

/* --------- TODO ----------
a. mangler detail view når man trykker på en note
b. mangler crud på image
c. mangler visning af på image i detail view
d. mangler navi i stedet for modal
e. mangler maps
f. opdeling i components i stedet for en stor fil
g. når man edit en note og så cancel og så laver en ny note, 
   så opdateres den anden note i stedet for at  lave en ny
h. mangler valg af billeder ift maps
 */

const App = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);

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

    // If editing an existing note
    if (selectedNote) {
      const noteRef = doc(firestore, "notes", selectedNote.id);
      updatedNotes = notes.map((note) => (note.id === selectedNote.id ? { ...note, title, content, imageUrl: selectedImageUri } : note));
      setNotes(updatedNotes);

      await updateDoc(noteRef, { title, content, imageUrl: selectedImageUri });
      setSelectedNote(null);
    } else {
      // If creating a new note
      const newNote = { title, content, imageUrl: selectedImageUri };
      const docRef = await addDoc(collection(firestore, "notes"), newNote);
      updatedNotes = [...notes, { id: docRef.id, ...newNote }];
      setNotes(updatedNotes);
    }

    setTitle("");
    setContent("");
    setSelectedImageUri(null); // Clear the image selection after saving
    setModalVisible(false);
  };

  // const handleSaveNote = async () => {
  //   let updatedNotes;
  //   if (selectedNote) {
  //     const noteRef = doc(firestore, "notes", selectedNote.id);
  //     updatedNotes = notes.map((note) => (note.id === selectedNote.id ? { ...note, title, content } : note));
  //     setNotes(updatedNotes);

  //     await updateDoc(noteRef, { title, content });
  //     setSelectedNote(null);
  //   } else {
  //     const newNote = { title, content };
  //     const docRef = await addDoc(collection(firestore, "notes"), newNote);
  //     updatedNotes = [...notes, { id: docRef.id, ...newNote }];
  //     setNotes(updatedNotes);
  //   }
  //   setTitle("");
  //   setContent("");
  //   setModalVisible(false);
  // };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setModalVisible(true);
  };

  const handleDeleteNote = () => {
    setConfirmDeleteVisible(true); // Show the confirmation overlay
  };

  const confirmDeleteNote = async () => {
    const updatedNotes = notes.filter((item) => item.id !== selectedNote.id);
    setNotes(updatedNotes);

    const noteRef = doc(firestore, "notes", selectedNote.id);
    await deleteDoc(noteRef);

    setModalVisible(false);
    setConfirmDeleteVisible(false);
    setSelectedNote(null);
  };

  const selectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
    });

    if (result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setSelectedImageUri(imageUri);

      const uploadImage = async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storage = getStorage();
        const filename = `images/${Date.now()}.jpg`;
        const imageRef = ref(storage, filename);

        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);
        return downloadURL;
      };

      const imageUrl = await uploadImage(imageUri);
      setSelectedImageUri(imageUrl);
    }
  };

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
      {/* Modal for creating/editing notes */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainerPurple}>
          <TextInput style={styles.detailTitle} placeholder="Enter note title" value={title} onChangeText={setTitle} />
          <TextInput style={styles.detailContent} multiline placeholder="Enter note content" value={content} onChangeText={setContent} />

          {/* Conditional overlay confirmation */}
          {confirmDeleteVisible && (
            <View style={styles.confirmationOverlay}>
              <Text style={styles.confirmationText}>Are you sure you want to delete this note?</Text>
              <View style={styles.buttonRow}>
                <Pressable onPress={confirmDeleteNote} style={styles.deleteButton}>
                  <Text style={styles.buttonText}>Yes</Text>
                </Pressable>
                <Pressable onPress={() => setConfirmDeleteVisible(false)} style={styles.cancelButton}>
                  <Text style={styles.buttonText}>No</Text>
                </Pressable>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Pressable onPress={handleSaveNote} style={styles.saveButton}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
            <Pressable onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            {/* Delete button */}
            <Pressable onPress={handleDeleteNote} style={styles.deleteButton}>
              <Text style={styles.buttonText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default App;
