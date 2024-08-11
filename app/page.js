"use client";
import React from "react";
import InputAdornment from "@mui/material/InputAdornment";
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
} from "@mui/material";
import { firestore } from "@/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Home() {
  // State variables
  const [pantry, setPantry] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [itemname, setItemname] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [expirationDates, setExpirationDates] = useState({});
  const [notes, setNotes] = useState({});

  // Fetch data from Firestore
  const fetchData = async () => {
    const snapshot = query(collection(firestore, "pantry"));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    const notesData = {};
    docs.forEach((doc) => {
      const data = doc.data();
      pantryList.push({ name: doc.id, ...doc.data() });
      if (data.notes) {
        notesData[doc.id] = data.notes;
      }
    });
    setPantry(pantryList);
    setFilteredInventory(pantryList);
    setNotes(notesData);
    localStorage.setItem("notes", JSON.stringify(notesData));
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Add item to Firestore
  const addItem = async (item, quantity = 1, expirationDate = null) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count, expirationDate: existingExpirationDate } = docSnap.data();
      await setDoc(docRef, {
        count: count + parseInt(quantity),
        expirationDate: expirationDate || existingExpirationDate,
      });
    } else {
      await setDoc(docRef, {
        count: parseInt(quantity),
        expirationDate: expirationDate || null,
      });
    }
    await fetchData();
  };

  // Increment item quantity
  const incrementQuantity = async (itemName) => {
    const docRef = doc(collection(firestore, "pantry"), itemName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 }, { merge: true });
    }
    await fetchData();
  };

  // Decrement item quantity
  const decrementQuantity = async (itemName) => {
    const docRef = doc(collection(firestore, "pantry"), itemName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count > 1) {
        await setDoc(docRef, { count: count - 1 }, { merge: true });
      } else {
        await deleteDoc(docRef);
      }
    }
    await fetchData();
  };

  // Update item expiration date
  const updateExpirationDate = async (itemName, newExpirationDate) => {
    const docRef = doc(collection(firestore, "pantry"), itemName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { expirationDate } = docSnap.data();
      if (expirationDate !== newExpirationDate) {
        await setDoc(
          docRef,
          { expirationDate: newExpirationDate },
          { merge: true }
        );
      } else {
        await setDoc(docRef, { expirationDate: null }, { merge: true });
      }
    }
    await fetchData();
  };

  // Handle search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === "" || searchTerm === null) {
      setFilteredInventory(pantry);
    } else {
      const filtered = pantry.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInventory(filtered);
    }
  };

  // Update search results when search term changes
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Handle expiration date change
  const handleExpirationDateChange = (name, date) => {
    setExpirationDates((prev) => ({ ...prev, [name]: date }));
  };

  // Update item notes
  const updateNoteChange = async (itemName, note) => {
    const docRef = doc(collection(firestore, "pantry"), itemName);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await setDoc(docRef, { notes: note }, { merge: true });
      setNotes((prev) => ({ ...prev, [itemName]: note }));
      localStorage.setItem(
        "notes",
        JSON.stringify({ ...notes, [itemName]: note })
      );
    }
    await fetchData();
  };

  // Handle note change
  const handleNoteChange = (name, note) => {
    setNotes((prev) => ({ ...prev, [name]: note }));
  };

  // Check if screen size is small
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  return (
    <Box
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      flexDirection={"column"}
      gap={2}
      sx={{
        backgroundImage: "url('/picpantry.jpg')", // Background image for the entire container
        backgroundSize: "cover", // Cover the entire container
        backgroundRepeat: "no-repeat", // Do not repeat the background image
        backgroundPosition: "center", // Center the background image
        backgroundAttachment: "fixed", // Fix the background image while scrolling
        paddingBottom: "1%", // Padding at the bottom
        paddingTop: "1%", // Padding at the top
      }}
    >
      <Box
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)", // Light background to contrast with #333 text
          padding: 2, // Padding inside the box
          borderRadius: 2, // Rounded corners
          textAlign: "center", // Center the text
        }}
      >
        <Typography
          variant={isSmallScreen ? "h4" : "h3"} // Responsive typography variant
          color={"#333"} // Text color
          gutterBottom // Adds bottom margin
        >
          Pantry Manager
        </Typography>
        <Typography variant="body3" color={"#333"} gutterBottom>
          Manage your pantry items efficiently with our easy-to-use interface.
        </Typography>
      </Box>
      <Box
        border={"1px solid #333"} // Border styling
        borderRadius={"10px"} // Rounded corners
        bgcolor={"#f0f0f0"} // Background color
        display={"flex"}
        flexDirection={"column"}
        alignItems={isSmallScreen ? "center" : "Right"} // Responsive alignment
        gap={2} // Gap between child elements
        padding={2} // Padding inside the box
        justifyContent={isSmallScreen ? "center" : "Right"} // Responsive justification
        width={isSmallScreen ? "95%" : "830px"} // Responsive width
      >
        <Box width="100%" bgcolor={"ADD8E6"} gap={2}>
          <Typography variant={isSmallScreen ? "h5" : "h4"} color={"#333"}>
            Add Item
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            textAlign={"center"}
          >
            <TextField
              id="outlined-basic"
              label="Item"
              variant={isSmallScreen ? "standard" : "outlined"} // Responsive variant
              {...(isSmallScreen ? {} : { fullWidth: true })} // Full width for larger screens
              type="text"
              value={itemname}
              onChange={(e) => setItemname(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && itemname.trim() !== "") {
                  addItem(itemname, quantity || 1, expirationDate);
                  setItemname("");
                  setQuantity("");
                  setExpirationDate("");
                  handleClose();
                }
              }}
            />
            <TextField
              id="outlined-basic"
              label="Quantity"
              variant={isSmallScreen ? "standard" : "outlined"} // Responsive variant
              {...(isSmallScreen ? {} : { fullWidth: true })} // Full width for larger screens
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && itemname.trim() !== "") {
                  addItem(itemname, quantity || 1, expirationDate);
                  setItemname("");
                  setQuantity("");
                  setExpirationDate("");
                  handleClose();
                }
              }}
            />
            <TextField
              id="outlined-basic"
              variant={isSmallScreen ? "standard" : "outlined"} // Responsive variant
              {...(isSmallScreen ? {} : { fullWidth: true })} // Full width for larger screens
              type="date"
              label={isSmallScreen ? "Exp Date" : "Expiration Date"} // Responsive label
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && itemname.trim() !== "") {
                  addItem(itemname, quantity || 1, expirationDate);
                  setItemname("");
                  setQuantity("");
                  setExpirationDate("");
                  handleClose();
                }
              }}
              InputLabelProps={{
                shrink: true, // Shrink the label when the input is focused
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (itemname.trim() !== "") {
                  addItem(itemname, quantity || 1, expirationDate);
                  setItemname("");
                  setQuantity("");
                  setExpirationDate("");
                  handleClose();
                }
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Box>

      <Box
        border={"1px solid #333"} // Border styling
        borderRadius={"10px"} // Rounded corners
        bgcolor={"#f0f0f0"} // Background color
        display={"flex"}
        flexDirection={"column"}
        alignItems={isSmallScreen ? "center" : "Right"} // Responsive alignment
        gap={2} // Gap between child elements
        padding={2} // Padding inside the box
        justifyContent={isSmallScreen ? "center" : "Right"} // Responsive justification
        width={isSmallScreen ? "95%" : "830px"} // Responsive width
      >
        <Box width="100%" bgcolor={"ADD8E6"} gap={2}>
          <Typography variant={isSmallScreen ? "h5" : "h4"} color={"#333"}>
            Search Inventory
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            textAlign={"center"}
          >
            <TextField
              fullWidth
              variant={isSmallScreen ? "standard" : "outlined"} // Responsive variant
              placeholder="Search..."
              width={isSmallScreen ? "100%" : "800px"} // Responsive width
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onChangeCapture={handleSearch}
            />
          </Stack>
        </Box>
      </Box>
      <Box
        border={"1px solid #333"} // Border styling
        borderRadius={"10px"} // Rounded corners
        bgcolor={"#f0f0f0"} // Background color
        display={"flex"}
        flexDirection={"column"}
        alignItems={isSmallScreen ? "center" : "Right"} // Responsive alignment
        gap={2} // Gap between child elements
        padding={2} // Padding inside the box
        justifyContent={isSmallScreen ? "center" : "Right"} // Responsive justification
        width={isSmallScreen ? "95%" : "830px"} // Responsive width
      >
        <Box width="100%" bgcolor={"ADD8E6"} display={"flex"}>
          <Typography variant={isSmallScreen ? "h5" : "h4"} color={"#333"}>
            Pantry Items
          </Typography>
        </Box>
        <Box
          width="100%"
          height={isSmallScreen ? "200px" : "400px"} // Responsive height
          sx={{ overflowY: "auto" }} // Enable vertical scrolling
        >
          <Stack
            width={isSmallScreen ? "100%" : "780px"} // Responsive width
            spacing={2}
            overflow="auto"
          >
            {filteredInventory.map(({ name, count, expirationDate }) => (
              <Card
                key={name}
                width="100%"
                sx={{ minWidth: "100%", bgcolor: "#f9f9f9", boxShadow: 3 }} // Card styling
              >
                <CardContent padding={isSmallScreen ? 0 : 0}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    flexDirection={isSmallScreen ? "column" : "row"} // Responsive flex direction
                  >
                    <Box
                      display={isSmallScreen ? "flex" : "block"} // Responsive display
                      flexDirection={isSmallScreen ? "row" : "column"} // Responsive flex direction
                      gap={isSmallScreen ? 2 : 0} // Responsive gap
                      alignItems={isSmallScreen ? "center" : "None"} // Responsive alignment
                    >
                      <Typography
                        variant={isSmallScreen ? "h6" : "h5"} // Responsive typography variant
                        component="div"
                        gutterBottom
                      >
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Expiration Date: {expirationDate || "N/A"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        position: "relative", // Position the note box relatively
                        padding: 0,
                        borderRadius: 1, // Rounded corners
                        marginLeft: isSmallScreen ? 0 : "auto", // Responsive margin
                        width: isSmallScreen ? "100%" : "500px", // Responsive width
                      }}
                    >
                      <TextField
                        label="Note"
                        variant="outlined"
                        multiline
                        rows={isSmallScreen ? 1 : 3} // Responsive rows
                        sx={{
                          width: isSmallScreen ? "100%" : "500px", // Responsive width
                          bgcolor: "#fefcbf", // Equivalent to bg-yellow-100
                          boxShadow: 3, // Box shadow for the note field
                        }}
                        value={notes[name] || ""}
                        onChange={(e) => handleNoteChange(name, e.target.value)}
                      />
                      {isSmallScreen ? (
                        <Button
                          sx={{
                            position: "absolute", // Position the button absolutely
                            bottom: 12, // Adjust as needed
                            right: 12, // Adjust as needed
                          }}
                          variant="contained"
                          onClick={() => updateNoteChange(name, notes[name])}
                        >
                          Save
                        </Button>
                      ) : (
                        <Button
                          sx={{
                            position: "absolute",
                            bottom: 12,
                            right: 12,
                            marginLeft: "auto",
                          }}
                          variant="contained"
                          onClick={() => updateNoteChange(name, notes[name])}
                        >
                          Save Note
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
                <CardActions
                  sx={{
                    // Set the alignment of the CardActions content based on screen size
                    justifyContent: "space-between",
                    flexDirection: isSmallScreen ? "column" : "row",
                    padding: 0,
                  }}
                >
                  <Box
                    display="flex"
                    width="100%"
                    alignItems="center"
                    gap={1}
                    padding={isSmallScreen ? 0.5 : 1}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => incrementQuantity(name)}
                    >
                      {/* Display "+" on small screens and "Add" on larger screens */}
                      {isSmallScreen ? "+" : "Add"}
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => decrementQuantity(name)}
                    >
                      {/* Display "-" on small screens and "Remove" on larger screens */}
                      {isSmallScreen ? "-" : "Remove"}
                    </Button>

                    <TextField
                      id="outlined-basic"
                      variant={isSmallScreen ? "standard" : "outlined"}
                      {...(isSmallScreen ? {} : { fullWidth: true })}
                      type="date"
                      label={isSmallScreen ? "Exp Date" : "Expiration Date"}
                      value={expirationDates[name] || expirationDate || ""}
                      onChange={(e) =>
                        handleExpirationDateChange(name, e.target.value)
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      padding={isSmallScreen ? 2 : 1}
                      onClick={() => {
                        updateExpirationDate(name, expirationDates[name]);
                      }}
                    >
                      Update
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            ))}
          </Stack>
        </Box>
      </Box>
      <Box
        border={"1px solid #333"}
        borderRadius={"10px"}
        bgcolor={"#f0f0f0"}
        display={"flex"}
        flexDirection={"column"}
        alignItems={isSmallScreen ? "center" : "Right"}
        gap={2}
        padding={2}
        justifyContent={isSmallScreen ? "center" : "Right"}
        width={isSmallScreen ? "95%" : "830px"}
      >
        <Box width="100%" bgcolor={"ADD8E6"} display={"flex"}>
          <Typography variant={isSmallScreen ? "h5" : "h4"} color={"#333"}>
            Upcoming Expiration Dates
          </Typography>
        </Box>
        <Box
          width="100%"
          height={isSmallScreen ? "100px" : "200px"}
          sx={{ overflowY: "auto" }}
        >
          <Stack width="100%" spacing={2} overflow="auto">
            {filteredInventory
              .filter(({ expirationDate }) => expirationDate)
              .sort(
                (a, b) =>
                  new Date(a.expirationDate) - new Date(b.expirationDate)
              )
              .map(({ name, expirationDate }) => (
                <Card
                  key={name}
                  width="100%"
                  sx={{ minWidth: 275, bgcolor: "#f9f9f9", boxShadow: 3 }}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box>
                        <Typography variant="h5" component="div" gutterBottom>
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                          {/* Capitalize the first letter of the name */}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Expiration Date: {expirationDate || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
