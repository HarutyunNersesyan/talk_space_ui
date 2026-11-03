import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ProfileAbout from './ProfileAbout';

test('shows the existing biography and invokes profile editing', () => {
    const edit=jest.fn();
    render(<ProfileAbout about="A love for music" onEdit={edit} />);
    expect(screen.getByText('A love for music')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(edit).toHaveBeenCalledTimes(1);
});

test('shows a prompt when a biography is absent', () => {
    render(<ProfileAbout onEdit={() => {}} />);
    expect(screen.getByText('Tell people a little about yourself.')).toBeInTheDocument();
});
