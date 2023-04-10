import request from "../utils/request";
import { visualApiPath, projectId, teamId, userId, region } from '../utils/cookies';

import mockJson from '../mock';

/**
 * 回答接口
 * @param {*} answer 
 * @returns 
 */
async function getEnquire({ conversationId, msgId, parentMsgId, text }) {
    return await request.post(`/api/conversation/msg`, { conversationId, msgId, parentMsgId, text });
}

/**
 * 点赞/取消赞
 * @param {*} conversationId 
 * @param {*} msgId 
 * @param {*} feedback 
 * @returns 
 */
async function feedback(conversationId, msgId, feedback) {
    return request.post(`/api/conversation/feedback`, {
        conversationId,
        msgId,
        feedback
    })
}

/**
 * 
 * @param {*} conversationId 
 * @returns 
 */
async function exit(conversationId) {
    return await request.post(`/api/conversation/exit`, { conversationId });
}

const Api = {
    getEnquire,
    feedback,
    exit
}

export default Api;