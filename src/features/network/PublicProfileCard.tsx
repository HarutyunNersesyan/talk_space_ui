import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL, SearchProfile } from '../../api/features';
import PresenceBadge from './PresenceBadge';
import { useProfileVisibility } from './useProfileVisibility';

const format = (text?: string) => text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase().replace(/_/g, ' ') : '';
const zodiacSymbols: Record<string, string> = {
    ARIES: '♈', TAURUS: '♉', GEMINI: '♊', CANCER: '♋', LEO: '♌', VIRGO: '♍',
    LIBRA: '♎', SCORPIO: '♏', SAGITTARIUS: '♐', CAPRICORN: '♑', AQUARIUS: '♒', PISCES: '♓'
};
function socialLink(value: string) {
    try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url : null; }
    catch { return null; }
}
export const PublicProfileDetails: React.FC<{ profile: SearchProfile }> = ({ profile }) => <>
    <div className="nf-profile-meta">
        {profile.age != null && <span>{profile.age} years</span>}
        {profile.gender && <span>{format(profile.gender)}</span>}
        {profile.zodiac && <span className="nf-zodiac">{zodiacSymbols[profile.zodiac.toUpperCase()] && <span aria-hidden="true" className="nf-zodiac-symbol">{zodiacSymbols[profile.zodiac.toUpperCase()]}</span>}{format(profile.zodiac)}</span>}
    </div>
    <div><h3 className="nf-label">ABOUT</h3><p className="nf-about">{profile.about || 'This person has not added a bio yet.'}</p></div>
    <div><h3 className="nf-label">HOBBIES</h3><div className="nf-tags">{profile.hobbies?.length ? profile.hobbies.map((x, i) => <span key={`${x}-${i}`}>{x}</span>) : <span>No hobbies listed</span>}</div></div>
    <div><h3 className="nf-label">SPECIALITIES</h3><div className="nf-tags">{profile.specialities?.length ? profile.specialities.map((x, i) => <span key={`${x}-${i}`}>{x}</span>) : <span>No specialities listed</span>}</div></div>
    <div><h3 className="nf-label">SOCIAL NETWORKS</h3><div className="nf-socials">{profile.socialNetworks?.length ? profile.socialNetworks.map((value, i) => {
        const url = socialLink(value);
        return url ? <a key={`${value}-${i}`} href={url.href} target="_blank" rel="noopener noreferrer">{url.hostname.replace(/^www\./, '')}</a> : null;
    }) : <span className="nf-muted">No social networks listed</span>}</div></div>
</>;
const PublicProfileCard: React.FC<{ profile: SearchProfile; children?: React.ReactNode; highlighted?: boolean }> = ({ profile, children, highlighted }) => {
    const [image, setImage] = useState('');
    const [hidden, setHidden] = useState(false);
    useProfileVisibility(profile.userName, () => setHidden(true), () => setHidden(false));
    useEffect(() => {
        let active = true;
        let url = '';
        const controller = new AbortController();
        setImage('');
        axios.get(`${API_URL}/api/public/user/image/${encodeURIComponent(profile.userName)}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, responseType: 'blob', signal: controller.signal
        }).then(r => {
            if (active && r.data?.size) { url = URL.createObjectURL(r.data); setImage(url); }
        }).catch(() => {});
        return () => { active = false; controller.abort(); if (url) URL.revokeObjectURL(url); };
    }, [profile.userName]);
    if (hidden) return null;
    return <article className={`nf-card nf-full-profile ${highlighted ? 'highlighted' : ''}`}>
        <div className="nf-profile-photo">{image ? <img src={image} alt={`${profile.firstName} ${profile.lastName}`} /> : <span>{profile.userName.charAt(0).toUpperCase()}</span>}</div>
        <div className="nf-person"><div><h2>{[profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.userName}</h2><span className="nf-muted">@{profile.userName}</span></div><PresenceBadge userName={profile.userName} /></div>
        <PublicProfileDetails profile={profile} />
        <div className="nf-profile-actions">{children}</div>
    </article>;
};
export default PublicProfileCard;
