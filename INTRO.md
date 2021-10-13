# 医链  -- 面向隐私保护的医药大数据可信流转溯源解决方案

##  一、产品说明

医链，构建更美好的“链”上医疗平台，使数据由储于一个个医疗机构中的孤岛转变为以人为中心的全时空维度视图。平台基于代理重加密提出私密性更强的健康记录共享方案，并打破现有溯源合约显式存储所有权的传统，提出一套基于零知证明的药企供应链产品信息追溯服务方案。安全性更高，隐私性更完备，一站式解决就诊、异地复诊、取药、授权、溯源等问题，助力医疗行业实现健康和就诊数据的可信共享，加速医药数字化生态落地，促进全民建成互联互通的人口健康信息平台，为医疗大数据价值挖掘做技术背书。

## 二、技术创新点

### （1）基于代理重加密(Proxy Re-Encryption)的电子健康记录的共享方案

提及个人健康记录，安全和隐私是患者最为关心的，同时个人应当拥有是否透露细节的权利。如果不能解决链上电子病历流转过程中的隐私泄露和滥用问题，那么就无法保障上“链”患者的数据安全。于是我们提出了基于代理重加密的共享方案。作为加密数据存储和共享必不可少的加密工具，代理重加密已被广泛用于保护存储在第三方的数据的机密性。

在本方案中，健康记录的所有权在患者手中，只有患者本人才能对其进行授权。医生在为患者创建病历或体检记录时，需要提供签名并加密，在患者确认后方能上链；其他医生或机构查看患者的病历或体检记录时，需要在用户授权后才能查看。同时，尽管患者完全拥有其健康记录的访问权限，但只有通过认证的医生的签名才会被其他医生或机构认可，因此其无法篡改或伪造病历。

本方案的优点在于：

1. 使用了AFGH方案的代理重加密，它拥有单向性、抗合谋等特性，最小化对区块链节点的信任
2. 在方便了数据共享、解决了医疗大数据的数据孤岛问题的同时，也确保了在区块链这个零信任环境下的保密性，防止涉及的密钥和明文在链上泄露
3. 保证了患者向其他医生或机构共享某份健康记录时，其他人无法通过合约调用记录查询到患者把哪份健康记录共享给了谁，实现了隐私保护
4. 将患者加密、存储、传输的开销转移到节点上，本地只保存必要的密钥与索引信息

### （2）基于非交互式零知证明(Non-Interactive Zero-Knowledge Proof)的药企供应链产品信息追溯服务方案

区块链最为直接的使用场景便是溯源。尽管现有的溯源方案较为成熟且有很多落地应用，但仍存在如下的问题：

* 所有人都可以dump整个区块链，获取所有物品的供应链中的各个环节，而实际上这些信息只应被供应链的参与者与最终的消费者获取；
* 合约以地址->资产或资产->地址的方式存储物品所有权，同理，所有人都可以获取各个用户所拥有的物品或各个物品的所有者。

我们提出基于零知证明的药企供应链产品信息追溯服务方案。在本方案中，只有拥有溯源码的人（供应链节点、最终消费者、政府部门）才能对药品进行溯源。各个中间环节只有提供自己拥有溯源码的证明才能对供应链进行增加环节的操作，同时又不暴露关于溯源码的任何信息。另一方面，上传加密数据时需要先对其进行签名，以此在防止篡改的同时保证药品的来源与去路真实可靠。记录数据时，供应链的各个节点还可以选择记录其前驱与后继，进一步提高供应链的鲁棒性。

本方案的优点在于：

1. 使用了zk-STARK协议，无需可信初始化，同时保证了后量子安全，更适合区块链这个去中心化的环境
2. 不保存药品的所有权关系，而是将其在供应链中的所有者的转移隐式地记录在加密后的数据中，任何人都无法通过患者拥有的药品，进而保护了患者的隐私
3. 溯源码只有物理接触药品才能获取，由此防止了其他人对供应链的恶意追踪，保护了各个中间环节的利益

## 三、功能特色

（1）解决分散就诊记录的数据孤岛问题，健康记录一链直达

不同医疗机构的数据互相独立，患者的健康记录是处于支离破碎的状态，想要获取不同机构或不同时间段的记录非常不便利，没有一个患者维度的全局视图。

医链可将用户的病历、体检数据、可穿戴设备等健康相关的数据在保障隐私和安全性的前提下，汇总起来成为用户的电子健康记录，使数据由储于一个个医疗机构中的孤岛转变为以人为中心的全时空维度视图。对于用户而言，可以更方便地管理和维护个人健康记录，并根据历史健康记录做出相应的健康决策。

（2）解决不同医院间就诊时历史病历的数据信任问题，跨院就诊

不同医疗机构的诊疗记录和检查检验数据无法保证不可篡改、不可伪造和可溯源，难获得跨机构医疗工作者的信任，导致患者在跨医疗机构就诊时不得不重复进行检查检验，即浪费医疗资源，又给患者带来额外负担。

医链上存放的每笔电子健康记录均经过联盟链上注册医生的签名，并经过加密保存在区块链上，极大程度地保证了可信度和不可篡改性。用户可将该可信数据共享给联盟链上任意第三方。

