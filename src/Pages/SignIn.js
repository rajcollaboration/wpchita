import React, {useEffect,useState} from "react";
import ReactDOM from 'react-dom';
import axios from 'axios';
import { setUserSession } from '../Utils/Common';
import {ReactComponent as Logo} from '../assets/logo.svg';

function SignIn(props) {
    const [loading, setLoading] = useState(false);
    const username = useFormInput('');
    const password = useFormInput('');
    const [error, setError] = useState(null);

    useEffect(() => document.body.classList.add('form-membership'), []);

    const handleLogin = (event) => {
        event.preventDefault();
        setError(null);
        setLoading(true);
        console.log(username+" "+password);
        axios.post('https://sso.wapchita.com/users/authorization', { token: 'v8uisbxJ72FY',username: username.value, password: password.value }).then(response => {
            console.log(response.data);
          if (response.data.error === "Usuario y/o contraseña incorrectos") {
            let element = document.getElementById("WrongUserPass")
            ReactDOM.findDOMNode(element).classList.remove("disp-none")
          } else {
            setLoading(false);
            console.log(response);
            setUserSession(response.data.response.api_token, response.data.response.default_email);
            props.history.push('/dashboard');
          }
        }).catch(error => {
          setLoading(false);
          if (error.response.status === 401) setError(error.response.data.message);
          else setError("Something went wrong. Please try again later.");
        });
    }

    return (
        <div className="form-wrapper">
            <div className="logo-sign-in">
                <Logo/>
            </div>
            <h5>Room</h5>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <input type="text" id="email" {...username} name="email" className="form-control" placeholder="Usuario o correo electrónico" required />
                </div>
                <div className="form-group">
                    <input type="password" id="password" {...password} name="password" className="form-control" placeholder="Contraseña" required />
                </div>
                {error && <><small style={{ color: 'red' }}>{error}</small><br /></>}<br />
                <button className="btn btn-primary btn-block">Iniciar Sesión
                </button>
                <hr/>
                {/* <p className="text-muted">Login with your social media account.</p>
                <ul className="list-inline">
                    <li className="list-inline-item">
                        <a href="/" className="btn btn-floating btn-facebook">
                            <i className="fa fa-facebook"></i>
                        </a>
                    </li>
                    <li className="list-inline-item">
                        <a href="/" className="btn btn-floating btn-twitter">
                            <i className="fa fa-twitter"></i>
                        </a>
                    </li>
                    <li className="list-inline-item">
                        <a href="/" className="btn btn-floating btn-dribbble">
                            <i className="fa fa-dribbble"></i>
                        </a>
                    </li>
                    <li className="list-inline-item">
                        <a href="/" className="btn btn-floating btn-linkedin">
                            <i className="fa fa-linkedin"></i>
                        </a>
                    </li>
                    <li className="list-inline-item">
                        <a href="/" className="btn btn-floating btn-google">
                            <i className="fa fa-google"></i>
                        </a>
                    </li>
                    <li className="list-inline-item">
                        <a href="/" className="btn btn-floating btn-behance">
                            <i className="fa fa-behance"></i>
                        </a>
                    </li>
                    <li className="list-inline-item">
                        <a href="/" className="btn btn-floating btn-instagram">
                            <i className="fa fa-instagram"></i>
                        </a>
                    </li>
                </ul> */}
                {/* <hr/> */}
                {/* <p className="text-muted">Don't have an account?</p>
                <a href="/sign-up" className="btn btn-outline-light btn-sm">Register now!</a> */}
            </form>
            <p id="WrongUserPass" className="disp-none">Usuario y/o contraseña incorrectos</p>
        </div>
    )
}

const useFormInput = initialValue => {
  const [value, setValue] = useState(initialValue);
 
  const handleChange = e => {
    setValue(e.target.value);
  }
  return {
    value,
    onChange: handleChange
  }
}

export default SignIn
