import cookie from 'react-cookies';

export const token = cookie.load("token");

export const teamId = cookie.load('teamId');
export const userId = cookie.load('userId');
export const hpoptPort = cookie.load('hpoptPort');
export const getTeamId = () => cookie.load('teamId');

export const region = cookie.load('region');

export const projectId = new URLSearchParams(window.location.search).get('projectId') || '';

cookie.save("projectId", projectId, { path: '/' });

export const visualApiPath = `/${region}/api/v2/idp-note-rs`;
