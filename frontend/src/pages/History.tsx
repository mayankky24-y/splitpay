import { Receipt } from "lucide-react";

const History = () => {
  const transactions = [
    {
      date: "2025-07-22",
      restaurant: "Pizza Palace",
      amount: "45.50",
      people: 3,
      status: "Completed",
    },
    {
      date: "2025-07-21",
      restaurant: "Coffee Shop",
      amount: "18.75",
      people: 2,
      status: "Pending",
    },
    {
      date: "2025-07-20",
      restaurant: "Thai Restaurant",
      amount: "67.20",
      people: 4,
      status: "Completed",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          Transaction History
        </h2>
        <p className="text-purple-200 text-lg">
          View your past bill splitting transactions
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-purple-800/30 rounded-xl border border-purple-600/30 overflow-hidden">
          <div className="p-6 border-b border-purple-600/30">
            <h3 className="text-xl font-semibold">Recent Transactions</h3>
          </div>

          <div className="divide-y divide-purple-600/30">
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className="p-6 hover:bg-purple-700/20 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Receipt className="w-8 h-8 text-purple-300" />
                    <div>
                      <div className="font-semibold text-purple-100">
                        {transaction.restaurant}
                      </div>
                      <div className="text-sm text-purple-300">
                        {transaction.date} • {transaction.people} people
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-fuchsia-400">
                      ${transaction.amount}
                    </div>
                    <div
                      className={`text-sm px-2 py-1 rounded-full inline-block ${
                        transaction.status === "Completed"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {transaction.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
