# 医链  -- 面向隐私保护的医药大数据可信流转溯源解决方案

##  一、产品说明

医链，构建更美好的“链”上医疗平台，使数据由储于一个个医疗机构中的孤岛转变为以人为中心的全时空维度视图。我们创新性地提出了密钥可重新随机化的代理重加密方案，并基于此实现了私密性更强的健康记录共享机制；同时打破现有溯源合约显式存储所有权的传统，提出一套基于零知识证明与聚合签名的药企供应链产品信息追溯服务方案。安全性更高，隐私性更完备，一站式解决就诊、异地复诊、取药、授权、溯源等问题，助力医疗行业实现健康和就诊数据的可信共享，加速医药数字化生态落地，促进全民建成互联互通的人口健康信息平台，为医疗大数据价值挖掘做技术背书。

<center style="display: flex; justify-content: center">  
  <div>
    <img src="https://tva1.sinaimg.cn/large/008i3skNgy1gw12vsvpkij30lq0liaba.jpg" width="200"/>
    <p style="margin: 5px 0 0 0"><a>https://mc.trchk.top/patient</a></p>
    <p style="margin: 3px 0 0 0">您可以扫描此二维码访问“医链”</p>
  </div>
</center>

## 二、技术创新点

### （1）基于密钥可重新随机化的代理重加密(Proxy Re-Encryption with Rerandomizable Keys)的电子健康记录的共享方案

提及个人健康记录，安全和隐私是患者最为关心的，同时个人应当拥有是否透露细节的权利。如果不能解决链上电子病历流转过程中的隐私泄露和滥用问题，那么就无法保障上“链”患者的数据安全。于是我们提出了基于代理重加密的共享方案。作为加密数据存储和共享必不可少的加密工具，代理重加密已被广泛用于保护存储在第三方的数据的机密性。

在本方案中，健康记录的所有权在患者手中，只有患者本人才能对其进行授权。医生在为患者创建病历或体检记录时，需要提供签名并加密，在患者确认后方能上链；其他医生或机构查看患者的病历或体检记录时，需要在用户授权后才能查看。同时，尽管患者完全拥有其健康记录的访问权限，但只有通过联盟链认证的医生的签名才会被其他医生或机构认可，因此其无法篡改或伪造病历。

本方案的优点在于：

1. 创新性地提出了RPRE（Proxy Re-Encryption with Rerandomizable Keys，密钥可重新随机化的代理重加密），它不仅拥有单向性、抗合谋等特性，最小化对区块链节点的信任，还可以从一个主密钥对中动态派生会话密钥，进而减少了私钥存储的成本；
2. 在方便了数据共享、解决了医疗大数据的数据孤岛问题的同时，也确保了在区块链这个零信任环境下的保密性，防止涉及的密钥和明文在链上泄露；
3. 保证了患者向其他医生或机构共享某份健康记录时，其他人无法通过合约调用记录查询到患者把哪份健康记录共享给了谁，实现了隐私保护；
4. 将患者加密、存储、传输的开销转移到节点上，本地只保存必要的密钥与索引信息。

### （2）基于非交互零知识证明(Non-Interactive Zero-Knowledge Proof)与聚合签名的药企供应链产品信息追溯服务方案

区块链最为直接的使用场景便是溯源。尽管现有的溯源方案较为成熟且有很多落地应用，但仍存在如下的问题：

* 所有人都可以dump整个区块链，获取所有物品的供应链中的各个环节，而实际上这些信息只应被供应链的参与者与最终的消费者获取；
* 合约以`地址->资产`或`资产->地址`的方式存储物品所有权，同理，所有人都可以获取各个用户所拥有的物品或各个物品的所有者。

我们提出基于zk-STARK（Zero-Knowledge Scalable Transparent ARguments of Knowledge，零知识的可扩展的透明的知情证明）与BLS(Boneh-Lynn-Shacham)的药企供应链产品信息追溯服务方案。在本方案中，只有拥有溯源码的人（供应链节点、最终消费者、政府部门）才能对医药产品进行溯源。各个中间环节只有提供自己拥有溯源码的证明才能对供应链进行增加环节的操作，同时又不暴露关于溯源码的任何信息。另一方面，上传加密数据时需要先对其进行签名，以此在防止篡改的同时保证医药产品的来源与去路真实可靠。同时，供应链的各个节点还需要验证前一个节点的数据，并为其生成签名，进一步提高供应链的鲁棒性。

本方案的优点在于：

