import { useContext, useRef, useState } from "react";
import classes from "./ProfileForm.module.css";
import AuthContext from "../../store/auth-context";
import { useHistory } from "react-router-dom";

const ProfileForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const authCtx = useContext(AuthContext);
  const newPasswordInputRef = useRef();
  const history = useHistory();

  const submitHandler = async (e) => {
    e.preventDefault();

    const newPassword = newPasswordInputRef.current.value;

    setIsLoading(true);

    const API_KEY = process.env.REACT_APP_API_KEY;
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          idToken: authCtx.token,
          password: newPassword,
          returnSecureToken: false,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        let errorMessage = "Authentication failed!";
        if (data && data.error && data.error.message)
          errorMessage = data.error.message;

        throw new Error(errorMessage);
      }

      history.replace("/");
    } catch (err) {
      alert(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={classes.form} onSubmit={submitHandler}>
      <div className={classes.control}>
        <label htmlFor="new-password">New Password</label>
        <input type="password" id="new-password" ref={newPasswordInputRef} />
      </div>
      <div className={classes.action}>
        {!isLoading && <button>Change Password</button>}
        {isLoading && <p>Sending request...</p>}
      </div>
    </form>
  );
};

export default ProfileForm;
