import axios from "axios";
import { useEffect } from "react";

function ParticipantBody() {
  useEffect(() => {
    const getParticipant = async () => {
      await axios
        .get("http://localhost:8080/api/v1/participants/User456")
        .then((res) => {
          console.log("Participant: ", res);
        })
        .catch((err) => {
          console.log("Error: ", err);
        });
    };

    getParticipant();
  }, []);

  return <div>ParticipantBody</div>;
}

export default ParticipantBody;
