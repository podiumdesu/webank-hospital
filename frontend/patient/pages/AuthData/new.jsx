import React, { useEffect, useState } from 'react';
import { toDataURL } from 'qrcode';
import { generatorGen, keyGen } from '#/utils/pre';

const { g, h } = generatorGen('foo', 'bar');

export default () => {
    const [src, setSrc] = useState('');
    useEffect(() => {
        const { pk, sk } = keyGen(g);
        toDataURL([{
            data: pk.serialize(),
            mode: 'byte'
        }]).then(setSrc);
    }, []);
    return (
        <img src={src} />
    )
}