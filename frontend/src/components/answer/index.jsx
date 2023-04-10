import React, { useContext } from 'react';

import './index.less';

function IdpAnswer({ data }) {
    return (
        <div className='idpAnswer-root'>
            <div style={{ marginRight: '5px', width: '35px' }}>
                <img src={require('../../assets/svg/user.svg').default} alt={""}></img>
            </div>
            <div className='idpAnswer-content'><pre>{data}</pre></div>
        </div>
    )
}

export default IdpAnswer