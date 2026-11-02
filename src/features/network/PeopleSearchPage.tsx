import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { featureError, networkApi, SearchResults } from '../../api/features';
import ConnectionButton from './ConnectionButton';
import PublicProfileCard from './PublicProfileCard';
import BlockButton from './BlockButton';
import { useNetwork } from './NetworkContext';

const PeopleSearchPage: React.FC = () => {
    const { revision } = useNetwork();
    const [params, setParams] = useSearchParams();
    const query = (params.get('q') || '').trim();
    const rawPage = Number(params.get('page') || 0);
    const page = Number.isInteger(rawPage) && rawPage >= 0 && rawPage <= 99 ? rawPage : 0;
    const [draft, setDraft] = useState(query);
    const [data, setData] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);
    useEffect(() => { setDraft(query); }, [query]);
    useEffect(() => {
        setData(null); setError('');
        if (!query || query.length > 100) { if (query.length > 100) setError('Search text must be 100 characters or fewer.'); setLoading(false); return; }
        const controller = new AbortController();
        setLoading(true);
        networkApi.search(query, page, controller.signal).then(setData).catch(e => {
            if (!controller.signal.aborted) setError(featureError(e, 'Unable to search for people.'));
        }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [query, page, reload, revision]);
    return <div className="nf-page"><div className="nf-inner">
        <header className="nf-hero"><div><span className="nf-eyebrow"><SearchRoundedIcon /> FIND YOUR PEOPLE</span><h1>Explore your community.</h1><p>Search by name, hobbies, skills or something you have in common.</p></div></header>
        <form className="nf-search" onSubmit={e => { e.preventDefault(); if (draft.trim()) { setParams({ q: draft.trim() }); setReload(v => v + 1); } }}><label className="nf-sr-only" htmlFor="people-query">Search people</label><SearchRoundedIcon /><input id="people-query" type="search" maxLength={100} value={draft} placeholder="Name, hobby or specialty…" onChange={e => setDraft(e.target.value)} /><button className="nf-button" disabled={!draft.trim() || loading}>Search</button></form>
        {error && <div className="nf-error" role="alert">{error}<button className="nf-text-button" onClick={() => setReload(v => v + 1)}>Try again</button></div>}
        {loading ? <div className="nf-empty" role="status">Searching people…</div>
        : !query ? <div className="nf-empty"><SearchRoundedIcon /><h2>Start with something in common</h2><p>Enter a name, interest or specialty to discover people.</p></div>
        : data && <><p className="nf-muted">Results for “{query}” · Page {page + 1}</p>{!data.content.length && <div className="nf-empty"><h2>No profiles on this page</h2><p>Try another search or browse another page.</p></div>}<div className="nf-grid">{data.content.map(profile => <PublicProfileCard key={profile.userName} profile={profile}><ConnectionButton userName={profile.userName} /><BlockButton userName={profile.userName} /></PublicProfileCard>)}</div><nav className="nf-pagination" aria-label="Search pages"><button className="nf-button secondary" disabled={page === 0} onClick={() => setParams({ q: query, page: String(page - 1) })}>Previous</button><span>{page + 1}</span><button className="nf-button secondary" disabled={(page + 1) * data.size >= data.indexedTotal || page >= 99} onClick={() => setParams({ q: query, page: String(page + 1) })}>Next</button></nav></>}
    </div></div>;
};
export default PeopleSearchPage;
