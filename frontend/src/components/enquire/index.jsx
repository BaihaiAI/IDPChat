import React, { useCallback } from 'react';
import LazyLoad from 'react-lazyload';
import uuid from 'react-uuid';

import './index.less';

function IdpEnquire({ content, type }) {

    const loadTypeComponent = useCallback((data, type) => {
        let html = [];
        switch (type) {
            case 'image':
                html.push(<img key={uuid()} loading="lazy" src={data} alt={''}></img>)
                break;
            default:
                html.push(<span key={uuid()}>{data}</span>)
        }
        return html;
    }, []);

    return (
        <div className='idpEnquire-root'>
            <div style={{ marginRight: '5px', minWidth: '35px' }}>
                <img src={require('../../assets/svg/jqr.svg').default} alt={""}></img>
            </div>
            <div className='idpEnquire-content'>
                <LazyLoad>
                    {loadTypeComponent(content, type)}
                </LazyLoad>
            </div>
        </div>
    )
}

export default IdpEnquire