package- 
mongoose
express, dotenv, nodemon
morgan

in /gateway -> npm i express-http-proxy
in /service -> npm i firebase-admin

express-http-proxy is used in Node.js + Express to forward HTTP requests from one server to another server.
Simple example
Suppose you have two servers:
- Frontend: http://localhost:5173
- Backend A: http://localhost:5000
- Backend B: http://localhost:8000

>app.use("/api", proxy("http://localhost:8000"));


# Firebase Client SDK vs Firebase Admin SDK

The main difference is where they are used and what they can do.

| Feature | Firebase Client SDK (`firebase`) | Firebase Admin SDK (`firebase-admin`) |
|---|---|---|
| Used in | Frontend (React) | Backend (Node.js/Express) |
| Login/signup | Yes | Can manage users, but doesn't perform normal user login |
| Google login | Yes | No direct user login flow |
| Verify ID token | No, not for backend verification | Yes |
| Create/delete users | Limited user operations | Yes, full user management |
| Database access | Based on Firebase security rules | Privileged server access |
| Security | Public client configuration is normal | Requires secure server credentials |

## Simple Example

**Client SDK:**
```javascript
signInWithEmailAndPassword(auth, email, password);
```
Logs the user in.

**Admin SDK:**
```javascript
admin.auth().verifyIdToken(token);
```
Verifies that the token sent to your backend is valid.

## Remember This

- **Client SDK = User authentication (login/signup).**
- **Admin SDK = Backend verification and administration.**

In a MERN project, you can use both together: React logs in the user, and Express verifies the user's token before returning protected data.