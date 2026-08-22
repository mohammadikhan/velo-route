import {useRef, useState} from "react";
import {getRideByID, uploadRide} from "../api/rideApi.js";

const UploadModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const pollRef = useRef(null)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      return
    }

    try {
      setStatus("uploading")
      const { activityId } = await uploadRide(file)

      setStatus("processing")
      pollRef.current = setInterval(async () => {
        try {
          const ride = await getRideByID(activityId)
          if (ride.movingTime > 0) {
            clearInterval(pollRef.current)
            setStatus("done")
            onSuccess()
          }
        } catch {
          clearInterval(pollRef.current)
          setStatus("error")
          setErrorMessage("[ERROR]: Failed to check processing status")
        }
      }, 200)

    } catch (err) {
      setStatus("error")
      setErrorMessage(err.message)
    }
  }

  const handleClose = () => {
    clearInterval(pollRef.current)
    onClose()
  }

  // Create button style for the upload and choose button
  const chooseUploadFile = {
    padding: "10px 24px", backgroundColor: "var(--text-h)", color: "#3c1313",
    border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px",
    fontWeight: 500, fontFamily: "monospace"
  }


  // Create button style for the cancel button
  const cancelButton = {
    padding: "10px 24px", backgroundColor: "#b0b0b0", color: "#3c1313",
    border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px",
    fontWeight: 500, fontFamily: "monospace"
  }

  return (

      <>
        <div style={{position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100}}>
          <div style={{backgroundColor: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "32px", width: "400px", boxShadow: "var(--shadow)"}}>
            <h2 style={{marginBottom: "20px"}}> Upload Ride (accepts .json only)</h2>
            {status === "idle" || status === "error" ? (
                <form onSubmit={handleSubmit}>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    id={"file-input"}
                    style={{ display: "none"}}
                  />
                  <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px"}}>
                    <label htmlFor="file-input" style={{...chooseUploadFile, cursor: "pointer"}}>
                      Choose File
                    </label>
                    <span style={{fontSize: "14px", color: "var(--text-h)", fontFamily: "monospace"}}>
                      {file ? file.name : "No File Chosen"}
                    </span>
                  </div>
                  { status === "error" && (
                      <p style={{color: "red", marginBottom: "12px"}}>{errorMessage}</p>
                  )}
                  <div style={{display: "flex", gap: "12px", justifyContent: "center"}}>
                    <button type="submit" disabled={!file} style={chooseUploadFile}>Upload</button>
                    <button type="button" onClick={handleClose} style={cancelButton}>Cancel</button>
                  </div>
                </form>
            ) : status === "Uploading" ? (
                <p style={{color: "white"}}>Uploading file...</p>
            ) : status === "processing" ? (
                <p style={{color: "white"}}>Processing ride data, please wait...</p>
            ) : (
                <div>
                  <p style={{color: "white", marginBottom: "16px"}}>[SUCCESS]: Ride Processed!</p>
                  <div style={{display: "flex", justifyContent: "center"}}>
                    <button onClick={handleClose} style={cancelButton}>Close</button>
                  </div>
                </div>
            )}
          </div>
        </div>
      </>
  )
}

export default UploadModal
