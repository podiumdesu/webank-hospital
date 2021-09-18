# 标题**TODO**标题

## 简介

本作品**TODO**

## 功能

**TODO**

## 技术栈

* 前端
    * React
    * Ant Design
    * Vite
    * WebAssembly
* 后端
    * Node.js
    * TypeScript
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
        * Solidity
    * 存储
        * IPFS

## 系统架构

**TODO**

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
正是因为其独特性质，零知识证明被广泛地应用于需要隐私保护的场景中。在本作品中，用户的xxx属于隐私信息，而零知识证明能够满足其匿名性需求。

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
