import User from "../model/User.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
    const { name,role,fonction,departement, email, password } = req.body;
    
    try {
        if (!name ||!role||!fonction||!departement|| !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingUser = await
        User.findOne({ email,name });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPass0 =await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPass0,
            role,
            departement,
            fonction    
        });
        await newUser.save();
        
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);    
        res.status(500).json({ message: "Internal server error" });
    }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userFind = await User.findOne({ email });
    if (!userFind) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPassValid = await bcrypt.compare(password, userFind.password);
    if (!isPassValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    req.session.user = {
      id: userFind._id,
      name: userFind.name,
      email: userFind.email,
        role: userFind.role,
        departement: userFind.departement,
        fonction: userFind.fonction
    };
 
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Session save error" });
      }
   
      return res.status(200).json({ message: "Login successful", user: req.session.user });
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const logoutUser = (req, res) => {
  
    req.session.destroy((err) => {
        if (err) {
            console.error("Error logging out user:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        res.clearCookie('connect.sid'); 
        res.status(200).json({ message: "Logout successful" });
    });
    
}
export const  getUserInSession=(req, res) =>{
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "No user logged in" });
  }
}
export const getRoleInSession = (req, res) => {
  if (req.session && req.session.user) {
    console.log("User role in session:", req.session.user.role);
    res.json({ role: req.session.user.role });
  } else {
    res.status(401).json({ message: "No user logged in" });
  }
}
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); 
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export const deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}