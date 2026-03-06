import React from 'react';

const Login = () => (
    <div>
        <h1>Admin Login</h1>
        <form>
            <label>
                Email:
                <input type="email" name="email" />
            </label>
            <br />
            <label>
                Password:
                <input type="password" name="password" />
            </label>
            <br />
            <button type="submit">Sign In</button>
        </form>
    </div>
);

export default Login;