应用场景例如：
* 去其他医院看病时，患者可直接将历史病历拿给医生看，减少重复检验带来的医疗成本；
* 去公司入职时，可以直接提交历史体检记录
* 线上看病后，可以凭病历记录直接去加入联盟链中的任意药房取药，提升线上病历的可信程度更能进一步推动远程医疗服务以及优质医疗资源的纵向流动。


促进优质医疗资源纵向流动，建立医院与基层医疗卫生机构之间共享诊疗信息、开展远程医疗服务

（3）解决医疗数据授权共享的数据安全问题，给予医疗大数据技术背书

在数据共享时，不可信的第三方可以通过追踪用户的授权记录，分析用户什么时候去哪家医院把什么数据共享给了谁，进而构建用户画像并以此牟利，侵犯用户的隐私权。

在医链中，所有的数据都是以密文的形式保存，只有患者本人与被授权方才能解密，保证了数据的保密性；同时，所有的流程设计均以隐私保护为出发点，即使是恶意的节点也无法得知被授权的数据内容与被授权方的身份，保证了被授权方的匿名性，进而保护了患者的隐私。

（4）解决医药器材质量管理的数据溯源问题，加速构建医药数字化生态

目前基于区块链的溯源以类似于资产交易的形式进行，物品从一个地址转移到另一个地址下，恶意的节点或成员可以很容易地得知整个供应链的所有环节的详细信息，进而分析出各个参与者的吞吐量与经营状况，也可以得知最终的消费者所拥有的所有物品，这是对利益与隐私的双重侵害。

医链通过引入区块链+溯源码技术，实现“一物一码”，确保物理世界药品唯一映射至区块链系统；区块链保证信息具有不可篡改性，即制药厂商、批发商、经销商和药房等药品溯源的每个参与者，共同参与药品在“生产—流通—销售”每个环节中信息记录上链的过程。同时，只有各个环节的参与者、最终的消费者与监管方才能拥有相应的供应链的视图，而其它任何人都无法得知各个环节参与者的身份与其上传的数据。

## 四、技术开发方案

