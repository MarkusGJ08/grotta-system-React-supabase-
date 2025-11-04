import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'
import './Login.css'


function App() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [rolle, setRolle] = useState('')
  const [message, setMessage] = useState('')
  const [users, setUsers] = useState([])
  const [showSignup, setShowSignup] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(res => {
      if (res.data.session) setUser(res.data.session.user)
    })
  }, [])

  useEffect(() => {
    if (user) {
      supabase
        .from('users')
        .select('*')
        .order('id', { ascending: true })
        .then(({ data, error }) => {
          if (error) console.error(error)
          else setUsers(data)
        })
    }
  }, [user])

  // Login
  const handleLogin = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else setUser(data.user)
  }

  // Signup
  const handleSignup = async (e) => {
    e.preventDefault()
    // 1️⃣ Opprett bruker i Auth
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMessage(error.message)
      return
    }

    const userId = data.user.id

    // 2️⃣ Legg til resten av feltene i users-tabellen
    const { error: dbError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,          // brukerens UUID fra auth
          name,
          last_Name: lastName,
          phoneNumber,
          email,
          rolle
        }
      ])

    if (dbError) {
      setMessage(dbError.message)
    } else {
      setMessage('Signup successful! You can now log in.')
      // Tøm feltene
      setEmail('')
      setPassword('')
      setName('')
      setLastName('')
      setPhoneNumber('')
      setRolle('')
      setShowSignup(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUsers([])
  }

  // ----- Render -----
  if (!user) {
    return (
      <div>
        {showSignup ? (
          <form onSubmit={handleSignup}>
            <h2>Sign Up</h2>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <input type="text" placeholder="First Name" value={name} onChange={e => setName(e.target.value)} required />
            <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
            <input type="text" placeholder="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
            <input type="text" placeholder="Role" value={rolle} onChange={e => setRolle(e.target.value)} />
            <button type="submit">Sign Up</button>
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => setShowSignup(false)}>Log In</button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit">Log In</button>
            <p>
              Don't have an account?{' '}
              <button type="button" onClick={() => setShowSignup(true)}>Sign Up</button>
            </p>
          </form>
        )}
        {message && <p>{message}</p>}
      </div>
    )
  }

  return (
    <div>
      <button onClick={handleLogout}>Log Out</button>
      <h1>Users</h1>
      <ul>
        {users.map(u => <li key={u.id}>{u.name} {u.last_name}</li>)}
      </ul>
    </div>
  )
}

export default App
