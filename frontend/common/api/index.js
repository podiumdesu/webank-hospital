import axios from 'axios';
import { API } from '#/constants';

const client = axios.create({
    baseURL: API,
})

export const getRecord = (id) => client.get(`/records/${id}`);
export const setRecord = (id, ca) => client.post(`/records/${id}`, ca);
export const reEncrypt = (id, rk) => client.get(`/records/${id}/rk/${rk}`);

export const getTrace = (id) => client.get(`/traces/${id}`);
export const setTrace = (id, c, proof) => client.post(`/traces/${id}`, { c, proof });

export const getBlockHash = () => client.get(`/status/hash`);