import React from "react";
import { Link } from 'react-router-dom'

export const SectionHeader = ({ icon, title }) => (
    <p className='pl-3 my-4 flex items-center'>
        <img className='inline-block w-4' src={icon} />
        <span className='text-lg leading-6 ml-2 text-[#242424]'>{title}</span>
    </p>
);

export const SectionBody = ({ items }) => (
    <div className='grid grid-cols-4 gap-y-8 my-4'>
        {items.map(({ category, icon, text }, i) => (
            <Link to={`/${category}`} key={i}>
                <div className='flex flex-col items-center'>
                    <img src={icon} className='w-1/2' alt='' />
                    <div className='mt-2 text-xs'>
                        <span className='text-[#04343499]'>{text}</span>
                    </div>
                </div>
            </Link>
        ))}
    </div>
);

export const Section = ({ icon, title, items }) => (
    <>
        <SectionHeader icon={icon} title={title} />
        <SectionBody items={items} />
    </>
);
