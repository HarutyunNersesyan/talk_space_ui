import React from 'react';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

const ProfileAbout: React.FC<{ about?: string | null; onEdit: () => void }> = ({ about, onEdit }) => (
    <section className="profile-card">
        <div className="profile-card-heading">
            <div><span>ABOUT</span><h2>About me</h2></div>
            <button type="button" className="profile-small-edit" onClick={onEdit}><EditRoundedIcon /> Edit</button>
        </div>
        <p className="profile-about-text">{about || 'Tell people a little about yourself.'}</p>
    </section>
);
export default ProfileAbout;
