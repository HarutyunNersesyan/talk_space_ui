import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { networkApi } from '../../api/features';
import SearchByHobbies from '../../components/SearchByHobbies';
import SearchBySpecialities from '../../components/SearchBySpecialities';
jest.mock('./ConnectionButton', () => () => null);
jest.mock('./BlockButton', () => () => null);
jest.mock('./PresenceBadge', () => () => null);
jest.mock('./useProfileVisibility', () => ({ useProfileVisibility: jest.fn() }));
const profile = (name: string) => ({ userName: name, firstName: name, lastName: 'Smith', age: 25,
    gender: 'FEMALE', zodiac: 'LEO', about: '', hobbies: ['Music'], specialities: ['Java'], socialNetworks: [],
    matching: { algorithmVersion: '2.0', mode: 'HOBBIES', score: 100, hobbyScore: 100, specialityScore: 100,
        hobbyWeight: 80, specialityWeight: 20, exactPrimaryMatch: true,
        commonHobbies: ['Music'], commonSpecialities: ['Java'], relatedHobbyCategories: [], relatedSpecialityCategories: [] } });
beforeEach(() => {
    jest.restoreAllMocks();
    localStorage.setItem('token', `e30.${btoa(JSON.stringify({ sub: 'alice@gmail.com' }))}.test`);
    jest.spyOn(axios, 'get').mockImplementation(async url => {
        if (String(url).includes('/get/userName/')) return { data: 'alice' };
        if (String(url).includes('/image/')) throw new Error('No image in fixture');
        return { data: profile('Carol') };
    });
});
test.each([
    ['HOBBIES', SearchByHobbies], ['SPECIALITIES', SearchBySpecialities]
] as const)('%s records an explicit skip before requesting another match and permits the next click', async (mode, Component) => {
    const events: string[] = [];
    jest.spyOn(networkApi, 'skipMatch').mockImplementation(async name => { events.push(`skip:${name}`); return {} as any; });
    jest.mocked(axios.get).mockImplementation(async url => {
        if (String(url).includes('/get/userName/')) return { data: 'alice' };
        if (String(url).includes('/image/')) throw new Error('No image in fixture');
        events.push('next'); return { data: profile('Carol') };
    });
    render(<MemoryRouter initialEntries={[{ pathname: '/', state: { initialProfile: profile('Bob') } }]}><Component /></MemoryRouter>);
    await screen.findByRole('meter');
    expect(networkApi.skipMatch).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole('button', { name: 'Find another' })[0]);
    await waitFor(() => expect(events).toEqual(['skip:Bob', 'next']));
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Find another' })[0]).not.toBeDisabled());
    fireEvent.click(screen.getAllByRole('button', { name: 'Find another' })[0]);
    await waitFor(() => expect(networkApi.skipMatch).toHaveBeenLastCalledWith('Carol', mode));
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Find another' })[0]).not.toBeDisabled());
});
