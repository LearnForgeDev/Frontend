import { Outlet } from 'react-router-dom';
import Footer from '../pages/Landing/Components/Footer';

const PublicLayout = () => {
    return (
        <div className="public-layout">
            <Outlet />
            <Footer />
        </div>
    );
};

export default PublicLayout;

