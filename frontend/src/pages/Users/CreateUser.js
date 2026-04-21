import React, { useState } from "react";
import { createUser } from "../../services/userService";

const CreateUser = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createUser({
      name,
      email,
    });

    alert("User Created");
  };

  return (
    <div>
      <h2>Create User</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateUser;