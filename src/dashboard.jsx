import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase"; // sørg for riktig path
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [scanValue, setScanValue] = useState("");
  const [message, setMessage] = useState("");

  const [products, setProducts] = useState([]);
  const [loans, setLoans] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");

  // --------------------------
  // HENT PRODUKTER
  // --------------------------
  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    setProducts(data);
  }

  // --------------------------
  // HENT AKTIVE LÅN
  // --------------------------
  async function loadLoans() {
    const { data, error } = await supabase
      .from("loans")
      .select(`
        id,
        loan_date,
        returned,
        user_id,
        users ( name ),
        product_id,
        products ( name )
      `)
      .eq("returned", false)
      .order("loan_date", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setLoans(data);
  }

  // --------------------------
  // INIT – last alt
  // --------------------------
  useEffect(() => {
    loadProducts();
    loadLoans();
  }, []);

  // --------------------------
  // FINN PRODUKT VIA STREKKODE
  // --------------------------
  async function findProductByBarcode(barcode) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("barcode", barcode)
      .single();

    if (error) return null;
    return data;
  }

  // --------------------------
  // OPPRETT LÅN
  // --------------------------
  async function createLoan(userId, productId) {
    const { error } = await supabase.from("loans").insert({
      user_id: userId,
      product_id: productId,
      loan_date: new Date().toISOString(),
      returned: false,
    });

    if (!error) {
      await supabase
        .from("products")
        .update({ available: false })
        .eq("id", productId);

      loadProducts();
      loadLoans();
    }
  }

  // --------------------------
  // RETURNER LÅN
  // --------------------------
  async function returnLoan(loanId, productId) {
    const { error } = await supabase
      .from("loans")
      .update({
        returned: true,
        return_date: new Date().toISOString(),
      })
      .eq("id", loanId);

    if (!error) {
      await supabase
        .from("products")
        .update({ available: true })
        .eq("id", productId);

      loadProducts();
      loadLoans();
    }
  }

  // --------------------------
  // SCANNING
  // --------------------------
  const handleScan = (e) => {
    setScanValue(e.target.value);
    setMessage("");
  };

  const handleExecute = async () => {
    const code = scanValue.trim();
    if (!code) {
      setMessage("Ingen strekkode oppgitt.");
      return;
    }

    const product = await findProductByBarcode(code);
    if (product) {
      // Toggle via Supabase
      if (product.available) {
        // produkt blir utlånt → krev bruker
        await createLoan("00000000-0000-0000-0000-000000000000", product.id); 
        setMessage(`Produkt ${product.name} utlånt!`);
      } else {
        // produkt returneres
        // finn lån som ikke er returnert
        const activeLoan = loans.find((l) => l.product_id === product.id);
        if (activeLoan) {
          await returnLoan(activeLoan.id, product.id);
          setMessage(`Produkt ${product.name} returnert.`);
        }
      }

      setScanValue("");
      return;
    }

    // ingen produkt → sjekk om bruker
    if (code.toUpperCase().startsWith("U")) {
      setMessage(`Bruker skannet: ${code} (du kan utvide denne logikken)`);
      setScanValue("");
      return;
    }

    setMessage(`Ingen treff for kode: ${code}`);
    setScanValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleExecute();
    }
  };

  // --------------------------
  // SORT LÅN
  // --------------------------
  const sortedLoans = [...loans].sort((a, b) => {
    const ta = new Date(a.loan_date).getTime();
    const tb = new Date(b.loan_date).getTime();
    return sortOrder === "newest" ? tb - ta : ta - tb;
  });

  // --------------------------
  // RENDER
  // --------------------------
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Lagerstyring – Dashboard</h1>

      <div className="top-row">
        {/* VENSTRE: SCAN */}
        <div className="scan-box">
          <h2>Scan bruker eller produkt</h2>

          <div className="scan-row">
            <input
              type="text"
              placeholder="Scan strekkode her..."
              value={scanValue}
              onChange={handleScan}
              onKeyDown={handleKeyDown}
            />
            <button className="scan-button" onClick={handleExecute}>
              Utfør
            </button>
          </div>

          {message && <p className="scan-message">{message}</p>}

          <div className="info-cards" style={{ marginTop: 16 }}>
            <div className="info-card">
              <h3>Registrerte produkter</h3>
              <p className="info-number">{products.length}</p>
            </div>
          </div>
        </div>

        {/* HØYRE: LÅN */}
        <aside className="loans-card">
          <h3>Aktive lån</h3>

          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button
              className="small-btn"
              onClick={() => setSortOrder("newest")}
              style={{ opacity: sortOrder === "newest" ? 1 : 0.6 }}
            >
              Nyest
            </button>
            <button
              className="small-btn"
              onClick={() => setSortOrder("oldest")}
              style={{ opacity: sortOrder === "oldest" ? 1 : 0.6 }}
            >
              Eldst
            </button>
          </div>

          <div className="loans-list">
            {sortedLoans.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>Ingen aktive lån.</p>
            ) : (
              <ul>
                {sortedLoans.map((l) => (
                  <li key={l.id} className="loan-row">
                    <div>
                      <div className="loan-title">{l.products?.name}</div>
                      <small>{l.users?.name ?? "Ukjent bruker"}</small>{" "}
                      <small style={{ color: "var(--muted)", marginLeft: 8 }}>
                        {new Date(l.loan_date).toLocaleString()}
                      </small>
                    </div>

                    <button
                      className="small-btn"
                      onClick={() => returnLoan(l.id, l.product_id)}
                    >
                      Returner
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* PRODUKTTABELL */}
      <div className="users-container">
        <h2>Tilgjengelige produkter</h2>

        <table className="users-table">
          <thead>
            <tr>
              <th>Navn</th>
              <th>Barcode</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.barcode}</td>
                <td>
                  <span
                    className={
                      "badge " + (p.available ? "available" : "taken")
                    }
                  >
                    {p.available ? "Ledig" : "Utlånt"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

         <div style={{ marginTop: 12 }}>
-          <button className="Register-button" onClick={() => navigate("./admin")}></button>
+          <button className="Register-button" onClick={() => navigate("/admin")}>
             Gå til Admin
           </button>
         </div>
      </div>
    </div>
  );
}