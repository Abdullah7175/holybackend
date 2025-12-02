import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    
    // Ensure database name is in the URI
    // Check if URI has a database name (format: ...@host/dbname? or ...@host/dbname)
    if (uri) {
      // Parse the URI to check for database name
      // Pattern: mongodb+srv://user:pass@host/dbname?query
      const uriMatch = uri.match(/^(mongodb\+srv:\/\/[^@]+@[^/]+)(\/([^?]+))?(\?.*)?$/);
      if (uriMatch) {
        const basePart = uriMatch[1]; // mongodb+srv://user:pass@host
        const dbName = uriMatch[3]; // database name if exists
        const queryString = uriMatch[4] || ''; // ?query=string
        
        // If no database name found, add it before the query string
        if (!dbName) {
          uri = basePart + '/holytravel-portal' + queryString;
          console.log('⚠️  Database name not found in MONGO_URI, using: holytravel-portal');
        }
      }
    }
    
    const conn = await mongoose.connect(uri);

    console.log(
      `MongoDB Connected: ${conn.connection.host}`.bgGreen.black
    );
    console.log(
      `Database: ${conn.connection.db.databaseName}`.bgGreen.black
    );
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`.red);
    process.exit(1);
  }
};

export default connectDB;