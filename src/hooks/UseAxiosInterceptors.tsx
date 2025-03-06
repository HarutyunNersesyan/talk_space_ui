import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useAxiosInterceptors = () => {
    const navigate = useNavigate();

    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
            return Promise.reject(error);
        }
    );

};

export default useAxiosInterceptors;
