import { useEffect } from 'react';

export const useAsyncEffect = (effect, deps) => {
    useEffect(() => {
        (async () => await effect())();
    }, deps);
};
