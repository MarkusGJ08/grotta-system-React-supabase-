import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './Users.css'

function Users() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from('users')
        .select('id, created_at, name, last_name, phoneNumber, email, rolle')
        .order('id', { ascending: true })

      if (error) {
        console.error('Error fetching users:', error)
      } else {
        setUsers(data)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="users-container">
      <h2>Users</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Created At</th>
            <th>Name</th>
            <th>Last Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tablebody className="users-table-body">
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{new Date(u.created_at).toLocaleString()}</td>
              <td>{u.name}</td>
              <td>{u.last_name}</td>
              <td>{u.phoneNumber}</td>
              <td>{u.email}</td>
              <td>{u.rolle}</td>
            </tr>
          ))}
        </tbody>
        </tablebody>
        <button className="Register-button">Register New Item</button>
      </table>
    </div>
  )
}

export default Users
