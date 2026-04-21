import { Bell, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";

interface Inbox {
  id: string;
  message: string;
  link: string;
  createdAt: string;
}

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${
  import.meta.env.VITE_API_VERSION
}`;

export default function InboxBell() {
  const [open, setOpen] = useState<boolean>(false);
  const { inboxes }: { inboxes: Inbox[] } = useSocket();

  const unread: number = inboxes.length;

  const handleInboxClick = async (
    inboxId: string,
    link: string
  ): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/inboxes/${inboxId}/read`, {
        method: "PATCH",
      });
    } catch (error) {
      console.error("Failed to mark inbox as read:", error);
    } finally {
      window.location.href = link;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Element;
      if (open && !target.closest(".inbox-dropdown")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative inbox-dropdown">
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="relative cursor-pointer"
      >
        <Bell
          className={`w-6 h-6 text-gray-300 hover:text-white transition-all duration-200 ${
            unread > 0 ? "animate-pulse" : ""
          }`}
        />

        {unread > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs font-medium text-white animate-bounce">
            {unread > 9 ? "9+" : unread}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed sm:absolute right-4 sm:right-0 top-14 sm:top-8 w-80 sm:w-96 bg-gray-900 rounded-lg border border-gray-600 shadow-xl z-50 opacity-0 translate-y-2 animate-dropdown">
          <div className="flex items-center justify-between p-5 border-b border-gray-700">
            <h4 className="text-base font-medium text-gray-200">
              Notifications
            </h4>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[80vh] overflow-y-auto">
            {inboxes.length === 0 ? (
              <div className="p-8 text-center text-gray-500 opacity-0 animate-fade-in">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="p-2">
                {inboxes.map((inbox, index) => (
                  <div
                    key={inbox.id}
                    className="p-4 rounded-md cursor-pointer hover:bg-gray-700 border-b border-gray-700 last:border-b-0 transition-all duration-200 opacity-0 animate-slide-up mb-4"
                    style={{
                      animationDelay: `${200 + index * 100}ms`,
                      animationFillMode: "forwards",
                    }}
                    onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.preventDefault();
                      handleInboxClick(inbox.id, inbox.link);
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base text-gray-200 leading-relaxed">
                          {inbox.message}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(inbox.createdAt).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropdown {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-dropdown {
          animation: dropdown 0.2s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
