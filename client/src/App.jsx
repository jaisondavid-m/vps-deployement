import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL

export default function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await fetch(`${API}/users`);
    const data = await res.json();
    setUsers(data);
  }

  async function createUser(e) {
    e.preventDefault();

    if (!name || !email) return;

    await fetch(`${API}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
      }),
    });

    setName("");
    setEmail("");

    fetchUsers();
  }

  async function deleteUser(id) {
    await fetch(`${API}/users/${id}`, {
      method: "DELETE",
    });

    fetchUsers();
  }

  return (
    <>
      <style>{`
        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
          font-family:Arial, Helvetica, sans-serif;
        }

        body{
          background:#f4f6f8;
        }

        .container{
          width:700px;
          margin:40px auto;
        }

        h1{
          text-align:center;
          margin-bottom:25px;
          color:#333;
        }

        form{
          background:white;
          padding:20px;
          border-radius:10px;
          display:flex;
          flex-direction:column;
          gap:15px;
          box-shadow:0 2px 10px rgba(0,0,0,.1);
        }

        input{
          padding:12px;
          font-size:16px;
          border:1px solid #ccc;
          border-radius:6px;
        }

        button{
          padding:12px;
          background:#007bff;
          color:white;
          border:none;
          cursor:pointer;
          border-radius:6px;
          font-size:16px;
        }

        button:hover{
          background:#0056b3;
        }

        .users{
          margin-top:30px;
        }

        .card{
          background:white;
          padding:15px;
          border-radius:10px;
          margin-bottom:15px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          box-shadow:0 2px 10px rgba(0,0,0,.08);
        }

        .info h3{
          margin-bottom:6px;
          color:#222;
        }

        .info p{
          color:#666;
        }

        .delete{
          background:#dc3545;
        }

        .delete:hover{
          background:#b52a37;
        }

        .empty{
          text-align:center;
          color:#666;
          margin-top:30px;
        }
      `}</style>

      <div className="container">

        <h1>Go Gin GORM CRUD</h1>

        <form onSubmit={createUser}>
          <input
            placeholder="Enter Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

          <input
            placeholder="Enter Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <button>Add User</button>
        </form>

        <div className="users">

          {users.length===0 ? (
            <div className="empty">No Users Found</div>
          ) : (
            users.map((user)=>(
              <div className="card" key={user.id}>

                <div className="info">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                </div>

                <button
                  className="delete"
                  onClick={()=>deleteUser(user.id)}
                >
                  Delete
                </button>

              </div>
            ))
          )}

        </div>

      </div>
    </>
  );
}