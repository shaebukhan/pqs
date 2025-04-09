import React from 'react';
import { quantum } from 'ldrs';

quantum.register();

const Loader = () => {
    return (
        <div className="loader-overlay">
            <l-quantum size="45" speed="1.75" color="black"></l-quantum>
        </div>
    );
};

export default Loader;


