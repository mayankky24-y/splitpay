import axios from "axios";
import { useEffect } from "react";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_VERSION}`;

function ParticipantBody() {
  useEffect(() => {
    const getParticipant = async () => {
      const participantId = localStorage.getItem("wallet_account_id");
      if (!participantId) {
        console.warn("participantId not found in localStorage");
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/participants/${participantId}`);
        console.log("Participant: ", res);
      } catch (err) {
        console.log("Error: ", err);
      }
    };

    getParticipant();
  }, []);

  return <div>ParticipantBody</div>;
}

export default ParticipantBody;
