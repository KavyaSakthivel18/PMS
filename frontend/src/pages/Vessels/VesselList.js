import React, { useEffect, useState } from "react";
import { getVessels } from "../../services/vesselService";

const VesselList = () => {
  const [vessels, setVessels] = useState([]);

  useEffect(() => {
    fetchVessels();
  }, []);

  const fetchVessels = async () => {
    const res = await getVessels();
    setVessels(res.data);
  };

  return (
    <div>
      <h2>Vessel List</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
          </tr>
        </thead>

        <tbody>
          {vessels.map((vessel) => (
            <tr key={vessel.id}>
              <td>{vessel.name}</td>
              <td>{vessel.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VesselList;