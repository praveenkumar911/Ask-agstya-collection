import React, { useState } from "react";
import axios from "axios";
import AWS from "aws-sdk";
const AskAgastya = () => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    let chunks = [];

    recorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/wav" });
      setAudioBlob(blob);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const uploadToMinio = async () => {
    if (!audioBlob) return alert("No audio recorded");
  
    // Generate a unique file name based on the current date and timestamp
    const timestamp = new Date().toISOString().replace(/[-:.]/g, ""); // Example: "20250205T142217699Z"
    const fileName = `recording-${timestamp}.wav`; // Remove "askagstya/" prefix
  
    // Configure AWS SDK for MinIO
    const s3 = new AWS.S3({
      endpoint: "https://s3.us-east-2.amazonaws.com/bahubhashak-iiit", // MinIO endpoint
      accessKeyId: "", // MinIO access key
      secretAccessKey: "", // MinIO secret key
      region: "us-east-2", // MinIO region (can be any value since MinIO is not AWS)
      signatureVersion: "v4", // Use AWS Signature v4
    });
  
    const params = {
      Bucket: "agastya_foundation",
      Key: fileName, // Use the generated file name without "askagstya/" prefix
      Body: audioBlob,
      ContentType: "audio/wav",
      ACL: "public-read", // Optional, depending on whether you want it publicly accessible
    };
  
    try {
      // Upload the audio file to MinIO using signed request
      const response = await s3.upload(params).promise();
  
      // If upload is successful, get the file URL and send it to the server
      const audioUrl = response.Location;
      await sendAudioUrl(audioUrl);
    } catch (error) {
      alert("Error uploading audio: " + error.message);
    }
  };
  

  const sendAudioUrl = async (audioUrl) => {
    const payload = {
      from_mobile: "9110791397",
      language: "telugu",
      grade: "10",
      subject: "physics",
      type: "automatic",
      audio_url: audioUrl,
    };

    try {
      await axios.post("http://10.8.0.14:9002/questions", payload);
      alert("Success");
    } catch (error) {
      alert("Error sending audio URL: " + error.message);
    }
  };

  return (
    <div>
      <h2>Ask Agastya</h2>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
      <button onClick={uploadToMinio} disabled={!audioBlob}>
        Upload & Send
      </button>
    </div>
  );
};

export default AskAgastya;