1. 使用了zk-STARK协议，无需可信初始化，同时保证了后量子安全，更适合区块链这个去中心化的环境；
2. 使用了BLS签名方案，所有供应链参与者的签名在链上被聚合为常数个，减少了区块链节点的存储开销，同时加快了验证的效率；
3. 不保存医药产品的所有权关系，而是将其在供应链中的所有者的转移隐式地记录在加密后的数据中，任何人都无法通过患者拥有的医药产品，进而保护了患者的隐私；
4. 溯源码只有物理接触医药产品才能获取，由此防止了其他人对供应链的恶意追踪，保护了各个中间环节的利益。

## 三、功能特色

### （1）解决分散就诊记录的数据孤岛问题，健康记录一链直达

不同医疗机构的数据互相独立，患者的健康记录是处于支离破碎的状态，想要获取不同机构或不同时间段的记录非常不便利，没有一个患者维度的全局视图。

医链可将用户的病历、体检数据、可穿戴设备等健康相关的数据在保障隐私和安全性的前提下，汇总起来成为用户的电子健康记录。诊疗医生可以看到患者的历史就诊记录，体检数据，甚至可穿戴医疗设备数据，从而做到精准施治或提前预防。而对于用户而言，可以更方便地管理和维护个人健康记录，并根据历史健康记录做出相应的健康决策。

### （2）解决历史病历/健康记录的数据信任问题，跨机构数据共享便捷可信

不同医疗机构的诊疗记录和检查检验数据无法保证不可篡改、不可伪造和可溯源，难获得跨机构医疗工作者的信任，导致患者在跨医疗机构就诊时不得不重复进行检查检验，既浪费医疗资源，又给患者带来额外负担。

医链上存放的每笔电子健康记录均经过联盟链上注册医生的签名，并经过加密保存在区块链上，极大程度地保证了可信度和不可篡改性。用户可将该可信数据共享给联盟链上任意第三方。

应用场景例如：
* 去其他医院看病时，患者可直接将历史病历拿给医生看，减少重复检验带来的医疗成本；
* 去公司入职时，可以直接提交链上的历史体检记录；
* 线上看病后，可以凭病历记录直接去加入联盟链中的任意药房取药，提升线上病历的可信程度更能进一步推动远程医疗服务以及促进优质医疗资源的纵向流动。

### （3）解决医疗数据授权共享的数据安全问题，给予医疗大数据技术背书

在数据共享时，不可信的第三方可以通过追踪用户的授权记录，分析用户什么时候去哪家医院把什么数据共享给了谁，进而构建用户画像并以此牟利，侵犯用户的隐私权。医疗数据不敢共享直接影响医疗大数据的使用。

在医链中，所有的数据都是以密文的形式保存，只有患者本人与被授权方才能解密，保证了数据的保密性；同时，所有的流程设计均以隐私保护为出发点，即使是恶意的节点也无法得知被授权的数据内容与被授权方的身份，保证了被授权方的匿名性，进而保护了患者的隐私。

应用场景例如：
* 用户可以将历史病历数据/健康记录均共享给第三方机构做医疗研究，依托于重加密技术，无需担心链上或共享时的数据泄露和隐私问题，医疗研究机构可以通过电子病历和健康档案联盟链获取更多的数据分析样本；
* 患者可以参与到医疗数据共享中，对自己的数据是否使用和使用范围进行授权。同时也可以在授权使用后获得激励。

### （4）解决医药器材质量管理的数据溯源问题，加速构建医药数字化生态

目前基于区块链的溯源以类似于资产交易的形式进行，物品从一个地址转移到另一个地址下，恶意的节点或成员可以很容易地得知整个供应链的所有环节的详细信息，进而分析出各个参与者的吞吐量与经营状况，也可以得知最终的消费者所拥有的所有物品，这是对利益与隐私的双重侵害。

医链通过引入区块链+溯源码技术，实现“一物一码”，确保物理世界医药产品唯一映射至区块链系统；区块链保证信息具有不可篡改性，即制药厂商、批发商、经销商和药房等医药产品溯源的每个参与者，共同参与医药产品在“生产—流通—销售”每个环节中信息记录上链的过程。同时，只有各个环节的参与者、最终的消费者与监管方才能拥有相应的供应链的视图，而其它任何人都无法得知各个环节参与者的身份与其上传的数据。

应用场景例如：
* 某个农村的政府可以通过溯源码追溯到供应医药用品给该农村的供应链里的每一个环节，给予它们政策优惠，以此鼓励扶贫事业、促进乡村医疗发展。

## 四、技术开发方案

### （1）系统架构



<img src="images/INTRO.images/image-20211102202533637.png" alt="image-20211102202533637" style="zoom:50%;" />

