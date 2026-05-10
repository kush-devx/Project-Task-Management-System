"use client";

import { useCallback, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import api, { SOCKET_BASE_URL } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface Props {
  projectId: string;
}

interface Message {
  _id: string;
  content: string;
  createdAt: string;
  sender: {
    name: string;
    email?: string;
  };
}

let socket: Socket | null = null;

export default function ProjectChat({ projectId }: Props) {
  const { userToken } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await api.get(`/messages/${projectId}`);
      setMessages(response.data);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);
      const response = await api.post("/messages", {
        projectId,
        content: message,
      });

      setMessages((prev) => {
        if (prev.some((item) => item._id === response.data._id)) {
          return prev;
        }

        return [...prev, response.data];
      });
      setMessage("");
    } catch {
      // Keep UI simple for the demo.
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!userToken) return;

    socket?.disconnect();
    socket = io(SOCKET_BASE_URL, {
      auth: { token: userToken },
    });

    socket.emit("joinProject", projectId);
    socket.on("newMessage", (incomingMessage: Message) => {
      setMessages((prev) => {
        if (prev.some((item) => item._id === incomingMessage._id)) {
          return prev;
        }

        return [...prev, incomingMessage];
      });
    });

    return () => {
      socket?.emit("leaveProject", projectId);
      socket?.disconnect();
    };
  }, [projectId, userToken]);

  return (
    <section className="section-card rounded-[1.75rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Team Discussion
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-900">Project chat</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          {messages.length} messages
        </span>
      </div>

      <div className="mt-6 h-80 space-y-3 overflow-y-auto rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
        {loading ? (
          <p className="text-sm text-slate-500">Loading discussion...</p>
        ) : messages.length ? (
          messages.map((msg) => (
            <div key={msg._id} className="rounded-[1.25rem] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{msg.sender?.name}</p>
                <p className="text-xs text-slate-400">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{msg.content}</p>
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
            No messages yet. Start the conversation with your team.
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <input
          type="text"
          placeholder="Share an update, blocker, or review note..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />

        <button
          onClick={sendMessage}
          disabled={sending}
          className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </section>
  );
}
