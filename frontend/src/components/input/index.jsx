import React, { useContext, useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { Input } from 'antd';
import { SendOutlined, MessageOutlined, LoadingOutlined } from '@ant-design/icons';
import { AppContext } from '@store';
import Api from '../../api';
import uuid from 'react-uuid';

import './index.less';

function IdpInput() {

    const { updateIdpGPTMap, conversationId, parentMsgId, setInputDisabled, inputDisabled } = useContext(AppContext);
    const [inputValue, setInputValue] = useState();
    const refInput = useRef();

    const onInputKeyDown = (e) => {
        const theEvent = e || window.event;
        const code = theEvent.keyCode || theEvent.which || theEvent.charCode;
        if (code == 13) {
            setInputDisabled(true);
            let msgId = uuid();
            const msg = { answer: inputValue, enquire: { content: '正在输入中...', type: 'text' }, msgId };
            updateIdpGPTMap(msg);
            setInputValue('');
            setTimeout(() => {
                getEnquireApi(msgId, inputValue, msg);
            }, 1000);
        }
    }

    const onChageInputValue = (e) => {
        setInputValue(e.target.value);
    }

    const getEnquireApi = async (msgId, text, msg) => {
        const result = await Api.getEnquire({ conversationId, msgId, parentMsgId, text });
        if (result.code >= 20000000 && result.code <= 30000000) {
            setInputDisabled(false);
            updateIdpGPTMap(Object.assign(msg, { enquire: result.data }));
        }
        setTimeout(() => {
            refInput.current.focus();
        });
    }

    const loadInput = useMemo(() => {
        return (
            <Input
                ref={refInput}
                disabled={inputDisabled}
                value={inputValue}
                onChange={onChageInputValue}
                onKeyDown={onInputKeyDown}
                style={{ height: '40px' }}
                suffix={inputDisabled ? <LoadingOutlined spin={true}/> : <MessageOutlined />}
                placeholder={'如果需要画图，请以 "画xxx" 开始'}
                autoFocus={'autofocus'}
            />
        )
    }, [inputDisabled, inputValue, refInput]);

    return (
        <div className='idpInput-root'>
            {loadInput}
        </div>
    )
}

export default IdpInput