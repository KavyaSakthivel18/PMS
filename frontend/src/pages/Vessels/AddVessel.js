import React, { useState } from "react";
import { createVessel } from "../../services/vesselService";

const AddVessel = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createVessel({
      name,
      type,
    });

    alert("Vessel Added");
  };

  return (
    <div>
      <h2>Add Vessel</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Type"
          onChange={(e) => setType(e.target.value)}
        />

        <button type="submit">Add</button>
      </form>
    </div>
  );
};

export default AddVessel;