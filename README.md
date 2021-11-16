# 医链

## 简介

医链，构建更美好的“链”上医疗平台，使数据由储于一个个医疗机构中的孤岛转变为以人为中心的全时空维度视图。我们创新性地提出了密钥可重新随机化的代理重加密方案，并基于此实现了私密性更强的健康记录共享机制；同时打破现有溯源合约显式存储所有权的传统，提出一套基于零知识证明与聚合签名的药企供应链产品信息追溯服务方案。安全性更高，隐私性更完备，一站式解决就诊、异地复诊、取药、授权、溯源等问题，助力医疗行业实现健康和就诊数据的可信共享，加速医药数字化生态落地，促进全民建成互联互通的人口健康信息平台，为医疗大数据价值挖掘做技术背书。

## 许可证

本项目以双重许可（dual-license）的形式开源。其中，软件本身的许可证为[AGPLv3](./LICENSE.AGPLv3)，而所有静态资源（图片、视频等）、文本文件的许可证为[CC BY-NC-ND 4.0]。

### 现有的问题

#### 数据流转

* 数据以明文存储，或是虽然经过加密，但合约拥有解密权限，恶意的节点能够获取链上所有的数据；
* 授权以合约为中心，分享、流转过程中合约能够知道谁给了谁什么数据，进而导致恶意的节点追踪用户行为，侵犯用户隐私。

#### 物品溯源

* 所有人都可以dump整个区块链，获取所有物品的供应链中的各个环节，而实际上这些信息只应被供应链的参与者与最终的消费者获取；
* 合约以地址->资产或资产->地址的方式存储物品所有权，同理，所有人都可以获取各个用户所拥有的物品或各个物品的所有者；
* 签名数量随着供应链节点数量增长，带来线性的存储开销与线性的验证开销，造成空间与时间的浪费。

### 本作品的贡献

* 创新性地提出了**密钥可重新随机化的代理重加密**，实现了 病历/医疗/体检 数据/记录 的授权
  * 方便健康记录共享、流转
  * 授权以用户为中心，用户是自己的健康数据的真正控制者，且能够进行记录级别的细粒度授权
  * 保证了保密性，只有用户授权的人员或机构才能解密数据，而合约无法解密
  * 保证了一定程度上的匿名性，合约无法知道用户给了谁什么数据
  * 减轻了用户的存储、计算、传输的开销
  * 可以从一个主密钥对中动态派生会话密钥，进一步减少了私钥存储的成本
* 使用**ZK-STARK**作为非交互式零知识证明协议，实现了医药产品的溯源
  * 在确保医药产品来源可信的同时确保只有物理接触医药产品才能查询供应链
  * 打破合约显式存储所有权的传统，进一步保证了供应链参与者与患者的利益与隐私
  * 采用Rescue Hash作为零知识证明下的哈希函数，提高了证明生成与验证时的效率
* 使用**BLS**作为多重签名、聚合签名方案，实现了签名的优化
  * 将供应链签名的存储与验证开销从线性降至常数
  * 一个节点的参与者所提交的数据由其本人与后续节点共同签名，进一步保证了供应链的真实性
  * 具有优秀的可扩展性，如在多重签名时可以同时加入政府部门的签名
* 使用ECDSA作为其余数据的签名方案，实现了 病历/医疗/体检 数据/记录 的认证
  * 支持患者跨医院/机构/药房 就医/取药
  * 确保患者数据的真实性，即它确实由相应的医生创建且未经过篡改
* 实现了良好的用户体验
  * 所有链下的数据传递交互简单
  * 使用二维码作为数据载体，便捷且高效
  * 用户全程私钥无感
* 集成了IPFS
  * 防止在节点之间同步大量的数据
  * 减轻了节点存储与传输的负担
  * 保证了整个区块链网络的性能

## 功能

* 患者：
  * 查看电子病历
  * 查看体检报告
  * 下载健康记录附件
  * 验证健康记录真实性
  * 通过二维码，授权医生创建健康记录
  * 通过二维码，授权医生查看健康记录
  * 通过溯源码，对药品供应链进行溯源
* 医生：
  * 填写电子病历并申请患者授权
  * 填写体检报告并申请患者授权
  * 申请患者授权并查看其健康记录
  * 验证患者健康记录真实性
* 医药产品供应链成员：
  * 查询供应链在自己之前的视图
  * 上传当前节点的记录与签名
  * 为前一个节点的记录提交签名
  * 验证供应链真实性
