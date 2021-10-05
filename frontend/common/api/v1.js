import axios from 'axios';
import { API } from '#/constants';

const client = axios.create({
    baseURL: API,
})

export const getRecord = async (id) => (await client.get(`/records/${id}`)).data;
export const setRecord = async (id, ca) => (await client.post(`/records/${id}`, ca)).data;
export const reEncrypt = async (id, rk) => (await client.get(`/records/${id}/rk/${rk}`)).data;

export const getTrace = async (id) =>(await  client.get(`/traces/${id}`)).data;
export const setTrace = async (id, c, proof) => (await client.post(`/traces/${id}`, { c, proof })).data;

export const getBlockHash = async () => (await client.get(`/status/hash`)).data;
