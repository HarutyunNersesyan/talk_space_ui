import React from 'react';
import { render, screen } from '@testing-library/react';
import MatchInsight from './MatchInsight';
import { MatchEvaluation } from '../../api/features';
const matching: MatchEvaluation = {
    algorithmVersion: '2.0', mode: 'HOBBIES', score: 86.4, hobbyScore: 100, specialityScore: 32,
    hobbyWeight: 80, specialityWeight: 20, exactPrimaryMatch: true,
    commonHobbies: ['Board_Games'], commonSpecialities: ['Java'],
    relatedHobbyCategories: ['Games'], relatedSpecialityCategories: []
};
test('renders the server score, weights and exact shared interests', () => {
    render(<MatchInsight matching={matching} />);
    expect(screen.getByText('86.4%')).toBeInTheDocument();
    expect(screen.getByText('80% of score')).toBeInTheDocument();
    expect(screen.getByText('Board Games')).toBeInTheDocument();
    expect(screen.getByText('Java')).toBeInTheDocument();
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '86.4');
});
test('missing secondary data stays unknown, rather than showing zero percent', () => {
    render(<MatchInsight matching={{ ...matching, specialityScore: null, hobbyWeight: 100, specialityWeight: 0 }} />);
    expect(screen.getByText('Not enough data')).toBeInTheDocument();
    expect(screen.getByText('100% of score')).toBeInTheDocument();
});
test('ordinary profiles without a matching evaluation have no invented score', () => {
    const { container } = render(<MatchInsight />);
    expect(container).toBeEmptyDOMElement();
});
test('category-only matches are explained separately from exact overlap', () => {
    render(<MatchInsight matching={{ ...matching, exactPrimaryMatch: false, commonHobbies: [] }} />);
    expect(screen.getByText('You have related hobbies in common categories.')).toBeInTheDocument();
    expect(screen.queryByText('Shared hobbies')).not.toBeInTheDocument();
});
