import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import IdpInput from '@components/input';
import IdpAnswer from '@components/answer';
import IdpEnquire from '@components/enquire';
import { AppContext } from '@store';
import uuid from 'react-uuid';
import Api from '../../api';

import './index.less';

let idpGPTMapGlobal = [];

function Home() {

    const refContent = useRef();

    const [conversationId, setConversationId] = useState(uuid());
    const [parentMsgId, setParentMsgId] = useState('');
    const [refreshPage, setRefreshPage] = useState();
    const [inputDisabled, setInputDisabled] = useState(false);

    const [msgIdUpvoteList, setMsgIdUpvoteList] = useState([]);
    const [msgIddownvoteList, setMsgIddownvoteList] = useState([]);

    const updateIdpGPTMap = (data) => {
        let gpt = idpGPTMapGlobal.filter(it => it.msgId == data.msgId);
        if (gpt.length > 0) {
            gpt[0]['enquire'] = data.enquire;
        } else {
            idpGPTMapGlobal.push(data);
        }
        setRefreshPage(uuid());
    }

    const upvote = (item) => {
        const upvoteIndex = msgIdUpvoteList.map(it => it).indexOf(item.msgId);
        const downvoteIndex = msgIddownvoteList.map(it => it).indexOf(item.msgId);
        if (downvoteIndex > -1) {
            const xarr = msgIddownvoteList.splice(0, downvoteIndex);
            const downvoteDom = document.getElementById(`downvote_${item.msgId}`);
            downvoteDom.src = require(`../../assets/svg/upvote_black.svg`).default;
            setMsgIddownvoteList([...xarr]);
        }
        const upvoteDom = document.getElementById(`upvote_${item.msgId}`);
        if (upvoteIndex > -1) {
            upvoteDom.src = require(`../../assets/svg/upvote_black.svg`).default;
            const narr = msgIdUpvoteList.splice(0, upvoteIndex);
            setMsgIdUpvoteList([...narr]);
        } else {
            upvoteDom.src = require(`../../assets/svg/upvote_red.svg`).default;
            feedbackApi(item.msgId, 'upvote');
            setMsgIdUpvoteList([...msgIdUpvoteList, item.msgId]);
        }

    }

    const downvote = (item) => {
        const downvoteIndex = msgIddownvoteList.map(it => it).indexOf(item.msgId);
        const upvoteIndex = msgIdUpvoteList.map(it => it).indexOf(item.msgId);
        if (upvoteIndex > -1) {
            const xarr = msgIdUpvoteList.splice(0, upvoteIndex);
            const upvoteDom = document.getElementById(`upvote_${item.msgId}`);
            upvoteDom.src = require(`../../assets/svg/upvote_black.svg`).default;
            setMsgIdUpvoteList([...xarr]);
        }
        const downvoteDom = document.getElementById(`downvote_${item.msgId}`);
        if (downvoteIndex > -1) {
            downvoteDom.src = require(`../../assets/svg/upvote_black.svg`).default;
            const narr = msgIddownvoteList.splice(0, downvoteIndex);
            setMsgIddownvoteList([...narr]);
        } else {
            downvoteDom.src = require(`../../assets/svg/upvote_red.svg`).default;
            feedbackApi(item.msgId, 'downvote');
            setMsgIddownvoteList([...msgIddownvoteList, item.msgId]);
        }
    }

    const bottom = (e) => {
        const height = refContent.current.scrollHeight - 0;
        refContent.current.scrollTop = height;
    }

    const feedbackApi = async (msgId, feedback) => {
        await Api.feedback(conversationId, msgId, feedback);
    }

    useEffect(() => {
        return () => {
            exitApi();
            setConversationId('');
        }
    }, []);

    const exitApi = async () => {
        await Api.exit(conversationId);
    }

    const loadImage = useCallback((it, name, onClick, ids) => {
        return (
            <img id={`${ids}_${it.msgId}`} onClick={() => onClick(it)} src={require(`../../assets/svg/${name}`).default}></img>
        )
    }, [msgIdUpvoteList, msgIddownvoteList]);

    const loadIdpGPTMap = useMemo(() => {
        return (
            <>
                {
                    idpGPTMapGlobal.map((it, index) => {
                        return (
                            <React.Fragment key={it.msgId}>
                                <div className='idpChatGPT-answer'>
                                    <IdpAnswer data={it.answer} />
                                </div>
                                <div className='idpChatGPT-enquire'>
                                    <IdpEnquire content={it.enquire?.content || ''} type={it.enquire?.type || 'text'} />
                                    <div className='idpChatGPT-feedback'>
                                        <div className='idpChatGPT-upvote'>
                                            {loadImage(it, 'upvote_black.svg', upvote, 'upvote')}
                                        </div>
                                        <div className='idpChatGPT-downvote'>
                                            {loadImage(it, 'upvote_black.svg', downvote, 'downvote')}
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        )
                    })
                }
            </>
        )
    }, [refreshPage, msgIdUpvoteList, msgIddownvoteList]);

    useEffect(() => {
        bottom();
    }, [refreshPage]);

    return (
        <AppContext.Provider value={{
            conversationId,
            parentMsgId,
            inputDisabled,
            setParentMsgId,
            updateIdpGPTMap,
            setInputDisabled
        }}>
            <div className='idpChatGPT-root'>
                <div className='idpChatGPT-content' ref={refContent}>
                    {loadIdpGPTMap}
                </div>
                <div className='idpChatGPT-input'>
                    <IdpInput />
                </div>
            </div>
        </AppContext.Provider>

    )
}

export default Home;