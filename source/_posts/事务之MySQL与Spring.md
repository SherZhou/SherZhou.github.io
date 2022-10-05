---
title: 事务之MySQL与Spring
top: false
cover: false
toc: true
mathjax: true
date: 2022-07-28 01:09:09
password:
summary:
tags: 事务
categories: java
---

### 前请提要

事务的ACID特性：原子性（atomicity，或称不可分割性）、一致性（consistency）、隔离性（isolation，又称独立性）、持久性（durability）
事务隔离级别（读未提交，读已提交，可重复读，序列化）
CAP理论：一致性（Consistency）、可用性（Availability）、分区容忍性（Partition Tolerance）

## MySQL事务实现原理

### Redo Log

负责原子性与持久性，记载对磁盘上数据进行的修改操作
作用：恢复提交后的物理数据页
构成：
日志缓冲（内存） -- 易失
重做日志文件（磁盘）--  持久化 不易失
刷盘规则：
	（1）开启事务，发出提交事务指令后是否刷新日志由innodb_flush_log_at_trx_commit决定，默认1（每次提交事务都将日志缓冲中日志写入OS buffer，并且调用fsync(）写入磁盘文件，不会丢失数据）
0、1、2的值影响写入OS buffer与写入磁盘文件是否需要隔1s
（2）按频率刷新。刷新频率由innodb_flush_log_at_timeout决定，默认1s
（3）Log Buffer使用内存>50% 触发刷盘操作
（4）chechpoint 一定程度上代表了刷鞋到磁盘时日志所处LSN位置（Long sequence number）


### Undo log

作用：回滚事务和多版本并发事务--MVCC机制
undo log也会产生redo log保证完整性与可靠性
存储：段segment，存放在共享数据表空间，默认ibdata1文件
undo log实现MVCC：
两个隐藏列：行的创建版本；行删除版本
可重复读下增删查改：
select:只查找版本号<=当前事务版本号的数据
insert：将当前事务版本号保存为当前行创建版本号
delete: 当前事务版本号保存为删除的数据行版本号，作为行删除标识
update:innodb将待修改的行赋值为新行，当前事务版本号保存为新数据行的创建版本号，**同时保存当前事务版本号为原来数据行删除版本号**
实际innodb实现上 每行数据后面添加了三个字段：6字节事务id,7字节回滚指针,6字节DB_ROW_ID


### Binlog

属于MySQL的日志(redo log是innodb特有)  二进制日志
以事件形式记录所有数据库表结构变更以及表数据变更的二进制日志
使用场景：主从复制；数据恢复
记录模式:row\statement\mixed


### MySQL事务执行流程

![](https://gcore.jsdelivr.net/gh/SherZhou/pic_source/img/1655400261761-acb3d305-97db-41c9-ba16-aa57cb63964f.jpeg)

### 事务恢复流程

<img src="https://gcore.jsdelivr.net/gh/SherZhou/pic_source/img/1655400240625-491c357b-c3f6-4866-9734-c977a5cc9082.jpeg" style="zoom:67%;" />

### MySQL中XA事务

XA(eXtended Architecture)是指由X/Open 组织提出的分布式交易处理的规范。XA 是一个分布式事务协议,由Tuxedo 提出,所以分布式事务也称为XA 事务。
本质上基于两阶段提交，有一个事务管理器，一个或多个资源管理器和一个应用程序组成
MySQL中通过show engiens命令查看存储引擎是否支持XA事务
可以通过JDBC操作MySQL事务但较为繁琐


## Spring 事务实现原理

本质上是对数据库事务的进一步封装
使用spring事务则不用JDBC手动开启、提交、回滚事务
通过注解实现

### 三大接口

Platform TransactionManager：为Hibernate、MyBatis、JTA等持久化框架提供了事务管理器
TransactionDefinition：主要定义了与事务相关的方法，表示事务属性的常量值等。部分事务属性的常量与Propagation枚举类中的事务传播类型相对应
TransactionStatus：存储事务执行状态，并定义一组方法来判断或读取事务状态信息

### 隔离级别

ISOLATION_DEFAULT：默认。直接使用数据库默认的事务隔离级别
ISOLATION_READ_UNCOMMITTED：最低，会产生脏读、不可重复读和幻读问题。相当于MySQL的UNCOMMITTED_READ
ISOLATION_READ_COMMITTED：存在不可重复读和幻读问题。相当于COMMITTED_READ
ISOLATION_REPEATABLE_READ：存在幻读问题。相当于REPEATABLE_READ
ISOLATION_SERIALIZABLE：事务只能按特定顺序执行，相当于SERIALIZABLE

ps：不可重复读关注修改，幻读关注增删

### 传播机制

加粗为常用事务类型
支持当前事务：
**REQUIRED：默认**
SUPPORTS：外部不存在事务时，不会开启新的事物，外部存在事务时，将其加入外部事物
MANDATORY：具备强制性，当前操作必须存在事务，不存在则抛出异常

不支持当前事务：
**REQUIRES_NEW：总是创建新的事务执行，适用于不受外层方法事务影响的场景如记录事务日志等操作**
**NOT_SUPPORTED：适用于发送提示信息、邮件等不影响系统的主体业务逻辑，即使操作失败也不应该对主体逻辑产生影响，不能使主题逻辑的事务回滚**
NEVER：当前操作存在事务则抛出异常	
嵌套：
NESTED：封装事务存在，并且外部事物抛出异常回滚，内层事务必回滚。内层事务回滚则并不影响外层事务的提交与回滚。如果封装事务不存在则按REQUIED事务传播类型执行

### 失效场景

数据库不支持事务
事务方法未被Spring管理
方法没有被public修饰
同一类中方法调用
未配置事务管理器
方法的事务传播类型不支持事务
不正确的捕获异常
标注错误异常类型



### 参考资料

《深入理解分布式事务-原理与实战》  肖宇、冰河著

