import { Configuration } from './contract-sdk/config';
import { Web3jService } from './contract-sdk';

const config = new Configuration({
    account: {
        privateKey: `-----BEGIN PRIVATE KEY-----
MIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQgdEYQ++b92Q+eTN/D4/2v
PR1ri1CEjfTL06BzAaJ1WyqhRANCAAQW8jupmvxX2sZn+2/JRMA+gKDSDazkFPri
KFoYwnafD758K/zixqN/IU816YZf3AqGvFwQIanOElQIpI0uGM8U
-----END PRIVATE KEY-----`,
        address: '0x440bc044b9dac7b0f2aadc735d62b7c7f851d053',
    },
    nodes: [
        {
            ip: "18.219.192.167",
            port: 20200
        },
        {
            ip: "18.219.192.167",
            port: 20201
        }
    ],
    "timeout": 10000,
    "groupID": 1,
    "chainID": 1,
    "authentication": {
        "key": `-----BEGIN PRIVATE KEY-----
MIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQgfstqXOBs4BA3QAEavCO6
5te0cY7yYmqpnpYk8MMu6PuhRANCAASuFhgJ5OMz/3NXjwWk7v9m+X393dO7x0p3
RDXQpUIOwThc9593CxALKY1+6wIcilOfuTDD6B16reQoYMLBfdZ8
-----END PRIVATE KEY-----`,
        "cert": `-----BEGIN CERTIFICATE-----
MIIBgzCCASmgAwIBAgIUE40nyipGpcGGEzqPLXtl2Zma/uQwCgYIKoZIzj0EAwIw
NzEPMA0GA1UEAwwGYWdlbmN5MRMwEQYDVQQKDApmaXNjby1iY29zMQ8wDQYDVQQL
DAZhZ2VuY3kwIBcNMjEwOTExMTI0ODM1WhgPMjEyMTA4MTgxMjQ4MzVaMDExDDAK
BgNVBAMMA3NkazETMBEGA1UECgwKZmlzY28tYmNvczEMMAoGA1UECwwDc2RrMFYw
EAYHKoZIzj0CAQYFK4EEAAoDQgAErhYYCeTjM/9zV48FpO7/Zvl9/d3Tu8dKd0Q1
0KVCDsE4XPefdwsQCymNfusCHIpTn7kww+gdeq3kKGDCwX3WfKMaMBgwCQYDVR0T
BAIwADALBgNVHQ8EBAMCBeAwCgYIKoZIzj0EAwIDSAAwRQIhAIwpu9/6Anqv2wr1
q4Ot1YnRBrrVmjjAyOGIgSbrdNLpAiA6VRwwzPe7+Nb5dn3je8vJwThoAipfUvQI
rZG2oXMZAg==
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIIBezCCASGgAwIBAgIUeQ9PXxJuNX5G9kSFaX7NsHYnIXgwCgYIKoZIzj0EAwIw
NTEOMAwGA1UEAwwFY2hhaW4xEzARBgNVBAoMCmZpc2NvLWJjb3MxDjAMBgNVBAsM
BWNoYWluMB4XDTIxMDkxMTEyNDgzNVoXDTMxMDkwOTEyNDgzNVowNzEPMA0GA1UE
AwwGYWdlbmN5MRMwEQYDVQQKDApmaXNjby1iY29zMQ8wDQYDVQQLDAZhZ2VuY3kw
VjAQBgcqhkjOPQIBBgUrgQQACgNCAARZvMgqOYuRD95r23rZ7pXouxlkhcpFtdEc
LbB0+Q0rvmj8gJE7auhouBY19cVhYI1GrOAaKkEUI40Ptoq0ytY0oxAwDjAMBgNV
HRMEBTADAQH/MAoGCCqGSM49BAMCA0gAMEUCIEgt7ABaWDg7N1DUwNoK7bct8+H5
eVwMIlTK5vRNn2/qAiEAnHY7M1LjQA9fto2dsAqBf/OrNkLG7kE+JeJZtHi3sII=
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIIBvjCCAWSgAwIBAgIUaqIp9bTc7F0ju5DPyPxtDtOygOIwCgYIKoZIzj0EAwIw
NTEOMAwGA1UEAwwFY2hhaW4xEzARBgNVBAoMCmZpc2NvLWJjb3MxDjAMBgNVBAsM
BWNoYWluMCAXDTIxMDkxMTEyNDgzNVoYDzIxMjEwODE4MTI0ODM1WjA1MQ4wDAYD
VQQDDAVjaGFpbjETMBEGA1UECgwKZmlzY28tYmNvczEOMAwGA1UECwwFY2hhaW4w
VjAQBgcqhkjOPQIBBgUrgQQACgNCAATHpLyotpYtYXpVN3xh8q8U3tBGCGe6sxhe
5arJGDnM5YBuSanuIpYCwb0zUg2KtUzxbjLCFd56ORhoE3f61b7So1MwUTAdBgNV
HQ4EFgQUU9wE+i1LdpReLSI4qFj3fFC4hDcwHwYDVR0jBBgwFoAUU9wE+i1LdpRe
LSI4qFj3fFC4hDcwDwYDVR0TAQH/BAUwAwEB/zAKBggqhkjOPQQDAgNIADBFAiBZ
u7ESCxVBJhQKAaYHe+TU4OC32rqyo1W6Fl/IP/bhvwIhAJVGSRKO9aOYZeU4Qi5A
hqVrevrZykI9JUHk277cWf7h
-----END CERTIFICATE-----`,
        "ca": `-----BEGIN CERTIFICATE-----
MIIBvjCCAWSgAwIBAgIUaqIp9bTc7F0ju5DPyPxtDtOygOIwCgYIKoZIzj0EAwIw
NTEOMAwGA1UEAwwFY2hhaW4xEzARBgNVBAoMCmZpc2NvLWJjb3MxDjAMBgNVBAsM
BWNoYWluMCAXDTIxMDkxMTEyNDgzNVoYDzIxMjEwODE4MTI0ODM1WjA1MQ4wDAYD
VQQDDAVjaGFpbjETMBEGA1UECgwKZmlzY28tYmNvczEOMAwGA1UECwwFY2hhaW4w
VjAQBgcqhkjOPQIBBgUrgQQACgNCAATHpLyotpYtYXpVN3xh8q8U3tBGCGe6sxhe
5arJGDnM5YBuSanuIpYCwb0zUg2KtUzxbjLCFd56ORhoE3f61b7So1MwUTAdBgNV
HQ4EFgQUU9wE+i1LdpReLSI4qFj3fFC4hDcwHwYDVR0jBBgwFoAUU9wE+i1LdpRe
LSI4qFj3fFC4hDcwDwYDVR0TAQH/BAUwAwEB/zAKBggqhkjOPQQDAgNIADBFAiBZ
u7ESCxVBJhQKAaYHe+TU4OC32rqyo1W6Fl/IP/bhvwIhAJVGSRKO9aOYZeU4Qi5A
hqVrevrZykI9JUHk277cWf7h
-----END CERTIFICATE-----`
    },
});

const web3j = new Web3jService(config);

web3j.getBlockHeight().then(console.log, console.error);
web3j.getPbftView().then(console.log, console.error);

web3j.sendRawTransaction(
    '0x0000000000000000000000000000000000005007',
    'function generatorGen(string g, string h) public pure returns (string, string)',
    ['foo', 'bar']
).then(console.log, console.error);

web3j.call(
    '0x0000000000000000000000000000000000005007',
    'function generatorGen(string g, string h) public pure returns (string, string)',
    ['foo', 'bar']
).then(console.log, console.error);