* CA：
  * 登记区块链成员身份
  * 撤销区块链成员身份

## 系统架构

![image.png](https://i.loli.net/2021/10/31/M87JmO15LINtRqG.png)

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

## 流程

### 初始化

各个角色申请加入联盟链。此时，各个角色均持有ECDSA公私钥对$(SK_{\texttt{ECDSA}, x}, PK_{\texttt{ECDSA}, x})$，与供应链有关的各个角色均持有BLS公私钥对$(SK_{\texttt{BLS}, x}, PK_{\texttt{BLS}, x})$，由CA（假设是某个具有公信力的组织）负责对各个角色身份、签名、有效期等的认证。

同时，授权流程中的各个角色生成PRE公私钥对$(SK_{\texttt{RPRE}, x}, PK_{\texttt{RPRE}, x})$。

### 病历授权

病历在上链后只能Create/Read，不能Update/Delete。

#### Alice（患者）授权Bob（医生）Create

1. Alice -> Bob：$PK_{\texttt{RPRE}, a}$
2. Bob：
    1. 填写病历$m$，并以自己的私钥$SK_{\texttt{ECDSA}, b}$为病历签名：$\sigma := \mathrm{Sign}_\texttt{ECDSA}(SK_{\texttt{ECDSA}, b}, \mathrm{Hash}(m))$
    3. 生成对称密钥$DK$，加密病历：$c := \mathrm{Enc}_\texttt{AES-GCM}(DK, m \| \sigma)$
3. Bob -> IPFS：$c$
4. IPFS：生成$CID := \mathrm{Hash}(c)$并保存$c$
5. IPFS -> Bob：$CID$
6. Bob：
    1. 重新随机化Alice的PRE公钥$PK_{\texttt{RPRE}, a}$：$PK_{\texttt{RPRE},a}' := \mathrm{PKDer}_\texttt{RPRE}(PK_{\texttt{RPRE}, a}, CID)$
    2. 以$PK_{\texttt{RPRE}, a}'$加密对称密钥：$DK' := \mathrm{Enc}_\texttt{RPRE}(PK_{\texttt{RPRE}, a}', DK)$
7. Bob -> Alice：$CID, DK'$
8. Alice：以$CID$生成$AID$：$AID := \mathrm{HMAC}(CID, password \| salt)$
9. Alice -> 合约：$AID, DK'$
10. 合约
    1. 若$AID$已存在，则throw
    2. 保存键值对$AID \to DK'$

![image.png](https://i.loli.net/2021/10/31/7KvJDPtbxwYBXnU.png)

#### Alice（患者）Read

1. Alice -> 合约：$AID := \mathrm{HMAC}(CID, password \| salt)$
2. 合约 -> Alice：$DK'$
3. Alice -> IPFS：$CID$
4. IPFS -> Alice：$c$
5. Alice：
    1. 重新随机化自己的PRE私钥$SK_{\texttt{RPRE}, a}$：$SK_{\texttt{RPRE},a}' := \mathrm{SKDer}_\texttt{RPRE}(SK_{\texttt{RPRE}, a}, CID)$
    2. 以$SK_{\texttt{RPRE},a}'$解密对称密钥：$DK := \mathrm{Dec}_\texttt{RPRE}(SK_{\texttt{RPRE}, a}', DK')$
    3. 以对称密钥解密病历：$(m, \sigma) := \mathrm{Dec}_\texttt{AES-GCM}(DK, c)$
    4. 从CA获取Bob对应的公钥$PK_{\texttt{ECDSA}, b}$，验证真实性：$\mathrm{Verify}_\texttt{ECDSA}(PK_{\texttt{ECDSA}, b}, \mathrm{Hash}(m), \sigma)$

![image.png](https://i.loli.net/2021/10/31/oTyZBjAx6uHpL7e.png)

#### Alice（患者）授权Carol（医生、药房或科研机构）Read

下述过程中，合约无法追踪Alice授权*什么数据*给了*谁*，进而保护了患者的隐私（匿名性）。

`*`表示在离线场景下可以从CA处获取的数据。

1. Carol -> Alice：$PK_{\texttt{RPRE}, c}(*)$
2. Alice：
    1. 重新随机化自己的PRE私钥$SK_{\texttt{RPRE}, a}$：$SK_{\texttt{RPRE},a}' := \mathrm{SKDer}_\texttt{RPRE}(SK_{\texttt{RPRE}, a}, CID)$
    2. 重新随机化自己的PRE公钥$PK_{\texttt{RPRE}, a}$：$PK_{\texttt{RPRE},a}' := \mathrm{PKDer}_\texttt{RPRE}(PK_{\texttt{RPRE}, a}, CID)$
    3. 使用$SK_{\texttt{RPRE},a}'$与Carol的PRE公钥$PK_{\texttt{RPRE}, c}$生成重加密密钥$RK_{a \to b} := \mathrm{RKGen}_\texttt{RPRE}(SK_{\texttt{RPRE}, a}', PK_{\texttt{RPRE}, c})$
    4. 生成$AID$：$AID := \mathrm{HMAC}(CID, password \| salt)$
    5. 生成$BID$：$BID := \mathrm{Pairing}(g, PK_{\texttt{RPRE}, c})^{SK_{\texttt{RPRE},a}'}$
3. Alice -> 合约：$AID, BID, RK_{a \to b}$
4. 合约：
    1. 以$AID$获取$DK'$，并使用重加密密钥$RK_{a \to b}$重加密：$DK'' := \mathrm{ReEnc}_\texttt{RPRE}(RK_{a \to b}, DK')$
    3. 保存键值对$BID \to DK''$
5. Alice -> Carol：$CID, PK_{\texttt{RPRE}, a}'(*)$
6. Carol：计算$BID := \mathrm{Pairing}(PK_{\texttt{RPRE}, a}', h)^{SK_{\texttt{RPRE},c}}$
7. Carol -> 合约：$BID$
8. 合约 -> Carol：$DK''$
9. Carol -> IPFS：$CID$
10. IPFS -> Carol：$c$
11. Carol：
    1. 以PRE私钥解密对称密钥：$DK := \mathrm{ReDec}_\texttt{RPRE}(SK_{\texttt{RPRE}, c}, DK'')$
    2. 以对称密钥解密病历：$(m, \sigma) := \mathrm{Dec}_\texttt{AES-GCM}(DK, c)$
    3. 从CA获取Bob对应的公钥$PK_{\texttt{ECDSA}, b}$，验证真实性：$\mathrm{Verify}_\texttt{ECDSA}(PK_{\texttt{ECDSA}, b}, \mathrm{Hash}(m), \sigma)$

![image.png](https://i.loli.net/2021/10/31/GrfDkJzomWRy25s.png)

### 医药产品溯源

简化的医药产品供应链：生产（生产厂商） -> 运输（货运公司） -> 销售（营销公司） -> （药房 -> 患者）/（医院）/（科研机构）

#### 数据结构

在存储时，每个医药产品都是一个键值对，其中键为医药产品的$ID$，值包括了`trace`与`signature`。
* $ID := \mathrm{Hash}_\texttt{Rescue}(DK)$，其中$DK$是溯源码，打印在医药产品包装上。只有能够物理接触医药产品的参与者才能获取$DK$；
* `trace`是一个只能push的数组，其中包括以$DK$加密后的各个环节的信息；
* `signature`包括了供应链的聚合签名$\sigma_{agg}$与未被多重签名的临时签名$\sigma_{tmp}$，存储、验证开销为常数。

值得注意的是，合约并不直接存储医药产品与其当前所有者的所有权关系，而是通过$DK$证明（物理）所有权、通过trace记录之前的所有者（即供应链的参与者）。

#### David（首个环节的参与者）创建trace

1. David：
    1. 填写相关信息$m_1$，并加密：$c_1 := \mathrm{Enc}_\texttt{AES-GCM}(DK, m_1)$
        * 生产厂商应该填写医药产品名、生产日期、生产厂商名等；
        * 货运公司应该填写始发地、目的地、运输时间、货运公司名等；
        * etc.
    2. 以自己的私钥为当前数据签名，以供后续环节验证：$\sigma_{1,1} := \mathrm{Sign}_\texttt{BLS}(SK_{\texttt{BLS}, 1}, \mathrm{Hash}(c_1))$
    3. 以溯源码$DK$计算$ID := \mathrm{Hash}_\texttt{Rescue}(DK)$
    4. 生成证明，以在不泄露$DK$的前提下证明自己拥有$DK$：$\pi := \mathrm{Prove}_\texttt{STARK}(ID=\mathrm{Hash}_\texttt{Rescue}(DK))$
        * 如果必要，可以加入当前区块高度/hash作为nonce，以防止重放
2. David -> 合约：$ID, c_1, \sigma_{1,1}, \pi$
3. 合约：
    1. 验证$\mathrm{Prove}_\texttt{STARK}(ID, \pi)$，若不为$True$，则throw
    2. 保存键值对$ID \to (\{c_1\}, \sigma_{agg} := \epsilon, \sigma_{tmp} := \sigma_{1,1})$

![image.png](https://i.loli.net/2021/10/31/v2ZB9Xkq5gwbxSW.png)

#### Frank（第i个环节的参与者）验证Erin（第i-1个环节的参与者）的信息

1. Frank：以溯源码$DK$计算$ID := \mathrm{Hash}_\texttt{Rescue}(DK)$
2. Frank -> 合约：$ID$
3. 合约 -> Frank：$\{c_j|1\le j < i\}, \sigma_{tmp}$
4. Frank
    1. 填写相关信息$m_i$，并加密：$c_i := \mathrm{Enc}_\texttt{AES-GCM}(DK, m_i)$
        * 生产厂商应该填写医药产品名、生产日期、生产厂商名等；
        * 货运公司应该填写始发地、目的地、运输时间、货运公司名等；
        * etc.
    2. 以自己的私钥为当前数据签名，以供后续环节验证：$\sigma_{i, i} := \mathrm{Sign}_\texttt{BLS}(SK_{\texttt{BLS}, i}, \mathrm{Hash}(c_i))$
    3. 生成证明，以在不泄露$DK$的前提下证明自己拥有$DK$：$\pi := \mathrm{Prove}_\texttt{STARK}(ID=\mathrm{Hash}_\texttt{Rescue}(DK))$
        * 如果必要，可以加入当前区块高度/hash作为nonce，以防止重放
    4. 以自己的私钥为trace中的最后一项$c_{i-1}$签名：$\sigma_{i,i-1} := \mathrm{Sign}_\texttt{BLS}(SK_{\texttt{BLS}, i}, \mathrm{Hash}(c_{i-1}))$
    5. 从CA获取Erin对应的公钥$PK_{\texttt{BLS}, i - 1}$，生成聚合签名$\sigma_{agg}' := \mathrm{AggregateMultiSig}_\texttt{BLS}(\{PK_{\texttt{BLS}, i - 1}, PK_{\texttt{BLS}, i}\}, \{\sigma_{tmp}, \sigma_{i,i-1}\})$
5. Frank -> 合约：$ID, c_i, \sigma_{agg}', \sigma_{i,i}, \pi$
6. 合约：
    1. 验证$\mathrm{Prove}_\texttt{STARK}(ID, \pi)$，若不为$True$，则throw
    2. 获取此前所有相邻节点的聚合签名$\sigma_{agg}$，将其与$\sigma_{agg}'$再次聚合：$\sigma_{agg} := \mathrm{AggregateSig}_\texttt{BLS}(\{\sigma_{agg}, \sigma_{agg}'\})$
    3. 保存键值对$ID \to (\{c_j|1\le j < i\} \cup c_i, \sigma_{agg}, \sigma_{tmp} := \sigma_{i,i})$

![image.png](https://i.loli.net/2021/10/31/P5JMeZVENvzncIt.png)

#### Grace（患者或政府部门）查询/抽检 供应链

1. Grace：以溯源码$DK$计算$ID := \mathrm{Hash}_\texttt{Rescue}(DK)$
2. Grace -> 合约：$ID$
3. 合约 -> Grace：$\{c_i|1\le i \le n\}, \sigma_{agg}, \sigma_{tmp}$
4. Grace
   1. 对于$1 \le i \le n$，解密：$m_i := \mathrm{Dec}_\texttt{AES-GCM}(DK, c_i)$
   2. 以自己的私钥为trace中的最后一项$c_{n}$签名：$\sigma_{n+1,n} := \mathrm{Sign}_\texttt{BLS}(SK_{\texttt{BLS}, n+1}, \mathrm{Hash}(c_n))$
   3. 从CA获取trace的最后一个参与者对应的公钥$PK_{\texttt{BLS}, n}$，生成聚合签名$\sigma_{agg}' := \mathrm{AggregateMultiSig}_\texttt{BLS}(\{PK_{\texttt{BLS}, n}, PK_{\texttt{BLS}, n+1}\}, \{\sigma_{tmp}, \sigma_{n+1,n}\})$
   4. 将$\sigma_{agg}$与$\sigma_{agg}'$再次聚合：$\sigma_{agg} := \mathrm{AggregateSig}_\texttt{BLS}(\{\sigma_{agg}, \sigma_{agg}'\})$
   5. 从CA获取trace中每个参与者对应的公钥$\{PK_{\texttt{BLS}, i}|1 \le i \le n\}$，验证真实性：$\mathrm{Verify}_\texttt{BLS}(\{PK_{\texttt{BLS}, i}|1 \le i \le n\}, \{\mathrm{Hash}(c_i)|1\le i \le n\}, \sigma_{agg})$

![image.png](https://i.loli.net/2021/10/31/1q2panbYmcTGN5W.png)

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

#### 密钥可重新随机化的代理重加密

本作品提出了密钥可重新随机化的代理重加密（Proxy Re-Encryption with Rerandomizable Keys, RPRE）方案。据我们所知，该方案为我们首创。该方案受现有数字货币钱包的密钥生成方案启发，通过主密钥对动态生成会话密钥对，而无需存储会话密钥对，进一步减小了用户存储的开销。

同时，本方案可以进行类似于冷热钱包的拓展，将主公钥公开，而将主私钥存储于冷钱包（硬件，如患者的医保卡）中，只有在解密时才上线。由此可以进一步地保证密钥的安全性。

本方案在AFGH方案的基础上增加了公钥重新随机化与私钥重新随机化算法，描述如下：

* 公钥重新随机化(PKDer)：
    * 对于秘密值$id$与主公钥$MPK$，计算随机化后的$PK_{id} = MPK^{id}$
* 私钥重新随机化(SKDer)：
    * 对于秘密值$id$与主公钥$MSK$，计算随机化后的$SK_{id} = MSK \times id$

直觉上而言，在攻击者的视角中，$PK_{id}$的分布与$MPK$相同，即他无法分辨$PK_{id}$与$MPK$，进而可以说明该方案的安全性与AFGH方案相同。完整的安全规约按下不表。

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

### 多重签名与聚合签名

多重签名与聚合签名是特殊的数字签名方案，二者可以共同使用。其中：

* 多重签名使用多个不同的用户的公钥，为相同的数据进行签名，并生成一个单独的签名；
* 聚合签名将多个不同的签名压缩为一个。

比起传统的签名方案，多重签名提供了额外的安全性保证，而聚合签名减少了签名的存储开销与验证开销，其在区块链中的应用场景近年来也备受关注。

#### BLS

BLS签名方案由Dan Boneh、Ben Lynn与Hovav Shacham共同提出，并以他们的名字命名。该方案简单但可拓展，拥有阈值签名、多重签名、聚合签名等所要求的特性。该方案同样使用了双线性映射，其整体流程如下：

* 密钥生成(KeyGen)：
    * 选取乘法群$G_1=<g>,G_2=<h>$；
    * 随机选择$SK_a=a \in Z_q^*$，$PK_a=h^{SK_a}=h^a$。
* 签名(Sign)：
    * 对于消息$m$，计算摘要$H(m) \in G_1$；
    * 使用私钥$SK_a$生成签名$\sigma = H(m)^{SK_a}$。
* 验证(Verify)：
    * 对于签名$$\sigma$，计算$e(\sigma, h)$；
    * 对于消息$m$与公钥$PK_a$，计算$e(H(m), PK_a)$；
    * 若上述二者相等，则返回$True$，否则返回$False$。

基于BLS的聚合签名描述如下：

* 签名聚合(Aggregate)：
    * 对于签名$\{\sigma_i|1 \le i \le n\}$，计算$\sigma = \prod_{i=1}^n(\sigma_i)$。
* 验证(Verify)：
    * 对于聚合签名$\sigma$，计算$e(\sigma, h)$；
    * 对于消息$\{m_i|1 \le i \le n\}$与公钥$\{PK_i|1 \le i \le n\}$，计算$\prod_{i=1}^n(e(H(m_i), PK_i))$；
        * 当$m_1=\ldots=m_n=m$时，可优化为$e(H(m), \prod_{i=1}^n(PK_i))$。
    * 若上述二者相等，则返回$True$，否则返回$False$。

然而，当消息相同时，上述的聚合签名方案存在Rogue key attack，即攻击者可在没有Bob私钥的情况下伪造聚合签名，说服验证者Bob对该消息进行了签名。

对于Rogue key attack攻击，显而易见的抵御方式是使用不同的消息，但由此会带来线性的配对次数，无法使用相同消息下的优化方案。另一种措施是使用零知识证明，以证明签名者确实拥有相应的私钥。但由于零知识证明的证明与验证过程相对而言效率更低，而签名与验证在本作品中较为频繁，因此不适合本作品的场景。

本作品使用了Dan Boneh，Manu Drijvers与Gregory Neven于2018年提出的Compact Multi-Signatures for Smaller Blockchains方案，它不依赖零知识证明，更适用于区块链环境。其描述如下：

* 密钥生成(KeyGen)：
    * 选取乘法群$G_1=<g>,G_2=<h>$；
    * 选取哈希函数$H: G_1^n \to R^n, \text{where } R := \{1,2,\ldots,2^{128}\}；
    * 随机选择$SK_a=a \in Z_q^*$，$PK_a=h^{SK_a}=h^a$。
* 签名(Sign)：
    * 对于消息$m$，计算摘要$H(m) \in G_1$；
    * 使用私钥$SK_a$生成签名$\sigma = H(m)^{SK_a}$。
* 签名聚合(Aggregate)：
    * 对于公钥$\{PK_i|1 \le i \le n\}$，计算$(t_1,\ldots,t_n) := H(PK_1,\ldots,PK_n)$；
    * 对于签名$\{\sigma_i|1 \le i \le n\}$与$\{t_i|1 \le i \le n\}$，计算$\sigma = \prod_{i=1}^n(\sigma_i^{t_i})$。
* 验证(Verify)：
    * 对于公钥$\{PK_i|1 \le i \le n\}$，计算$(t_1,\ldots,t_n) := H(PK_1,\ldots,PK_n)$，并生成聚合公钥$PK = \prod_{i=1}^n(PK_i^{t_i})$；
    * 对于聚合签名$\sigma$，计算$e(\sigma, h)$；
    * 对于消息$m$与聚合公钥$PK$，计算$e(H(m), PK)$；
    * 若上述二者相等，则返回$True$，否则返回$False$。

当消息不同时，可在上述方案的验证环节的基础上进一步拓展，在此不详细描述。

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

我们还配置了GitHub Actions，下载最新的artifact请访问[这里](https://github.com/winderica/FISCO-BCOS/actions )。

解压后，获取[build_chain.sh](https://github.com/FISCO-BCOS/FISCO-BCOS/releases/download/v2.8.0/build_chain.sh )，并运行：

```bash
./build_chain.sh -l 127.0.0.1:2 -e <path>/<to>/fisco-bcos
./nodes/127.0.0.1/start_all.sh
```

### 编译合约

请预先安装rust相关工具链与`cargo-liquid`。

```bash
cd contracts
make
```

### 部署合约与后端

1. 安装依赖：
```bash
cd backend
yarn
```
2. 修改`src/config/index.ts`中`baseConfig`的各个字段
3. 部署合约：
```bash
yarn deploy
```
4. 修改`src/config/index.ts`中`addresses`的各个字段
5. CA初始化各个成员：
```bash
yarn ca
```
6. 构建并运行：
```bash
yarn build
yarn start:prod
```

### 部署前端

#### 编译WebAssembly

虽然项目中已经存在预编译的WebAssembly文件，但为确保万无一失，可以自行编译。

```bash
cd rust
cargo build --release
cp ./target/wasm32-unknown-unknown/release/rescue.wasm ../frontend/common/utils/rescue/
```

#### 配置

修改`common/api/v2.js`中`addresses`的各个字段

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
    * 理论上来说，后端重新引入了区块链本已解决的信任问题（除非用户自行部署），因此不应存在后端
    * 本项目与私钥有关的所有操作均在前端完成，后端作为简单的RPC over HTTP Gateway，完全透明，不接触用户私钥，只起到消息转发的作用
    * 前端支持直接访问节点的JSONRPC服务，但由于浏览器对CORS的检查愈发严格，因此后端是必要的
    * 用户可以自行部署后端、使用其它的RPC over HTTP服务或在*不跨域*的前提下直接通过前端访问节点的JSONRPC端口
