import axios from 'axios';
import { API } from '#/constants';

const client = axios.create({
    baseURL: API,
})

export const getRecord = (id) => client.get(`/records/${id}`);
export const setRecord = (id, ca) => client.post(`/records/${id}`, ca);
export const reEncrypt = (id, rk) => client.get(`/records/${id}/rk/${rk}`);
