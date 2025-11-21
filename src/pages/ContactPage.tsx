import React from 'react';
import { Contact } from '../components/frontend/Contact';

export const ContactPage: React.FC = () => {
    return (
        <div className="animate-fadeIn w-full flex-1 flex flex-col">
            <Contact />
        </div>
    );
};
