import type { IRoute } from "../interfaces/route-interface";
import Friends from "../pages/Friends";
import History from "../pages/History";
import Participant from "../pages/Participant";
import NewBill from "../pages/NewBill";
import PaymentStatus from "../pages/PaymentStatus";
import CreatedBills from "../pages/CreatedBills";
import EditBill from "../pages/EditBill";
import ParticipatedBills from "../pages/ParticipatedBills";
import AssignParticipants from "../pages/ViewBill";

export const RouteSetting: IRoute[] = [
  {
    name: "App",
    path: "/",
    element: <></>,
  },
  {
    name: "New Bill",
    path: "/new-bill",
    element: <NewBill />,
  },
  {
    name: "Friends",
    path: "/friends",
    element: <Friends />,
  },
  {
    name: "History",
    path: "/history",
    element: <History />,
  },
  {
    name: "Created Bills",
    path: "/created-bills",
    element: <CreatedBills />,
  },
  {
    name: "Participant",
    path: "/participant",
    element: <Participant />,
  },
  {
    name: "Assign Participants",
    path: "/assign-participants/:billId",
    element: <AssignParticipants />,
  },
  {
    name: "Edit Bill",
    path: "/edit-bill/:billId",
    element: <EditBill />,
  },
  {
    name: "Payment Status",
    path: "/payment-status/:billId",
    element: <PaymentStatus />,
  },
  {
    name: "Participated Bills",
    path: "/participated-bills",
    element: <ParticipatedBills />,
  },
];
