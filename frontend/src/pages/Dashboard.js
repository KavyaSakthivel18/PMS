import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    containers: [],
    monthlyFees: []
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/dashboard");

      setData(res.data);
      setLoading(false);

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h2>Dashboard</h2>

      <div>
        <h3>Containers Per Line</h3>
        <ul>
          {data.containers?.map((item, index) => (
            <li key={index}>
              {item.line} - {item.count}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3>Monthly Fees</h3>
        <ul>
          {data.monthlyFees?.map((item, index) => (
            <li key={index}>
              {item.month} - ₹{item.amount}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default Dashboard;