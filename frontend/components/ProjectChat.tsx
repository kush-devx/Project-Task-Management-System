"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

interface Props {
  projectId: string;
}

interface Message {
  _id: string;
  content: string;
  sender: { name: string };
  createdAt: string;
}

let socket: Socket;

export default function ProjectChat({ projectId }: Props) {
  const { userToken } = useAuth();   // ✅ get token correctly

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch old messages from DB
  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${projectId}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to load messages");
    }
  };

  // Send message via socket
  const sendMessage = () => {
    if (!message.trim()) return;
    if (!socket) return;

    socket.emit("sendMessage", {
      projectId,
      message,
    });

    setMessage("");
  };

  useEffect(() => {
    if (!userToken) return;   // 🔥 wait until token exists

    fetchMessages();

    socket = io("https://collab-platform-backend.onrender.com", {
      auth: {
        token: userToken,   // ✅ correct token
      },
    });

    socket.emit("joinProject", projectId);

    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId, userToken]);

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-8">
      <h3 className="text-lg font-semibold mb-4">💬 Project Discussion</h3>

      <div className="border rounded-md h-60 overflow-y-auto p-3 mb-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg._id} className="mb-2">
            <p className="text-xs text-gray-500">
              {msg.sender?.name}
            </p>
            <p className="bg-white p-2 rounded shadow-sm text-sm">
              {msg.content}
            </p>
            <p className="text-[10px] text-gray-400">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />

        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}