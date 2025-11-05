import { useEffect, useState } from "react";
import supabase from "./supabaseClient"; // importér klienten fra din egen fil
import "./Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const { data, error } = await supabase
        .from("users") // hvis du bruker auth.users, endre til 'auth.users'
        .select("id, name, email, role, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Feil ved henting av brukere:", error.message);
      } else {
        setUsers(data);
      }
      setLoading(false);
    }

    fetchUsers();
  }, []);
  
  if (loading) {
    return <div className="loading">Laster brukere...</div>;
  }

  return (
    <div className="users-container">
      <h1>Brukeroversikt</h1>
      {users.length === 0 ? (
        <p>Ingen brukere funnet.</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Navn</th>
              <th>E-post</th>
              <th>Rolle</th>
              <th>Opprettet</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
