# 医链

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
* 实现了良好的用户体验，所有链下的数据传递交互简单，均使用二维码作为数据载体，便捷且高效，用户全程私钥无感
* 集成了IPFS，防止在节点之间同步大量的数据，减少了存储与传输负担，保证了整个区块链网络的性能

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
        * FISCO-BCOS
    * 预编译合约
        * C++
        * Rust FFI
        * [mcl](https://github.com/herumi/mcl)
        * [winterfell](https://github.com/novifinancial/winterfell)
    * 合约
        * Solidity
        * [Liquid](https://github.com/WeBankBlockchain/liquid) (Rust)
    * 存储
        * IPFS

## 系统架构

**TODO**

## 流程

### 初始化

各个角色申请加入联盟链。此时，各个角色均持有公私钥对`(PKx_ec, SKx_ec)`，由CA（假设是某个具有公信力的组织）负责对各个角色身份、签名、有效期等的认证。

### 病历授权

病历在上链后只能Create/Read，不能Update/Delete。

#### Alice（患者）授权Bob（医生）Create

1. Alice：生成*新的*PRE公私钥对`(PKa_pre, SKa_pre) = PRE.KeyGen()`
2. Alice -> Bob：`PKa_pre`
3. Bob：
   1. 填写病历`m`
   2. 以自己的私钥`SKb_ec`为病历签名：`sig = EC.Sign(SKb_ec, Hash(m))`
   3. 生成对称密钥`DK`，加密病历：`c = Sym.Enc(DK, { m, sig })`
   4. 以Alice的PRE公钥`PKa_pre`加密对称密钥：`DK' = PRE.Enc(PKa_pre, DK)`
4. Bob -> IPFS：`c`
5. IPFS：
   1. `CID = Hash(c)`
   2. `storage[CID] = c`
6. IPFS -> Bob：`CID`
7. Bob -> Alice：`CID`、`DK'`
8. Alice：
   1. 将`CID`与`SKa_pre`成对保存
   2. 以`CID`生成`AID`：`AID = Hmac(CID, Hash(password + salt))`
9. Alice -> 合约：`AID`、`DK'`
10. 合约：判断`AID`是否存在
     * 若存在，则throw
     * 否则获取当前时间戳`timestamp = now()`并保存：`cas[AID] = (DK', timestamp)`

#### Alice（患者）Read

1. Alice -> 合约：`AID = Hmac(CID, Hash(password + salt))`
2. 合约 -> Alice：`(DK', timestamp) = cas[AID]`
3. Alice -> IPFS：`CID`
4. IPFS -> Alice：`c = storage[CID]`
5. Alice：
   1. 以PRE私钥解密对称密钥：`DK = PRE.Dec(SKa_pre, DK')`
   2. 以对称密钥解密病历：`{ m, sig } = Sym.Dec(c, DK)`
   3. 必要时可以从CA获取Bob对应的公钥`PKb_ec`，验证真实性：`isValid = EC.Verify(PKb_ec, Hash(m), sig)`

#### Alice（患者）授权Carol（医生、药房或科研机构）Read

下述过程中，合约无法追踪Alice授权*什么数据*给了*谁*（CDH problem），进而保护了患者的隐私（匿名性）。

`*`表示在离线场景下可以从CA处获取的数据。

1. Carol：生成PRE公私钥对`(PKc_pre, SKc_pre) = PRE.KeyGen()`
2. Carol -> Alice：`PKc_pre`(\*)、`PKc_ec`(\*)
3. Alice：
   1. 使用`CID`对应的PRE私钥`SKa_pre`与Carol的PRE公钥`PKc_pre`生成重加密密钥`RK = PRE.ReKeyGen(SKa_pre, PKc_pre)`
   2. 生成`AID`：`AID = Hmac(CID, Hash(password + salt))`
   3. 生成`BID`：`BID = EC.DH(SKa_ec, PKc_ec) xor CID`
4. Alice -> 合约：`AID`、`BID`、`RK`
5. 合约：
   1. 以`AID`获取`(DK', timestamp) = cas[AID]`
   2. 使用重加密密钥`RK`重加密`DK'`：`DK'' = PRE.ReEnc(RK, DK')`
   3. 保存重加密后的对称密钥`DK''`：`cbs[BID] = (DK'', timestamp)`
6. Alice -> Carol：`CID`、`PKa_ec`(\*)
7. Carol：计算`BID = EC.DH(SKc_ec, PKa_ec) xor CID`
8. Carol -> 合约：`BID`
9. 合约 -> Carol：`(DK'', timestamp) = cbs[BID]`
10. Carol -> IPFS：`CID`
11. IPFS -> Carol：`c = storage[CID]`
12. Carol：
    1. 以PRE私钥解密对称密钥：`DK = PRE.ReDec(SKc_pre, DK'')`
    2. 以对称密钥解密病历：`{ m, sig } = Sym.Dec(c, DK)`
    3. 必要时可以从CA获取Bob对应的公钥`PKb_ec`，验证真实性：`isValid = EC.Verify(PKb_ec, Hash(m), sig)`

### 药品溯源

简化的药品供应链：生产（生产厂商） -> 运输（货运公司） -> 销售（药房） -> （患者）

#### 数据结构

在存储时，每个药品都是一个键值对，其中键为药品的id，值为trace。
* `id = HashZK(key)`，其中key是溯源码，打印在药品包装上。只有能够物理接触药品的参与者才能获取key；
* trace是一个只能push的数组，其中包括以key加密后的各个环节的信息。

值得注意的是，合约并不直接存储药品与其当前所有者的所有权关系，而是通过key证明（物理）所有权、通过trace记录之前的所有者（即供应链的参与者）。

#### David（某个环节的参与者）增加trace

1. David：
   1. 填写相关信息data，如：
       * 生产厂商应该填写药品名、生产日期、生产厂商名等；
       * 货运公司应该填写始发地、目的地、运输时间、货运公司名等；
       * etc.
   2. 以自己的私钥为数据签名，以供后续环节验证：`sig = EC.Sign(SKd_ec, Hash(data))`
   3. 加密：`c = Sym.Enc(key, { data, sig })`
   4. 生成证明，以在不泄露key的前提下证明自己拥有key：`proof = ZK.Prove(id = HashZK(key))` 
       * 如果必要，可以加入当前区块高度/hash作为nonce，以防止重放
2. David -> 合约：`id`、`c`、`proof`
3. 合约：验证proof`isValid = ZK.Verify(proof, id)`
    * 若验证通过，则获取当前时间戳`timestamp = now()`并保存：`drugs[id].push((c, timestamp))`
    * 否则throw

#### Erin（后续环节的参与者、患者或政府部门）查询/抽检 供应链

1. Erin：以溯源码key计算`id = HashZK(key)`
2. Erin -> 合约：`id`
3. 合约 -> Erin：`trace = drugs[id]`
4. Erin
   1. 对于`trace`中的每个`(c, timestamp)`，解密`{ data, sig } = Sym.Dec(key, c)`
   2. 必要时可以从CA获取David对应的公钥`PKd_ec`，验证真实性：`isValid = EC.Verify(PKd_ec, Hash(m), sig)`

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

### 编译合约

```bash
cd contracts
make
```

### 部署合约与后端

```bash
cd backend
yarn install
yarn deploy
yarn ca
yarn build
yarn start:prod
```

### 前端

#### 编译WebAssembly

虽然项目中已经存在预编译的WebAssembly文件，但为确保万无一失，可以自行编译。

```bash
cd rust
cargo build --release
cp ./target/wasm32-unknown-unknown/release/rescue.wasm ../frontend/common/src/utils/rescue/
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
    * 本项目与私钥有关的所有操作均在前端完成，后端作为简单的RPC over HTTP Gateway，完全透明，不接触用户私钥，只起到消息转发的作用
    * 前端支持直接访问节点的JSONRPC服务，但由于浏览器对CORS的检查愈发严格，因此后端是必要的
    * 用户可以自行部署后端、使用其它的RPC over HTTP服务或在*不跨域*的前提下直接通过前端访问节点的JSONRPC端口
