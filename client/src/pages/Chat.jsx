import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Avatar from "../components/common/Avatar";
import styles from "./Chat.module.css";

export default function Chat() {
  const { rideId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimer = useRef(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Load ride info + message history
  useEffect(() => {
    const init = async () => {
      try {
        const [rideRes, msgRes] = await Promise.all([
          api.get(`/rides/${rideId}`),
          api.get(`/messages/${rideId}`),
        ]);
        setRide(rideRes.data.ride);
        setMessages(msgRes.data.messages);
      } catch (err) {
        toast.error(err.response?.data?.message || "Cannot open this chat");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [rideId, navigate]);

  // Socket.io event listeners
  useEffect(() => {
    if (!socket || !rideId) return;

    socket.emit("join_ride_room", { rideId });

    const onNewMessage = (msg) => {
      setMessages((prev) =>
        prev.find((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
      socket.emit("mark_read", { rideId });
    };

    const onTyping = ({ name, userId }) => {
      if (userId !== user._id) setTypingUser(name);
    };

    const onStopTyping = () => setTypingUser(null);

    const onRideStatus = ({ status }) =>
      setRide((r) => (r ? { ...r, status } : r));

    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onTyping);
    socket.on("user_stop_typing", onStopTyping);
    socket.on("ride_status_update", onRideStatus);

    socket.emit("mark_read", { rideId });

    return () => {
      socket.emit("leave_ride_room", { rideId });
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onTyping);
      socket.off("user_stop_typing", onStopTyping);
      socket.off("ride_status_update", onRideStatus);
    };
  }, [socket, rideId, user._id]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setText("");

    // Optimistic insert
    const optimistic = {
      _id: `opt-${Date.now()}`,
      text: trimmed,
      sender: { _id: user._id, name: user.name, avatar: user.avatar },
      createdAt: new Date().toISOString(),
      _opt: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      if (socket?.connected) {
        socket.emit("send_message", { rideId, text: trimmed });
        // Remove the optimistic version once real message arrives via socket
        setTimeout(() => {
          setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
        }, 3000);
      } else {
        // REST fallback
        const res = await api.post(`/messages/${rideId}`, { text: trimmed });
        setMessages((prev) =>
          prev.map((m) => (m._id === optimistic._id ? res.data.message : m))
        );
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      toast.error("Failed to send message");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleTyping = () => {
    if (!socket) return;
    socket.emit("typing", { rideId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("stop_typing", { rideId });
    }, 1500);
  };

  const isMe = (msg) =>
    (msg.sender?._id || msg.sender) === user._id;

  // Group messages: add showAvatar flag when sender changes
  const grouped = messages.map((msg, i) => {
    const prev = messages[i - 1];
    const sameAuthor =
      prev &&
      (prev.sender?._id || prev.sender) === (msg.sender?._id || msg.sender);
    return { ...msg, showAvatar: !sameAuthor };
  });

  if (loading) {
    return (
      <div className="flex-center" style={{ height: "60vh" }}>
        <span className="spinner spinner-dark" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>←</button>
        <div className={styles.headerInfo}>
          <p className={styles.headerRoute}>
            {ride?.from} → {ride?.to}
          </p>
          <p className={styles.headerMeta}>
            {ride?.departureTime &&
              format(new Date(ride.departureTime), "dd MMM, h:mm a")}
            {ride?.status && ride.status !== "active" && (
              <span
                className={`badge ${
                  ride.status === "departed" ? "badge-gray" : "badge-danger"
                }`}
                style={{ marginLeft: 8 }}
              >
                {ride.status}
              </span>
            )}
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(`/rides/${rideId}`)}
        >
          Ride details
        </button>
      </div>

      {/* Messages */}
      <div className={styles.messageList}>
        {messages.length === 0 && (
          <div className={styles.emptyChat}>
            <span className={styles.emptyChatIcon}>💬</span>
            <p>No messages yet.</p>
            <p className="text-muted">
              Say hi to coordinate your pickup!
            </p>
          </div>
        )}

        {grouped.map((msg) => {
          const mine = isMe(msg);
          return (
            <div
              key={msg._id}
              className={`${styles.msgWrapper} ${mine ? styles.mine : styles.theirs}`}
            >
              {!mine && msg.showAvatar && (
                <div className={styles.msgMeta}>
                  <Avatar user={msg.sender} size="sm" />
                  <span className={styles.senderName}>{msg.sender?.name}</span>
                </div>
              )}
              <div
                className={`${styles.bubble} ${
                  mine ? styles.bubbleMine : styles.bubbleTheirs
                } ${msg._opt ? styles.optimistic : ""}`}
              >
                {msg.text}
              </div>
              {msg.showAvatar && (
                <span className={styles.timestamp}>
                  {format(new Date(msg.createdAt), "h:mm a")}
                </span>
              )}
            </div>
          );
        })}

        {typingUser && (
          <div className={styles.typingRow}>
            <div className={styles.typingDots}>
              <span /><span /><span />
            </div>
            <span className={styles.typingName}>{typingUser} is typing</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form className={styles.inputBar} onSubmit={handleSend}>
        <input
          ref={inputRef}
          className={styles.textInput}
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleTyping}
          autoComplete="off"
          maxLength={1000}
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!text.trim() || sending}
        >
          {sending ? <span className="spinner" style={{ width: 16, height: 16 }} /> : "Send"}
        </button>
      </form>
    </div>
  );
}