import React from 'react';
import { MatchEvaluation } from '../../api/features';
import './MatchInsight.css';

const label = (value: string) => value.replace(/_/g, ' ');
const percent = (value: number) => `${Math.max(0, Math.min(100, value))}%`;
const Tags: React.FC<{ title: string; values: string[] }> = ({ title, values }) => values.length ?
    <div className="match-insight-reasons"><h4>{title}</h4><div>{values.map(value => <span key={value}>{label(value)}</span>)}</div></div> : null;

const MatchInsight: React.FC<{ matching?: MatchEvaluation | null }> = ({ matching }) => {
    if (!matching || !Number.isFinite(matching.score)) return null;
    const primary = matching.mode === 'HOBBIES' ? 'hobbies' : 'specialities';
    return <section className="match-insight" aria-label="Interest similarity">
        <div className="match-insight-heading">
            <div><span className="match-insight-kicker">WHY THIS PERSON</span><h3>Interest similarity</h3>
                <p>{matching.exactPrimaryMatch ? `You share exact ${primary}.` : `You have related ${primary} in common categories.`}</p></div>
            <strong className="match-insight-score">{percent(matching.score)}</strong>
        </div>
        <div className="match-insight-track" role="meter" aria-label="Overall interest similarity"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={matching.score}>
            <span style={{ width: percent(matching.score) }} />
        </div>
        <div className="match-insight-components">
            <div><span>Hobbies</span><strong>{matching.hobbyScore == null ? 'Not enough data' : percent(matching.hobbyScore)}</strong><small>{matching.hobbyWeight}% of score</small></div>
            <div><span>Specialities</span><strong>{matching.specialityScore == null ? 'Not enough data' : percent(matching.specialityScore)}</strong><small>{matching.specialityWeight}% of score</small></div>
        </div>
        <details><summary>See what you have in common</summary>
            <Tags title="Shared hobbies" values={matching.commonHobbies} />
            <Tags title="Shared specialities" values={matching.commonSpecialities} />
            <Tags title="Related hobby categories" values={matching.relatedHobbyCategories} />
            <Tags title="Related speciality categories" values={matching.relatedSpecialityCategories} />
            <p className="match-insight-note">Calculated from selected interests and their categories. Missing secondary information is not treated as a mismatch. This is not a prediction of relationship success.</p>
        </details>
        <p className="match-insight-skip">Find another pauses this profile in this search mode for 24 hours.</p>
    </section>;
};
export default MatchInsight;
