import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Simple Admin panel
 * Save this file as: /src/Admin.jsx
 *
 * Features:
 * - view users
 * - add user (name + email)
 * - toggle admin role
 * - delete user
 * - simple search and localStorage persistence
 *
 * No external libs required.
 */

const STORAGE_KEY = "app_admin_users_v1";

const styles = {
    container: {
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        padding: 20,
        maxWidth: 900,
        margin: "24px auto",
        border: "1px solid #e6e6e6",
        borderRadius: 8,
        background: "#fff",
    },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    title: { margin: 0, fontSize: 20 },
    form: { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" },
    input: { padding: 8, borderRadius: 6, border: "1px solid #ccc", minWidth: 180 },
    button: {
        padding: "8px 12px",
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
    },
    addBtn: { background: "#0078d4", color: "#fff" },
    dangerBtn: { background: "#e81123", color: "#fff" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: 16 },
    th: { textAlign: "left", padding: "8px 6px", borderBottom: "1px solid #eee" },
    td: { padding: "8px 6px", borderBottom: "1px solid #f7f7f7", verticalAlign: "middle" },
    smallMuted: { color: "#666", fontSize: 12 },
    actions: { display: "flex", gap: 6 },
    pill: (isAdmin) => ({
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: 999,
        background: isAdmin ? "#dff6dd" : "#f2f2f2",
        color: isAdmin ? "#0b6623" : "#333",
        fontSize: 12,
    }),
};

function makeId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

const sampleUsers = [
    { id: makeId(), name: "Alice Johnson", email: "alice@example.com", admin: true, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5 },
    { id: makeId(), name: "Bob Smith", email: "bob@example.com", admin: false, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2 },
];

export default function Admin() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                setUsers(JSON.parse(raw));
            } else {
                setUsers(sampleUsers);
            }
        } catch {
            setUsers(sampleUsers);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        } catch {
            // ignore
        }
    }, [users]);

    function addUser(e) {
        e.preventDefault();
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        if (!trimmedName || !trimmedEmail) {
            setMessage("Name and email are required.");
            setTimeout(() => setMessage(""), 2500);
            return;
        }

        if (users.some((u) => u.email.toLowerCase() === trimmedEmail.toLowerCase())) {
            setMessage("A user with that email already exists.");
            setTimeout(() => setMessage(""), 2500);
            return;
        }

        const newUser = {
            id: makeId(),
            name: trimmedName,
            email: trimmedEmail,
            admin: false,
            createdAt: Date.now(),
        };
        setUsers((s) => [newUser, ...s]);
        setName("");
        setEmail("");
        setMessage("User added.");
        setTimeout(() => setMessage(""), 2000);
    }

    function deleteUser(id) {
        if (!window.confirm("Delete this user?")) return;
        setUsers((s) => s.filter((u) => u.id !== id));
    }

    function toggleAdmin(id) {
        setUsers((s) => s.map((u) => (u.id === id ? { ...u, admin: !u.admin } : u)));
    }

    function clearAll() {
        if (!window.confirm("Remove all users?")) return;
        setUsers([]);
    }

    const filtered = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Admin Panel</h2>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        style={{ ...styles.button, background: "#6b7280", color: "#fff" }}
                        onClick={() => navigate("/dashboard")}
                        title="Til dashboard"
                    >
                        Til Dashboard
                    </button>
                    <button
                        style={{ ...styles.button, ...styles.dangerBtn }}
                        onClick={clearAll}
                        title="Remove all users"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            <form style={styles.form} onSubmit={addUser}>
                <input
                    style={styles.input}
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" style={{ ...styles.button, ...styles.addBtn }}>
                    Add user
                </button>

                <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                        style={{ ...styles.input, minWidth: 240 }}
                        placeholder="Search by name or email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </form>

            {message && <div style={{ marginTop: 10, color: "#444" }}>{message}</div>}

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Role</th>
                        <th style={styles.th}>Created</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length === 0 && (
                        <tr>
                            <td style={styles.td} colSpan={5}>
                                <span style={styles.smallMuted}>No users found.</span>
                            </td>
                        </tr>
                    )}
                    {filtered.map((u) => (
                        <tr key={u.id}>
                            <td style={styles.td}>
                                <div>{u.name}</div>
                                <div style={styles.smallMuted}>{u.id}</div>
                            </td>
                            <td style={styles.td}>{u.email}</td>
                            <td style={styles.td}>
                                <span style={styles.pill(u.admin)}>{u.admin ? "Administrator" : "User"}</span>
                            </td>
                            <td style={styles.td}>
                                <div>{new Date(u.createdAt).toLocaleString()}</div>
                            </td>
                            <td style={{ ...styles.td, width: 220 }}>
                                <div style={styles.actions}>
                                    <button
                                        style={{ ...styles.button, background: u.admin ? "#f0f0f0" : "#2e7d32", color: "#fff", borderRadius: 6, padding: "6px 10px" }}
                                        onClick={() => toggleAdmin(u.id)}
                                    >
                                        {u.admin ? "Revoke" : "Make admin"}
                                    </button>
                                    <button
                                        style={{ ...styles.button, ...styles.dangerBtn }}
                                        onClick={() => deleteUser(u.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ marginTop: 12, color: "#666", fontSize: 13 }}>
                Total users: {users.length}
            </div>
        </div>
    );
}