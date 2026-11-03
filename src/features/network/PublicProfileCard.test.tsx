import React from 'react';
import { render, screen } from '@testing-library/react';
import { PublicProfileDetails } from './PublicProfileCard';
import { SearchProfile } from '../../api/features';

const profile: SearchProfile = {
    userName: 'aram', firstName: 'Aram', lastName: 'Hakobyan', age: 31,
    zodiac: 'SCORPIO', about: null, hobbies: [], specialities: [], socialNetworks: []
};

test('shows the matching zodiac symbol alongside its name', () => {
    render(<PublicProfileDetails profile={profile} />);
    expect(screen.getByText('Scorpio')).toBeInTheDocument();
    expect(screen.getByText('♏')).toHaveAttribute('aria-hidden', 'true');
});

test('keeps an unknown zodiac label readable without inventing a symbol', () => {
    const { container } = render(<PublicProfileDetails profile={{ ...profile, zodiac: 'UNKNOWN' }} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(container.querySelector('.nf-zodiac-symbol')).toBeNull();
});
