exports.convertTimestampToDate = (timestamp) => {
    const date = new Date(timestamp); // Create a date object from the timestamp

    // Extract day, month, and year
    const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    // Return formatted date
    return `${day}:${month}:${year}`;
}