### （2）技术栈

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
  * 预编译合约（微众银行区块链相关开源技术方案）
    * C++
    * Rust FFI
    * [mcl](https://github.com/herumi/mcl)
    * [winterfell](https://github.com/novifinancial/winterfell)
  * 合约
    * Solidity
    * [Liquid](https://github.com/WeBankBlockchain/liquid) (Rust)（微众银行区块链相关开源技术方案）
  * 存储
    * IPFS

### （3）流程

#### 1. 初始化

各个角色申请加入联盟链。此时，各个角色均持有ECDSA公私钥对$(SK_{\texttt{ECDSA}, x}, PK_{\texttt{ECDSA}, x})$，与供应链有关的各个角色均持有BLS公私钥对$(SK_{\texttt{BLS}, x}, PK_{\texttt{BLS}, x})$，由CA（假设是某个具有公信力的组织）负责对各个角色身份、签名、有效期等的认证。

同时，授权流程中的各个角色生成PRE公私钥对$(SK_{\texttt{RPRE}, x}, PK_{\texttt{RPRE}, x})$。

#### 2. 病历授权

病历在上链后只能Create/Read，不能Update/Delete。

##### (a) Alice（患者）授权Bob（医生）创建病历

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

<img src="https://i.loli.net/2021/10/31/7KvJDPtbxwYBXnU.png" alt="image.png" style="zoom:30%;" />

##### (b) Alice（患者）读取病历

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

##### (c\) Alice（患者）授权Carol（医生、药房或科研机构）读取病历

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

#### 3. 医药产品溯源

简化的医药产品供应链：生产（生产厂商） -> 运输（货运公司） -> 销售（营销公司） -> （药房 -> 患者）/（医院）/（科研机构）

##### (a) 数据结构

在存储时，每个医药产品都是一个键值对，其中键为医药产品的$ID$，值包括了`trace`与`signature`。
* $ID := \mathrm{Hash}_\texttt{Rescue}(DK)$，其中$DK$是溯源码，打印在医药产品包装上。只有能够物理接触医药产品的参与者才能获取$DK$；
* `trace`是一个只能push的数组，其中包括以$DK$加密后的各个环节的信息；
* `signature`包括了供应链的聚合签名$\sigma_{agg}$与未被多重签名的临时签名$\sigma_{tmp}$，存储、验证开销为常数。

值得注意的是，合约并不直接存储医药产品与其当前所有者的所有权关系，而是通过$DK$证明（物理）所有权、通过trace记录之前的所有者（即供应链的参与者）。

##### (b) David（首个环节的参与者）创建trace

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

##### (c\) Frank（第i个环节的参与者）验证Erin（第i-1个环节的参与者）的信息

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

##### (d) Grace（患者或政府部门）查询/抽检 供应链

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

### （4）核心算法

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

#### 密钥可重新随机化的代理重加密

本作品提出了密钥可重新随机化的代理重加密（Proxy Re-Encryption with Rerandomizable Keys, RPRE）方案。据我们所知，该方案为我们首创。该方案受现有数字货币钱包的密钥生成方案启发，通过主密钥对动态生成会话密钥对，而无需存储会话密钥对，进一步减小了用户存储的开销。

同时，本方案可以进行类似于冷热钱包的拓展，将主公钥公开，而将主私钥存储于冷钱包（硬件，如患者的医保卡）中，只有在解密时才上线。由此可以进一步地保证密钥的安全性。

本方案在AFGH方案的基础上增加了公钥重新随机化与私钥重新随机化算法，描述如下：

* 公钥重新随机化(PKDer)：
    * 对于秘密值$id$与主公钥$MPK$，计算随机化后的$PK_{id} = MPK^{id}$
* 私钥重新随机化(SKDer)：
    * 对于秘密值$id$与主公钥$MSK$，计算随机化后的$SK_{id} = MSK \times id$

直觉上而言，在攻击者的视角中，$PK_{id}$的分布与$MPK$相同，即他无法分辨$PK_{id}$与$MPK$，进而可以说明该方案的安全性与AFGH方案相同。完整的安全规约按下不表。

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

#### 3. 多重签名与聚合签名

多重签名与聚合签名是特殊的数字签名方案，二者可以共同使用。其中：

* 多重签名使用多个不同的用户的公钥，为相同的数据进行签名，并生成一个单独的签名；
* 聚合签名将多个不同的签名压缩为一个。

比起传统的签名方案，多重签名提供了额外的安全性保证，而聚合签名减少了签名的存储开销与验证开销，其在区块链中的应用场景近年来也备受关注。

##### BLS

BLS签名方案由Dan Boneh、Ben Lynn与Hovav Shacham共同提出，并以他们的名字命名。该方案简单但可拓展，拥有阈值签名、多重签名、聚合签名等所要求的特性。该方案同样使用了双线性映射，其整体流程如下：

* 密钥生成(KeyGen)：
    * 选取乘法群$G_1=<g>,G_2=<h>$；
    * 随机选择$SK_a=a \in Z_q^*$，$PK_a=h^{SK_a}=h^a$。
* 签名(Sign)：
    * 对于消息$m$，计算摘要$H(m) \in G_1$；
    * 使用私钥$SK_a$生成签名$\sigma = H(m)^{SK_a}$。
* 验证(Verify)：
    * 对于签名$\sigma$，计算$e(\sigma, h)$；
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

### （5）部署

#### 1. 包含预编译合约的区块链网络

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

#### 2. 编译合约

请预先安装rust相关工具链与`cargo-liquid`。

```bash
cd contracts
make
```

#### 3. 部署合约与后端

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

#### 4. 部署前端

##### 编译WebAssembly

虽然项目中已经存在预编译的WebAssembly文件，但为确保万无一失，可以自行编译。

```bash
cd rust
cargo build --release
cp ./target/wasm32-unknown-unknown/release/rescue.wasm ../frontend/common/utils/rescue/
```

##### 打包构建用户界面

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

## 五、商业应用场景及价值

国务院于2015年发布《全国医疗卫生服务体系规划纲要》指出：到2020年，实现全员人口信息、电子健康档案和电子病历三大数据库基本覆盖全国人口并信息动态更新；充分利用信息化手段，促进优质医疗资源纵向流动，建立医院与基层医疗卫生机构之间共享诊疗信息、开展远程医疗服务和教学培训的信息渠道；实现公共卫生、计划生育、医疗服务、医疗保障、药品供应、综合管理等六大业务应用系统的互联互通和业务协同。

每一次产业技术的兴起都会伴随着新基础设施的建设，进而带来传统利益格局、产业体系、制度文化的重构。当前中国传统的人口数量红利日渐减少，而围绕新型基础设施建设作创新探索将有望促成新一轮发展红利。云计算、物联网、大数据、区块链等信息化技术的快速发展，为优化医疗卫生业务流程、提高服务效率提供了条件，必将推动医疗卫生服务模式和管理模式的深刻转变。

个人健康记录作为促进智慧城市的医疗建设和大数据应用发展的重要一环，数字化医疗平台的目的是为了让患者可以更好地管理和维护个人健康记录，同时可以进一步提高医疗照护服务和降低成本，未来必将成为了大众体检、看病中不可或缺的一环。

而医链创新性地提出了基于PRPE的电子健康记录的共享方案与基于zk-STARK与BLS的药企供应链产品信息追溯服务方案，实现了以患者为中心的E2E数据授权共享与唯参与者可见的医药用品供应链视图，切实地解决了现有的数据共享与物品溯源中所存在的安全性缺陷，有力地保证了医药大数据在流转、溯源的过程中的保密性、完整性、真实性、放抵赖性与包括但不限于患者、医生、供应链参与者等等的各个用户的隐私，同时还具有极大的灵活性与可扩展性，在个人隐私越来越受重视的当下提供了全面的隐私保护措施，比现有的落地项目拥有更为独特的优势，因此在在线医疗、电子病历、联合问诊、跨机构取药、医疗器械与医药产品溯源、医学研究等等的广泛的应用场景下均有极为可观的商业价值。

## 六、团队分工 

| 学校               | 姓名   | 角色                 |
| ------------------ | ------ | -------------------- |
| 香港科技大学硕士生 | 王为红 | 产品经理、前端工程师 |
| 香港大学博士生     | 张诚儒 | 全栈工程师           |
| 华中科技大学本科生 | 陈洁   | 视觉设计师           |
| 华中科技大学本科生 | 鄢宁   | 交互设计师           |



## 七、“医链”使用方法

<center style="display: flex; justify-content: center">  
  <div style="margin-right: 20px">
    <img src="https://tva1.sinaimg.cn/large/008i3skNgy1gw12vsvpkij30lq0liaba.jpg" width="200"/>
    <p style="margin: 5px 0 0 0"><a>https://mc.trchk.top/patient</a></p>
    <p style="margin: 3px 0 0 0">您可以扫描此二维码访问“医链”</p>
  </div>
  <div style="">
    <img src="https://tva1.sinaimg.cn/large/008i3skNgy1gw131itzmzj306d06bwep.jpg" width="200"/>
    <p style="margin: 5px 0 0 0"><a>https://mc.trchk.top/doctor</a></p>
    <p style="margin: 3px 0 0 0">您可以扫描此二维码访问“医链”</p>
  </div>
    <div style="margin-left: 20px">
    <img src="https://tva1.sinaimg.cn/large/008i3skNgy1gw12vsvpkij30lq0liaba.jpg" width="200"/>
    <p style="margin: 5px 0 0 0"><a>https://mc.trchk.top/supplyChain</a></p>
    <p style="margin: 3px 0 0 0">您可以扫描此二维码访问“医链”</p>
  </div>
</center>

