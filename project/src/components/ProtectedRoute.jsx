import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user"); // or use a token
  console.log(user);
  if (!user) {
    return <Navigate to="/" replace/>;
  }

  return children;
}
