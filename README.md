# 链+医疗服务平台

## 简介

本作品**TODO**

### 现有的问题

#### 数据流转

**TODO**

#### 物品溯源

* 所有人都可以dump整个区块链，获取所有物品的供应链中的各个环节，而实际上这些信息只应被供应链的参与者与最终的消费者获取；
* 合约以地址->资产或资产->地址的方式存储物品所有权，同理，所有人都可以获取各个用户所拥有的物品或各个物品的所有者。

### 本作品的贡献

**TODO**

## 功能

* 实现了 病历/医疗/体检 数据/记录 的授权，在方便共享、流转的同时又保证了保密性与一定程度上的匿名性
* 实现了 病历/医疗/体检 数据/记录 的认证，在支持患者跨医院/机构/药房 就医/取药 的同时也能确保其数据的真实性
* 实现了药品的溯源，在确保药品来源可信的同时确保只有物理接触药品才能查询供应链，同时打破合约显式存储所有权的传统，进一步保证了供应链参与者与患者的隐私
* **TODO**

## 技术栈

* 前端
    * React
    * Ant Design
    * Tailwind CSS
    * Vite
    * WebAssembly
* 后端
    * Node.js
    * TypeScript
    * Fastify
    * 经过裁剪的最小化Contract SDK
* 区块链网络
    * 平台
        * FISCO BCOS
    * 预编译合约
        * C++
        * Rust FFI
        * [mcl](https://github.com/herumi/mcl)
        * [winterfell](https://github.com/novifinancial/winterfell)
    * 合约
        * [Liquid](https://github.com/WeBankBlockchain/liquid) (Rust)
    * 存储
        * IPFS

## 系统架构

**TODO**

## 流程

### 初始化

各个角色申请加入联盟链。此时，各个角色均持有公私钥对，而CA（假设是某个具有公信力的组织）持有身份到公钥的mapping。

### 病历流转

病历在上链后只能Create/Read，不能Update/Delete。

#### 患者Alice授权医生Bob Create

1. Alice生成*新的*PRE公私钥对，将公钥发送给Bob
2. Bob以自己的私钥（并非PRE私钥）对病历进行签名
3. Bob生成对称密钥，并使用对称密钥加密病历与签名
4. Bob将加密后的病历上传至IPFS，获得CID
5. Bob使用Alice的PRE公钥加密对称密钥
6. Bob向Alice发送CID与加密后的对称密钥
7. Alice保存CID与对应的PRE私钥
8. Alice以CID生成链上id，并以链上id、加密后的对称密钥调用合约
9. 合约判断链上id是否存在
    * 若存在，则throw
    * 否则保存链上id与加密后的对称密钥

#### 患者Alice Read

1. Alice根据保存的CID，生成链上id
2. Alice以链上id调用合约，获取对应的加密后的对称密钥
3. Alice以CID从IPFS获得加密后的病历
4. Alice以PRE私钥解密对称密钥，以对称密钥解密病历
5. 必要时，Alice可以从CA获取Bob对应的公钥，验证真实性

#### 患者Alice授权医生Carol、药房Charlie或科研机构Carlos Read

下述过程中，合约无法追踪患者授权了什么数据给谁，进而保护了患者的隐私（匿名性）。

1. Carol/Charlie/Carlos生成PRE公私钥对，将公钥发送给Alice
2. Alice使用待授权的CID对应的PRE私钥与Carol/Charlie/Carlos的PRE公钥生成重加密密钥
3. Alice根据CID，生成链上id，并以链上id、重加密密钥调用合约
4. 合约使用重加密密钥重加密链上id对应的加密后的对称密钥，返回重加密后的对称密钥
5. Alice将CID与重加密后的对称密钥发送给Carol/Charlie/Carlos
6. Carol/Charlie/Carlos以CID从IPFS获得加密后的病历
7. Carol/Charlie/Carlos以PRE私钥解密对称密钥，以对称密钥解密病历
8. 必要时，Carol/Charlie/Carlos可以从CA获取Bob对应的公钥，验证真实性

### 药品溯源

药品的供应链：生产（生产厂商） -> 运输（货运公司） -> 销售（药房） -> （患者）

#### 数据结构

在存储时，每个药品都是一个键值对，其中键为药品的id，值为trace。
* `id = Hash(key)`，其中key是溯源码，打印在药品包装上。只有能够物理接触药品的参与者才能获取key；
* trace是一个只能push的数组，其中包括以key加密后的各个环节的信息。

值得注意的是，合约并不直接存储药品与其当前所有者的所有权关系，而是通过key证明（物理）所有权、通过trace记录之前的所有者（即供应链的参与者）。

#### 某个环节的参与者David增加trace

1. David填写相关信息data，如：
    * 生产厂商应该填写药品名、生产日期、生产厂商名等；
    * 货运公司应该填写始发地、目的地、运输时间、货运公司名等；
    * etc.
2. David以自己的私钥为数据签名，以供后续环节验证：`sig = Sign(sk, Hash(data))`
3. David加密：`c = Enc(key, { data, sig })`
4. David生成证明，以在不泄露key的前提下证明自己拥有key：`proof = Prove(id = Hash(key))` 
    * 如果必要，可以加入当前区块高度/hash作为nonce，以防止重放
5. David以id、c、proof调用合约
6. 合约验证proof：`isValid = Verify(proof, id)`
    * 若isValid为true，则`drugs[id].push(c)`
    * 否则throw

#### 后续环节的参与者Erin（包括患者Alice）或政府部门Grace 查询/抽检 供应链

1. Erin/Grace以溯源码key计算`id = Hash(key)`，并以此调用合约，获取`drugs[id]`
2. Erin/Grace解密：`drugs[id].map(c => { data, sig } = Dec(key, c))`
3. 必要时，Erin/Grace可以从CA获取David对应的公钥，验证真实性

## 核心算法

### 代理重加密

代理重加密（*Proxy Re-Encryption*，PRE）是一种密文重加密方案。以典型的*Alice-Bob*模型为例，*Alice*使用自己的公钥加密了一些文件（准确说法应为使用公钥加密对称密钥，再使用对称密钥加密文件，但此处不做区分地使用，以便于叙述），并存储在云服务器*Proxy*上。当*Bob*想要获取*Alice*的这些文件时，他向*Alice*提出申请，*Alice*无需从*Proxy*下载文件并发送给*Bob*，而是通过*Proxy*将文件重加密为*Bob*的私钥能够解密的数据。

它将*Alice*的数据存储、计算、传输的开销转移到了*Proxy*，在云服务普及的当下具有广泛的应用场景。

#### AFGH方案

早期的代理重加密方案存在诸多问题，如依赖可信第三方、重加密密钥的生成依赖通信双方的私钥等。2006年，Ateniese等人提出了可行且较为完备的方案（下称AFGH方案），该方案以双线性映射作为理论基础，解决了上述的问题。本作品实现了原文中3.2节介绍的方案，其整体流程如下图所示。

![image.png](https://i.loli.net/2021/09/18/9BTXhewmPtUrZFD.png)

其中：
* 密钥生成(KeyGen)：
    * 选取乘法群$G_1=<g>,G_2=<h>$，计算$Z=e(g,h)$；
    * Alice：随机选择$SK_a=a∈Z_q^*$，$PK_a=g^{SK_a}=g^a$；
    * Bob：随机选择$SK_b=b∈Z_q^*$，$PK_b=h^{SK_b}=h^b$。
* 加密(Encrypt)：
    * 将明文映射为$M∈G_T$；
    * 随机选择$r∈Z_q^*$，计算密文$C_a=(Z^r M,{PK_a}^r)=(Z^r M,g^{ar})$。
* 解密(Decrypt)：
    * 由$C_a$中的$g^{ar}$计算${e(g^{ar},h)}^{1/SK_a}={e(g^{ar},h)}^{1/a}={e(g,h)}^{ar/a}=Z^r$；
    * 由$C_a$中的$Z^r M$解密${Z^r M}/Z^r =M$。
* 重加密密钥生成(ReKeyGen)：
    * 计算$RK_{a→b}={PK_b}^{1/SK_a}=h^{b/a}$。
* 重加密(ReEncrypt)：
    * 由$C_a$中的$g^ar$计算$e(g^{ar},RK_{a→b})=e(g^{ar},h^{b/a})={e(g,h)}^{arb/a}=Z^{rb}$；
    * 由$C_a$中的$Z^r M$生成重加密密文$C_b=(Z^r M,Z^{rb})$。
* 重解密(ReDecrypt)：
    * 由$C_b$中的$Z^{rb}$计算$(Z^{rb})^{1/SK_b}=Z^{rb/b}=Z^r$；
    * 由$C_b$中的$Z^r M$解密$(Z^r M)/Z^r =M$。

该方案具有如下的优点：
* *Alice*计算重加密密钥$RK_{a→b}$无需*Bob*的私钥；
* *Proxy*无法获取任何关于私钥、明文的信息，因此无需可信第三方；
* 重加密具有单向性，即*Proxy*无法通过$RK_{a→b}$计算出$RK_{b→a}$；
* 防止*Proxy*与*Alice*或*Bob*中的任意一人共谋，解密出对方私钥（$RK_{a→b}=h^{b/a}$，已知$a$求解$b$与已知$b$求解$a$均为离散对数问题）；
* 具备语义安全性。

### 零知识证明

零知识证明是现代密码学中的重要概念，最早由Goldwasse，Micali和Rackoff于1985年提出，它具有如下性质：
* **完备性**：如果证明者的宣称为真，则他最终将说服诚实的验证者；
* **可靠性**：只有证明者的宣称为真时，诚实的验证者才会被说服；
* **零知识性**：验证者无法从上述过程中获取除了“证明者的宣称为真”这一事实之外的任何信息。
正是因为其独特性质，零知识证明被广泛地应用于需要隐私保护的场景中。

#### zk-STARK

zk-STARK全称为*Zero-Knowledge Scalable Transparent Arguments of Knowledge*，即*可扩展的透明的零知识证明*。其中，**可扩展**是指随输入语句的扩展，证明的时间线性增加，而验证的时间对数增加；**透明**是指无需可信初始化。该方案分为**算术化**（Arithmetization）与**低度测试**（Low Degree Testing）两个步骤，其交互式版本如下图所示，使用*Fiat-Shamir变换*即可将其转换为非交互式版本。

![image.png](https://i.loli.net/2021/09/18/fdklzKAFGrUZbIq.png)

其中：
* Arithmetization：
    * *Prover*、*Verifier*：输入计算语句，并生成多项式约束；
    * *Prover*：执行计算语句，记录执行轨迹，并生成轨迹多项式；
    * *Prover*：将轨迹多项式发送给*Verifier*；
    * *Verifier*：生成随机数$α$并将其发送给*Prover*；
    * *Prover*、*Verifier*：由$α$、多项式约束与轨迹多项式生成组合多项式，双方比较组合多项式是否一致。
* Low Degree Testing：
    * *Verifier*：生成随机数$β_i$并将其发送给*Prover*；
    * *Prover*：使用*FRI*（*Fast Reed-Solomon Interactive Oracle Proofs of Proximity*）算法证明组合多项式与轨迹多项式的次数为某个固定值，并将证明$π_i$发送给*Verifier*；
    * *Verifier*：验证$π_i$，并重复Low Degree Testing过程。

除了**无需可信初始化**外，zk-STARK不使用椭圆曲线与配对密码学，而是使用哈希函数与信息论作为安全性保证，实现了**后量子安全**。

同时，为了证明用户确实拥有某些知识，本作品使用了Rescue Hash。Rescue Hash是专门为zk-STARK优化的抗碰撞密码学哈希函数，在保证安全性的同时极大程度上提高了在数字电路上的性能。

## 部署

### 包含预编译合约的区块链网络

注意，从源码编译应使用系统包管理器安装必要的依赖。具体的依赖项可以通过*Trial and error*方法得知。

```bash
git clone https://github.com/winderica/FISCO-BCOS
cd FISCO-BCOS
mkdir build
cd build
cmake ..
make
cd ..
./tools/build_chain.sh -l 127.0.0.1:2 -e build/bin/fisco-bcos
./nodes/127.0.0.1/start_all.sh
```

我们还配置了GitHub Actions，下载最新的artifact请访问[这里](https://github.com/winderica/FISCO-BCOS/actions)

**TODO**

### 合约

**TODO**

### 后端

```bash
cd backend
npm install
npm run build
npm run start:prod
```

### 前端

#### 编译WebAssembly

虽然项目中已经存在预编译的WebAssembly文件，但为确保万无一失，可以自行编译。

```bash
cd rust
cargo build --release
cp ./target/wasm32-unknown-unknown/release/rescue.wasm ../frontend/src/utils/rescue/
```

#### 打包构建用户界面

```bash
cd frontend
npm install
npm run build
npm run start:prod
```

注意：
* 本项目大量使用了WebCrypto等Web API，这些API只允许在HTTPS或localhost下使用；
* 本项目大量使用了WebAssembly、ES Module、Top-level Await等较新的特性，旧版本的浏览器可能不支持这些特性；
* 本项目的UI只适配移动端。

如有问题，请检查上述条件是否满足。

## FAQ

* 为什么有后端？  
    **TODO**
