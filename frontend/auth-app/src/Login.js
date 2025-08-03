import React, { useState } from 'react';
import {useNavigate, useNavigation} from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validateForm = () => {
        if (!username || !password) {
            setError("Username and password are required");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        const formDetails = new URLSearchParams();
        formDetails.append("username", username);
        formDetails.append("password", password);

        try {
            const response = await fetch("http://localhost:8000/token", {
                method: "POST",
                body: formDetails,
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
            });

            setLoading(false);

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.access_token);
                navigate("/protected");
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Authentication Error');
            }
        } catch (error) {
            setLoading(false);
            setError(error);
        }
    };


}