### （1）技术栈

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
    * [Liquid](https://github.com/WeBankBlockchain/liquid) (Rust)（微众银行区块链相关开源技术方案）
  * 存储
    * IPFS

### （2）流程

#### 1. 初始化

各个角色申请加入联盟链。此时，各个角色均持有公私钥对，而CA（假设是某个具有公信力的组织）持有身份到公钥的mapping。

#### 2. 病历授权

病历在上链后只能Create/Read，不能Update/Delete。

##### (a) Alice（患者）授权Bob（医生）创建病历

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

##### (b) Alice（患者）读取病历

1. Alice -> 合约：`AID = Hmac(CID, Hash(password + salt))`
2. 合约 -> Alice：`(DK', timestamp) = cas[AID]`
3. Alice -> IPFS：`CID`
4. IPFS -> Alice：`c = storage[CID]`
5. Alice：
   1. 以PRE私钥解密对称密钥：`DK = PRE.Dec(SKa_pre, DK')`
   2. 以对称密钥解密病历：`{ m, sig } = Sym.Dec(c, DK)`
   3. 必要时可以从CA获取Bob对应的公钥`PKb_ec`，验证真实性：`isValid = EC.Verify(PKb_ec, Hash(m), sig)`

##### (c) Alice（患者）授权Carol（医生、药房或科研机构）读取病历

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

#### 3. 药品溯源

简化的药品供应链：生产（生产厂商） -> 运输（货运公司） -> 销售（药房） -> （患者）

##### (a) 数据结构

在存储时，每个药品都是一个键值对，其中键为药品的id，值为trace。

* `id = Hash(key)`，其中key是溯源码，打印在药品包装上。只有能够物理接触药品的参与者才能获取key；
* trace是一个只能push的数组，其中包括以key加密后的各个环节的信息。

值得注意的是，合约并不直接存储药品与其当前所有者的所有权关系，而是通过key证明（物理）所有权、通过trace记录之前的所有者（即供应链的参与者）。

##### (b) David（某个环节的参与者）增加trace

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

##### (c) Erin（后续环节的参与者、患者或政府部门）查询/抽检 供应链

1. Erin：以溯源码key计算`id = HashZK(key)`
2. Erin -> 合约：`id`
3. 合约 -> Erin：`trace = drugs[id]`
4. Erin
   1. 对于`trace`中的每个`(c, timestamp)`，解密`{ data, sig } = Sym.Dec(key, c)`
   2. 必要时可以从CA获取David对应的公钥`PKd_ec`，验证真实性：`isValid = EC.Verify(PKd_ec, Hash(m), sig)`

### （3）核心算法

#### 1. 代理重加密

代理重加密（*Proxy Re-Encryption*，PRE）是一种密文重加密方案。

以典型的Alice-Bob模型为例，*Alice*使用公钥加密了一些文件（准确说法应为使用公钥加密对称密钥，再使用对称密钥加密文件，但此处不做区分地使用，以便于叙述），并存储在链上(proxy)，当*Bob*想要获取这些*Alice*的文件时，他向*Alice*提出申请，*Alice*无需从链上下载文件并发送给*Bob*，而是通过调用链上合约将文件重加密为*Bob*的私钥能够解密的数据。

它将*Alice*的数据存储、计算、传输的开销转移到了*Proxy*，在云服务普及的当下具有广泛的应用场景。

##### AFGH方案

早期的代理重加密方案存在诸多问题，如依赖可信第三方、重加密密钥的生成依赖通信双方的私钥等。2006年，Ateniese等人提出了可行且较为完备的方案（下称AFGH方案），该方案以双线性映射作为理论基础，解决了上述的问题。本作品实现了原文中3.2节介绍的方案，其整体流程如下图所示。

<img src="https://i.loli.net/2021/09/18/9BTXhewmPtUrZFD.png" alt="image.png" style="zoom:50%;" />

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

#### 2. 零知识证明

零知识证明是现代密码学中的重要概念，最早由Goldwasse，Micali和Rackoff于1985年提出。

同样以典型的Alice-Bob模型为例。*Alice*想要向*Bob*证明她拥有某些知识，但是又不想将该知识本身告诉*Bob*，同时还得说服*Bob*。那么她可以让*Bob*提供一个挑战（Challenge），并使用零知识证明协议为该挑战生成自己的确拥有相应的知识的证明，将其发送给*Bob*。*Bob*通过验证这个证明即可确认*Alice*所言为真，但又不知道她的知识具体是什么。

零知识证明具有如下性质：

* **完备性**：如果证明者的宣称为真，则他最终将说服诚实的验证者；
* **可靠性**：只有证明者的宣称为真时，诚实的验证者才会被说服；
* **零知识性**：验证者无法从上述过程中获取除了“证明者的宣称为真”这一事实之外的任何信息。
  正是因为其独特性质，零知识证明被广泛地应用于需要隐私保护的场景中。

##### zk-STARK

zk-STARK全称为*Zero-Knowledge Scalable Transparent Arguments of Knowledge*，即*可扩展的透明的零知识证明*。其中，**可扩展**是指随输入语句的扩展，证明的时间线性增加，而验证的时间对数增加；**透明**是指无需可信初始化。该方案分为**算术化**（Arithmetization）与**低度测试**（Low Degree Testing）两个步骤，其交互式版本如下图所示，使用*Fiat-Shamir变换*即可将其转换为非交互式版本。

<img src="https://i.loli.net/2021/09/18/fdklzKAFGrUZbIq.png" alt="image.png" style="zoom:45%;" />

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

## 五、商业应用场景及价值

国务院于2015年发布《全国医疗卫生服务体系规划纲要》指出：到2020年，实现全员人口信息、电子健康档案和电子病历三大数据库基本覆盖全国人口并信息动态更新。充分利用信息化手段，促进优质医疗资源纵向流动，建立医院与基层医疗卫生机构之间共享诊疗信息、开展远程医疗服务和教学培训的信息渠道。实现公共卫生、计划生育、医疗服务、医疗保障、药品供应、综合管理等六大业务应用系统的互联互通和业务协同。

每一次产业技术的兴起都会伴随着新基础设施的建设，进而带来传统利益格局、产业体系、制度文化的重构。当前中国传统的人口数量红利日渐减少，而围绕新型基础设施建设作创新探索将有望促成新一轮发展红利。云计算、物联网、大数据、区块链等信息化技术的快速发展，为优化医疗卫生业务流程、提高服务效率提供了条件，必将推动医疗卫生服务模式和管理模式的深刻转变。

个人健康记录作为促进智慧城市的医疗建设和大数据应用发展的重要一环，数字化医疗平台的目的是为了让患者可以更好地管理和维护个人健康记录，同时可以进一步提高医疗照护服务和降低成本，未来必将成为了大众体检、看病中不可或缺的一环。

而医链创新性地提出了基于代理重加密的电子健康记录的共享方案与基于非交互式零知证明的药企供应链产品信息追溯服务方案，实现了以患者为中心的E2E数据授权共享与唯参与者可见的医药用品供应链视图，切实地解决了现有的数据共享与物品溯源中所存在的安全性缺陷，有力地保证了医药大数据在流转、溯源的过程中的保密性、完整性、真实性、放抵赖性与包括但不限于患者、医生、供应链参与者等等的各个用户的隐私，同时还具有极大的灵活性与可扩展性，在个人隐私越来越受重视的当下提供了全面的隐私保护措施，比现有的落地项目拥有更为独特的优势，因此在在线医疗、电子病历、联合问诊、跨机构取药、医疗器械与药品溯源、医学研究等等的广泛的应用场景下均有极为可观的商业价值。

## 六、团队分工 

| 学校               | 姓名   | 角色                 |
| ------------------ | ------ | -------------------- |
| 香港科技大学硕士生 | 王为红 | 产品经理、前端工程师 |
| 香港大学博士生     | 张诚儒 | 全栈工程师           |
| 华中科技大学本科生 | 陈洁   | 视觉设计师           |
| 华中科技大学本科生 | 鄢宁   | 交互设计师           |