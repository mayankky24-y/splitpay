import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Inbox = {
  id: string;
  userId: string;
  message: string;
  link: string;
  type: string;
  createdAt: string;
};

type SocketContextType = {
  inboxes: Inbox[];
  socket: WebSocket | null;
  fetchInboxes: () => Promise<void>;
};

const SocketContext = createContext<SocketContextType>({
  inboxes: [],
  socket: null,
  fetchInboxes: async () => {},
});

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${
  import.meta.env.VITE_API_VERSION
}`;

const WS_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace("http", "ws");

export function SocketProvider({ children }: { children: ReactNode }) {
  const [inboxes, setInboxes] = useState<Inbox[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const fetchInboxes = async () => {
    const userId = localStorage.getItem("wallet_account_id");
    if (!userId) return;

    try {
      const res = await fetch(`${BASE_URL}/inboxes?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch inboxes");
      const json = await res.json();
      setInboxes(json || []);
    } catch (err) {
      console.error("Error fetching inboxes:", err);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("wallet_account_id");
    if (!userId) {
      console.warn("userId not found in localStorage");
      return;
    }

    fetchInboxes();

    const ws = new WebSocket(
      `${WS_BASE_URL}${import.meta.env.VITE_API_VERSION}/ws/${userId}`
    );
    socketRef.current = ws;

    ws.onopen = () => {};

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === "inbox_notification" && data?.data) {
          const inbox: Inbox = data.data;

          setInboxes((prev) => {
            const exists = prev.some((i) => i.id === inbox.id);
            if (exists) return prev;
            return [inbox, ...prev];
          });
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onclose = () => {};

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        inboxes,
        socket: socketRef.current,
        fetchInboxes,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
