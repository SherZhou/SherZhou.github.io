---
title: Restful vs WebSocket
date: 2023-06-01
---
在实习时需要进行实时交互，原先的C/S架构REST格式需要客户端重新发起请求，需改用WebSocket，稍微记录一下。

## REST

三种主流的[Web服务](https://zh.wikipedia.org/wiki/Web服务)实现方案，REST、[SOAP](https://zh.wikipedia.org/wiki/SOAP)、[XML-RPC](https://zh.wikipedia.org/wiki/XML-RPC)。

REST是根基于[超文本传输协议(HTTP)](https://zh.wikipedia.org/wiki/超文本传输协议)之上而确定的一组约束和属性，是一种设计提供万维网络服务的[软件构建风格](https://zh.wikipedia.org/wiki/軟件架構)。

REST通常基于使用[HTTP](https://zh.wikipedia.org/wiki/HTTP)，[URI](https://zh.wikipedia.org/wiki/URI)，和[XML](https://zh.wikipedia.org/wiki/XML)以及[HTML](https://zh.wikipedia.org/wiki/HTML)这些现有的广泛流行的协议和标准。

- 资源是由URI来指定。

- 对资源的操作包括获取、创建、修改和删除资源，这些操作正好对应HTTP协议提供的GET、POST、PUT和DELETE方法。

- 客户-服务器（Client-Server）
  通信只能由客户端单方面发起，表现为请求-响应的形式。
  无状态（Stateless）
  通信的会话状态（Session State）应该全部由客户端负责维护。
  缓存（Cache）
  响应内容可以在通信链的某处被缓存，以改善网络效率。
  统一接口（Uniform Interface）
  通信链的组件之间通过统一的接口相互通信，以提高交互的可见性。
  分层系统（Layered System）
  通过限制组件的行为（即每个组件只能“看到”与其交互的紧邻层），将架构分解为若干等级的层。
  按需代码（Code-On-Demand，可选）
  支持通过下载并执行一些代码（例如Java Applet、Flash或JavaScript），对客户端的功能进行扩展。

- 关于状态：应该注意区别应用的状态和连接协议的状态。HTTP连接是无状态的（也就是不记录每个连接的信息），而REST传输会包含应用的所有状态信息，因此可以大幅降低对HTTP连接的重复请求资源消耗

  

## WebSocket

WebSocket是一种在单个TCP连接上进行全双工通信的协议(不是socket)。WebSocket通信协议于2011年被IETF定为标准RFC 6455，并由RFC7936补充规范。WebSocket API也被W3C定为标准。

WebSocket使得客户端和服务器之间的数据交换变得更加简单，允许服务端主动向客户端推送数据。在WebSocket API中，浏览器和服务器只需要完成一次握手，两者之间就直接可以创建持久性的连接，并进行双向数据传输。

WebSocket在建立握手时，数据是通过HTTP传输的。但是建立之后，在真正传输时候是不需要HTTP协议的。
