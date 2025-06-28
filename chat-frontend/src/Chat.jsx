import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:8080";

export default function Chat() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Setup socket connection and listeners
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("receive", (data) => {
      setMessages((prev) => [...prev, data]);
      setTypingUser("");
    });

    newSocket.on("user-typing", (user) => {
      setTypingUser(user);

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser("");
      }, 1000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogin = () => {
    if (!username.trim()) {
      alert("Please enter a valid name");
      return;
    }
    if (socket) {
      socket.emit("login", { username });
      setLoggedIn(true);
    }
  };

  const sendMessage = () => {
    if (!message.trim() || !socket) return;
    const time = new Date().toLocaleTimeString();
    socket.emit("send", { msg: message, time });
    setMessage("");
  };

  const handleTyping = () => {
    if (socket) socket.emit("typing");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  if (!loggedIn) {
    return (
      <div style={{ maxWidth: 400, margin: "20px auto", textAlign: "center" }}>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleLogin()}
          style={{ padding: 8, width: "80%", marginBottom: 10 }}
        />
        <br />
        <button onClick={handleLogin} style={{ padding: "8px 16px" }}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 800,
        height: "80vh",
        margin: "20px auto",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 20,
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Chat Room</h2>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          flexGrow: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 10,
          border: "1px solid #ddd",
          borderRadius: 6,
          padding: 10,
          backgroundColor: "#fff",
        }}
      >
        {messages.map((m, i) => (
          <li
            key={i}
            style={{
              alignSelf: m.username === username ? "flex-end" : "flex-start",
              backgroundColor: m.username === username ? "#cef" : "#eee",
              padding: "10px 14px",
              borderRadius: 20,
              maxWidth: "70%",
              wordBreak: "break-word",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>
              <small>{m.time}</small> <b>{m.username}</b>
            </div>
            <div>{m.msg}</div>
          </li>
        ))}
        <div ref={messagesEndRef} />
      </ul>

      {typingUser && (
        <p style={{ fontStyle: "italic", color: "#666", marginBottom: 10 }}>
          {typingUser} is typing...
        </p>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          onInput={handleTyping}
          style={{
            flexGrow: 1,
            padding: 10,
            borderRadius: 20,
            border: "1px solid #ccc",
            outline: "none",
          }}
          disabled={!socket}
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim() || !socket}
          style={{
            padding: "10px 20px",
            borderRadius: 20,
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: message.trim() && socket ? "pointer" : "not-allowed",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
