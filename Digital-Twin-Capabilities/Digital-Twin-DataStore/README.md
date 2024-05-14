## File Manager

This project is an Express-based server application that provides endpoints for uploading, listing, and managing files. It includes features for uploading files, listing uploaded files, and deleting files.

### Features

- **File Upload**: Upload files with a size limit of 300MB. For other values change config.js
- **File Management**: List and delete uploaded files.
- **Version Information**: Retrieve version information of the server.

### Configuration

Configuration settings are managed in the `config.js` file. You can adjust the server port, upload directory, and body parser options as needed.

### Running the Server

Start the server with the following command:

```bash
yarn start
```

The server will run on the port specified in the configuration (default is `3000`).

### API Endpoints

#### Upload Files

- **URL**: `/upload`
- **Method**: `POST`
- **Description**: Upload a file. The file must be provided in the `file` field of the form data.
- **Response**:
  ```json
  {
    "message": "File uploaded successfully.",
    "url": "/static/<filename>"
  }
  ```

#### List Uploaded Files

- **URL**: `/catalogue`
- **Method**: `GET`
- **Description**: List all uploaded files with their URLs.
- **Response**:
  ```json
  [
    {
      "filename": "/static/<filename>"
    },
    ...
  ]
  ```

#### Get Version Information

- **URL**: `/`
- **Method**: `GET`
- **Description**: Retrieve the version information of the server.
- **Response**:
  ```json
  {
    "version": "1.0.0"
  }
  ```

#### Delete a File

- **URL**: `/file/:name`
- **Method**: `DELETE`
- **Description**: Delete a file by its name.
- **Response**:
  ```json
  {
    "message": "File '<name>' deleted successfully."
  }
  ```

### Project Structure

```plaintext
├── config.js            # Configuration settings
├── routes
│   ├── upload.js        # Upload routes
│   ├── catalogue.js     # Catalogue routes
│   ├── version.js       # Version routes
│   └── delete.js        # Delete routes
├── static               # Directory for uploaded files
├── version.json         # Version information
├── server.js               # Main application file
├── package.json         # Project dependencies and scripts
└── README.md            # Project documentation
```
