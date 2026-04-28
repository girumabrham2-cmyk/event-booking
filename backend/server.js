const PORT = process.env.PORT || 10000; // Render likes 10000, local likes 5000

// Start the server FIRST
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is reaching out to Render on port ${PORT}`);
    
    // THEN connect to the database
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("✅ MongoDB Connected"))
        .catch(err => console.log("❌ MongoDB Error:", err.message));
});
