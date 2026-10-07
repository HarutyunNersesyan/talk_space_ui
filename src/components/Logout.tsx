import React, {
    useContext,
    useState
} from 'react';

import axios from 'axios';

import LogoutRoundedIcon
    from '@mui/icons-material/LogoutRounded';

import {
    AuthContext
} from '../context/AuthContext';

import './Logout.css';


const API_URL =
    process.env.REACT_APP_API_URL ||
    'http://localhost:8080';


const LogoutForm: React.FC = () => {

    const authContext =
        useContext(AuthContext);


    const [
        isLoggingOut,
        setIsLoggingOut
    ] = useState<boolean>(false);


    /* =====================================================
       LOGOUT
       ===================================================== */

    const handleLogout =
        async () => {

            if (isLoggingOut) {
                return;
            }


            setIsLoggingOut(true);


            const token =
                localStorage.getItem(
                    'token'
                );


            try {

                /*
                 * Եթե token կա՝ backend-ին ասում ենք,
                 * որ user-ը logout է անում։
                 */
                if (token) {

                    await axios.get(
                        `${API_URL}/account/profile/logout`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                }

            } catch (error) {

                /*
                 * Backend logout-ի ձախողումը
                 * չպետք է user-ին պահի համակարգում։
                 *
                 * Local authentication-ը միևնույն է
                 * մաքրում ենք։
                 */
                console.error(
                    'Backend logout failed:',
                    error
                );

            } finally {

                /*
                 * AuthContext-ը միաժամանակ՝
                 *
                 * - ջնջում է token-ը
                 * - ջնջում է userName-ը
                 * - ջնջում է userRole-ը
                 * - isAuthenticated = false
                 * - տեղափոխում է /login
                 */
                if (authContext) {

                    authContext.logout();

                } else {

                    /*
                     * Fallback՝ եթե ինչ-որ պատճառով
                     * component-ը AuthProvider-ից դուրս է։
                     */
                    localStorage.removeItem(
                        'token'
                    );

                    localStorage.removeItem(
                        'userName'
                    );

                    localStorage.removeItem(
                        'userRole'
                    );

                    localStorage.removeItem(
                        'redirectPath'
                    );


                    window.location.href =
                        '/login';
                }


                setIsLoggingOut(false);
            }
        };


    return (

        <button
            type="button"

            className="logout-button"

            onClick={handleLogout}

            disabled={isLoggingOut}
        >

            <span className="logout-button-icon">
                <LogoutRoundedIcon />
            </span>


            <span>
                {isLoggingOut
                    ? 'Logging out...'
                    : 'Logout'
                }
            </span>

        </button>
    );
};


export default LogoutForm;