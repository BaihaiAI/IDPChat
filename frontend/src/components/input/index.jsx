import React, { useContext, useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { Input } from 'antd';
import { SendOutlined, MessageOutlined, LoadingOutlined } from '@ant-design/icons';
import { AppContext } from '@store';
import Api from '../../api';
import uuid from 'react-uuid';

import './index.less';

function IdpInput() {

    const { updateIdpGPTMap, conversationId, parentMsgId, setInputDisabled, inputDisabled, setParentMsgId } = useContext(AppContext);
    const [inputValue, setInputValue] = useState();
    const [histories, setHistories] = useState([]);
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
              getAnswer(msgId, inputValue, msg);
            }, 1000);
        }
    }

    const onChageInputValue = (e) => {
        setInputValue(e.target.value);
    }

    const getEnquireApi = async (msgId, text, msg) => {
        const result = await Api.getEnquire({ conversationId, msgId, parentMsgId, text });
        setInputDisabled(false);
        setParentMsgId(msgId);
        if (result.code >= 20000000 && result.code <= 30000000) {
            updateIdpGPTMap(Object.assign(msg, { enquire: result.data }));
        } else {
            updateIdpGPTMap(Object.assign(msg, { enquire: '无法解析，请尝试重试提问', type: 'text' }));
        }
        setTimeout(() => {
            refInput.current.focus();
        });
    }

  const getAnswer = async (msgId, text, msg) => {
    let answer = ''
    let answerType = ''
    let resLen = 0;
    await Api.generateAnswer({
      conversationId, msgId, parentMsgId, text, histories,
      onEvent: (({ target }) => {
        try {
          const responseText = target.responseText.slice(resLen);
          const result = JSON.parse(responseText);
          if (result.code >= 20000000 && result.code <= 30000000) {
            answer = result.data.content;
            answerType = result.data.type;
            if (answerType === 'text' && answer) {
              result.data.content = answer.replaceAll('<br>', '\n');
            }
            updateIdpGPTMap(Object.assign(msg, { enquire: result.data }));
          } else {
            updateIdpGPTMap(Object.assign(msg, { enquire: '无法回答改问题，请尝试重新提问', type: 'text' }));
          }
          resLen = target.responseText.length;
        } catch (error) {
          
        }
      }),
    }).then((res) => {
      if (answerType === 'text') {
        histories.push({
          q: text,
          a: answer
        });
        setHistories(histories);
      }
    }).catch((err) => {
      console.log(err);
      updateIdpGPTMap(Object.assign(msg, { enquire: '无法回答该问题，请尝试重新提问', type: 'text' }));
    });
    setInputDisabled(false);
    setParentMsgId(msgId);
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
                suffix={inputDisabled ? <LoadingOutlined spin={true} /> : <MessageOutlined />}
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